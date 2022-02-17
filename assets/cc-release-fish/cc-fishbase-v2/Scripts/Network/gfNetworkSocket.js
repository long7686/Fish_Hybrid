const EventEmitter = require('events');
let msgpack = require("msgpack-lite");
const logger = require('logger');
const NetworkEvent = require('gfNetworkEvent');
const {hash} = require('hashKey');
const XOCypher = require("XOCypher");
const DataStore = require("gfDataStore");
const STATUS_INIT = 'INIT';
const STATUS_CONNECTED = 'CONNECTED';
const STATUS_DISCONNECTED = 'DISCONNECTED';

const LIVE_STATUS_INIT = 'INIT';
const LIVE_STATUS_CONNECT = 'CONNECT';
const LIVE_STATUS_CLOSED = 'CLOSED';

class gfNetworkSocket {


    /**
     *
     * @param { } opt : {
     *      pingInterval,
     *      pingTimeout,
     *      reconnectionAttempts,
     *      reconnectionDelay
     *      reconnectionAttemptsWarning,
     * }
     */
    constructor(opt) {
        opt = opt || {};
        this._socket = null;
        this._status = STATUS_INIT;
        this._liveStatus = LIVE_STATUS_INIT;
        this._pingInfo = {
            pingInterval: opt.pingInterval || 5000,
            pingTimeout: opt.pingTimeout || 3000,
            pingIntervalId: 0,
            pongIntervalId: 0,
            lastPingTime: 0,
            delay: 0,
            isSendingPing: false
        };
        this._reconnectInfo = {
            reconnectionCount: 0,
            reconnectionAttempts: opt.reconnectionAttempts || 100,
            reconnectionDelay: opt.reconnectionDelay || 500,
            reconnectionAttemptsWarning: opt.reconnectionAttemptsWarning || 10,
            reconnectionAttemptsDie: opt.reconnectionAttemptsDie || 25,
            reconnectIntervalId: 0
        };
        this._msgQueue = [];
        this._hashKey = undefined;
        this._emitter = new EventEmitter();
    }

    init(hostName, token) {
        logger.debug('NetworkSocket init: %j', {hostName, token});
        this._hostName = hostName;
        this._token = token;
        this.connect();
    }

    connect() {
        this._socket = new WebSocket(this._hostName, this._token, "cacert.pem");
        this._socket.binaryType = "arraybuffer";

        this._handleConnectionEvent();

        this._liveStatus = LIVE_STATUS_CONNECT;
    }

    close(reason, isReconnect = false, callback = null) {
        if (typeof isReconnect === 'function') {
            callback = isReconnect;
            isReconnect = false;
        }

        logger.debug('NetworkSocket close %s', reason ? ': by ' + reason : '');
        this._changeStatus(STATUS_DISCONNECTED);
        if (this._socket) {
            this._socket.close();
            this._removeHandleConnectionEvent();
            this._socket = null;
        }
        this._cleanupTimer();

        if (!isReconnect) {
            this._liveStatus = LIVE_STATUS_CLOSED;
        }
        if (callback) {
            callback();
        }

    }

    cleanUp() {
        this._emitter.removeAllListeners();
    }

    reconnect(reason) {
        if (this._liveStatus !== LIVE_STATUS_CLOSED) {

            logger.debug('NetworkSocket reconnect by %s', reason);
            //Reset queue message
            this._msgQueue.length = 0;
            if (this._reconnectInfo.reconnectionCount < this._reconnectInfo.reconnectionAttempts) {
                if (this._reconnectInfo.reconnectionCount == this._reconnectInfo.reconnectionAttemptsWarning) {
                    this._emitter.emit(NetworkEvent.EVENT_NETWORK_POOR);
                }
                if (this._reconnectInfo.reconnectionCount == this._reconnectInfo.reconnectionAttemptsDie) {
                    this._emitter.emit(NetworkEvent.EVENT_NETWORK_DIE);
                    this._onClose("NETWORK_DIE");
                }

                logger.debug('NetworkSocket reconnect attempts: %s', this._reconnectInfo.reconnectionCount);
                this._reconnectInfo.reconnectionCount++;
            } else {
                logger.error("NetworkSocket Exceed maximum reconnection attempts.");
                this._emitter.emit(NetworkEvent.EVENT_NETWORK_DIE);
            }

            this.connect();
        } else {
            this._cleanupTimer();
        }
    }

