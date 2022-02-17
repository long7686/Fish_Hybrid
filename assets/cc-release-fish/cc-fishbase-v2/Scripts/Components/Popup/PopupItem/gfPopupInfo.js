const GameConfig = require('gfBaseConfig');

cc.Class({
    extends: require('gfPopupBase'),
    properties: {
        pageIndexLabel: cc.Label,
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },
    
    updateTabs() {
        // To Do
    },

    show() {
        this._super();
        this.updateTabs();
    },

});
