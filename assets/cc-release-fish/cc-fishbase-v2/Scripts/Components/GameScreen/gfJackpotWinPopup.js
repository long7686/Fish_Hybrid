

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const { registerEvent, removeEvents, formatCoin } = require('gfUtilities');


cc.Class({
    extends: cc.Component,

    properties: {
        blackLayer: cc.Component,
        txtCoin: cc.Label,
        particleCoin: cc.Node,
        animNode: cc.Node,
        winFrame: cc.Node,
        _coinValue: 0,
        coinValue: {
            visible: false,
            get() {
                return this._coinValue;
            },
            set(value) {
                this._coinValue = value;
                this._updateCoinWin();
            },
        },
        _duration: 9,
    },

    onLoad() {
        this.node.zIndex = GameConfig.instance.Z_INDEX.POPUP;
        registerEvent(EventCode.DRAGON.WARNING, this.onDragonWarning, this);
    },

    onDragonWarning() {
        if (cc.isValid(this.node)) {
            this.hideFn();
        }
    },

    setWinValue(value) {
        this.winValue = value;
    },

    _updateCoinWin() {
        this.txtCoin.string = formatCoin(this._coinValue);
    },

    start() {
        this.txtCoin.string = "0";
        this.winFrame.active = false;
        this.animNode.scale = 0;

        Emitter.instance.emit(EventCode.SOUND.STOP_ALL_AUDIO);
        Emitter.instance.emit(EventCode.SOUND.DRAGON_BIG_WIN);
        Emitter.instance.emit(EventCode.SOUND.PLAY_EFFECT_JACKPOT_COIN);

        this.particleCoin.active = true;
        this.particleCoin.startAnimation();
        this.winFrame.active = true;
        this.winFrame.scaleY = 0.2;
        cc.tween(this.winFrame)
            .to(0.1, { scaleY: 1 })
            .start();
        cc.tween(this.animNode)
            .to(0.25, { scaleX: 1, scaleY: 1 })
            .start();

        this.scheduleOnce(() => {
            this.blackLayer.getComponent(cc.Button).interactable = true;
        }, 0.65);
        this._tweenCoin();
    },

    _tweenCoin() {
        const superValue = this.winValue * 0.75;
        const megaValue = this.winValue * 0.5;
        this.tweenCoin = cc.tween(this)
            .to(this._duration / 3, { coinValue: megaValue }, { easing: "sineInOut" })
            .to(this._duration / 3, { coinValue: superValue }, { easing: "sineInOut" })
            .to(this._duration / 3, { coinValue: this.winValue }, { easing: "sineInOut" })
            .call(() => {
                this.hideFn();});
        this.tweenCoin.start();
    },

    quickShow() {
        if (this.coinValue === this.winValue) {
            return;
        }
        this.blackLayer.getComponent(cc.Button).interactable = false;
        this.tweenCoin.stop();
        this.tweenCoin = cc.tween(this)
            .to(1, { coinValue: this.winValue }, { easing: "quadOut" })
            .delay(1)
            .call(() => {
                this.hideFn();
            })
            .start();
    },

    hideFn() {
        Emitter.instance.emit(EventCode.SOUND.STOP_EFFECT_JACKPOT_COIN);
        DataStore.instance.curBGMusic = null;
        Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
        this.node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.fadeOut(0.5),
            cc.callFunc(() => {
                this.particleCoin.stopAnimation();
                Emitter.instance.emit(EventCode.DRAGON.JACKPOT_WINAMOUNT_POPUP_CLOSE);
                Emitter.instance.emit(EventCode.EFFECT_LAYER.CHECK_QUEUE_ANIM);
                this.node.destroy();
            })
        ));
    },

    onDestroy() {
        this.node.stopAllActions();
        if (this.tweenCoin) {
            this.tweenCoin.stop();
            DataStore.instance.curBGMusic = null;
        }
        if(Emitter.instance){
            Emitter.instance.emit(EventCode.SOUND.STOP_EFFECT_JACKPOT_COIN);
            Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
        }
        removeEvents(this);
    },
});
