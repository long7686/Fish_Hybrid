

const EventCode = require("gfBaseEvents");
const GameConfig = require('gfBaseConfig');
const { registerEvent, removeEvents } = require("gfUtilities");
const offsetX = 200;
cc.Class({
    extends: cc.Component,

    properties: {
        wave: cc.Node,
        bubble: cc.Prefab,
    },

    onLoad() {
        this.node.opacity = 0;
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.EFFECT_LAYER.PLAY_WAVE_TRANSITION, this.playWaveTransition, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
    },


    playWaveTransition() {
        const realSize = GameConfig.instance.realSize;
        this.resetOnExit();
        this.node.opacity = 255;
        this.schedule(this.createBubble, 0.1);
        this.wave.runAction(cc.sequence(
            cc.moveTo(4, -(realSize.Width + offsetX), 0),
            cc.callFunc(() => {
                this.unschedule(this.createBubble);
                this.node.opacity = 0;
            })
        ));
    },

    createBubble() {
        const realSize = GameConfig.instance.realSize;
        const Count = 5;
        for (let i = 0; i < Count; ++i) {
            const bubble = cc.instantiate(this.bubble);
            bubble.parent = this.node;
            bubble.x = this.wave.x + Math.random() * 50 - 220;
            bubble.y = -realSize.Height / 2 + (realSize.Height / Count * i) + Math.random() * 100;
        }
    },
    resetOnExit() {
        const realSize = GameConfig.instance.realSize;
        this.node.opacity = 0;
        this.wave.x = realSize.Width / 2 + offsetX;
        this.wave.stopAllActions();
        this.unschedule(this.createBubble);
    },

    onDestroy() {
        removeEvents(this);
    }
});
