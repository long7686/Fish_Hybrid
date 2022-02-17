

const DataStore = require('gfDataStore');
const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
const { convertAssetArrayToObject } = require('utils');
const GameConfig = require('gfBaseConfig');

cc.Class({
    extends: require('WebSoundPlayer').WebSoundPlayer,

    properties: {
        lstSoundAsset: {
            default: [],
            type: cc.AudioClip
        },
    },

    onLoad() {
        this.gameNode = this.node.parent;
        this.releaseCocosSound = false;
        this._super();
        this.initEvents();
    },

    onExtendedLoad(){
        this.SOUND = convertAssetArrayToObject(this.lstSoundAsset);
        DataStore.instance.setDataStore({ "isEnableBGM": this.isEnableBGM, "isEnableSFX": this.isEnableSFX });
        let effectVolume = 0;
        let musicVolume = 0;
        if(GameConfig.instance.SOUND_SLIDER){
            let storeMusicVolume = cc.sys.localStorage.getItem(GameConfig.instance.LOCAL_STORE.MUSIC_VOLUME);
            if(storeMusicVolume != null){
                storeMusicVolume = parseFloat(storeMusicVolume);
                if((this.isEnableBGM && storeMusicVolume > 0))  {
                    musicVolume = storeMusicVolume;
                }
            }

            let storeEffectVolume = cc.sys.localStorage.getItem(GameConfig.instance.LOCAL_STORE.EFFECT_VOLUME); 
            if(storeEffectVolume != null){
                storeEffectVolume = parseFloat(storeEffectVolume);
                if(this.isEnableSFX && storeEffectVolume > 0)  {
                    effectVolume = storeEffectVolume;
                } 
            }
        }
        if(this.isEnableBGM && !musicVolume) musicVolume = 1;
        if(this.isEnableSFX && !effectVolume) effectVolume = 1;
        DataStore.instance.currMusic = musicVolume;
        DataStore.instance.currSound = effectVolume;
        this.updateMusicVolume(DataStore.instance.currMusic);
        this.updateEffectVolume(DataStore.instance.currSound);
    },

    start() {
        if (cc.sys.isBrowser && cc.sys.isMobile && cc.sys.os === cc.sys.OS_IOS) this.isWebSoundEnable = false;
    },

    initEvents() {
        registerEvent(EventCode.COMMON.CLOSE_SCENE, this.stopAllSound, this);
        registerEvent(EventCode.SOUND.RESET_VOLUME, this.onResumeSound, this);
        registerEvent(EventCode.SOUND.PLAY_SOUND_BACKGROUND, this.playBackGroundMusic, this); 
        registerEvent(EventCode.SOUND.UPDATE_MUSIC_VOL, this.updateMusicVolume, this);
        registerEvent(EventCode.SOUND.UPDATE_EFFECT_VOL, this.updateEffectVolume, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.onResetAllSound, this);
    },


    playFishSFX(name, loop = false, ratio = 1){
        const soundID = this.playEffect(this.SOUND[name], loop);
        this.setVolume(soundID , DataStore.instance.currSound * ratio);
        return soundID;
    },
    playFishBGM(name, loop = false, ratio = 1){
        const soundID = this.playMusic(this.SOUND[name], loop);
        this.setVolume(soundID , DataStore.instance.currMusic * ratio);
        return soundID;
    },

    updateMusicVolume(_musicVolume) {
        _musicVolume = parseFloat(_musicVolume);
        this.setMusicVolume(_musicVolume);
        if(GameConfig.instance.SOUND_SLIDER){
            cc.sys.localStorage.setItem(GameConfig.instance.LOCAL_STORE.MUSIC_VOLUME, _musicVolume);
        }
        if(_musicVolume <= 0) {
            this.isEnableBGM = false;
        } else {
            this.isEnableBGM = true;
        }
        DataStore.instance.isEnableBGM = this.isEnableBGM;
        this.setBgmEnable(this.isEnableBGM);
        // cc.sys.localStorage.setItem(this.storageKeyBGM, this.isEnableBGM);
        this.isEnableBGM = true; // Allways true, only set volume
        this.MUSIC_VOLUME = DataStore.instance.currMusic = _musicVolume;
    },

    updateEffectVolume(_effectVolume) {
        _effectVolume = parseFloat(_effectVolume);
        this.setEffectsVolume(_effectVolume);
        this.SOUND_EFFECT_VOLUME = DataStore.instance.currSound = _effectVolume;
        if(GameConfig.instance.SOUND_SLIDER){
            cc.sys.localStorage.setItem(GameConfig.instance.LOCAL_STORE.EFFECT_VOLUME, _effectVolume);
        } 
        if(_effectVolume <= 0) {
            this.isEnableSFX = false;
        } else {
            this.isEnableSFX = true;
        }
        DataStore.instance.isEnableSFX = this.isEnableSFX;
        this.setEffectEnable(this.isEnableSFX);
        // cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX);

    },

    onResetAllSound(){
        this.stopAllEffects();
        this.onResumeSound();
    },

    onResumeSound() {
        if (!DataStore || !DataStore.instance) return;
        this.setMusicVolume(DataStore.instance.currMusic);
        this.setEffectsVolume(DataStore.instance.currSound);
    },

    stopAllSound() {
        this.stopAllEffects();
        this.stopMusic();
    },

    onDestroy() {
        this._super();
        removeEvents(this);
    }
});