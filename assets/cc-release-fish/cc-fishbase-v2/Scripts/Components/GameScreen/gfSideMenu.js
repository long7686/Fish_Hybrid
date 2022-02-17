

const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
const GameConfig = require("gfBaseConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        nodeMove: cc.Node,
        frameWidth: 90,
        iconHide: cc.Node,
        isHide: {
            default: true,
            visible: false,
        },
    },

    onLoad() {
        this.node.zIndex = GameConfig.instance.Z_INDEX.MENU;
        this.resetSideMenu();
        this.btnHideHandle = this.hideSideBar.bind(this);
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
    },

    onInfoClick() {
        if (!this.isActionDone) return;
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_INFO);
        // PopupController.instance.showInfo();
        this.unscheduleAllCallbacks();
        this.hideSideBar();
    },
    onExitClick() {
        if (!this.isActionDone) return;
        Emitter.instance.emit(EventCode.COMMON.SHOW_WAITING, true);
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.unscheduleAllCallbacks();
        this.hideSideBar();
        Emitter.instance.emit(EventCode.COMMON.SEND_EXIT_GAME_SERVER);
    },


    onSettingClick() {
        if (!this.isActionDone) return;
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_SETTING);
        //PopupController.instance.showSetting();
        this.unscheduleAllCallbacks();
        this.hideSideBar();
    },

    onJPHistoryClick() {
        if (!this.isActionDone) return;
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_HISTORY);
        // PopupController.instance.showJPHistory();
        this.unscheduleAllCallbacks();
        this.hideSideBar();
    },

    onBtnHistoryClick() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_HISTORY);
        // PopupController.instance.showJPHistory();
        this.unscheduleAllCallbacks();
    },

    onHideClick() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.hideSideBar();
    },
    hideSideBar() {
        if (!this.isActionDone)
            return;
        this.unschedule(this.btnHideHandle);
        this.isActionDone = false;
        let pos = cc.v2(-this.frameWidth, 0);
        this.isHide = !this.isHide;
        this.iconHide.scaleX = -this.iconHide.scaleX;
        if (this.isHide) {
            pos = cc.v2(0, 0);
        } else {
            this.scheduleOnce(this.btnHideHandle, 3);
        }
        let baseEasing = this.isHide ? cc.easeSineIn() : cc.easeSineOut();
        this.nodeMove.stopAllActions();
        this.nodeMove.runAction(cc.sequence(
            cc.moveTo(0.3, pos).easing(baseEasing),
            cc.callFunc(() => {
                this.isActionDone = true;
            })
        ));
    },
    resetSideMenu() {
        this.unschedule(this.btnHideHandle);
        this.isHide = true;
        this.iconHide.scaleX = -1;
        this.nodeMove.stopAllActions();
        this.nodeMove.setPosition(0, 0);
        this.isActionDone = true;
    },


    resetOnExit() {
        this.resetSideMenu();
        this.unscheduleAllCallbacks();
    },
    onDestroy() {
        removeEvents(this);
    },
});
