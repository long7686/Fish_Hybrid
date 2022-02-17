const GameConfig = require('Config1990');
const DataStore = require('DataStore1990');
const Localize = require('gfLocalize');
const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");
const { registerEvent } = require("gfUtilities");

cc.Class({
    extends: require('gfPopupBase'),

    properties: {
        pageIndexLabel: cc.Label,
        togglePopup:{
            default: null,
            type: cc.ToggleContainer
        },
        jPGodzilla:{
            default: null,
            type: cc.Toggle
        },
        jPGhostShip:{
            default: null,
            type: cc.Toggle
        },
        blockTouchLayer:{
            default: null,
            type: cc.Node
        },
        _initialized: false
    },

    initEvent(){
        registerEvent(EventCode.POPUP.HISTORY_BLOCK_TOUCH, this.onBlockTouch, this);
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },

    show() {
        this._super();

        this.blockTouchLayer.active = false;
        this.gameId = GameConfig.instance.GameId;

        this.jPGodzilla.toggle();
        this._initJPGodzilla();
        this._initialized = true;
    },

    hide() {
        this._super();
        this.jPGodzilla.node.getComponent('JackpotHistory1990').table.emit('CLEAR_DATA');
        this.jPGhostShip.node.getComponent('JackpotGhostShipHistory1990').table.emit('CLEAR_DATA');
        this._initialized = false;
    },

    _initJPGodzilla(){
        const jpList = "GRAND";
        const jpPrefix = "ktf_";
        const url = "jackpothistory/fish";
        const betIDs = DataStore.instance.listJackpotBet;
        this.jPGodzilla.node.getComponent('JackpotHistory1990').init(this.gameId, betIDs, jpList, jpPrefix, url);
        this.jPGodzilla.node.getComponent('JackpotHistory1990').openPanel();
    },

    _initJPGhostShip(){
        const jpList = "GRAND";
        const jpPrefix = "ktf_";
        const url = "history/fish/ghost-ship";
        const betIDs = DataStore.instance.listJackpotBet;
        this.jPGhostShip.node.getComponent('JackpotGhostShipHistory1990').init(this.gameId, betIDs, jpList, jpPrefix, url);
        this.jPGhostShip.node.getComponent('JackpotGhostShipHistory1990').openPanel();
    },

    onToggleItemClick(toggle) {
        this.onBlockTouch();
        if(this._initialized){
            Emitter.instance.emit(EventCode.SOUND.CLICK);
        }
        switch (toggle) {
        case this.jPGodzilla:
            this._initJPGodzilla();
            break;
        case this.jPGhostShip:
            this._initJPGhostShip();
            break;
        default :
            this._initJPGodzilla();
            break;
        }
    },

    onBlockTouch(){
        this.blockTouchLayer.active = true;
        this.scheduleOnce(()=>{
            this.blockTouchLayer.active = false;
        }, .1);

    },

    initLanguage() {
        this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.jackpotHistory;
        // this.pageIndexLabel.string = Localize.instance.txtPopup.txtPageIndex;
    },
});
