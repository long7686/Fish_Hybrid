class PacketManager {
    constructor (maxRetry) {
        this.MAX_RETRY = maxRetry || 3;
        this._ackPacket = {};
        this._ids = 0;
    }
    hasPacket() {
        return Object.keys(this._ackPacket).length > 0;
    }
    addNew(message) {
        let packetId = this._ids++;
        this._ackPacket[packetId] = {
            counter: 0,
            message
        };
        return packetId;
    }

    removeSendingMessage(checkRemoveMessageFn) {
        Object.keys(this._ackPacket).forEach(packetId => {
            let {message} = this._ackPacket[packetId];
            if (checkRemoveMessageFn(message)){
                delete this._ackPacket[packetId];
            }
        });
    }

    iteratePacket(availableMsgCb, invalidMsgCb) {
        let packet;
        Object.keys(this._ackPacket).forEach( (packetId) => {
            packet = this._ackPacket[packetId];
            if (packet.counter == 0 ) {
                packet.counter++;
            } else if (packet.counter < this.MAX_RETRY) {
                availableMsgCb(packetId, packet.message, packet.counter);
                packet.counter++;
            } else {
                delete this._ackPacket[packetId];
                invalidMsgCb(packetId, packet.message);
            }
        });
    }

    ackPacket(packetId) {
        let packet = this._ackPacket[packetId];
        delete this._ackPacket[packetId];
        return packet ? packet.message : null;
    }

    updateAllCounter(counter) {
        Object.keys(this._ackPacket).forEach( (packetId) => {
            this._ackPacket[packetId].counter = counter;
        });
    }

    updateCounter(packetId, counter) {
        this._ackPacket[packetId].counter = counter;
    }

    clearAll(){
        this._ackPacket = {};
    }
}

module.exports = PacketManager;