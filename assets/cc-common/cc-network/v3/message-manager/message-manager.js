const uuid = require('custom-uuid');
const HashMap = require('hashmap');
const Duplicate = require('deduplicate');
const logger = require('logger');
const RoutingEvent = require('routing-event');
const SocketManager = require('socket-manager');

const getPlayerInfoState = require('player-info-state-manager');

class MessageManager {
    constructor () {
        this._routingEventHandler = new RoutingEvent();

        this._config = {};

        this._duplicateMessageId = new Duplicate(1000);
        this._messageIdServiceIdMap = new HashMap();
        this._cachedMessage = [];

        this.playerStateInfo = getPlayerInfoState();
    }

    initSocket(socketUrl, token, {serviceRest, urlVerifyToken}, env, games, device = {}) {
        // validate
        if (!socketUrl) {
            throw new Error('Updated url must not empty.');
        }
        if (!token) {
            throw new Error('Updated token must not empty.');
        }

        if (this._config.url  === socketUrl && this._config.token === token) {
            return; // ignore update config.
        }

        logger.debug("MessageManager - Update new config: %j", { socketUrl, token });
        this.closeAndCleanUp();

        if (Array.isArray(socketUrl)) {
            socketUrl = socketUrl[parseInt(Math.random()*10000) % socketUrl.length];
        }

        this._config.url = socketUrl;
        this._config.token = token;
        this._config.env = env;
        this._config.games = games;

        this.playerStateInfo._registerSystemState();
        this.playerStateInfo.setToken(token);
        if (window && window.dataLoginM) {
            logger.debug("MessageManager - Authen token success.", token);
            const data = window.dataLoginM;
            this.playerStateInfo.setUserId(data.userId);
            this.playerStateInfo.setToken(data.token);
            this.playerStateInfo.setDisplayName(data.displayName);
            this.playerStateInfo.setWalletBalance(parseInt(data.wallet), parseInt(data.walletVersion));
            this._initSocket();
        }
        else 
        if (serviceRest) {
            logger.debug("MessageManager - Authen token: %s", token);
            serviceRest.post({
                url : urlVerifyToken,
                data : {
                    token,
                    device: JSON.stringify(device)
                },
                callback : (res) => {
                    let data = res.data;
                    if (data.data && data.data.userId) {
                        logger.debug("MessageManager - Authen token success.", token);
                        data = data.data;
                        this.playerStateInfo.setUserId(data.userId);
                        this.playerStateInfo.setToken(data.token);
                        this.playerStateInfo.setDisplayName(data.displayName);
                        this.playerStateInfo.setWalletBalance(parseInt(data.wallet), parseInt(data.walletVersion));
                        this._initSocket();
                    } else {
                        logger.debug("MessageManager - Authen token fail.");
                        this._routingEventHandler.onCannotAuthen();
                        this.closeAndCleanUp();
                    }
                },
                callbackErr : () => {
                    logger.debug("Authen token error");
                    this._routingEventHandler.onCannotAuthen();
                    this.closeAndCleanUp();
                }
            });
        } else {
            this._initSocket();
        }
    }

    subscribe(channelName) {
        if (this._socketManager) {
            this._socketManager.subscribe(channelName);
        } else {
            // throw new Error("Haven't init socket connection. Please update config.");
        }
    }

    unSubscribe(channelName) {
        if (this._socketManager) {
            this._socketManager.unSubscribe(channelName);
        }
    }

    sendMessage(serviceId, payload, messageId) {
        messageId = messageId || uuid();
        this._messageIdServiceIdMap.set(messageId, serviceId);
        if (this._socketManager) {
            if (this._socketManager.isAbleSendingData()){
                logger.debug("MessageManager - sendMessage: %s - %j", serviceId, payload);
                this._socketManager.sendMessage({
                    messageId,
                    data : payload
                });
            } else {
                this._cachedMessage.push({serviceId, payload, messageId});
                this._initSocket();
            }
        } else {
            this._cachedMessage.push({serviceId, payload, messageId});
        }
        return messageId;
    }

    /**
     *
     * @param {*} chatData : {serviceId, groupId, content, sender}
     */
    sendChatMessage(chatData) {
        if (this._socketManager) {
            let chatMessage = {
                messageId : uuid(),
                data : chatData
            };
            logger.debug("MessageManager - sendChatMessage: %j", chatMessage);
            this._socketManager.sendChatMessage(chatMessage);
        } else {
            logger.error('sendChatMessage: _socketManager was not setup.');
        }
    }

