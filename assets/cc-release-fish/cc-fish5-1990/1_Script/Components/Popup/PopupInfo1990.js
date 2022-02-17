const Localize = require('gfLocalize');
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');

cc.Class({
    extends: require('gfPopupInfo'),
    properties:{
        toggleContainer: cc.ToggleContainer,
        lstScrollView: [cc.ScrollView],
        _initialized: false
    },

    initLanguage() {
        this.popupTitle = Localize.instance.popupTitle.info;
    },

    show(){
        this._super();
        this.resetInfo();
        this._initialized = true;
    },

    resetInfo() {
        this.toggleContainer.toggleItems[0].isChecked = true;
        this.onResetScrollView();
    },

    onClick(){
        if(this._initialized){
            Emitter.instance.emit(EventCode.SOUND.CLICK);
        }
        this.onResetScrollView();
    },
    onResetScrollView(){
        this.lstScrollView.forEach(scrollView => {
            scrollView.scrollToTop(0);
        });
    },
    hide() {
        this._super();
        this._initialized = false;
    },
    onClose() {
        this._super();
    },
});
