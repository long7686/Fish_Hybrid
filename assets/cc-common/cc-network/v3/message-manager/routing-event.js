const HashMap = require('hashmap');
const logger = require('logger');
class RoutingEvent {
    constructor () {
        this._commandHandlerMap = new HashMap();
        this._eventHandlerMap = new HashMap();
    }

    /**
     * 
     * @param {*} serviceId 
     * @param {*} commandHandler : {onAck(messageId), onCannotSendMessage(messageId)}
     * @param {*} eventHander : {onCannotConnect(), onConnected(), onEvent(event)}
     */
    registerGame(serviceId, commandHandler, eventHander) {
        logger.debug('RoutingEvent %s - registerGame.', serviceId);
        this._commandHandlerMap.set(serviceId, commandHandler);
        this._eventHandlerMap.set(serviceId, eventHander);
    }

    unregisterGame(serviceId) {
        logger.debug('RoutingEvent %s - unregisterGame.', serviceId);
        this._commandHandlerMap.delete(serviceId);
        this._eventHandlerMap.delete(serviceId);
    }
    
    onAck(serviceId, messageId) {
        let handler = this._commandHandlerMap.get(serviceId);
        if (handler && handler.onAck) {
            logger.debug('RoutingEvent %s - ack: %s.', serviceId, messageId);
            handler.onAck(messageId);
        }
    }

    onCannotSendMessage(serviceId, messageId) {
        let handler = this._commandHandlerMap.get(serviceId);
        if (handler && handler.onCannotSendMessage) {
            logger.debug('RoutingEvent %s - cannotSendMessage: %s.', serviceId, messageId);
            handler.onCannotSendMessage(messageId);
        }
    }


    onCannotConnect() {
        this._eventHandlerMap.keys().forEach( (serviceId) => {
            let handler = this._eventHandlerMap.get(serviceId);
            if (handler && handler.onCannotConnect) {
                logger.debug('RoutingEvent %s - cannotConnect.', serviceId);
                handler.onCannotConnect();
            }
        });
    }

    onNetworkStatus(status) {
        this._eventHandlerMap.keys().forEach( (serviceId) => {
            let handler = this._eventHandlerMap.get(serviceId);
            if (handler && handler.onNetworkStatus) {
                logger.debug('RoutingEvent %s - onNetworkStatus: %s.', serviceId, status);
                handler.onNetworkStatus(status);
            }
        });
    }

    onNetworkWarning(status) {
        this._eventHandlerMap.keys().forEach( (serviceId) => {
            let handler = this._eventHandlerMap.get(serviceId);
            if (handler && handler.onNetworkWarning) {
                logger.debug('RoutingEvent %s - onNetworkWarning: %s.', serviceId, status);
                handler.onNetworkWarning(status);
            }
        });
    }

    onShowPopupDisconnected() {
        this._eventHandlerMap.keys().forEach( (serviceId) => {
            let handler = this._eventHandlerMap.get(serviceId);
            if (handler && handler.onShowPopupDisconnected) {
                logger.debug('RoutingEvent %s - onShowPopupDisconnected.', serviceId);
                handler.onShowPopupDisconnected();
            }
        });
    }

    onCannotAuthen() {
        this._eventHandlerMap.keys().forEach( (serviceId) => {
            let handler = this._eventHandlerMap.get(serviceId);
            if (handler && handler.onCannotAuthen) {
                logger.debug('RoutingEvent %s - onCannotAuthen.', serviceId);
                handler.onCannotAuthen();
            }
        });
    }

    onConnected() {
        this._eventHandlerMap.keys().forEach( (serviceId) => {
            let handler = this._eventHandlerMap.get(serviceId);
            if (handler && handler.onConnected) {
                logger.debug('RoutingEvent %s - connected.', serviceId);
                handler.onConnected();
            }
        });
    }

    onPong(data) {
        this._eventHandlerMap.keys().forEach( (serviceId) => {
            let handler = this._eventHandlerMap.get(serviceId);
            if (handler && handler.onPong) {
                handler.onPong(data);
            }
        });
    }

    onEvent(event){
        let handler = this._eventHandlerMap.get(event.serviceId);
        if (handler) {
            // logger.debug('RoutingEvent %s - event %j', event.serviceId, event);
            handler.onEvent(event);
        }
    }

    cleanUp() {
        logger.debug('RoutingEvent - clean up command handler: %j.', this._commandHandlerMap.keys());
        logger.debug('RoutingEvent - clean up event handler: %j.', this._eventHandlerMap.keys());
        this._commandHandlerMap.clear();
        this._eventHandlerMap.clear();
    }
    
}


module.exports = RoutingEvent;