    removeSendingMessage(listMessageId) {
        if (this._socketManager){
            this._socketManager.removeSendingMessage(listMessageId);
        }
    }

    registerGame(serviceId, commandHandler, eventHander) {
        this._routingEventHandler.registerGame(serviceId, commandHandler, eventHander);
    }

    unregisterGame(serviceId) {
        this._routingEventHandler.unregisterGame(serviceId);
    }

    /**
     * - clean up handler.
     * - clean up config.
     * - clean up socket.
     */
    closeAndCleanUp() {
        logger.debug("MessageManager - closeAndCleanUp.");
        this._routingEventHandler.onCannotConnect();
        this._routingEventHandler.cleanUp();
        this._config = {};
        this._duplicateMessageId.clearAll();
        this._messageIdServiceIdMap.clear();
        this._cachedMessage = [];
        
        if (this._socketManager) {
            this._socketManager.close();
            this._socketManager = null;
        }

        this.playerStateInfo.cleanUp();
    }

    _initSocket() {
        logger.debug("MessageManager - _initSocket.");
        if (!this._socketManager || !this._socketManager.isAbleSendingData()) {
            logger.debug("MessageManager - _initSocket - new socket.");
            this._socketManager = new SocketManager({
                url : this._config.url,
                token : this._config.token,
                env : this._config.env,
                games : this._config.games,
                reconnectionAttempts : 999999, // times
                reconnectionDelay : 500,
                nextTickIn : 150, //ms
                numberRetrySendingMessage : 10 // times
            });

            this._handleSocketEvent();
            this._handleSocketStatus();

            this._cachedMessage.forEach( ({serviceId, payload, messageId}) => {
                this.sendMessage(serviceId, payload, messageId);
            });
            this._cachedMessage = [];
        } else {
            logger.debug("MessageManager - _initSocket - exist socket.");
        }
    }

    _handleSocketEvent() {
        logger.debug("MessageManager - _handleSocketEvent.");

        this._socketManager.registerEvent(SocketManager.NEW_MESSAGE_EVENT, (message) => {
            if (this._duplicateMessageId.exists(message.messageId)){
                return;
            }
            this._duplicateMessageId.insert(message.messageId);
            this._routingEventHandler.onEvent(message.data);
        });

        this._socketManager.registerEvent(SocketManager.SEND_MESSAGE_SUCCESS_EVENT, (messageId) => {
            let serviceId = this._messageIdServiceIdMap.get(messageId);
            if (serviceId) {
                this._routingEventHandler.onAck(serviceId, messageId);
                this._messageIdServiceIdMap.delete(messageId);
            }
        });

        this._socketManager.registerEvent(SocketManager.CAN_NOT_SEND_MESSAGE_EVENT, (messageId) => {
            let serviceId = this._messageIdServiceIdMap.get(messageId);
            if (serviceId) {
                this._messageIdServiceIdMap.delete(messageId);
                this._routingEventHandler.onCannotSendMessage(serviceId, messageId);
            }
        });
    }

    _handleSocketStatus() {
        logger.debug("MessageManager - _handleSocketStatus.");
        this._socketManager.registerEvent(SocketManager.CAN_NOT_CONNECT_EVENT, () => {
            this._routingEventHandler.onCannotConnect();
            this.closeAndCleanUp();
        });
        this._socketManager.registerEvent(SocketManager.CONNECTED_EVENT, () => {
            this._routingEventHandler.onConnected();
        });
        this._socketManager.registerEvent(SocketManager.POOR_CONNECTION, () => {
            this._routingEventHandler.onNetworkStatus(SocketManager.POOR_CONNECTION);
        });
        this._socketManager.registerEvent(SocketManager.DISCONNECTED_CONNECTION, () => {
            this._routingEventHandler.onNetworkWarning(SocketManager.DISCONNECTED_CONNECTION);
        });
        this._socketManager.registerEvent(SocketManager.POPUP_DISCONNECTED_EVENT, () => {
            this._routingEventHandler.onShowPopupDisconnected(SocketManager.POPUP_DISCONNECTED_EVENT);
        });
        this._socketManager.registerEvent(SocketManager.PONG_EVENT, (data) => {
            this._routingEventHandler.onPong(data);
        });

    }

}
module.exports = new MessageManager();