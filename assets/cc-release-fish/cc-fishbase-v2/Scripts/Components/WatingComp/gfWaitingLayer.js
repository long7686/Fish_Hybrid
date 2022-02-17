

const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
const GameConfig = require('gfBaseConfig');
const NetworkGameEvent = require('gfNetworkGameEvent');
const Emitter = require('gfEventEmitter');

cc.Class({
    extends: cc.Component,

    properties: {
        iconWating: cc.Node,
    },

    onLoad() {
        cc.game.addPersistRootNode(this.node);
        this.iconWating.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
        this.node.zIndex = GameConfig.instance.Z_INDEX.WAITING;
        this.hideWaiting();
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.SHOW_WAITING, this.showWaiting, this);
        registerEvent(EventCode.COMMON.HIDE_WAITING, this.hideWaiting, this);
        registerEvent(EventCode.COMMON.REMOVE_PERSIST_NODE, this.refreshPage, this);
    },

    showWaiting(needTimeout = false) {
        this.node.active = true;
        this.node.opacity = 0;
        this.node.stopAllActions();
        cc.tween(this.node)
            .to(0.2, {opacity : 255})
            .start();
        this.iconWating.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
        if(needTimeout) {
            this.scheduleOnce(() => {
                this.hideWaiting();
                if(Emitter.instance) {
                    Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.MSG_CODE.WAITING_TIMEOUT);
                }
            }, GameConfig.instance.waiting_timeout);
        }
    },

    hideWaiting() {
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        cc.tween(this.node)
            .to(0.2, {opacity : 0})
            .call(()=> {
                this.node.active = false;
                this.node.opacity = 0;
            })
            .start();
    },
    refreshPage(){
        removeEvents(this);
        this.unscheduleAllCallbacks();
        cc.game.removePersistRootNode(this.node);
    },

    onDestroy() {
        removeEvents(this);
        this.unscheduleAllCallbacks();
    }
});
