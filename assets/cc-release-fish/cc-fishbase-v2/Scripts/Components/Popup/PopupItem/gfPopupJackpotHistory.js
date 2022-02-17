const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Localize = require('gfLocalize');

cc.Class({
    extends: require('gfPopupBase'),

    properties: {
        pageIndexLabel: cc.Label,
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },

    show() {
        this._super();
        this.gameId = GameConfig.instance.GameId;
        const jackpotHistoryComp = this.node.getComponent('gfJackpotHistory');
        jackpotHistoryComp.table.emit('CLEAR_DATA');
        const jpList = "GRAND";
        const jpPrefix = "ktf_";
        const url = "jackpothistory/fish";
        const betIDs = DataStore.instance.listJackpotBet;
        jackpotHistoryComp.init(this.gameId, betIDs, jpList, jpPrefix, url);
        jackpotHistoryComp.openPanel();

    },

    hide() {
        this._super();
        const jackpotHistoryComp = this.node.getComponent('gfJackpotHistory');
        jackpotHistoryComp.table.emit('CLEAR_DATA');
    },

    initLanguage() {
        this.popupTitle && (this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.jackpotHistory);
        this.pageIndexLabel.string = Localize.instance.txtPopup.txtPageIndex;
    },
});
