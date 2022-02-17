/* global ingameDeposit */

const GameConfig = require('gfBaseConfig');
const Localize = require('gfLocalize');
const NetworkGameEvent = require('gfNetworkGameEvent');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

cc.Class({
    extends: require('gfPopupBase'),

    properties: {
        txtMessage: cc.Label,
        btnYes: {
            type: cc.Node,
            default: null,
        },
        btnNo: {
            type: cc.Node,
            default: null,
        },
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },

    initLanguage() {
        this.popupTitle && (this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.notice);
    },

    show(data) {
        this.unscheduleAllCallbacks();
        if (data) {
            this._lastData = data;
        }
        if (!this._lastData || !this.txtMessage) return;
        const {msg, type, callbacks} = this.onPromptHandler(this._lastData);
        this.txtMessage.string = msg;

        switch (type) {
            case GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON:
                this.btnYes.x = 0;
                this.btnYes.active = true;
                this.btnNo.active = false;
                this.btnClose.active = false;
                this.btnYes.off('click');
                this.btnYes.on('click', () => {
                    Emitter.instance && Emitter.instance.emit(EventCode.SOUND.CLICK);
                    if (callbacks && callbacks.confirmCallback) {
                        this._callback = callbacks.confirmCallback;
                    }
                    this.onClose();
                }, this);
                break;
            case GameConfig.instance.POPUP_PROMPT.CONFIRM_AND_REJECT_BUTTON:
                this.btnYes.x = -150;
                this.btnNo.x = 150;
                this.btnNo.active = true;
                this.btnYes.active = true;
                this.btnYes.off('click');
                this.btnYes.on('click', () => {
                    Emitter.instance && Emitter.instance.emit(EventCode.SOUND.CLICK);
                    if (callbacks && callbacks.confirmCallback) {
                        this._callback = callbacks.confirmCallback;
                    }
                    this.onClose();
                }, this);

                this.btnNo.off('click');
                this.btnNo.on('click', () => {
                    Emitter.instance && Emitter.instance.emit(EventCode.SOUND.CLICK);
                    if (callbacks && callbacks.rejectCallback) {
                        this._callback = callbacks.rejectCallback;
                    }
                    this.onClose();
                }, this);
                break;
            case GameConfig.instance.POPUP_PROMPT.CONFIRM_AND_CLOSE_BUTTON:
                this.btnYes.x = 0;
                this.btnYes.active = true;
                this.btnNo.active = false;
                this.btnClose.active = true;
                this.btnYes.off('click');
                this.btnYes.on('click', () => {
                    Emitter.instance && Emitter.instance.emit(EventCode.SOUND.CLICK);
                    if (callbacks && callbacks.confirmCallback) {
                        this._callback = callbacks.confirmCallback;
                    }
                    this.onClose();
                }, this);
                break;
            case GameConfig.instance.POPUP_PROMPT.NONE_BUTTON:
                this.btnYes.active = false;
                this.btnNo.active = false;
                this.btnClose.active = false;
                break;
            default:
                this.btnYes.active = false;
                this.btnNo.active = false;
                this.btnClose.active = false;
                break;
        }
        this._super();
    },

    onResetState() {
        if (!cc.isValid(this.node)) return;
        this._super();
        this.btnYes.x = 0;
        this.btnNo.active = false;
        this.btnYes.active = false;
        this.btnClose.active = false;
        this._callback = null;
    },

    onPromptHandler(eventData) {
        const {
            customMsg, customType, customCallbacks, Code,
        } = eventData;
        const eventCode = customMsg || (Code || eventData);
        let msg = null;
        let type = null;
        let callbacks = null;
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        switch (eventCode) {
            case NetworkGameEvent.NETWORK_ERROR:
            case NetworkGameEvent.NETWORK_DIE:
                msg = Localize.instance.NETWORK_MESSAGE.NETWORK_DIE;
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                callbacks = {
                    confirmCallback: () => {
                        Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
                    },
                };
                break;
            case NetworkGameEvent.AUTHEN_FAIL:
                msg = Localize.instance.NETWORK_MESSAGE.AUTHEN_FAIL;
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                callbacks = {
                    confirmCallback: () => {
                        Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
                    },
                };
                break;
            case NetworkGameEvent.LOGIN_IN_OTHER_DEVICE:
                msg = Localize.instance.NETWORK_MESSAGE.LOGIN_IN_OTHER_DEVICE;
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                callbacks = {
                    confirmCallback: () => {
                        Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
                    },
                };
                break;
            case NetworkGameEvent.NETWORK_POOR:
                msg = Localize.instance.NETWORK_MESSAGE.NETWORK_POOR;
                type = GameConfig.instance.POPUP_PROMPT.NONE_BUTTON;
                break;
            case NetworkGameEvent.MSG_CODE.DUPLICATE_LOGIN:
            case NetworkGameEvent.MSG_CODE.IG_DUPLICATE_LOGIN:
                msg = Localize.instance.MessagesSystem[NetworkGameEvent.MSG_CODE.DUPLICATE_LOGIN];
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                callbacks = {
                    confirmCallback: () => {
                        Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
                    },
                };
                break;
            case NetworkGameEvent.MSG_CODE.CANT_FIND_ROOM:
            case NetworkGameEvent.MSG_CODE.ROOM_FULL:
                msg = Localize.instance.MessagesSystem[eventCode];
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                break;
            case NetworkGameEvent.MSG_CODE.OWN_LASER:
                msg = Localize.instance.MessagesSystem[eventCode];
                msg = msg.replace("xxx", Localize.instance.txtGameMode[eventData.roomCode]);
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                break;
            case NetworkGameEvent.MSG_CODE.NO_MONEY_LOBBY:
                if (LOGIN_IFRAME && typeof (ingameDeposit) === 'function') {
                    msg = Localize.instance.MessagesSystem[NetworkGameEvent.MSG_CODE.CHARGE_MONEY];
                    type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                    callbacks = {
                        confirmCallback: () => {
                            ingameDeposit();
                        },
                    };
                } else {
                    msg = Localize.instance.MessagesSystem[NetworkGameEvent.MSG_CODE.NO_MONEY_LOBBY];
                    type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                }
                break;
            case NetworkGameEvent.MSG_CODE.NO_MONEY_IN_GAME:
                if (LOGIN_IFRAME && typeof (ingameDeposit) === 'function') {
                    msg = Localize.instance.MessagesSystem[NetworkGameEvent.MSG_CODE.CHARGE_MONEY];
                    type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                    callbacks = {
                        confirmCallback: () => {
                            ingameDeposit();
                        },
                    };
                } else {
                    msg = Localize.instance.MessagesSystem[NetworkGameEvent.MSG_CODE.NO_MONEY_IN_GAME];
                    type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                    callbacks = {
                        confirmCallback: () => {
                            // Emitter.instance.emit(EventCode.COMMON.GO_LOBBY);
                            Emitter.instance.emit(EventCode.COMMON.SEND_EXIT_GAME_SERVER);
                        },
                    };
                }
                Emitter.instance.emit(EventCode.GAME_LAYER.OFF_ALL_TARGET);
                break;
            case NetworkGameEvent.MSG_CODE.NO_ACTION:
                this.scheduleOnce(this.goToLobby, 4);
                msg = Localize.instance.MessagesSystem[NetworkGameEvent.MSG_CODE.NO_ACTION];
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                callbacks = {
                    confirmCallback: () => {
                        Emitter.instance.emit(EventCode.POPUP.CLOSE_ALL);
                        this.unschedule(this.goToLobby);
                        Emitter.instance.emit(EventCode.COMMON.GO_LOBBY);
                    },
                };
                break;
            case NetworkGameEvent.MSG_CODE.SERVER_MAINTAIN:
                this.scheduleOnce(this.goToLobby, 2);
                msg = Localize.instance.MessagesSystem[NetworkGameEvent.MSG_CODE.SERVER_MAINTAIN];
                type = GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                callbacks = {
                    confirmCallback: () => {
                        Emitter.instance.emit(EventCode.POPUP.CLOSE_ALL);
                        this.unschedule(this.goToLobby);
                        Emitter.instance.emit(EventCode.COMMON.GO_LOBBY);
                    },
                };
                break;
            case NetworkGameEvent.MSG_CODE.WAITING_TIMEOUT:
                this.scheduleOnce(this.goRefreshPage, 2);
                msg = Localize.instance.NETWORK_MESSAGE.NETWORK_DIE;
                type = GameConfig.instance.POPUP_PROMPT.NONE_BUTTON;
                break;
            default:
                msg = Localize.instance.MessagesSystem[eventCode] ? Localize.instance.MessagesSystem[eventCode] : eventCode;
                type = customType || GameConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON;
                if (customCallbacks) {
                    callbacks = customCallbacks;
                }
        }
        return {msg, type, callbacks};
    },


    goRefreshPage(){
        Emitter.instance && Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
    },

    goToLobby() {
        Emitter.instance.emit(EventCode.POPUP.CLOSE_ALL);
        Emitter.instance.emit(EventCode.COMMON.GO_LOBBY);
    },
});
