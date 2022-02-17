const EventEmitter = require('events');
const io = require('socket.io-client');
const parser = require('socket.io-parser');
const hasBin = require('has-binary2');

const PacketManager = require("packet-manager");
const logger = require("logger");

const CLIENT_SOCKET_VERSION = 'v4';
const SERVER_SOCKET_VERSION_V4 = 'v4';

class SocketManager {
    /**
     * @param {*} otp : {
     *     url,
     *     token,
     * 
     *     numberRetrySendingMessage,
     * 
     *     forceNew,
     *     transports
     * 
     *     reconnectionDelay
     *     reconnectionDelayMax
     *     reconnectionAttempts
     * 
     *     nextTickIn //ms
     * }
     */
    constructor (opt) {
        this._opt = this._defaultOption(opt);
        this._emitter = new EventEmitter();

        this._packetManager = new PacketManager(this._opt.numberRetrySendingMessage);

        this._status = SocketManager.STATUS_INIT; //STATUS_INIT >>> STATUS_ALIVE >>> STATUS_KILLED
        this._subscribeChannelList = [];
        this._pendingSubscribeChannelList = [];

        this._countPingOverTime = 0;

        this._latency = {
            listLastLatency : [],
            maxLastLatency : 5,
            currentLatencyIdx: -1,
            averageLatency: 150
        };

        this._serverSocketVersion = 'v3';

        this._initNewConnection();
    }

    _initNewConnection() {

        // clear socket io cache.
        Object.keys(io.managers).forEach( (key) => {
            delete io.managers[key];
        });

        if (this._status == SocketManager.STATUS_KILLED){
            logger.debug("SocketManager status KILLED, not init new connection!");
            return;
        }

        this._socket = io(`${this._opt.url}/?token=${this._opt.token}&sv=${CLIENT_SOCKET_VERSION}&env=${this._opt.env}&games=${this._opt.games}`, {
            transports: this._opt.transports,
            reconnection: true,
            forceNew : this._opt.forceNew,

            reconnectionAttempts : this._opt.reconnectionAttempts || 10,
            reconnectionDelay : this._opt.reconnectionDelay || 500,
            randomizationFactor : 0,
            rememberUpgrade : true,
            timestampRequests : true
        });

        this._reconnect_attempt = 0;

        this._handleReponseMessage(this._socket);
        this._handleConnectionStatus(this._socket);

        this._subscribeChannelList.forEach( (channelName) => {
            this._subscribe(channelName);
        });
        logger.debug("SocketManager - Init new connection!!!");
    }

    _defaultOption(opt) {
        opt = opt || {};
        let defaultOpt = {};
        //require opt
        defaultOpt.url = opt.url;
        defaultOpt.token = opt.token;

        defaultOpt.numberRetrySendingMessage = opt.numberRetrySendingMessage || 2; // times

        defaultOpt.forceNew = opt.forceNew || false;
        defaultOpt.transports = opt.transports || ['websocket'];

        defaultOpt.reconnectionDelay = opt.reconnectionDelay || 1000;
        defaultOpt.reconnectionDelayMax = opt.reconnectionDelayMax || 3000;
        defaultOpt.reconnectionAttempts = opt.reconnectionAttempts || 3;

        defaultOpt.nextTickIn = opt.nextTickIn || 200;

        defaultOpt.pingTimeoutWarning = 600;

        defaultOpt.env = opt.env || 'portal';
        defaultOpt.games = opt.games || 'all';

        return defaultOpt;
    }

    _handleReponseMessage(socket) {
        socket.on(SocketManager.SOCKET_RESPONSE_EVENT, (message, ack) => {
            if (ack) {
                ack();
            }
            /*
            message = {messageId : '', data : { event : '', data}};
            */
            if (message) {
                logger.debug("SocketManagerNewMessage: %j", message);
                if (message.v == SERVER_SOCKET_VERSION_V4) {
                    message = {
                        messageId : message.id,
                        data : {
                            event : message.da.ev,
                            svt : message.da.svt,
                            serviceId : message.da.sid,
                            eventId : message.da.eid,
                            data : message.da.da,
                            channelType : message.da.ch
                        },
                        version : message.v
                    };
                }
                this._emitter.emit(SocketManager.NEW_MESSAGE_EVENT, message);
            }
        });

        socket.on("chat-event", (chatMessage) => {
            /*
                chatMessage = {messageId : "",  data : {serviceId : "", groupId : "", content : "", sender : "", time : 0}}
            */
            if (chatMessage) {
                logger.debug("SocketManager - chat-event: %j", chatMessage);
                this._emitter.emit(SocketManager.NEW_MESSAGE_EVENT, {
                    messageId: chatMessage.messageId,
                    data : {
                        event : "chat-event",
                        eventId : chatMessage.messageId,
                        serviceId : chatMessage.data.serviceId,
                        channelType : "presence",
                        data : chatMessage.data
                    }
                });
            }
        });

        socket.on("socket-info", ({server}) => {
            this._serverSocketVersion = server;
        });
    }

