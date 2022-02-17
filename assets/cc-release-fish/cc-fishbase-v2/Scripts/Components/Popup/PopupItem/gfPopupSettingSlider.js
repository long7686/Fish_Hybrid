

const EventCode = require("gfBaseEvents");
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Localize = require("gfLocalize");
const Emitter = require('gfEventEmitter');
cc.Class({
    extends: require('gfPopupBase'),

    properties: {
        BtnJackpotHistory: cc.Node,
        musicSliderNode: cc.Node,
        effectSliderNode: cc.Node,
        handlerMusic: cc.Node,
        handlerEffect: cc.Node,
    },
    onLoad(){
        this._super();
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },
    
    initObj() {
        this._super();
        if (cc.sys.isNative) {
            this.handlerMusic.off('touchend');
            this.handlerMusic.off('touchcancel');
            this.handlerEffect.off('touchend');
            this.handlerEffect.off('touchcancel');

            this.handlerMusic.on('touchend', ()=>{ this.onBtnMusicClick(); });
            this.handlerMusic.on('touchcancel', ()=>{ this.onBtnMusicClick();});
            this.handlerEffect.on('touchend', ()=>{ this.onBtnEffectClick(); });
            this.handlerEffect.on('touchcancel', ()=>{ this.onBtnEffectClick();});

            this.musicSliderNode.off('touchend');
            this.musicSliderNode.off('touchcancel');
            this.effectSliderNode.off('touchend');
            this.effectSliderNode.off('touchcancel');

            this.musicSliderNode.on('touchend', ()=>{ this.onBtnMusicClick(); });
            this.musicSliderNode.on('touchcancel', ()=>{ this.onBtnMusicClick();});
            this.effectSliderNode.on('touchend', ()=>{ this.onBtnEffectClick(); });
            this.effectSliderNode.on('touchcancel', ()=>{ this.onBtnEffectClick();});
        }
    },

    updateSlider() {
        this.effectSliderNode.getChildByName("ProgressBar").getComponent(cc.ProgressBar).progress = DataStore.instance.currSound;
        this.effectSliderNode.getComponent(cc.Slider).progress = DataStore.instance.currSound;
        this.musicSliderNode.getChildByName("ProgressBar").getComponent(cc.ProgressBar).progress = DataStore.instance.currMusic;
        this.musicSliderNode.getComponent(cc.Slider).progress = DataStore.instance.currMusic;
    },

    show() {
        this._super();
        this.updateSlider();
    },

    initLanguage() {
        this.popupTitle && (this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.setting);
    },

    onBtnJPHistory() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_HISTORY);
        // PopupController.instance.showJPHistory();
    },

    onSliderMusic(event) {
        this.musicSliderNode.getChildByName("ProgressBar").getComponent(cc.ProgressBar).progress = event.progress;
        if (!cc.sys.isNative) {
            Emitter.instance.emit(EventCode.SOUND.UPDATE_MUSIC_VOL, event.progress);
        }
    },
    
    onSliderEffect(event) {
        this.effectSliderNode.getChildByName("ProgressBar").getComponent(cc.ProgressBar).progress =  event.progress;
        if (!cc.sys.isNative) {
            Emitter.instance.emit(EventCode.SOUND.UPDATE_EFFECT_VOL, event.progress);
        }
    },

    onBtnMusicClick(){
        Emitter.instance.emit(EventCode.SOUND.UPDATE_MUSIC_VOL, this.musicSliderNode.getComponent(cc.Slider).progress);
    },
    onBtnEffectClick(){
        Emitter.instance.emit(EventCode.SOUND.UPDATE_EFFECT_VOL, this.effectSliderNode.getComponent(cc.Slider).progress);
    },
});