    send(data) {
        if (~NetworkEvent.LIST_EVENT_QUEUE.indexOf(data.requestId) && this._liveStatus == LIVE_STATUS_CONNECT) { //send fire laser
            this._ping(true);
            this._msgQueue.push(data);
            return true;
        } else if (this._status == STATUS_CONNECTED && this._socket && this._socket.readyState == WebSocket.OPEN) {
            if (data.requestId === 3001) {//clear queue on reconnect event
                this._msgQueue.length = 0;
            }
            this._socket.send(this._encode(data));
            return true;
        }
        return false;
    }

    registerEvent(event, listener) {
        this._emitter.on(event, listener);
    }

    removeEvent(event, listener) {
        this._emitter.removeListener(event, listener);
    }

    _handleConnectionEvent() {
        if (this._socket) {
            this._socket.onopen = this._onOpen.bind(this);
            this._socket.onerror = this._onError.bind(this);
            this._socket.onmessage = this._onMessage.bind(this);
            this._socket.onclose = this._onClose.bind(this);
        }
    }

    _removeHandleConnectionEvent() {
        if (this._socket) {
            this._socket.onopen = null;
            this._socket.onerror = null;
            this._socket.onmessage = null;
            this._socket.onclose = null;
        }
    }

    _onOpen() {
        this._changeStatus(STATUS_CONNECTED);
        this._cleanupTimer();
        if (this._reconnectInfo.reconnectionCount > 0) {
            this._emitter.emit(NetworkEvent.EVENT_NETWORK_RECONNECTED);
        } else {
            this._emitter.emit(NetworkEvent.EVENT_NETWORK_CONNECTED);
        }
        this._reconnectInfo.reconnectionCount = 0;

        this._ping();
    }

    _onError(error) {
        logger.debug('NetworkSocket _onError: %j', error);
        this._changeStatus(STATUS_DISCONNECTED);
        this.reconnect('_onError');
    }

    _onMessage(message) {
        let messageDecode = this._decode(message.data);
        const isEncrypted = this._onCheckMessageEncrypted(messageDecode);
        if (isEncrypted) {
            let strMessageDecode = undefined;
            try {
                strMessageDecode = XOCypher.decode_new(this._hashKey, messageDecode);
            } catch (error) {
                const dataLog = {
                    userID: DataStore.instance.selfInfo.UserID,
                    method: DataStore.instance.selfInfo.pek,
                    key: DataStore.instance.selfInfo.cpm,
                    hashKey: this._hashKey,
                    messageDecode: messageDecode,
                    message: message,
                    error: error
                };
                logger.error("NetworkSocket _onMessage decode fail: ", dataLog);
            }
            try {
                messageDecode = JSON.parse(strMessageDecode);
            } catch (error) {
                const dataLog = {
                    userID: DataStore.instance.selfInfo.UserID,
                    method: DataStore.instance.selfInfo.pek,
                    key: DataStore.instance.selfInfo.cpm,
                    hashKey: this._hashKey,
                    messageDecode: messageDecode,
                    strMessageDecode: strMessageDecode,
                    message: message,
                    error: error
                };
                logger.error("NetworkSocket _onMessage JSON.parse fail: ", dataLog);
            }
        }
        logger.debug('NetworkSocket _onMessage: %j', messageDecode);
        if (messageDecode.requestId == 2001) {
            const {cpm, pek} = messageDecode.content;
            this._setHashKeyDecode(cpm, pek);
        }
        if (messageDecode.requestId === 3999) {
            this._pong();
        }
        if (messageDecode.requestId === 3000) {
            this._handleNetworkPacketResponse(messageDecode);
        }
        if (messageDecode.requestId === 2019) { //NO ACTION
            this._handleNoActionLongTime();
        } else {
            this._emitter.emit(NetworkEvent.EVENT_NEW_MESSAGE, messageDecode);
        }
    }

    _onCheckMessageEncrypted(message) {
        if (typeof message == "object") {
            return false;
        }
        return true;
    }

    _setHashKeyDecode(method, key) {
        if (!method || !key) {
            logger.debug("NetworkSocket: No have method or key");
            return;
        }
        this._hashKey = hash(method, key);
    }

