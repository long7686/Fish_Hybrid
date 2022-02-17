

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const { registerEvent, removeEvents } = require("gfUtilities");

cc.Class({
    extends: cc.Component,

    properties: {
        jackpotAnim: sp.Skeleton,
        txtValue: cc.Node,
    },

    onLoad() {
        this.initEvents();
        this.onShowJackpotInfo({ isShow: false });
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.UPDATE_JACKPOT, this.onUpdateRoomJackpot, this);
        registerEvent(EventCode.GAME_LAYER.SHOW_JACKPOT_INFO, this.onShowJackpotInfo, this);
        registerEvent(EventCode.DRAGON.WARNING, this.onDragonWarning, this);
    },

    onShowJackpotInfo({ isShow, amount }) {
        this.node.active = isShow;
        if (isShow && amount) {
            if(this.txtValue.getComponent("animateNumberLabel").currentValue  === undefined) {
                this.txtValue.getComponent("animateNumberLabel").currentValue = amount;
            }
            this.onUpdateRoomJackpot(amount);
        }
    },

    onDragonWarning() {
        this.txtValue.stopAllActions();
        this.txtValue.runAction(
            cc.sequence(
                cc.fadeOut(0.25),
                cc.callFunc(() => {
                    Emitter.instance.emit(EventCode.SOUND.DRAGON_APPEAR);
                    Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.1, amplitude: 10 });
                    this.jackpotAnim.setAnimation(0, "animation", false);
                    this.jackpotAnim.setCompleteListener(() => {
                        this.txtValue.runAction(cc.fadeIn(0.25));
                        Emitter.instance.emit(EventCode.SOUND.RESET_VOLUME);
                        this.jackpotAnim.setAnimation(0, "idel", true);
                        this.jackpotAnim.setCompleteListener(() => {});
                    });
                }),
            ),
        );
    },

    onJPHistoryClick() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        // PopupController.instance.showJPHistory();
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_HISTORY);
    },

    onUpdateRoomJackpot(amount, time = 3000) {
        if (amount && this.node.active) {
            const newJP = parseInt(amount);
            this.txtValue.onUpdateValue(newJP, time);
        }
    },
    resetOnExit() {
        if(this.node.active){
            this.txtValue.stopAllActions();
        }
    },

    onDestroy() {
        removeEvents(this);
    },

});
