/* global CC_DEBUG */

const util = require('util');
const serviceRest = require('serviceRest');
const  regexIgnoreMessage = /^(CommandManager|RoutingEvent|SocketManagerNewMessage)/g;

class Logger {
    constructor(logFn, logFnError, logFnWarn) {
        this.isDebugging = !!logFn;
        this.logFn = logFn;
        this.logFnError = logFnError;
        this.logFnWarn = logFnWarn;
        this.userId = '';
        this.loggyService = new LoggyService();
    }
    debug (message, ...args) {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGGY} = loadConfigAsync.getConfig();
        let logData = '';
        if (this.isDebugging || LOGGY) {
            logData = util.format("%s : " +  message, new Date().toTimeString(), ...args);
        }
        if (this.isDebugging) {
            this.logFn(logData);
        }
        if (LOGGY){
            this.sendToLoggy(logData, message);
        }
    }
    warn (message, ...args) {
        let logData = '';
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGGY} = loadConfigAsync.getConfig();
        if (this.isDebugging || LOGGY) {
            logData = util.format("%s : " +  message, new Date().toTimeString(), ...args);
        }
        if (this.isDebugging) {
            this.logFnWarn(logData);
        }
        if (LOGGY){
            this.sendToLoggy(logData, message);
        }
    }
    error (message, ...args) {
        let logData = '';
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGGY} = loadConfigAsync.getConfig();
        if (this.isDebugging || LOGGY) {
            logData = util.format("%s : " +  message, new Date().toTimeString(), ...args);
        }
        if (this.isDebugging) {
            this.logFnError(logData);
        }
        if (LOGGY){
            this.sendToLoggy(logData, message);
        }
    }
    sendToLoggy (logData, rawMessage) {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGGY} = loadConfigAsync.getConfig();
        if (LOGGY && logData && rawMessage && !rawMessage.match(regexIgnoreMessage)) {
            logData = this.userId + "::: " + logData;
            this.loggyService.pushLogData(logData);
        }   
    }
    setUserId(userId) {
        this.userId = userId;
    }
}


class LoggyService {
    constructor() {
        this.loggyBuffer = [];
        this.isSending = false;
    }
    pushLogData(logData) {
        this.loggyBuffer.push(logData);
        if (!this.isSending) {
            this.sendLogDataLoop();
        }
    }
    sendLogDataLoop() {
        if (this.loggyBuffer.length == 0) {
            this.isSending = false;
            return;
        }
        this.isSending = true;
        this.sendLogData(this.loggyBuffer[0], () => {
            this.loggyBuffer.splice(0,1);
            this.sendLogDataLoop();
        }, () => {
            this.isSending = false;
            setTimeout( () => {
                if (!this.isSending) {
                    this.sendLogDataLoop();
                }
            }, 3000);
        });
    }
    sendLogData(logData, callback, callbackErr) {
        const loadConfigAsync = require('loadConfigAsync');
        const {API_URL} = loadConfigAsync.getConfig();
        try {
            serviceRest.postRaw({apiUrl : API_URL, url: 'loggy/push', data: logData, callback, callbackErr});
        } catch (err) {
            this.pushLogData(err.message);
        }
    }
}


if (CC_DEBUG){
    module.exports = new Logger(cc.log, cc.warn, cc.warn);
} else {
    module.exports = new Logger(cc.log, cc.warn, cc.warn);
}