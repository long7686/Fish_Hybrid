

const Emitter = require("gfEventEmitter");
const DataStore = require("gfDataStore");
const EventCode = require("EventsCode1990");
const { registerEvent, removeEvents } = require("gfUtilities");

const SCENE_KIND = {
    MINIBOSS: 4,
    SCENE_0: 0,
    SCENE_1: 1,
    SCENE_2: 2,
    SCENE_3: 3,
};
cc.Class({
    extends: cc.Component,

    properties: {
        listBackground: [cc.Node],
        _curBackgroundID: -1,
        animWell: {
            default: null,
            type: sp.Skeleton,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.GAME_LAYER.GAME_CHANGE_ROUND, this.onChangeRound, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_ROOM_DATA, this.onInitBackground, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
    },
    /**
     * rule change background
     * BE send change background
     * FE clear all fish (ignore paradise fish)
     * after this.RoundDelayTime (4s) BE send package spawn fish (2006)
     */
    onInitBackground(data) {
        const backgroundID = parseInt(data.SceneKind);
        if (this._curBackgroundID == backgroundID) return;
        if(!this.listBackground[this._curBackgroundID] && this._curBackgroundID >=0){
            cc.error("Cannot find background ID: ", this._curBackgroundID);
        }
        this._curBackgroundID = backgroundID;
        this.activeBackgroundByID(backgroundID);
    },

    onChangeRound(data) {
        const backgroundID = parseInt(data.SceneKind);
        if (this._curBackgroundID == backgroundID ) return;

        this.tweenWell = null;
        this.tweenCurrentBG = null;
        this.tweenNextBG = null;
        this.tweenActionBG = null;

        switch (backgroundID) {
        case SCENE_KIND.MINIBOSS:
            //todo play transition switch to scene miniboss
            this.onAnimationSwitchBackGroundMiniboss();
            break;
        case SCENE_KIND.SCENE_0:
            //todo play transition switch to scene 0.
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_WAVE_TRANSITION);
            this.onAnimationFadeSwitchBackGround(backgroundID);
            break;
        case SCENE_KIND.SCENE_1:
            this.onAnimationFadeSwitchBackGround(backgroundID);
            break;
        case SCENE_KIND.SCENE_2:
        case SCENE_KIND.SCENE_3:
            //todo play transition switch to scene 2
            this.onAnimationZoomBackground(backgroundID);
            break;
        }
        if(this.tweenActionBG) this.tweenActionBG.start();
        this._curBackgroundID = backgroundID;
    },

    activeBackgroundByID(id) {
        this.listBackground.forEach((bg, index) => {
            if (id == index) {
                if(index == SCENE_KIND.SCENE_1){
                    this.animWell.node.opacity = 255;
                }
                else {
                    this.animWell.node.opacity = 0;
                }
                bg.opacity = 255;
            } else {
                bg.opacity = 0;
            }
        });
    },

    onAnimationSwitchBackGroundMiniboss() {
        if(!this.listBackground[this._curBackgroundID] && this._curBackgroundID >=0){
            cc.error("Cannot find background ID: ", this._curBackgroundID);
        }
        this.tweenCurrentBG = cc.tween(this.listBackground[this._curBackgroundID])
            .to(0.75, { opacity: 0 });

        this.tweenNextBG = cc.tween(this.listBackground[SCENE_KIND.MINIBOSS])
            .to(0.75, { opacity: 255 });

        this.tweenActionBG = cc.tween(this.node)
            .call(()=>{
                Emitter.instance.emit(EventCode.GAME_LAYER.MOVE_OUT_ALL_FISHES); 
            })
            .delay(1.5)
            .call(()=>{
                this.tweenCurrentBG.start();
                Emitter.instance.emit(
                    EventCode.EFFECT_LAYER.SCAN_TRANSITION,
                    (DataStore.instance.getSelfDeskStation() > 1)
                );
            })
            .delay(1.25)
            .call(()=>{
                this.tweenNextBG.start();
            });
    },

    onAnimationFadeSwitchBackGround(newBackgroundKind) {
        if(newBackgroundKind == SCENE_KIND.SCENE_1){
            this.tweenWell = cc.tween(this.animWell.node)
                .to(1, {opacity: 255});
        } 

        this.tweenCurrentBG = cc.tween(this.listBackground[this._curBackgroundID])
            .to(1, { opacity: 0 });

        this.tweenNextBG = cc.tween(this.listBackground[newBackgroundKind])
            .to(1, { opacity: 255 });
        
        this.tweenActionBG = cc.tween(this.node)
            .delay(1)
            .call(()=>{
                this.tweenCurrentBG.start();
                this.tweenNextBG.start();
                if(this.tweenWell) this.tweenWell.start();
            });
    },

    onAnimationZoomBackground(newBackgroundKind) {
        let durationOpenCover = 0;
        let durationFishGroup2MoveOut = 0;
        let isSwitchToScene2 = false;
        if (this._curBackgroundID == SCENE_KIND.SCENE_1) {
            durationOpenCover = this.animWell.findAnimation("animation").duration; //1.5
            durationFishGroup2MoveOut = 1;
            isSwitchToScene2 = true;

            this.tweenWell = cc.tween(this.animWell.node)
                .to(1.25, {opacity: 100, scale: 10})
                .to(0.25, {opacity: 0})
                .to(0, {scale: 1.3})
                .call(() => {
                    this.animWell.setToSetupPose();
                    this.animWell.clearTrack(0);
                });
        }
        this.tweenCurrentBG = cc.tween(this.listBackground[this._curBackgroundID])
            .to(1.5, { opacity: 100, scale: 10 })
            .to(0.25, {opacity: 0})
            .to(0, { scale: 1 });

        this.tweenNextBG = cc.tween(this.listBackground[newBackgroundKind])
            .to(1.75, { opacity: 255 });
        
        this.tweenActionBG = cc.tween(this.node)
            .delay(durationFishGroup2MoveOut)
            .call(()=>{
                if (isSwitchToScene2) {
                    this.animWell.setAnimation(0, "animation", false);
                    Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.03, amplitude: 3 , countStep: 18 });
                }
            })
            .delay(durationOpenCover)
            .call(()=>{
                this.tweenCurrentBG.start();
                if(this.tweenWell) this.tweenWell.start();
                this.tweenNextBG.start();
            });
    },

    resetOnExit() { 
        this.node.stopAllActions();
        if(this.tweenCurrentBG) this.tweenCurrentBG.stop();
        if(this.tweenNextBG) this.tweenNextBG.stop();
        if(this.tweenActionBG) this.tweenActionBG.stop();
        if(this.tweenWell) this.tweenWell.stop();
        if(this.animWell){
            this.animWell.setToSetupPose();
            this.animWell.clearTrack(0);
        }
        this._curBackgroundID = -1;
        this.listBackground.forEach((bg) => {
            bg.scale = 1;
        });
    },

    onDestroy() {
        removeEvents(this);
    },
});
