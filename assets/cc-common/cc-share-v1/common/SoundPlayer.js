

cc.Class({
    extends: cc.Component,

    properties: {
        sfxClick: {
            default: null,
            type: cc.AudioClip,
        },
        bgmMain: {
            default: null,
            type: cc.AudioClip,
        },
        storageKeyBGM: "enableBackgroundMusic",
        storageKeySFX: "enableSound"
    },

    onLoad () {
        this.setDefaultVolume();
        this.isEnableBGM = false;
        this.isEnableSFX = false;
        this.node.on("PLAY_SOUND",this.playSound,this);
        this.node.on("STOP_SOUND",this.stopSound,this);
        this.node.on("PLAY_CLICK",this.playSFXClick,this);
        this.node.on("PLAY_SFX",this.playSFX,this);
        this.emit = this.node.emit;
        this.node.soundPlayer = this;
        this.isEnableBGM = cc.sys.localStorage.getItem(this.storageKeyBGM);
        this.isEnableSFX = cc.sys.localStorage.getItem(this.storageKeySFX);
        this.isEnableBGM = (this.isEnableBGM != null) ? JSON.parse(this.isEnableBGM) : true;
        this.isEnableSFX = (this.isEnableSFX != null) ? JSON.parse(this.isEnableSFX) : true;
        this.onExtendedLoad();
    },
    setDefaultVolume() {
        const {MUSIC_VOLUME, SOUND_EFFECT_VOLUME} = this.node.config || {};
        this.MUSIC_VOLUME = MUSIC_VOLUME || 0.5;
        this.SOUND_EFFECT_VOLUME = SOUND_EFFECT_VOLUME || 1;
        cc.audioEngine.setEffectsVolume(this.SOUND_EFFECT_VOLUME);
        cc.audioEngine.setMusicVolume(this.MUSIC_VOLUME);
    },
    onExtendedLoad(){
        
    },
    start() {
        
    },
    sfxToggle() {
        this.isEnableSFX = !this.isEnableSFX;
        if (this.node.gSlotDataStore) this.node.gSlotDataStore.isEnableSFX = this.isEnableSFX;
        cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX);

        if (!this.isEnableSFX) {
            cc.audioEngine.stopAllEffects();
        }
    },
    bgmToggle() {
        this.isEnableBGM = !this.isEnableBGM;
        if (this.node.gSlotDataStore) this.node.gSlotDataStore.isEnableBGM = this.isEnableBGM;
        cc.sys.localStorage.setItem(this.storageKeyBGM, this.isEnableBGM);

        if (this.isEnableBGM) {
            this.playMainBGM();
        } else {
            cc.audioEngine.pauseMusic();
        }
    },
    playMusic(audio, loop = true, volume = this.MUSIC_VOLUME) {
        if (!this.isEnableBGM) return;
        if (cc.audioEngine.isMusicPlaying() && this.currentBGM === audio) {
            return; // return if this bgm audio is playing
        }
        cc.audioEngine.playMusic(audio, loop);
        cc.audioEngine.setMusicVolume(volume);
        this.currentBGM = audio;
    },
    playSFXClick() {
        if (!this.isEnableSFX) return;
        cc.audioEngine.playEffect(this.sfxClick);
    },
    playSFX(sfx) {
        if (!this.isEnableSFX) return;
        return cc.audioEngine.playEffect(sfx);
    },
    playMainBGM() {
        if (!this.isEnableBGM) return;
        this.playMusic(this.bgmMain, true);
    },
    playSound(sound, loop = false, volume = this.SOUND_EFFECT_VOLUME) {
        if (!this.isEnableSFX) return;
        return cc.audioEngine.play(sound, loop, volume);
    },
    stopSound(soundkey) {
        cc.audioEngine.stop(soundkey);
    },
    stopAllAudio() {
        cc.audioEngine.stopAll();
    },
});
