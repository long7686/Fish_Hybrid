

const EventCode = require("EventsCode1990");
const FishManager = require('gfFishManager');
const GameConfig = require('Config1990');
const {registerEvent, removeEvents} = require('gfUtilities');
const { getPostionInOtherNode } = require('utils');
const ANIM_SCAN_NAME = {
    ONE_TIME: "onetime",
    DEFAULT: "animation"
};
cc.Class({
    extends: cc.Component,

    properties: {
        spScan: sp.Skeleton,
    },

    onLoad() {
        this.node.opacity = 0;
        this.initEvents();
        
    },

    initEvents() {        
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
        registerEvent(EventCode.EFFECT_LAYER.SCAN_MINI_BOSS, this.playFXScanMiniBoss, this);
        registerEvent(EventCode.EFFECT_LAYER.SCAN_TRANSITION, this.playFXScanTransition, this);
    },

    playFXScanMiniBoss(fishID) {
        const fish = FishManager.instance.getFishById(fishID);
        if(fish && fish.isAvailable()){
            this.node.position = getPostionInOtherNode(this.node.parent, fish.node);
            this.node.opacity = 255;
            this.spScan.setAnimation(0, ANIM_SCAN_NAME.ONE_TIME, false);
        }
    },
    playFXScanTransition(isRightToLeft){
        this.node.position = isRightToLeft ? cc.v2(GameConfig.instance.realSize.Width / 2, 0) : cc.v2(-GameConfig.instance.realSize.Width / 2, 0);
        this.node.opacity = 255;
        this.spScan.setAnimation(0, ANIM_SCAN_NAME.DEFAULT, false);
    },
    resetOnExit() {
        this.node.opacity = 0;
    },

    onDestroy() {
        removeEvents(this);
    },
});
