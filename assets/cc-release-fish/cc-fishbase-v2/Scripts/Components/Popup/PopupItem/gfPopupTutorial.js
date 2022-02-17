

const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Localize =  require('gfLocalize');
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');

cc.Class({
    extends: require('gfPopupBase'),

    properties: {
        checkBox: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },

    initObj(){
        this._super();
        this.checkBox.getComponent(cc.Toggle).isChecked = false;
        this.checkBox.on('toggle', this.onToggle, this);
    },
    
    initLanguage(){
        this.popupTitle && (this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.tutorial);
    },
    onToggle(){
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.save();
    },

    save(){
        if(!DataStore.instance || !GameConfig.instance) return;
        const selfInfo = DataStore.instance.getSelfInfo();
        const value = this.checkBox ? this.checkBox.getComponent(cc.Toggle).isChecked : false;
        const llv = { [GameConfig.instance.LOCAL_STORE.NOT_SHOW_NT]: value };
        cc.sys.localStorage.setItem(GameConfig.instance.LOCAL_STORE.LOCAL_LOGIN_VAR + selfInfo.UserID, JSON.stringify(llv));
    },

});
