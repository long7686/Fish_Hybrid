

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const { registerEvent, removeEvents, convertSecondToTimeDay, addTimePrefix } = require("gfUtilities");
const ReferenceManager = require('gfReferenceManager');
const DataStore = require('gfDataStore');
const GameConfig = require('gfBaseConfig');
const Localize = require('gfLocalize');
cc.Class({
    extends: cc.Component,

    properties: {
        tray:  require('gfEventTray'),
        txtEventTime: cc.Label,
        _timeRemain: 0,
        _eventState: null,
    },

    onLoad() {
        this.PREFIX_TIME = ["D:","H:","M:","S"];
        this.node.active = false;
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExitGameRoom, this);
        registerEvent(EventCode.EVENT.EVENT_COMING, this.onComing, this);
        registerEvent(EventCode.EVENT.EVENT_PLAYING, this.onPlaying, this);
        registerEvent(EventCode.EVENT.EVENT_END, this.onEnd, this);
        registerEvent(EventCode.EVENT.EVENT_IDLE, this.onIdle, this);
        registerEvent(EventCode.GAME_LAYER.ON_AFTER_INIT_PLAYER_LIST, this.updatePosition, this);
        registerEvent(EventCode.COMMON.REFRESH_PAGE, this.resetButton, this);
    },

    onIdle(){
        this.node.active = false;
        this.resetButton();
    },
    onComing(){
        this.resetButton();     
        this.node.active = true;
        Emitter.instance.emit(EventCode.EVENT_TRAY_LAYER.RESET_EVENT_TRAY);
        this.txtEventTime.string = Localize.instance.TXT_EVENT.COMING;
        this.tray && this.tray.hide();
    },

    onPlaying(data){
        this.resetButton();
        this.node.active = true;
        const timeRemain = Math.floor((data.EventEndTime - DataStore.instance.getTime())/1000);
        this.updateTimer(timeRemain);
        if(data.EventDetail){
            this.updateTray(data.EventDetail);
        } 
    },

    onEnd(){
        this.resetButton();
        this.node.active = true;
        Emitter.instance.emit(EventCode.EVENT_TRAY_LAYER.RESET_EVENT_TRAY);
        this.txtEventTime.string = Localize.instance.TXT_EVENT.END;
        this.tray && this.tray.hide();
    },

    updateTimer(timeRemain){
        this._timeRemain = Math.floor(timeRemain);
        const formatTime = convertSecondToTimeDay(this._timeRemain);
        this.txtEventTime.string = addTimePrefix(formatTime,this.PREFIX_TIME);
        this._timeRemain--;
        this.schedule(this.startCountDown, 1);
    },

    startCountDown(){
        if(this._timeRemain < 0) {
            return;
        }
        const formatTime = convertSecondToTimeDay(this._timeRemain);
        this.txtEventTime.string = addTimePrefix(formatTime,this.PREFIX_TIME);
        this._timeRemain--;
    },

    updateTray(EventDetail){   
        if(!Array.isArray(EventDetail) || !this.tray) return;
        this.tray && this.tray.updateTray(EventDetail);
    },

    onEventClick() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_EVENT_INFO);
    },

    updatePosition(){
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        if(player) {
            const pos = player.index === 0 ? GameConfig.instance.POS_EVENT.LEFT : GameConfig.instance.POS_EVENT.RIGHT;
            this.node.setPosition(pos);
        }
    },

    resetButton(){
        this.unscheduleAllCallbacks();
        this.tray && this.tray.reset();
        this.txtEventTime.string = '';
    },

    resetOnExitGameRoom(){
        this.resetButton();
        this.node.active = false;     
    },

    onDestroy() {
        removeEvents(this);
    },

});