    _onClose(event) {
        logger.debug('NetworkSocket _onClose: %j', event);
        this._changeStatus(STATUS_DISCONNECTED);
        this._cleanupTimer();
        this._removeHandleConnectionEvent();
        this._socket = null;

        if (this._liveStatus == LIVE_STATUS_CONNECT) {
            this._reconnectInfo.reconnectIntervalId = setTimeout(() => {
                this.connect('_onClose');
            }, this._reconnectInfo.reconnectionDelay);
        }
    }

    _cleanupTimer() {
        clearTimeout(this._pingInfo.pingIntervalId);
        clearTimeout(this._pingInfo.pongIntervalId);
        clearTimeout(this._reconnectInfo.reconnectIntervalId);

        this._pingInfo.isSendingPing = false;
    }

    _ping(isPingImmediately = false) {
        if (this._liveStatus !== LIVE_STATUS_CLOSED) {

            let delayPing = isPingImmediately ? 0 : this._pingInfo.pingInterval;
            this._pingInfo.pingIntervalId = setTimeout(() => {

                if (!this._pingInfo.isSendingPing) {
                    this._pingInfo.lastPingTime = Date.now();
                    let isSendSuccess = this.send({
                        requestId: 3999,
                        content: {}
                    });
                    if (isSendSuccess) {
                        this._pingInfo.isSendingPing = true;
                    }
                }

                clearTimeout(this._pingInfo.pongIntervalId);
                this._pingInfo.pongIntervalId = setTimeout(() => {
                    logger.debug("pong timeout -> reconnect.");

                    if (this._status == STATUS_CONNECTED) {
                        this._changeStatus(STATUS_DISCONNECTED);
                    }

                    this._ping(true);
                    if (this._socket) {
                        this.close('PONG TIMEOUT', true);
                    }
                    this.reconnect('pong timeout');
                }, this._pingInfo.pingTimeout);
                logger.debug("ping");
            }, delayPing);
        } else {
            this._cleanupTimer();
        }
    }

    _pong() {
        clearTimeout(this._pingInfo.pongIntervalId);
        this._pingInfo.delay = Date.now() - this._pingInfo.lastPingTime;
        this._pingInfo.isSendingPing = false;
        this._ping();

        if (this._status != STATUS_CONNECTED) {
            this._changeStatus(STATUS_CONNECTED);
            if (this._reconnectInfo.reconnectionCount > 0) {
                this._emitter.emit(NetworkEvent.EVENT_NETWORK_RECONNECTED);
                this._reconnectInfo.reconnectionCount = 0;
            }
        }
        for (let i = 0; i < this._msgQueue.length; ++i) {
            if (this._status === STATUS_CONNECTED) {
                this._socket.send(this._encode(this._msgQueue[i]));
            }
        }
        this._msgQueue.length = 0;

        this._emitter.emit(NetworkEvent.EVENT_NETWORK_PINGPONG, this._pingInfo.delay);
        logger.debug("pong: %s", this._pingInfo.delay);
    }

    _handleNetworkPacketResponse({content}) {
        switch (content.code) {
            case 1: // Login in other device.
                this.close('EVENT_LOGIN_IN_OTHER_DEVICE', false);
                this._emitter.emit(NetworkEvent.EVENT_LOGIN_IN_OTHER_DEVICE);
                break;
            case 2: // Authen fail
                this.close('EVENT_AUTHEN_FAIL', false);
                this._emitter.emit(NetworkEvent.EVENT_AUTHEN_FAIL);
                break;
            default:
                cc.error(content);
                break;

        }
    }

    isAvailable() {
        return (this._liveStatus !== LIVE_STATUS_CLOSED);
    }

    _changeStatus(status) {
        logger.debug("NetworkSocket _changeStatus from [%s] to [%s]", this._status, status);
        this._status = status;
    }

    _encode(message) {
        return msgpack.encode(message);
    }

    _decode(byteData) {
        let arr = new Uint8Array(byteData);
        let buf = arr.buffer;
        return msgpack.decode(new Uint8Array(buf));
    }

    _handleNoActionLongTime() {
        this.close('EVENT_NO_ACTION_LONG_TIME');
        this._emitter.emit(NetworkEvent.EVENT_NO_ACTION_LONG_TIME);
    }
}

module.exports = gfNetworkSocket;