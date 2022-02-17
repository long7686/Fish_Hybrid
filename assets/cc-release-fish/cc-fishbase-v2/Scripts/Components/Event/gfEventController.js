const StateMachine = require('javascript-state-machine');
const { registerEvent, removeEvents } = require("gfUtilities");
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const DataStore = require("gfDataStore");
const GameConfig = require('gfBaseConfig');
const ReferenceManager = require('gfReferenceManager');
const STATE = {
    IDLE: 'idle',
    COMING: 'coming',
    PLAYING: 'playing',
    END: 'end',
};
const TRANSITION = {
    GO_IDLE: 'goIdle',
    GO_COMING: 'goComing',
    GO_PLAYING: 'goPlaying',
    GO_END: 'goEnd',
};
const EventController = cc.Class({
    properties: {
        _fsm: null,
        eventData: null,
        isGameShow: true,
    },
    ctor() {
        this.initFSM();
        this.initEvents();
    },
    initFSM(){
        this._fsm = new StateMachine({
            init: STATE.IDLE,
            observeUnchangedState: true,
            transitions: [
                { name: TRANSITION.GO_IDLE, from: "*", to: STATE.IDLE },
                { name: TRANSITION.GO_COMING, from: "*", to: STATE.COMING },
                { name: TRANSITION.GO_PLAYING, from: "*", to: STATE.PLAYING },
                { name: TRANSITION.GO_END, from: "*", to: STATE.END },
            ],
            data: {},
            methods: {
                onComing: this.onComing.bind(this),
                onPlaying: this.onPlaying.bind(this),
                onEnd: this.onEnd.bind(this),
                onIdle: this.onIdle.bind(this),
                onInvalidTransition() {
                    //cc.warn("EVENT: Transition", transition, "from", from, "is not allowed");
                },
                onTransition() {
                    //cc.warn("EVENT: From ", lifecycle.from, " to ", lifecycle.to);
                },
            },
        });
    },
    initEvents(){
        registerEvent(EventCode.EVENT.UPDATE_EVENT_STATUS, this.onEventStatus, this);
        registerEvent(EventCode.COMMON.GAME_HIDE, this.gameHide, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.gameShow, this);
        registerEvent(EventCode.COMMON.CLOSE_SCENE, this.goIdle, this);
        registerEvent(EventCode.COMMON.REFRESH_PAGE, this.refreshPage, this);

        registerEvent(EventCode.PLAYER_LAYER.UPDATE_LIST_PLAYER, this.updateListPlayer, this);
        registerEvent(EventCode.PLAYER_LAYER.PLAYER_JOIN_BOARD, this.playerJoinBoard, this);
        registerEvent(EventCode.PLAYER_LAYER.PLAYER_LEAVE_BOARD, this.playerLeaveBoard, this);
    },

    goIdle(){
        this._fsm.goIdle();
    },

    gameHide(){
        this.isGameShow = false;
        this.goIdle();
    },

    gameShow(){
        this.isGameShow = true;
        if(DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Lobby) {
            Emitter.instance.emit(EventCode.EVENT.SEND_GET_EVENT_INFO);
        }
    },
  
    onComing(){
        Emitter.instance.emit(EventCode.EVENT.EVENT_COMING, this.eventData);
    },

    onPlaying(){
        Emitter.instance.emit(EventCode.EVENT.EVENT_PLAYING, this.eventData);
    },
    onEnd(){
        Emitter.instance.emit(EventCode.EVENT.EVENT_END, this.eventData);
    },

    onIdle(){
        this.setEventData(null);

        Emitter.instance.emit(EventCode.EVENT.EVENT_IDLE);
    },

    onEventStatus(data) {
        //if(!this.isGameShow) return;

        // cc.warn('onEventStatus', data);
        this.setEventData(data ? data : null);
        if(!this.eventData){
            cc.warn('Event not started');
            this.goIdle();
            return;
        }
        DataStore.instance.setSelfInfo({EventInfo: this.eventData});
        const {EventStartTime, EventEndTime} = this.eventData;
        if(DataStore.instance.getTime() < EventStartTime){
            this._fsm.goComing();
        } else if (DataStore.instance.getTime() > EventEndTime){
            this._fsm.goEnd();
        } else {
            this._fsm.goPlaying();
        }
    },

    setEventData(data){
        this.eventData = data;
    },

    getEventData() {
        return this.eventData;
    },

    updateListPlayer(data) {
        if(!this.isEventPlaying()) return;
        for (let i = 0; i < data.length; i++) {
            const userInfo = data[i];
            const eventTray = ReferenceManager.instance.getEventTrayByDeskStation(userInfo.DeskStation);
            if (eventTray && userInfo.EventDetail) {
                eventTray.updateTray(userInfo.EventDetail);
            }
        }
    },

    playerJoinBoard(userInfo = null) {  
        if(!this.isEventPlaying()) return;
        const eventTray = ReferenceManager.instance.getEventTrayByDeskStation(userInfo.DeskStation);
        if (eventTray) {
            eventTray.updateTray(userInfo.EventDetail);
        }
    },

    playerLeaveBoard(data = null) {
        const eventTray = ReferenceManager.instance.getEventTrayByDeskStation(data.DeskStation);
        if (eventTray) {
            eventTray.hide();
            if(data.DeskStation != DataStore.instance.getSelfDeskStation()) {
                Emitter.instance.emit(EventCode.EFFECT_LAYER.REMOVE_EVENT_EFFECT_PLAYER, data);
            }
        }
    },

    isEventPlaying(){
        return this._fsm.is(STATE.PLAYING);
    },

    isEventComing(){
        return this._fsm.is(STATE.COMING);
    },

    refreshPage(){
        this.destroy();
    },

    destroy(){
        removeEvents(this);
        this._fsm = null;
    },


});
EventController.instance = null;
module.exports = EventController;