

const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
cc.Class({
    extends: cc.Component,

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initEvents();
    },
    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.EFFECT_LAYER.PLAY_FISH_GROUP_TRANSITION, this.play, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
    },
    start () {
        this.node.opacity = 0;
    },

    resetOnExit(){
        this.node.opacity = 0;
        this.node.stopAllActions();
    },

    play(isRightToLeft){
        this.resetOnExit();
        this.node.scaleX = isRightToLeft ? 1 : -1;
        this.node.opacity = 255;
        //@TODO Shake screen
        this.node.getComponent(sp.Skeleton).setAnimation(0,'animation',false);
    },
    onDestroy(){
        removeEvents(this);
    }
});
