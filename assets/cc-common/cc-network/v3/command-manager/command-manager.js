const uuid = require('custom-uuid');
const EventEmitter = require('events').EventEmitter;
const HashMap = require('hashmap');
const logger = require('logger');
const messageManager = require('message-manager');
class CommandManager {
    constructor (serviceId, maxConcurrentCommand) {
        this.serviceId = serviceId;
        this.maxConcurrentCommand = maxConcurrentCommand || 1;
        this._emitter = new EventEmitter();

        this._executingCommandType = new HashMap();
        this._messageIdInfosMap = new HashMap();
    }

    registerEvent(event, listener) {
        this._emitter.on(event, listener);
    }

    subscribe(channelName) {
        messageManager.subscribe(channelName);
    }

    unSubscribe(channelName) {
        messageManager.unSubscribe(channelName);
    }

    /**
     * 
     * @param {*} commandPayload : {event : "", data : {}}
     * @param {*} strategy : {resendCount, shouldWaitForACK, canBeDuplicated}
     * @returns {string} commandId: <cid> | CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT | CommandManager.COMMAND_FAILED_DUPLICATE}
     */
    executeCommand(commandPayload, strategy, isMinimizeRequest = true, isAddCommandId = true) {
        logger.debug("CommandManager %s - executeCommand: %j", this.serviceId, [commandPayload, strategy]);
        let numberExecutingCommand = this._executingCommandType.count();

        if (!this._validateDublicateCommandType(commandPayload, strategy)){
            // fail validation.
            logger.error("CommandManager %s - COMMAND_FAILED_DUPLICATE. Executing type: %j", this.serviceId, this._executingCommandType.keys());
            return CommandManager.COMMAND_FAILED_DUPLICATE;
        }

        if (numberExecutingCommand >= this.maxConcurrentCommand && !this._executingCommandType.has(commandPayload.event)) {
            logger.error("CommandManager %s - COMMAND_FAILED_CONC_OVER_LIMIT. current : %s, maximum: %s", this.serviceId, numberExecutingCommand, this.maxConcurrentCommand);
            return CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT;
        }

        let commandId = uuid();
        isMinimizeRequest && (commandPayload.data.cId = commandId);
        isAddCommandId && (commandPayload.data.commandId = commandId);

        let messageId = messageManager.sendMessage(this.serviceId, commandPayload);
        
        if (strategy.shouldWaitForACK) {
            this._executingCommandType.set(commandPayload.event);
            this._messageIdInfosMap.set(messageId, {
                commandId,
                resendCount : strategy.resendCount,
                commandPayload,
                numberResend : 0
            });
        }
        logger.debug("CommandManager %s - sendMessage messageId=%s, commandId=%s", this.serviceId, messageId, commandId);
        return commandId;
    }

    clearRemainingCommand() {
        this._executingCommandType.clear();

        messageManager.removeSendingMessage(this._messageIdInfosMap.keys());
        this._messageIdInfosMap.clear();
    }

    cleanUp() {
        logger.debug("CommandManager %s - clean up", this.serviceId);
        this._emitter.removeAllListeners();
        this.clearRemainingCommand();
    }

    onAck(messageId) {
        logger.debug("CommandManager %s - ack: messageId=%s", this.serviceId, messageId);
        if (this._messageIdInfosMap.has(messageId)){
            let {commandPayload} = this._messageIdInfosMap.get(messageId);
            this._messageIdInfosMap.delete(messageId);
            this._executingCommandType.delete(commandPayload.event);
            this._emitter.emit(CommandManager.COMMAND_SEND_SUCCESSFULLY, commandPayload);
        }
    }

    onCannotSendMessage(messageId) {
        logger.debug("CommandManager %s - cannotSendMessage: messageId=%s", this.serviceId, messageId);
        if (this._messageIdInfosMap.has(messageId)){
            let {resendCount, commandId , commandPayload, numberResend} = this._messageIdInfosMap.get(messageId);
            this._messageIdInfosMap.delete(messageId);

            if (numberResend < resendCount) {
                logger.debug("CommandManager %s - resendMessage: %s", this.serviceId, messageId);
                let resendMessageId = messageManager.sendMessage(this.serviceId, commandPayload, messageId);
                numberResend++;
                this._messageIdInfosMap.set(resendMessageId, {resendCount, commandId , commandPayload, numberResend});
                logger.debug("CommandManager %s - resendMessage: messageId=%s, resendMessageId=%s, numberResend=%s, resendCount=%s", this.serviceId, messageId, resendMessageId, numberResend, resendCount);
            } else {
                logger.debug("CommandManager %s - COMMAND_FAILED_RETRY: messageId=%s, numberResend=%s", this.serviceId, messageId, numberResend);
                this._emitter.emit(CommandManager.COMMAND_FAILED_RETRY, commandId);
            }
        }
    }

    /**
     * 
     * @param {*} commandPayload 
     * @param {*} strategy 
     * @returns: return true if valid commandPayload, else return false.
     */
    _validateDublicateCommandType(commandPayload, strategy) {
        let {event} = commandPayload;

        if (!strategy.canBeDuplicated) { // must not be duplicate.
            return this._executingCommandType.has(event) == false; // valid when has() return false.
        }

        return true;
    }
}

CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT = 'COMMAND_FAILED_CONC_OVER_LIMIT';
CommandManager.COMMAND_FAILED_DUPLICATE = 'COMMAND_FAILED_DUPLICATE';
CommandManager.COMMAND_FAILED_RETRY = 'COMMAND_FAILED_RETRY';
CommandManager.COMMAND_SEND_SUCCESSFULLY = 'COMMAND_SEND_SUCCESSFULLY';


module.exports = CommandManager;