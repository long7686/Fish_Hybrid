
const Localize = require("gfLocalize");
const GameConfig = require('Config1990');
cc.Class({
    extends: require('gfPopupSetting'),


    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },

    initLanguage() {
        this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.setting;
    },
});
