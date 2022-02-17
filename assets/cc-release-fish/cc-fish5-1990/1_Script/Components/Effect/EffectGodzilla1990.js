
const EventCode = require("EventsCode1990");
const { registerEvent, removeEvents } = require('gfUtilities');
const ReferenceManager = require('gfReferenceManager');
const GameConfig = require('Config1990');
const { getPostionInOtherNode, getRandomInt } = require('utils');
const Emitter = require('gfEventEmitter');
const DataStore = require("gfDataStore");

cc.Class({
    extends: cc.Component,

    properties: {
        jackpotWinAmountPopup: cc.Prefab,
        crystal: cc.Prefab,
        plasmaEffect: cc.Prefab,
        smallExplosion: cc.Prefab,
        endData: {
            default: null,
            visible: false
        },
        _arrEffect: [],
        _lstEffectGodzilla: [],

    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.initEvents();
    },
    initEvents() {
        registerEvent(EventCode.EFFECT_LAYER.SHOW_POPUP_WIN_JACKPOT, this.showJackpotWinAmountPopup, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.GODZILLA.GODZILLA_DROP_CRYSTAL, this.playDropCrystal, this);
        registerEvent(EventCode.GODZILLA.GODZILLA_PLASMA_EFFECT, this.playPlasmaEffect, this);
        registerEvent(EventCode.DRAGON.SMALL_EXPLOSION, this.explosionOnDie, this);
        registerEvent(EventCode.DRAGON.JACKPOT_WINAMOUNT_POPUP_CLOSE, this.updatePlayerWallet, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
        registerEvent(EventCode.GODZILLA.STATE_GODZILLA, this.scheduleRoar, this);

    },

    showJackpotWinAmountPopup(data){
        const selfInfo = DataStore.instance.getSelfInfo();
        this.endData  = data;
        if(selfInfo.DeskStation === data.DeskStation) {
            let plasmaEffect = cc.instantiate(this.plasmaEffect);
            plasmaEffect.parent = this.node;
            plasmaEffect.scale = 1.5;
            plasmaEffect.active = true;
            plasmaEffect.position = this.node.convertToNodeSpaceAR(data.EffectPos);
            plasmaEffect.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
            const duration = plasmaEffect.getComponent(sp.Skeleton).findAnimation('animation').duration * 0.67;
            let callback = () => {

                const popup = cc.instantiate(this.jackpotWinAmountPopup).getComponent('JackpotWinPopup1990');
                popup.setWinValue(data.WinAmount);
                popup.node.parent = ReferenceManager.instance.CurrentScene;
                popup.node.zIndex = GameConfig.instance.Z_INDEX.MENU;
                // this._arrEffect.push(popup);
                const index = this._lstEffectGodzilla.indexOf(plasmaEffect);
                if (index > -1) {
                    this._lstEffectGodzilla.splice(index, 1);
                }
                if (cc.isValid(plasmaEffect)) plasmaEffect.destroy();
            };
            this.scheduleOnce(callback, duration);
            this._lstEffectGodzilla.push(plasmaEffect);
        }

    },
    
    playDropCrystal(dataInput){
        const {
            data, worldPos, player,
        } = dataInput;

        const gem = cc.instantiate(this.crystal);
        gem.parent = this.node;
        gem.position = this.node.convertToNodeSpaceAR(worldPos);
        let dest = getPostionInOtherNode(this.node, player.gun);
        dest.y += 100 * (player.index > 1 ? -1 : 1);
        const coinDest = player.node.convertToWorldSpaceAR(cc.v2(0, 150  * (player.index > 1 ? -1 : 1)));
        gem.flyGemToPlayer(dest, () => {
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, {
                data,
                fishKind: GameConfig.instance.FISH_KIND.DRAGON + '_1',
                fishPos: coinDest,
                skipUpdateWallet: true,
            });
        });
        this._lstEffectGodzilla.push(gem);
    },
    playPlasmaEffect(data){
        let plasmaEffect = cc.instantiate(this.plasmaEffect);
        plasmaEffect.parent = this.node;
        plasmaEffect.scale = 1.5;
        plasmaEffect.active = true;
        plasmaEffect.position = this.node.convertToNodeSpaceAR(data.EffectPos);
        plasmaEffect.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        const duration = plasmaEffect.getComponent(sp.Skeleton).findAnimation('animation').duration * 0.67;
        let callback = ()=>{
            const dataInput = {
                DeskStation: data.DeskStation,
                BulletMultiple: data.BulletMultiple,
                ListFish: data.ListFish,
                skillID: GameConfig.instance.SkillConfig.PLASMA
            };
            // Emitter.instance.emit(EventCode.FISH_LAYER.CATCH_FISH_BY_SKILL, dataInput);
            Emitter.instance.emit(EventCode.GAME_LAYER.CATCH_FISH_BY_PLASMA, dataInput);
            const index = this._lstEffectGodzilla.indexOf(plasmaEffect);
            if (index > -1) {
                this._lstEffectGodzilla.splice(index, 1);
            }
            if(cc.isValid(plasmaEffect)) plasmaEffect.destroy();
        };
        this.scheduleOnce(callback, duration);
        this._lstEffectGodzilla.push(plasmaEffect);
    },
    explosionOnDie(positions){
        positions.forEach((pos, i) => {
            this.scheduleOnce(() => {
                const explosion = cc.instantiate(this.smallExplosion);
                let scale = getRandomInt(7,11)/10;
                explosion.parent = this.node;
                explosion.scale = scale;
                explosion.position = this.node.convertToNodeSpaceAR(pos);
            }, i * 0.15);
        });
    },
    scheduleRoar(isHaveBoss){
        if(isHaveBoss){
            this.schedule(this.roar, 6);
        } else {
            this.unschedule(this.roar);
        }
    },
    roar(){
        Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.05, amplitude: 5 });
        Emitter.instance.emit(EventCode.SOUND.DRAGON_APPEAR, 1.1);
        Emitter.instance.emit(EventCode.GODZILLA.GODZILLA_SCREAM, {callback: null, timeScale: 2.5});
    },
    resetOnExit() {
        this.unscheduleAllCallbacks();
        this._arrEffect.forEach(effect => {
            effect.resetOnExit && effect.resetOnExit();
            effect.node.removeFromParent();
        });
        this._arrEffect = [];

        this._lstEffectGodzilla.forEach((effect) => {
            effect.stopAllActions();
            effect.removeFromParent(true);
            if (cc.isValid(effect)) {
                effect.destroy();
            }
        });
        this._lstEffectGodzilla.length = 0;
    },

    updatePlayerWallet() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(this.endData.DeskStation);
        if (player.isMe) {
            player.addToDisplayWallet(this.endData.WinAmount);
        }
        this.endData = null;
    },

    onDestroy() {
        removeEvents(this);
    },
});
