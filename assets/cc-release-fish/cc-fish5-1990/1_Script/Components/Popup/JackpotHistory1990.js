const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");

cc.Class({
    extends: require("gfJackpotHistory"),

    properties: {
    },
    onNextButton() {
        this.backBtn.getComponent(cc.Button).interactable = false;
        this.nextBtn.getComponent(cc.Button).interactable = false;
        Emitter.instance.emit(EventCode.POPUP.HISTORY_BLOCK_TOUCH);
        this._super();
    },

    onPreviousButton() {
        this.backBtn.getComponent(cc.Button).interactable = false;
        this.nextBtn.getComponent(cc.Button).interactable = false;
        Emitter.instance.emit(EventCode.POPUP.HISTORY_BLOCK_TOUCH);
        this._super();
    },
});
