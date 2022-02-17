const GameConfig = require('gfBaseConfig');
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
cc.Class({
    extends: require('gfPopupBase'),
    properties: {
        toggleContainer: cc.ToggleContainer,
        pageHistory: cc.Node,
        pageInfo: cc.Node,
        history: require('gfBaseHistory'),
        eventUrl: '',
        _choiceIndex: -1,

    },

    show(firstTime = false) {
        this._super();
        this._initialized = false;
        this._choiceIndex = firstTime ? 0 : 1;
        const toggleChecked = this.toggleContainer.toggleItems[this._choiceIndex].isChecked = true;
        this.toggleContainer.updateToggles(toggleChecked);
        this._initialized = true;
        this.updatePage(this._choiceIndex);
    },

    updatePage(index) {
        if (parseInt(index) == 1) {
            this.pageHistory.active = true;
            this.pageInfo.active = false;
            if (this._initialized) {
                this.loadEventHistory();
            }
        } else {
            this.pageHistory.active = false;
            this.pageInfo.active = true;
        }
    },

    onClick(event, index) {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this._choiceIndex = parseInt(index);
        this.updatePage(index);
    },

    loadEventHistory() {
        const data = {
            gameId: GameConfig.instance.GameId,
            url: this.eventUrl,
        };
        this.history.openPanel(data);
    },

});