    _handleConnectionStatus(socket) {
        /* old approach
        let intervalSendMessageId; // store current interval's id for sending message.
        const initIntervalSendingMessage = () => {
            logger.debug("SocketManager - Setup interval sending message!");
            this._packetManager.updateAllCounter(0);
            intervalSendMessageId = setInterval( () => {
                let hasInvalidMessage = false;
                let listMessageIdCanNotBeSent = [];
                this._packetManager.iteratePacket( (packetId, message, counter) => { // available message callback
                    this._sendPacket(packetId, message, counter);
                }, (packetId, message) => { // not available message callback.
                    listMessageIdCanNotBeSent.push(message.messageId);
                    hasInvalidMessage = true;
                });
                if (hasInvalidMessage) {
                    clearInterval(intervalSendMessageId);
                    // this._reconnect();
                    listMessageIdCanNotBeSent.forEach( (messageId) => {
                        logger.debug("SocketManager - CAN_NOT_SEND_MESSAGE_EVENT : %s.", messageId);
                        this._emitter.emit(SocketManager.CAN_NOT_SEND_MESSAGE_EVENT, messageId);
                    })
                }
            }, this._opt.nextTickIn);
        }

        const pauseIntervalSendingMessage = () => {
            logger.debug('SocketManager - Pause interval sending message!');
            clearInterval(intervalSendMessageId);
        }

        const clearIntervalSendingMessage = () => {
            logger.debug("SocketManager - Clear interval sending message!");
            clearInterval(intervalSendMessageId);
            this._packetManager.clearAll();
        }
        */

        /* new approach */
        let intervalSendMessageId; // store current interval's id for sending message.
        let timeoutWarningDisconnected; // store current timeout's id for check disconnect network to show toast slow connection.
        let timeoutPopupDisconnected; // store current timeout's id for show popup disconnect
        const initIntervalSendingMessage = () => {
            let hasInvalidMessage = false;
            let listMessageIdCanNotBeSent = [];
            this._packetManager.iteratePacket( (packetId, message, counter) => { // available message callback
                this._sendPacket(packetId, message, counter);
            }, (packetId, message) => { // not available message callback.
                listMessageIdCanNotBeSent.push(message.messageId);
                hasInvalidMessage = true;
            });
            if (hasInvalidMessage) {
                listMessageIdCanNotBeSent.forEach( (messageId) => {
                    logger.debug("SocketManager - CAN_NOT_SEND_MESSAGE_EVENT : %s.", messageId);
                    this._emitter.emit(SocketManager.CAN_NOT_SEND_MESSAGE_EVENT, messageId);
                });
            }
            if (this._packetManager.hasPacket()){
                window.bufferLatecy = window.bufferLatecy || 5;
                let timeoutAck = this._latency.averageLatency * (100 + window.bufferLatecy)/100;
                intervalSendMessageId = setTimeout( () => {
                    initIntervalSendingMessage();
                }, timeoutAck);
            } else {
                intervalSendMessageId = setTimeout( () => {
                    initIntervalSendingMessage();
                }, 150);
            }
        };
        const pauseIntervalSendingMessage = () => {
            logger.debug('SocketManager - Pause interval sending message!');
            clearTimeout(intervalSendMessageId);
        };

        const clearIntervalSendingMessage = () => {
            logger.debug("SocketManager - Clear interval sending message!");
            clearTimeout(intervalSendMessageId);
            clearTimeout(timeoutWarningDisconnected);
            clearTimeout(timeoutPopupDisconnected);
            this._packetManager.clearAll();
        };
        /* end new approach */

        socket.on("connect", () => {
            this._status = SocketManager.STATUS_ALIVE;
            this._countPingOverTime = 0;

            if (this._pendingSubscribeChannelList.length > 0) {
                this._pendingSubscribeChannelList.forEach( (channelName) => {
                    this.subscribe(channelName);
                });
            }
            this._pendingSubscribeChannelList = [];

            initIntervalSendingMessage();
            clearTimeout(timeoutWarningDisconnected);
            clearTimeout(timeoutPopupDisconnected);

            logger.debug("SockerManager - health-check CONNECTED!");
            this._emitter.emit(SocketManager.CONNECTED_EVENT);
        });

        socket.on("disconnect", () => {
            logger.debug("SocketManager - DISCONNECTED.");
            pauseIntervalSendingMessage();

            timeoutWarningDisconnected = setTimeout(() => {
                this._emitter.emit(SocketManager.DISCONNECTED_CONNECTION);
            }, 10000);
            timeoutPopupDisconnected = setTimeout(() => {
                this._emitter.emit(SocketManager.POPUP_DISCONNECTED_EVENT);
            }, 15000);
        });

        socket.on('reconnecting', (attempt) => {
            this._reconnect_attempt = attempt;
        });

        socket.on('reconnect_error', (error) => { // eslint-disable-line
            logger.debug(`SockerManager - reconnect_error in ${this._reconnect_attempt} times. ${this._opt.reconnectionAttempts}`);
            if (this._reconnect_attempt >= this._opt.reconnectionAttempts) {
                this._close();
                this._status = SocketManager.STATUS_KILLED;
                clearIntervalSendingMessage();
                logger.debug("SockerManager - emit event can-not-connect!");
                this._emitter.emit(SocketManager.CAN_NOT_CONNECT_EVENT);
            } else {
                this._emitter.emit(SocketManager.POOR_CONNECTION);
            }
        });

        socket.on('force-disconnect', (message) => { // eslint-disable-line
            logger.debug("SocketManager - force-disconnect >>> close connect!");
            this._close();
            this._status = SocketManager.STATUS_KILLED;
            clearIntervalSendingMessage();
            logger.debug("SocketManager - emit event can-not-connect!");
            this._emitter.emit(SocketManager.CAN_NOT_CONNECT_EVENT);
        });

        socket.on('ping', () => {
            logger.debug("ping");
        });
        socket.on('pong', (latency) => {
            if (latency > this._opt.pingTimeoutWarning){
                this._countPingOverTime++;
            } else {
                this._countPingOverTime = 0;
            }
            if (this._countPingOverTime >= 5) {
                this._emitter.emit(SocketManager.POOR_CONNECTION);
                this._countPingOverTime = 0;
            }

            // calculate avagate latency
            this._latency.currentLatencyIdx = ++this._latency.currentLatencyIdx % this._latency.maxLastLatency;
            this._latency.listLastLatency[this._latency.currentLatencyIdx] = latency;
            this._latency.averageLatency = this._latency.listLastLatency.reduce( (accumulator, currentValue) => {return accumulator + currentValue;}, 0) / this._latency.listLastLatency.length;

            if (this._latency.averageLatency < 150) {
                this._latency.averageLatency = 150;
            }
            logger.debug("pong - latency: %s, avarage latency: %s", latency, this._latency.averageLatency);

            this._emitter.emit(SocketManager.PONG_EVENT, { latency, averageLatency : this._latency.averageLatency});
        });
    }

