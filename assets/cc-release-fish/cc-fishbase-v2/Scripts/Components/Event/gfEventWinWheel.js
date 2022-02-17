const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
cc.Class({
    extends: cc.Component,
    properties: {
        txtCoin: cc.Node,
    },
    onLoad() {
        this.initEvents();
        this.CONFIG_TIME = {
            START: 0.2,
            IDLE: 4,
            END: 0.2
        };
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
    },

    playAnimation(content, callback) {
        this.node.active = true;
        this.resetWheel();
        this.callbackFunc = callback;
        this.winValue = content.GoldReward;
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.animStart();
            }),
            cc.delayTime(this.CONFIG_TIME.START),
            cc.callFunc(() => {
                this.animIdle();
            }),
            cc.delayTime(this.CONFIG_TIME.IDLE),
            cc.callFunc(() => {
                this.animEnd();
            })
        ));
    },

    animStart() {
    },

    animIdle() {
        this.txtCoin.active = true;
        this.txtCoin.onUpdateValue(this.winValue, (this.CONFIG_TIME.IDLE - 1) * 1000);
    },

    animEnd() {
        this.txtCoin.active = false;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.delayTime(this.CONFIG_TIME.END),
            cc.callFunc(() => {
                if (this.callbackFunc && typeof this.callbackFunc === 'function') {
                    this.callbackFunc();
                }
                this.resetOnExit();
            }),
        ));
    },

    resetWheel() {
        if(this.txtCoin.resetValue) {
            this.txtCoin.resetValue();
        }
        this.txtCoin.active = false;
        this.node.stopAllActions();
    },

    resetOnExit(){
        this.resetWheel();
        this.node.active = false;

    },

    onDestroy() {
        removeEvents(this);
    },



});

