const GameConfig = require('gfBaseConfig');
const Localize = require('gfLocalize');

cc.Class({
    extends: require('gfPopupBase'),

    properties: {
        pageIndexLabel: cc.Label,
        history: require('gfBaseHistory')
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },

    show() {
        this._super();
        const data = {
            gameId: GameConfig.instance.GameId,
            jpList: "GRAND",
            jpPrefix: "ktf_",
            url: "jackpothistory/fish",
        };
        this.history.openPanel(data);

    },

    hide() {
        this._super();
        this.history.closePanel();
    },

    initLanguage() {
        this.popupTitle && (this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.jackpotHistory);
        this.pageIndexLabel.string = Localize.instance.txtPopup.txtPageIndex;
    },
});
