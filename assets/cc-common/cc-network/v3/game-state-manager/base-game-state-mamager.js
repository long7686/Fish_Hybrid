const EventEmitter = require('events').EventEmitter;
const CommandManager = require('command-manager');
const EventManager = require('event-manager');
const messageManager = require('message-manager');

const logger = require('logger');

class BaseGameStateManager {
    constructor (serviceId, maxConcurrentCommand, playerInfo) {
        this.serviceId = serviceId;
        this.playerInfo = playerInfo;

        this._commandManager = new CommandManager(this.serviceId, maxConcurrentCommand);
        this._eventManager = new EventManager();

        messageManager.registerGame(this.serviceId, this._commandManager, this._eventManager);

        this._state = BaseGameStateManager.STATE_INIT;
        this._emitter = new EventEmitter();

        this.joinGame();

        this.handleNetworkStatusEvent();
    }

    executeCommand(commandPayload) {
        let commandStrategy = this.buildCommandStrategy(commandPayload.event);

        let executeCommandResult = this.latestExecuteCommandResult = this._commandManager.executeCommand(commandPayload, commandStrategy);

        if (executeCommandResult.success) {
            let eventStrategy = this.buildEventSratergy(commandPayload.event);

            this._eventManager.waitForEvent(eventStrategy.timeWaitForEvent, this.verifyExpectedEvent.bind(this), this.timeoutExpectedEventHandler.bind(this));
        } else {
            // TODO
            logger.error("%j", executeCommandResult);
        }
    }

    registerEvent(event, listener) {
        this._emitter.on(event, listener);
    }

    cleanUp() {
        this._commandManager.cleanUp();
        this._eventManager.cleanUp();
        messageManager.unregisterGame(this.serviceId);
    }

    joinGame() {
        if (this._state == BaseGameStateManager.STATE_INIT) {
            this.executeCommand({
                "data": {
                    "serviceId": this.serviceId,
                    "token": this.playerInfo.token,
                    "delay": 0
                },
                "event": "client-join-game-request"
            });

            this._eventManager.registerEvent('client-join-game-result', this.handleJoinGameEvent.bind(this));
        }
    }

    handleJoinGameEvent(eventData) {
        if (this._state === BaseGameStateManager.STATE_INIT) {
            this._state = BaseGameStateManager.STATE_NORMAL;
            this.gotoNormalMode();
            this._emitter.emit(BaseGameStateManager.COMMON_EVENT_JOIN_GAME_SUCCESS, eventData.data);
        }
    }

    handleNetworkStatusEvent() {
        this._eventManager.registerEvent(EventManager.CAN_NOT_CONNECT, () =>{
            this._emitter.emit(BaseGameStateManager.COMMON_EVENT_NETWORK_PROBLEM);
        });

        this._eventManager.registerEvent(EventManager.CONNECTED, () =>{
            this._emitter.emit(BaseGameStateManager.COMMON_EVENT_NETWORK_CONNECTED);
        });
    }

    buildCommandStrategy() {
        return {
            resendCount : 3,
            shouldWaitForACK : true,
            canBeDuplicated : false
        };
    }

    buildEventSratergy() {
        return {
            timeWaitForEvent : 10000
        };
    }

    verifyExpectedEvent(eventData) {
        if (this._state == BaseGameStateManager.STATE_INIT) {
            if (eventData.event === 'client-join-game-result') {
                let data = eventData.data;
                return data.commandId === this.latestExecuteCommandResult.commandId;
            }
        } else if (this._state === BaseGameStateManager.STATE_NORMAL) {
            if (eventData.event === 'state-updated') {
                let data = eventData.data[this.serviceId].data;
                return data.commandId === this.latestExecuteCommandResult.commandId;
            }
        } else if (this._state === BaseGameStateManager.STATE_PANIC) {
            if (eventData.event === 'state-pushed') {
                let data = eventData.data;
                return data.commandId === this.latestExecuteCommandResult.commandId;
            }
        }
        return false;
    }

    timeoutExpectedEventHandler() {
        switch(this._state) {
            case BaseGameStateManager.STATE_INIT :
                this.gotoDieMode();
                break;
            case BaseGameStateManager.STATE_NORMAL: 
                this.gotoPanicMode();
                break;
            case BaseGameStateManager.STATE_PANIC:
                this.gotoDieMode();
                break;
        }
    }
    
    gotoPanicMode() {
        logger.debug('BaseGameStateManager gotoPanicMode!');
        this._state == BaseGameStateManager.STATE_PANIC;
        
        this._eventManager.removeAllEventListeners();
        this._eventManager.removeWaitingQueue();
        this._commandManager.clearRemainingCommand();
        
        this.handleNetworkStatusEvent();
    }

    gotoDieMode() {
        logger.debug('BaseGameStateManager gotoDieMode!');
        this._state == BaseGameStateManager.STATE_DIE;
        this.cleanUp();
    }

    gotoNormalMode() {
        logger.debug('BaseGameStateManager gotoNormalMode!');

        this._state == BaseGameStateManager.STATE_NORMAL;
        this._eventManager.removeAllEventListeners();
        this._eventManager.removeWaitingQueue();
        this._commandManager.clearRemainingCommand();

        this.handleNetworkStatusEvent();
    }

}

BaseGameStateManager.STATE_INIT = 'INIT';
BaseGameStateManager.STATE_NORMAL = 'NORMAL';
BaseGameStateManager.STATE_PANIC = 'PANIC';
BaseGameStateManager.STATE_RESUME = 'RESUME';
BaseGameStateManager.STATE_DIE = 'DIE';

BaseGameStateManager.COMMON_EVENT_JOIN_GAME_SUCCESS = 'JOIN_GAME_SUCCESS';
BaseGameStateManager.COMMON_EVENT_NETWORK_CONNECTED = 'NETWORK_CONNECTED';
BaseGameStateManager.COMMON_EVENT_NETWORK_PROBLEM = 'NETWORK_PROBLEM';

module.exports = BaseGameStateManager;