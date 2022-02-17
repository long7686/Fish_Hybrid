const EventCode = require("gfBaseEvents");
const {registerEvent, removeEvents} = require("gfUtilities");
const NetworkGameEvent = require('gfNetworkGameEvent');
const ReferenceManager = require('gfReferenceManager');
const DataStore = require('gfDataStore');
const GameConfig = require('gfBaseConfig');
const STATUS = {
    STRONG: 0,
    MEDIUM: 1,
    WEAK: 2,
    DISCONNECT: 3,
};
const WIFI_STATUS_AVERAGE = 5;

cc.Class({
    extends: cc.Component,

    properties: {
        listSprite: {
            default: [],
            type: cc.SpriteFrame
        },
        _right: false
    },

    onLoad() {
        this._ping = this.node.getChildByName('ping');
        this._lablePing = this._ping.getComponent(cc.Label);
        this._ms = this.node.getChildByName('ms');
        this._sprite = this.node.getChildByName('icon').getComponent(cc.Sprite);
        this.initEvents();
        this.node.setupRight = this.setupRight.bind(this);
        this.node.opacity = 0;
        this._listTotalPing = [];
        this._average();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.UPDATE_PING, this.onPingUpdate, this);
        registerEvent(EventCode.COMMON.NETWORK_STATUS_INFO, this._onNetworkState, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this._resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.ON_AFTER_INIT_PLAYER_LIST, this._updatePositionWifi, this);
        this._lablePing.string = '';
    },

    setupRight() {
        this._right = true;
        this._ping.anchorX = 0;
        this._ping.x = -37;
        this._ms.x = -60;
    },

    onPingUpdate(ms) {
        let sprite = null;
        let color = null;
        this._handlerListPing(ms);
        this._average();
        if (this._averagePing > 0 && this._averagePing <= 100) {
            sprite = this.listSprite[STATUS.STRONG];
            color = cc.Color.GREEN;
        } else if (this._averagePing > 100 && this._averagePing <= 300) {
            sprite = this.listSprite[STATUS.MEDIUM];
            color = cc.Color.YELLOW;
        } else {
            sprite = this.listSprite[STATUS.WEAK];
            color = cc.Color.RED;
        }
        this._ping.color = color;
        if(this._ms) this._ms.color = color;
        this._lablePing.string = this._averagePing;
        this._sprite.spriteFrame = sprite;
    },

    _onNetworkState(data) {
        if (!cc.isValid(this.node)) return;
        switch (data.EventID) {
            case NetworkGameEvent.NETWORK_ERROR:
            case NetworkGameEvent.NETWORK_CLOSE:
            case NetworkGameEvent.NETWORK_POOR:
            case NetworkGameEvent.NETWORK_DIE:
                this._sprite.spriteFrame = this.listSprite[STATUS.DISCONNECT];
                this._enableLbl(false);
                break;
            case NetworkGameEvent.NETWORK_RECONNECT:
                this._enableLbl(true);
                this.onPingUpdate(100);
                break;
            default:
                break;
        }
    },

    _updatePositionWifi() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        if (!player) {
            return;
        }
        const pos = player.index === 0 ? GameConfig.instance.POS_WIFI_STATUS.LEFT : GameConfig.instance.POS_WIFI_STATUS.RIGHT;
        this.node.opacity = 255;
        this.node.setPosition(pos);
    },

    _enableLbl(status) {
        this._ping.active = this._ms.active = status;
    },

    _average() {
        this._averagePing = Math.round(this._listTotalPing.reduce((p, c) => p + c, 0) / this._listTotalPing.length);
    },

    _handlerListPing(ms) {
        this._listTotalPing.length >= WIFI_STATUS_AVERAGE && this._listTotalPing.pop();
        this._listTotalPing.push(ms);
    },

    _resetOnExit() {
        this.node.active = false;
    },

    onDestroy() {
        removeEvents(this);
    }
});
