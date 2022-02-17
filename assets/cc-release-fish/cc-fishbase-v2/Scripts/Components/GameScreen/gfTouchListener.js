const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const ReferenceManager = require('gfReferenceManager');
const { registerEvent, removeEvents } = require("gfUtilities");

cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad() {
        this._userFireFunc = this._userFire.bind(this);
        this.holdClick = false;
        this.actionLastTime = Date.now();
        this.initEvents();
    },
    initEvents() {
        registerEvent(EventCode.GAME_LAYER.ON_AFTER_INIT_PLAYER_LIST, this.registerTouch, this);

        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.RESET_TOUCH_LISTENER, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.EXIT_GAME, this.removeTouchEvent, this);

    },
    registerTouch(){
        this.node.on(cc.Node.EventType.TOUCH_START, this._onUserStartTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onUserMoveTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onUserEndTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onUserEndTouch, this);
        if (!cc.sys.isNative) {
            this.node.on(cc.Node.EventType.MOUSE_MOVE, this._onUserMoveTouch, this);
        }
    },

    _onUserStartTouch(e) {
        const selfInfo = DataStore.instance.getSelfInfo();
        const targetState = DataStore.instance.getTargetState();
        this.holdClick = true;
        this._updateTouchPos((e) ? e.getLocation() : null);
        if (selfInfo.isLockGun) return;
        if (targetState === GameConfig.instance.TARGET_LOCK.AUTO_FIRE || targetState === GameConfig.instance.TARGET_LOCK.AUTO_BOT) {
            return;
        }
        if (targetState === GameConfig.instance.TARGET_LOCK.TARGET_ALL || targetState === GameConfig.instance.TARGET_LOCK.TARGET_ONE) {
            if (!selfInfo.skillLock) {
                Emitter.instance.emit(EventCode.GAME_LAYER.CHOOSE_FISH_BY_POINT, DataStore.instance.getMousePos());
                return;
            }
        }
        if (this._checkValidClick()) {
            this._onUserFire('touch_start');
        }
        this.actionLastTime = Date.now();
    },

    _onUserMoveTouch(e) {
        const selfInfo = DataStore.instance.getSelfInfo();
        if (selfInfo.isLockGun) return;
        if (selfInfo.skillLock) {
            this._updateTouchPos(e.getLocation());
            const myPlayer = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfDeskStation());
            if (myPlayer) {
                myPlayer.rotateGun(DataStore.instance.getMousePos());
            }
        }
        if (this.holdClick) {
            this._updateTouchPos(e.getLocation());
        }
    },

    _onUserEndTouch() {
        const selfInfo = DataStore.instance.getSelfInfo();
        this.holdClick = false;
        this.actionLastTime = Date.now();
        if (selfInfo.isLockGun) return;
        this._onUserFire('touch_end');
        this._checkTargetOne();
    },

    _onUserFire(status = 'touch_start') {
        const selfInfo = DataStore.instance.getSelfInfo();
        if (selfInfo.skillLock) {
            if (status === 'touch_end') {
                const myPlayer = ReferenceManager.instance.getPlayerByDeskStation(selfInfo.DeskStation);
                if (myPlayer) {
                    myPlayer.rotateGun(DataStore.instance.getMousePos());
                    this.scheduleOnce(() => { myPlayer.onPlayerSendFireLaser(); }, 0);
                }
            }
        } else if (status === 'touch_end') {
            this.unschedule(this._userFireFunc);
        } else {
            this._userFire();
            this.schedule(this._userFireFunc, DataStore.instance.FireSpeed.NORMAL);
        }
    },

    _userFire() {
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_SEND_FIRE, { point: DataStore.instance.mousePos, lockFishID: -1 });
    },

    _checkValidClick() {
        const deltaTime = Date.now() - this.actionLastTime;
        return (deltaTime > 40);
    },

    _updateTouchPos(pos) {
        if (!pos) return;
        DataStore.instance.setDataStore({ mousePos: pos });
    },
    _checkTargetOne() {
        // Todo: check and change target
    },

    update() {
    },

    removeTouchEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onUserStartTouch, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onUserMoveTouch, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onUserEndTouch, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onUserEndTouch, this);
        if (!cc.sys.isNative) {
            this.node.off(cc.Node.EventType.MOUSE_MOVE, this._onUserMoveTouch, this);
        }
    },

    resetOnExit() {
        this.holdClick = false;
        DataStore.instance.setDataStore({ mousePos: null });
        this.unschedule(this._userFireFunc);
    },

    onDestroy() {
        removeEvents(this);
        this.removeTouchEvent();
    },

});
