

const NetworkEvent = require('gfNetworkEvent');
const EventEmitter = require('events');
const logger = require('logger');
const KeyMap = require('gfNetworkKeyMap');
const GameEvent = require('gfNetworkGameEvent');
const NetworkSocket = require('gfNetworkSocket');

const gfNetworkParser = cc.Class({
    ctor () {
        this.logtag = "::gfNetworkParser::";
        this._emitter = new EventEmitter();
        this.socket = new NetworkSocket({
            pingInterval : 2000,
            pingTimeout : 3000,
            reconnectionAttempts: 999999,
            reconnectionAttemptsWarning : 1,
            reconnectionAttemptsDie : 5,
            reconnectionDelay : 2000
        });
        this._handleSocketEvent();
        this.deskInfo = {DeskId : ''};
    },

    /* Common function. */
    executeCommand(commandPayload) {
        if(this.socket == null) {
            return;
        }
        this.socket.send(commandPayload);
    },


    /* End Common function. */

    onEnterGame() {
    },

    onLeaveGame() {
        this.deskInfo = {DeskId : ''};
    },

    onEnterDie(reason) {
        logger.debug(this.logtag, 'Fish onEnterDie: %s', reason);
        this.close(reason);
        this.cleanup();
    },

    registerEvent(event, listener) {
        this._emitter.on(event, listener);
    },

    removeEvent(event, listener) {
        this._emitter.removeListener(event, listener);
    },

    connectMaster(ip, token){
        //close old connection
        this.socket.close('connectMaster',()=>{
            this.socket.init(ip, encodeURIComponent(token));
        });

        //setUp new connetion for lobby
        // this.socket.connect();
    },

    connectGame(ip, token) {
        //close old connection
        this.socket.close('connectGame', ()=>{
            this.socket.init(ip, token);
        });

        //setUp new connetion
        // this.socket.connect();
    },

    close(reason) {
        this.socket.close(reason);
    },

    cleanup() {
        if (!this._emitter || !this.socket) return;
        this.close('QUIT GAME!!!');
        this.socket.cleanUp();
        this.socket = null;
        this._emitter.removeAllListeners();
        this._emitter = null;
    },

    parseContent(content, requestId){
        let tmpContent;
        if(content && Array.isArray(content)){
            tmpContent = [];
            for(let i = 0; i < content.length; ++i){
                tmpContent[i] = this.parseContent(content[i],requestId);
            }
        }
        else if(content && typeof content === 'object') {
            tmpContent = {};
            Object.keys(content).forEach(key => {
                // if (!KeyMap.hasOwnProperty(key)) {
                //     cc.warn("Couldn't find mapping key for:", key, "in request", requestId);
                // }
                let newKey = KeyMap[key] || key;
                let newValue = content[key];
                if (Array.isArray(newValue)) {
                    for (let i = 0; i < newValue.length; ++i) {
                        newValue[i] = this.parseContent(newValue[i],requestId);
                    }
                } else if (typeof newValue === 'object') newValue = this.parseContent(newValue,requestId);
                tmpContent[newKey] = newValue;
            });
        }
        else 
            tmpContent = content;
        return tmpContent;
    },

    _handleSocketEvent() {
        this.socket.registerEvent(NetworkEvent.EVENT_NEW_MESSAGE, ({requestId, content}) => {
            content = this.parseContent(content,requestId);
            this._emitter.emit(requestId, content);
        });

        this.socket.registerEvent(NetworkEvent.EVENT_NETWORK_CONNECTED, () => {
            this._emitter.emit(GameEvent.NETWORK_EVENT, {
                EventID: GameEvent.NETWORK_CONNECT,
                EventData: {}
            });
        });

        this.socket.registerEvent(NetworkEvent.EVENT_NETWORK_POOR, () => {
            this._emitter.emit(GameEvent.NETWORK_EVENT, {
                EventID: GameEvent.NETWORK_POOR,
                EventData: {}
            });
        });

        this.socket.registerEvent(NetworkEvent.EVENT_NETWORK_DIE, () => {
            this._emitter.emit(GameEvent.NETWORK_EVENT, {
                EventID: GameEvent.NETWORK_DIE,
                EventData: {}
            });
        });

        this.socket.registerEvent(NetworkEvent.EVENT_NETWORK_RECONNECTED, () => {
            this._emitter.emit(GameEvent.NETWORK_EVENT, {
                EventID: GameEvent.NETWORK_RECONNECT,
                EventData: {}
            });
        });

        this.socket.registerEvent(NetworkEvent.EVENT_AUTHEN_FAIL, () => {
            this._emitter.emit(GameEvent.NETWORK_EVENT, {
                EventID: GameEvent.AUTHEN_FAIL,
                EventData: {}
            });
        });


        this.socket.registerEvent(NetworkEvent.EVENT_NETWORK_PINGPONG, (data) => {
            this._emitter.emit(GameEvent.NETWORK_EVENT, {
                EventID: GameEvent.PINGPONG,
                EventData: {data}
            });
        });

        this.socket.registerEvent(NetworkEvent.EVENT_LOGIN_IN_OTHER_DEVICE, () => {
            this._emitter.emit(GameEvent.NETWORK_EVENT, {
                EventID: GameEvent.LOGIN_IN_OTHER_DEVICE,
                EventData: {}
            });
        });
        this.socket.registerEvent(NetworkEvent.EVENT_NO_ACTION_LONG_TIME, () => {
            this.socket.close("EVENT_NO_ACTION_LONG_TIME");
            this._emitter.emit(GameEvent.GAME_KICK);
        });
    },

    optimizeContent(content, requestId){
        let tmpContent;
        if(content && Array.isArray(content)){
            tmpContent = [];
            for(let i = 0; i < content.length; ++i){
                tmpContent[i] = this.optimizeContent(content[i],requestId);
            }
        }
        else if(content && typeof content === 'object') {
            tmpContent = {};
            Object.keys(content).forEach(key => {
                let newKey;
                if(!Object.keys(KeyMap).find(mapkey => KeyMap[mapkey] === key)){
                    // cc.warn("Couldn't find mapping key for:", key, "in request", requestId);
                    newKey = key;
                }
                else newKey = Object.keys(KeyMap).find(mapkey => KeyMap[mapkey] === key);
                let newValue = content[key];
                if (Array.isArray(newValue)) {
                    for (let i = 0; i < newValue.length; ++i) {
                        newValue[i] = this.optimizeContent(newValue[i],requestId);
                    }
                } else if (typeof newValue === 'object') newValue = this.optimizeContent(newValue,requestId);
                tmpContent[newKey] = newValue;
            });
        }
        else tmpContent = content;
        return tmpContent;
    },
    _buildMessage(requestId, data) {
        data = this.optimizeContent(data, requestId);
        return {requestId:requestId, content:data};
    },
    isAvailable(){
        return this.socket.isAvailable();
    },
    // ***************** LOBBY *****************************
    sendGetInfoGameRoom(roomKind) {
        let data = {
            KindID : roomKind
        };
        let message = this._buildMessage(GameEvent.LOBBY_GET_ROOM_INFO, data);
        this.executeCommand(message);
    },

    /// ********  GAME *************

    sendJoinDesk(deskId)
    {
        let data = {DeskId : deskId};
        let message = this._buildMessage(GameEvent.GAME_JOIN_DESK, data);
        this.executeCommand(message);
    },

    sendGunFire(data) {
        let message = this._buildMessage(GameEvent.GAME_USER_FIRE, data);
        this.executeCommand(message);
    },

    sendActiveFreezeGun(){
        let message = this._buildMessage(GameEvent.GAME_ACTIVE_FREEZE_GUN);
        this.executeCommand(message);
    },

    sendCatchFishSkill(data) {
        let message = this._buildMessage(GameEvent.GAME_CATCH_FISH_SKILL, data);
        this.executeCommand(message);
    },

    sendFireSkill(Angle, Pos) {
        let data = {};
        data.Angle = Angle;
        data.x = Pos.x;
        data.y = Pos.y;
        let message = this._buildMessage(GameEvent.GAME_FIRE_SKILL, data);
        this.executeCommand(message);
    },

    sendCatchFish(FishID, Multiple, BulletID, FireType) {
        let data = {};
        data.FishID = FishID;
        data.Multiple = Multiple;
        data.BulletID = BulletID;
        data.FireType = FireType;
        let message = this._buildMessage(GameEvent.GAME_CATCH_FISH, data);
        this.executeCommand(message);
    },

    sendExitGameServer () {
        let message = this._buildMessage(GameEvent.GAME_USER_EXIT, {});
        this.executeCommand(message);
    },
    sendRegisterExit () {
        let message = this._buildMessage(GameEvent.GAME_ON_CLOSE_TAB, {});
        this.executeCommand(message);
    },

    notifyShowGame() {
        let message = this._buildMessage(GameEvent.GAME_LIST_FISH_ON_SHOW, {});
        this.executeCommand(message);
    },
    sendIdleMessage() {
        let message = this._buildMessage(GameEvent.GAME_IDLE_MESSAGE, {});
        this.executeCommand(message);
    },
    getBotSetting(roomKind){
        let message = this._buildMessage(GameEvent.GAME_GET_BOT_SETTING, {RoomKind: roomKind});
        this.executeCommand(message);
    },
    setBotSetting(arrFkd, duration, roomKind){
        let data = {
            FishKind: arrFkd,
            timeToExpire: duration,
            RoomKind: roomKind
        };
        let message = this._buildMessage(GameEvent.GAME_SET_BOT_SETTING, data);
        this.executeCommand(message);
    },
    stopBot(){
        let message = this._buildMessage(GameEvent.GAME_STOP_BOT, {});
        this.executeCommand(message);
    },

    sendGetLobbyEventInfo() {
        let message = this._buildMessage(GameEvent.LOBBY_UPDATE_EVENT_STATUS);
        this.executeCommand(message);
    },
    sendGetGameEventInfo(){
        let message = this._buildMessage(GameEvent.GAME_UPDATE_EVENT_STATUS);
        this.executeCommand(message);
    },

    sendGetLobbyOnShow(){
        let message = this._buildMessage(GameEvent.LOBBY_ON_SHOW);
        this.executeCommand(message);
    },

    destroy(){
        this.cleanup();
        gfNetworkParser.instance = null;

    },

});
gfNetworkParser.instance = null;
module.exports = gfNetworkParser;