    _sendPacket (packetId, message, counter) {
        if (this._socket.connected) {

            let sendedMessage = message;
            let event = SocketManager.SOCKET_REQUEST_EVENT_V3;
            if (this._serverSocketVersion === SERVER_SOCKET_VERSION_V4) {
                sendedMessage = {
                    id : message.messageId,
                    da : {
                        ev : message.data.event,
                        da : message.data.data,
                        v : message.data.version ? message.data.version : 1
                    }
                };
                event = SocketManager.SOCKET_REQUEST_EVENT_V4;
            }

            let packet = {
                "type": hasBin(message) ? parser.BINARY_EVENT : parser.EVENT,
                "options": {
                    "compress": true
                },
                "id": packetId,
                "data" : [event, sendedMessage]
            };
    
            // register ack with this packetId
            this._socket.acks[packetId] = () => {
                let originMessage = this._packetManager.ackPacket(packetId);
                if (originMessage) {
                    logger.debug("SocketManager - send-message-success: %s", originMessage.messageId);
                    this._emitter.emit(SocketManager.SEND_MESSAGE_SUCCESS_EVENT, originMessage.messageId);
                }
            };
    
            // send packet.
            logger.debug("SocketManager - send message: counter=%s, messageId=%s", counter, message.messageId);
            this._socket.packet(packet);
        } else {
            this._packetManager.updateCounter(packetId, counter + 1);
        }
    }

