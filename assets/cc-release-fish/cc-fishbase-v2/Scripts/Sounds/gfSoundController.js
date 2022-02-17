const SoundStateEnum = {
    NONE: 0,
    PLAYING: 1
};

const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
const DataStore = require('gfDataStore');
const GameConfig = require('gfBaseConfig');

cc.Class({
    extends: require('gfSoundBase'),

    initEvents() {
        this._super();
        this.scheduleResetVolume = this.onResumeSound.bind(this);
        this.currSoundBigwin = null;
        registerEvent(EventCode.SOUND.GUN_FIRE, this.playSfxFire, this);
        registerEvent(EventCode.EFFECT_LAYER.PLAY_WAVE_TRANSITION, this.playSfxWaveTransition, this);
        registerEvent(EventCode.EFFECT_LAYER.PLAY_FISH_GROUP_TRANSITION, this.playSfxRoundSwitch, this);
        registerEvent(EventCode.SOUND.EFFECT_GOLD, this.playSfxGold, this);
        registerEvent(EventCode.SOUND.EFFECT_CATCH, this.playSfxCatch, this);
        registerEvent(EventCode.SOUND.EFFECT_BOMB, this.playSfxBomb, this);
        registerEvent(EventCode.SOUND.BIG_WIN, this.playSfxBigwin, this);
        registerEvent(EventCode.SOUND.MEGA_WIN, this.playSfxMegawin, this);
        registerEvent(EventCode.SOUND.STOP_BIG_WIN, this.stopSfxBigWin, this);
        registerEvent(EventCode.SOUND.FIRE_LASER, this.playSfxFireLaser, this);
        registerEvent(EventCode.EFFECT_LAYER.MINIBOSS_SMASH, this.playSfxMiniBossSmash, this);
        registerEvent(EventCode.SOUND.MINIBOSS_DEAD, this.playSfxMiniBossDead, this);
        registerEvent(EventCode.SOUND.MINIBOSS_HIT, this.playSfxMiniBossHit, this);
        registerEvent(EventCode.SOUND.DRAGON_SCREAM, this.playNewSfxWarning, this);
        registerEvent(EventCode.SOUND.DRAGON_DIE, this.playSfxDragonDie, this);
        registerEvent(EventCode.DRAGON.DROP_BALL, this.playSfxBallDrop, this);
        registerEvent(EventCode.DRAGON.DONE_BALL_DROP, this.playSfxBallInsert, this);
        registerEvent(EventCode.SOUND.BALL_TRAY_SHOW, this.playSfxBallTray, this);
        registerEvent(EventCode.SOUND.BALL_TRAY_DRAW, this.playSfxBallTrayDraw, this);
        registerEvent(EventCode.SOUND.COLLECT_BALL, this.playSfxCollectBalls, this);
        registerEvent(EventCode.SOUND.DRAGON_APPEAR, this.playSfxsWarning, this);
        registerEvent(EventCode.SOUND.DRAGON_BIG_WIN, this.playSfxJackpotExplode, this);
        registerEvent(EventCode.SOUND.PLAY_EFFECT_JACKPOT_COIN, this.playSfxJackpotCoin, this);
        registerEvent(EventCode.SOUND.STOP_EFFECT_JACKPOT_COIN, this.stopSfxJackpotCoin, this);
        registerEvent(EventCode.SOUND.STOP_ALL_AUDIO, this.stopAllAudio, this);
        registerEvent(EventCode.SOUND.DRAGON_HIT_BALL, this.playDragonHitBall, this);
        registerEvent(EventCode.SOUND.DRAGON_BALL_REWARD, this.playSfxWinDragonBallShow, this);
        registerEvent(EventCode.SOUND.DRAGON_BALL_HIDE, this.playSfxWinDragonBallHide, this);
        registerEvent(EventCode.SOUND.RESUME_SOUND_BACKGROUND, this.resumeSoundBackground, this);
        registerEvent(EventCode.SOUND.EFFECT_GET_ITEM_FREEZE, this.playSfxGetItemFreeze, this);
        registerEvent(EventCode.SOUND.EFFECT_GET_ITEM_LASER, this.playSfxGetItemLaser, this);
        registerEvent(EventCode.SOUND.CLICK_BET, this.playSFXClickBet, this);
        registerEvent(EventCode.SOUND.CLICK, this.playSfxClick, this);
        registerEvent(EventCode.COMMON.REMOVE_PERSIST_NODE, this.destroy, this);
    },

    resumeSoundBackground({ listFishNormal, listFishGroup }) {
        const dragon = listFishNormal.find((fish) => fish.FishKind === GameConfig.instance.FISH_KIND.DRAGON);
        const miniBoss = listFishGroup.find((fish) => fish.FishKind === GameConfig.instance.FISH_KIND.MINIBOSS);
        if (!dragon && !miniBoss) {
            this.playBackGroundMusic(GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
        }
    },

    playBackGroundMusic(data, init = false) {
        if (DataStore.instance.curBGMusic === data && !init) return;
        this.unscheduleAllCallbacks();
        this.onResumeSound();
        switch (data) {
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.MINI_BOSS:
                this.playFishBGM("bgmMiniboss", true);
                break;
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.DRAGON:
                this.onResumeSound();
                this.playFishBGM("bgmDragon", true);
                this.schedule(this.playSfxDragonScream.bind(this), 6);
                break;
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.LOBBY:
                this.playFishBGM("bgmLobby", true);
                break;
            case GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME:
                this.playFishBGM("bgmMain", true);
                break;
            default:
                break;
        }
        DataStore.instance.curBGMusic = data;
    },

    playSfxCatch() {
        this.playFishSFX("sfxCatch");
    },

    playSfxGold() {
        this.playFishSFX("sfxGold");
    },

    playSfxFire() {
        this.playFishSFX("sfxGun_fire");
    },

    playSfxsWarning() {
        this.playFishSFX("sfxWarning");
    },

    playSfxBigwin() {
        this.unschedule(this.scheduleResetVolume);
        this.setEffectsVolume(DataStore.instance.currSound * 0.4);
        this.setMusicVolume(DataStore.instance.currMusic * 0.6);
        this.stopSfxBigWin();
        this.currSoundBigwin = this.playFishSFX("sfxBig_win");
        if (this.currSoundBigwin) {
            this.scheduleOnce(this.scheduleResetVolume, this.getDuration(this.currSoundBigwin));
        } else {
            this.onResumeSound();
        }
    },

    playSfxMegawin() {
        this.unschedule(this.scheduleResetVolume);
        this.setEffectsVolume(DataStore.instance.currSound * 0.4);
        this.setMusicVolume(DataStore.instance.currMusic * 0.6);
        this.stopSfxBigWin();
        this.currSoundBigwin = this.playFishSFX("sfxMega_win");
        if (this.currSoundBigwin) {
            this.scheduleOnce(this.scheduleResetVolume, this.getDuration(this.currSoundBigwin));
        }else{
            this.onResumeSound();
        }
    },
    stopSfxBigWin() {
        const state = this.getPlayState(this.currSoundBigwin);
        if(state == SoundStateEnum.PLAYING){
            this._stopEffect(this.currSoundBigwin);
            this.currSoundBigwin = null;
        }
    },

    playSfxBomb() {
        this.playFishSFX("sfxBomb");
    },

    playSfxFreeze() {
        this.playFishSFX("sfxFreeze");
    },

    playSfxFireLaser() {
        this.playFishSFX("sfxFire_laser");
    },

    playSfxJackpotExplode() {
        this.playFishSFX("sfxJackpot_explode");
    },

    stopSfxJackpotCoin() {
        const state = this.getPlayState(this.coinLoopId);
        if(state == SoundStateEnum.PLAYING){
            this._stopEffect(this.coinLoopId);
            this.coinLoopId = null;
        }
    },

    playSfxJackpotCoin() {
        this.coinLoopId = this.playFishSFX("sfxJackpot_coin", true, 0.4);
    },

    playDragonHitBall() {
        this.playFishSFX("sfxDragon_ball_drop");
    },

    playSfxBallDrop() {
        this.playFishSFX("sfxBall_drop");
    },

    playSfxBallInsert() {
        this.playFishSFX("sfxBall_insert");
    },

    playSfxBallTray() {
        this.playFishSFX("sfxBall_tray");
    },

    playSfxBallTrayDraw() {
        this.playFishSFX("sfxBall_tray_draw");
    },

    playSfxCollectBalls() {
        this.playFishSFX("sfxCollect_ball");
    },

    playSfxDragonDie() {
        this.playFishSFX("sfxDragon_die");
    },

    playSfxDragonScream() {
        this.playFishSFX("sfxDragon_scream");
    },

    playSfxWinDragonBallShow() {
        this.playFishSFX("sfxShow_win_dragon_ball_put");
    },

    playSfxWinDragonBallHide() {
        this.playFishSFX("sfxHide_win_dragon_ball_put");
    },

    playSfxGetItemFreeze() {
        this.playFishSFX("sfxGet_item");
    },

    playSfxGetItemLaser() {
        this.playFishSFX("sfxGet_item");
    },

    playNewSfxWarning() {
        this.stopAllEffects();
        if (this.isEnableSFX) {
            this.setEffectsVolume(DataStore.instance.currSound * 0.5);
        }
        if (this.isEnableBGM) {
            this.setMusicVolume(DataStore.instance.currMusic * 0.5);
        }
        this.playSfxDragonScream();
    },

    playSfxMiniBossDead() {
        this.playFishSFX("sfxMiniboss_dead");
    },

    playSfxMiniBossSmash() {
        this.playFishSFX("sfxMiniboss_stomp");
    },

    playSfxMiniBossHit() {
        const LENGTH_SFX_MINIBOSS_DAME = 3;
        const rand = Math.floor(Math.random() * LENGTH_SFX_MINIBOSS_DAME);
        this.playFishSFX(`sfxMiniboss_takedame${rand}`);
    },

    playSfxRoundSwitch() {
        this.setMusicVolume(0);
        const soundSwitchRound = this.playFishSFX("sfxRound_switch");
        if (soundSwitchRound) {
            this.scheduleOnce(this.scheduleResetVolume, this.getDuration(soundSwitchRound));
        } else {
            this.onResumeSound();
        }
    },

    playSfxWaveTransition() {
        this.setMusicVolume(0);
        const soundWave = this.playFishSFX("sfxWave");
        if(soundWave){
            this.scheduleOnce(this.scheduleResetVolume, this.getDuration(soundWave));
        } else {
            this.onResumeSound();
        }

    },

    stopAllAudio(){
        this.unscheduleAllCallbacks();
        this._super();
    },

    playSFXClickBet(){
        this.playSfxClick();
    },

    playSfxClick() {
        this.playEffect(this.sfxClick);
    },
    destroy(){
        this.stopAllAudio();
        this._super();
        removeEvents(this);
    },

    onDestroy() {
        this.stopAllAudio();
        this._super();
        removeEvents(this);
    },
});
