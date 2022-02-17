const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

cc.Class({
    extends: require("BaseHistory"),

    properties: {
        noJackpotText: cc.Node,
        _initialized: false,
        jpList: "GRAND-MAJOR",
    },

    initBase() {
        if (this._initialized) { return; }
        this.currentPage = 1;
        this.stopLoading();

        this.table.getComponent('BaseTableHistory').initCells(this.itemPerPage);
        this.noJackpotText.active = false;
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();

        if (this.node.config) {
            let betIds = this.node.config.BET_IDS;
            if (LOGIN_IFRAME) {
                betIds = this.node.config.BET_IDS_IFRAME;
            }
            if (this.node.config.JP_LIST_HISTORY) { this.jpList = this.node.config.JP_LIST_HISTORY; }
            this.init(this.node.config.GAME_ID, betIds, this.jpList);
        }
        this._initialized = true;
    },

    init(gameId, betIds, jpList = "GRAND-MAJOR", jpPrefix = "ktf_", url = "jackpothistory/fish") {
        this.gameId = gameId;
        this.jpList = jpList;
        this.betIds = betIds;
        this.jpPrefix = jpPrefix;
        this.url = url;
    },

    onNextButton() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.nextBtn.getComponent(cc.Button).interactable = false;
        this.backBtn.getComponent(cc.Button).interactable = false;
        this._super();
    },

    onPreviousButton() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.nextBtn.getComponent(cc.Button).interactable = false;
        this.backBtn.getComponent(cc.Button).interactable = false;
        this._super();
    },

    playLoading() {
        this._super();
        this.noJackpotText.active = false;
    },

    onRequestResponse(res) {
        this.noJackpotText.active = !!(res.error || Object.keys(res).length <= 0 || !res.data || res.data.length <= 0);
        this._super(res);
    },
});
