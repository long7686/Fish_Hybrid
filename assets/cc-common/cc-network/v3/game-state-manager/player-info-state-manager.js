const EventEmitter = require('events').EventEmitter;
const EventManager = require('event-manager');
const logger = require('logger');
class PlayerInfoStateManager {
    constructor () {
        this._eventManager = new EventManager();
        this._emitter = new EventEmitter();

        this.wallet = {
            amount : 0,
            version : 0
        };

        this.token = null;
        this.userId = null;
        this.displayName = null;

        this._eventManager.registerEvent('wallet-updated', (eventData) => {
            this.setWalletBalance(eventData.data.amount, eventData.data.version);
        });

        this._eventManager.registerEvent('user-logged-out', (eventData) => {
            logger.debug('user-logged-out: %j', eventData);
            this._emitter.emit(eventData.event, eventData.data);
        });
        this._eventManager.registerEvent('state-pushed', (eventData) => {
            if (eventData.serviceId == 'wallet-service-id'){
                this.setWalletBalance(eventData.data.amount, eventData.data.version);
            }
        });
    }

    _registerSystemState() {
        const messageManager = require('message-manager');
        
        messageManager.registerGame('wallet-service-id', {
            onAck: () => {},
            onCannotSendMessage: () => {}
        }, {
            onConnected: () => {
                if (this.getUserId()) {
                    messageManager.sendMessage('wallet-service-id', {
                        event: 'client-state-request',
                        data : {
                            serviceId : 'wallet-service-id',
                            objectId : this.getUserId(),
                            stateType : 'wallet-type',
                            token : this.getToken(),
                            commandId : Date.now() + ''
                        }
                    });
                }
            },
            onCannotConnect : () => {
                this.wallet = {
                    amount : 0,
                    version : 0
                };
        
                this.token = null;
                this.userId = null;
                this.displayName = null;
            },
            onCannotAuthen : () => {},
            onEvent: this._eventManager.onEvent.bind(this._eventManager)
        });

        messageManager.registerGame('0000', {}, {
            onConnected: () => {},
            onCannotConnect : () => {
                this._emitter.emit('player-can-not-connect');
            },
            onCannotAuthen : () => {
                this._emitter.emit('player-can-not-authen');
            },
            onEvent: this._eventManager.onEvent.bind(this._eventManager)
        });
    }

    registerEvent(event, listener){
        this._emitter.on(event, listener);
    }

    removeEvent(event, listener) {
        this._emitter.removeListener(event, listener);
    }

    setWalletBalance(amount = 0, version) {
        if ( this.wallet.version <= version) {
            this.wallet.amount = amount;
            this.wallet.version = version;
            logger.debug('my wallet update: %j', this.wallet);
            this._emitter.emit('wallet-updated');
        } else {
            logger.debug('my wallet CANNOT update. current wallet is: ', this.wallet);
        }
    }

    getWalletBalance() {
        return Math.floor(this.wallet.amount);
    }

    setUserId(userId) { 
        this.userId = userId;
        logger.setUserId(userId);
    }

    getUserId() {
        return this.userId;
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    setDisplayName(displayName) {
        this.displayName = displayName;
    }

    getDisplayName(){
        return this.displayName;
    }

    cleanUp() {
        this._emitter.removeAllListeners();
    }
}

let instance;
module.exports = () => {
    if (instance) {
        return instance;
    } else {
        return instance = new PlayerInfoStateManager();
    }
};
