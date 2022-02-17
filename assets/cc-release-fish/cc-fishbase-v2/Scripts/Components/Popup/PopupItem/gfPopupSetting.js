const EventCode = require("gfBaseEvents");
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Localize = require("gfLocalize");
const Emitter = require('gfEventEmitter');

cc.Class({
    extends: require('gfPopupBase'),
    properties: {
        BtnJackpotHistory: cc.Node,
        SFXCheckBox: cc.Node,
        BGMCheckBox: cc.Node,
        initialized: {
            default: false,
            visible: false
        },
    },

    initObj() {
        this._super();
        this.BtnJackpotHistory.off('click');
        this.BtnJackpotHistory.on('click', this.onBtnJPHistory, this);
        this.SFXCheckBox.off('toggle');
        this.BGMCheckBox.off('toggle');
        this.SFXCheckBox.on('toggle', this.onSFXCheckBoxTouch.bind(this), this);
        this.BGMCheckBox.on('toggle', this.onBGMCheckBoxTouch.bind(this), this);
        this.SFXCheckBox.getComponent(cc.Toggle).isChecked = DataStore.instance.getIsEnableSFX();
        this.BGMCheckBox.getComponent(cc.Toggle).isChecked = DataStore.instance.getIsEnableBGM();
        this.initialized = true;
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },
    
    initLanguage() {
        this.popupTitle && (this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.setting);
    },

    onBtnJPHistory() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_HISTORY);
        // PopupController.instance.showJPHistory();
    },

    onSFXCheckBoxTouch() {
        if (!this.initialized) {
            return;
        }
        Emitter.instance.emit(EventCode.SOUND.UPDATE_EFFECT_VOL, this.SFXCheckBox.getComponent(cc.Toggle).isChecked ? 1 : 0);
        Emitter.instance.emit(EventCode.SOUND.CLICK);
    },

    onBGMCheckBoxTouch() {
        if (!this.initialized) {
            return;
        }
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.SOUND.UPDATE_MUSIC_VOL, this.BGMCheckBox.getComponent(cc.Toggle).isChecked ? 1 : 0);
    },
});
