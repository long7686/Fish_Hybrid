const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const DataStore = require('gfDataStore');
const { registerEvent, removeEvents } = require("gfUtilities");
const { getPostionInOtherNode } = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        arrDataBackground: {
            default: [],
            type: cc.SpriteFrame
        },
        _curBackgroundID: -1,
        background1: {
            default: null,
            type: cc.Component,
            serializable: true
        },
        background2: {
            default: null,
            type: cc.Component,
            serializable: true
        },
        slapTailEffect: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.GAME_LAYER.GAME_CHANGE_ROUND, this.onChangeRound, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_ROOM_DATA, this.onInitBackground, this);
        registerEvent(EventCode.EFFECT_LAYER.MINIBOSS_SMASH, this.onSlapTailEffect, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
    },

    onInitBackground(data) {
        const backgroundID = data.SceneKind;
        if (this._curBackgroundID == backgroundID) return;
        this._curBackgroundID = backgroundID;
        this.background1.spriteFrame = this.arrDataBackground[backgroundID];
        this.background2.spriteFrame = this.arrDataBackground[backgroundID];
        Emitter.instance.emit(EventCode.GAME_LAYER.INIT_BUBBLE, backgroundID);
    },

    onChangeRound(data) {
        const backgroundID = data.SceneKind;
        const isFishGroupToNormal = data.isFishGroupToNormal;
        if (this._curBackgroundID == backgroundID) return;
        this._curBackgroundID = backgroundID;
        this.background2.node.opacity = 0;
        this.background2.spriteFrame = this.arrDataBackground[this._curBackgroundID];


        cc.tween(this.background1.node)
            .delay(1)
            .to(1.5, { opacity: 0 })
            .call(() => {
                this.background1.spriteFrame = this.arrDataBackground[this._curBackgroundID];
                this.background1.node.opacity = 255;
            })
            .start();

        cc.tween(this.background2.node)
            .delay(1)
            .to(1.5, { opacity: 255 })
            .start();

        if (!isFishGroupToNormal) {
            if (this._curBackgroundID > 2) {
                Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_WAVE_TRANSITION);
            } else {
                Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_FISH_GROUP_TRANSITION, !!(DataStore.instance.getSelfDeskStation() > 1));
            }

            Emitter.instance.emit(EventCode.GAME_LAYER.CHANGE_BUBBLE, this._curBackgroundID);
            //@TODO move out fish
        }
    },

    onSlapTailEffect(data) {
        const { nodeSmashTail, scaleX } = data;
        this.slapTailFX = cc.instantiate(this.slapTailEffect);
        this.node.addChild(this.slapTailFX);
        this.slapTailFX.setPosition(getPostionInOtherNode(this.node, nodeSmashTail));
        this.slapTailFX.scaleX = -scaleX;
        let animState = this.slapTailFX.getComponent(cc.Animation).play('SlapTailMiniBoss');
        animState.off('finished');
        animState.on('finished', () => {
            if(cc.isValid(this.slapTailFX)){
                this.slapTailFX.destroy();
                this.slapTailFX = null;
            }
        });
    },
    resetOnExit(){
        if(cc.isValid(this.slapTailFX)){
            this.slapTailFX.destroy();
            this.slapTailFX = null;
        }
    },
    onDestroy() {
        removeEvents(this);
    }
});
