

const DataStore = require('DataStore1990');
const GameConfig = require('Config1990');
const EventCode = require("EventsCode1990");
const {registerEvent, removeEvents } = require("gfUtilities");

cc.Class({
    extends: require("gfSoundController"),

    initEvents() {
        this._super();
        registerEvent(EventCode.SOUND.MINIBOSS_MOVE, this.playSfxMinibossMove, this);
        registerEvent(EventCode.SOUND.GODZILLA_IN, this.playSFXBossIn, this);
        registerEvent(EventCode.SOUND.GODZILLA_OUT, this.playSFXBossOut, this);


        registerEvent(EventCode.SOUND.STOP_SOUND_MINIBOSS_MOVE, this.stopSfxMinibossMove, this);
        registerEvent(EventCode.SOUND.OPEN_SAIL_GHOST_SHIP, this.playOpenSail, this);
        registerEvent(EventCode.SOUND.CLOSE_SAIL_GHOST_SHIP, this.playCloseSail, this);
        registerEvent(EventCode.SOUND.PLAY_SOUND_BLACK_HOLE, this.playBlackHole, this);
        registerEvent(EventCode.SOUND.STOP_SOUND_BLACK_HOLE, this.stopBlackHole, this);
        registerEvent(EventCode.SOUND.GHOST_SHIP_EXPLOSION, this.playShipExplosion, this);
        registerEvent(EventCode.SOUND.GODZILLA_PLASMA, this.playGodzillaPlasma, this);
        registerEvent(EventCode.SOUND.MINI_SHIP_DIE, this.playSfxMiniShipDie, this);
        registerEvent(EventCode.SOUND.SIDE_SHIP_DIE, this.playSfxSideShipDie, this);
        registerEvent(EventCode.SOUND.PAUSE_OR_RESUME_SOUND_WIN, this.pauseOrResumeSoundWin, this);
        registerEvent(EventCode.SOUND.BIG_FISH_EXPLORE, this.playSfxBigFishExplore, this);
    },

    resumeSoundBackground({ listFishNormal, listFishGroup }) {
        const dragon = listFishNormal.find(fish => fish.FishKind == GameConfig.instance.FISH_KIND.DRAGON);
        const miniBoss = listFishGroup.find(fish => fish.FishKind == GameConfig.instance.FISH_KIND.MINIBOSS);
        if (!dragon && !miniBoss) {
            this.playBackGroundMusic(GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
        }
    },

    playBackGroundMusic(data, init = false) {
        if(DataStore.instance.curBGMusic == data && !init) return;
        this.unscheduleAllCallbacks();
        //this.soundBigFishExplore = null;
        switch (data) {
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.MINI_BOSS:
                this.playFishBGM("bgmMiniboss", true);
                break;
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.GODZILLA:
                this.onResumeSound();
                this.playFishBGM("bgmDragon", true);
                break;
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.LOBBY:
                this.playFishBGM("bgmLobby", true);
                break;
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME:
                this.playFishBGM("bgmMain", true);
                break;
        
        }
        DataStore.instance.curBGMusic = data;
    },
    playSFXBossIn(){
        this.playFishSFX("dragonStart");

    },
    playSFXBossOut(){
        this.playFishSFX("dragonEnd");
    },


    playSfxMinibossMove() {
        this.loopMinibossMove = this.playFishSFX("sfxMiniboss_move", true);
    },
    stopSfxMinibossMove(){
        if(this.loopMinibossMove){
            this.stopSound(this.loopMinibossMove);
            this.loopMinibossMove = null;
        }
    },
    playSfxsWarning(volume = 1) {
        this.playFishSFX("sfxWarning", false, volume);
    },

    playOpenSail() {
        this.playFishSFX("sfx_Opensail");
    },

    playCloseSail() {
        this.playFishSFX("sfx_Closesail");
    },

    playBlackHole() {
        this.soundBackHole = this.playFishSFX("sfx_Blackhole");
    },

    stopBlackHole() {
        if(this.soundBackHole){
            this.stopSound(this.soundBackHole);
            this.soundBackHole = null;
        }
    },

    playShipExplosion() {
        this.playFishSFX("sfx_Shipexplosion");
    },

    playGodzillaPlasma() {
        this.playFishSFX("sfx_Godzilla_plasma");
    },

    playSfxMiniShipDie(){
        this.playFishSFX("sfxMiniship_die");
    },

    playSfxSideShipDie(){
        this.playFishSFX("sfxSideship_die");
    },

    playSfxBigFishExplore(){
        this.soundBigFishExplore = this.playFishSFX("sfxBigFishExplore");
        //rem to check anything
        // this.scheduleOnce(()=>{
        //     this.soundBigFishExplore = null;
        // }, this.getDuration(this.soundBigFishExplore));
    },

    playSfxBigwin() {
        if (this.currSoundBigwin) {
            return;
        }
        this.playFishSFX("sfxBig_win_start");
        this.currSoundBigwin = this.playFishSFX("sfxBig_win_loop", true, 1.2);
    },

    playSfxMegawin() {
        if (this.currSoundMegaWin) {
            return;
        }
        if(this.currSoundBigwin){
            this.stopSound(this.currSoundBigwin);
        }
        this.playFishSFX("sfxMega_win_start");
        this.currSoundMegaWin = this.playFishSFX("sfxBig_win_loop", true, 1.2);
    },

    pauseOrResumeSoundWin(isPause){
        let vol = isPause? 0 : 1;
        if(this.currSoundBigwin){
            this.setVolume(this.currSoundBigwin, vol);
        }
        if(this.currSoundMegaWin){
            this.setVolume(this.currSoundMegaWin, vol);
        }
    },

    stopSfxBigWin() {
        this._super();
        if (this.currSoundMegaWin) {
            this.stopSound(this.currSoundMegaWin);
            this.currSoundMegaWin = null;
        }
        this._scheduleBigWin = null;
    },
    playSfxGold() {
        //remove this sound at fish5
    },
    onDestroy() {
        this._super();
        removeEvents(this);
    },
    
    // update (dt) {},
});