    updateToken(token) {
        if (this._socket) {
            this._socket.io.opts.query = `token=${token}&sv=v3`;
            this._socket.io.uri = `${this._opt.url}/?token=${token}&sv=v3`;
        }
        this._opt.token = token;
    }

    /**
     *
     * @param {*} message : {messageId, data: {event, data}}
     */
    sendMessage(message) {
        logger.debug("SocketManager - Add message to queue: %j", message);
        // send packet immediately.
        let packetId = this._packetManager.addNew(message);
        this._sendPacket(packetId, message, 0);
    }

    removeSendingMessage(listMessageId) {
        listMessageId = listMessageId || [];
        this._packetManager.removeSendingMessage((message) => {
            return listMessageId.includes(message.messageId);
        });
    }

    /**
     *
     * @param {*} chatMessage : {messageId, data : {serviceId, groupId, senderId, content}}
     */
    sendChatMessage(chatMessage) {
        logger.debug("SocketManager - sendChatMessage: %j", chatMessage);
        this._socket.emit("chat-emit", chatMessage);
    }

    registerEvent(event, listener) {
        this._emitter.on(event, listener);
    }

    removeEvent(event, listener) {
        this._emitter.removeListener(event, listener);
    }

    subscribe(channelName) {
        if (this._subscribeChannelList.includes(channelName))
            return;
        if (this._socket.connected) {
            this._subscribeChannelList.push(channelName);
            this._subscribe(channelName);
        } else {
            this._pendingSubscribeChannelList.push(channelName);
        }
    }

    _subscribe(channelName) {
        let socketNsp = io(`${this._opt.url}/${channelName}?token=${this._opt.token}&sv=${CLIENT_SOCKET_VERSION}`);
        this._handleReponseMessage(socketNsp);
    }

    unSubscribe(channelName) {
        if (this._subscribeChannelList.includes(channelName)) {
            this._subscribeChannelList.splice(this._subscribeChannelList.indexOf(channelName), 1);
            this._unSubscribe(channelName);
        }
        if (this._pendingSubscribeChannelList.includes(channelName)) {
            this._pendingSubscribeChannelList.splice(this._pendingSubscribeChannelList.indexOf(channelName), 1);
        }
    }

    _unSubscribe(channelName) {
        let socketNsp = this._socket.io.nsps[`/${channelName}`];
        if (socketNsp) {
            socketNsp.close();
            socketNsp.removeAllListeners();
            delete this._socket.io.nsps[`/${channelName}`];
        }
    }

    _close() {
        Object.keys(this._socket.io.nsps).forEach( nsp => {
            let socketNsp = this._socket.io.nsps[nsp];
            if (socketNsp) {
                socketNsp.close();
                socketNsp.removeAllListeners();
                delete this._socket.io.nsps[nsp];
            }
        });
    }

    close() {
        this._close();
        this._status = SocketManager.STATUS_KILLED;
        this._emitter.removeAllListeners();
        this._packetManager.clearAll();
    }

    _reconnect() {
        logger.debug("SocketManager - Reconnect connection!");
        this._close();
        this._initNewConnection();
    }

    isAbleSendingData() {
        return this._status !== SocketManager.STATUS_KILLED;
    }
}

SocketManager.SOCKET_REQUEST_EVENT_V3 = "q";
SocketManager.SOCKET_REQUEST_EVENT_V4 = "q4";
SocketManager.SOCKET_RESPONSE_EVENT = "p";

SocketManager.CONNECTED_EVENT = "connected";
SocketManager.CAN_NOT_CONNECT_EVENT = "can-not-connect";
SocketManager.CAN_NOT_SEND_MESSAGE_EVENT = "can-not-send-message";
SocketManager.SEND_MESSAGE_SUCCESS_EVENT = "send-message-success";
SocketManager.NEW_MESSAGE_EVENT = "new-message";
SocketManager.CHAT_MESSAGE_EVENT = "chat-message";

SocketManager.POOR_CONNECTION = "poor-connection";

SocketManager.POPUP_DISCONNECTED_EVENT = "popup-disconnected-event";
SocketManager.DISCONNECTED_CONNECTION = "disconnected-connection";

SocketManager.STATUS_INIT = "init";
SocketManager.STATUS_ALIVE = "alive";
SocketManager.STATUS_KILLED = "killed";

module.exports = SocketManager;
