cc.Class({
    extends: require('gfCutSceneItem'),
    properties: {
        overlay: cc.Component,
        txtCoin: cc.Node,
    },

    onLoad() {
        this._super();
        this.CONFIG_TIME = {
            START: 2,
            IDLE: 6,
            END: 1
        };
    },

    extendShow(content, callback) {
        this.resetCutScene();
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
        this.overlay.getComponent(cc.Button).interactable = true;
        this.txtCoin.active = true;
        this.txtCoin.onUpdateValue(this.winValue, (this.CONFIG_TIME.IDLE - 2) * 1000);
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
                this.node.destroy();
            }),
        ));
    },

    resetCutScene() {
        this.isQuickShow = false;
        this.overlay.getComponent(cc.Button).interactable = false;
        this.txtCoin.resetValue();
        this.txtCoin.active = false;
        this.node.stopAllActions();
    },

    quickShow() {
        if (this.isQuickShow) return;
        //cc.warn("quickShow");
        this.isQuickShow = true;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.txtCoin.onUpdateValue(this.winValue, 500);
            }),
            cc.delayTime(1.5),
            cc.callFunc(() => {
                this.animEnd();
            })
        ));
    },


});

