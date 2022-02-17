

const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        this.node.opacity = 0;
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.EFFECT_LAYER.SHOW_NOTIFY_LOCK_FISH, this.showNotifyLockFish, this);
        registerEvent(EventCode.EFFECT_LAYER.HIDE_NOTIFY_LOCK_FISH, this.resetOnExit, this);
    },

    showNotifyLockFish() {
        this.resetOnExit();
        this.node.opacity = 255;
    },

    resetOnExit() {
        this.node.opacity = 0; 
    },

    onDestroy() {
        removeEvents(this);
    },
});
