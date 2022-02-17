

const DataStore = require("gfDataStore");
const Emitter = require('gfEventEmitter');
// const EventCode = require("gfBaseEvents");
const GameConfig = require("gfBaseConfig");
const EventsCode = require("EventsCode1990");
const FishManager = require('gfFishManager');
cc.Class({
    extends: require('gfPlayer'),

    properties: {
        bgGunIsMe: cc.Node,
        bgGunNotMe: cc.Node,
        freezeGunFx: {
            default: null,
            visible: false,
            override: true
        },
        frozenFx: {
            default: null,
            visible: false,
            override: true
        },
        ballTray: {
            default: null,
            visible: false,
            override: true
        },
        laser: cc.Node,
    },

    initEvents() {
        this._super();
    },

    initObj(data) {
        if(this.laserEffect)
            this.laserEffect.active = false;

        this._super(data);
        if (this.bgGunIsMe) {
            this.bgGunNotMe.active = !this.isMe;
            this.bgGunIsMe.active = this.isMe;
        }

    },

    checkHaveBallTrayOnActived() {
        if (this.ballTray && !this.ballTray.isAppear()) {
            this.resumeBallTray(0);
        }
    },
    
    changeGunLaser() {
        if (this.isMe) {
            if (!DataStore.instance.isAutoBot()) {
                DataStore.instance.setDataStore({
                    targetState: GameConfig.instance.TARGET_LOCK.NONE,
                    currentTargetState: GameConfig.instance.TARGET_LOCK.NONE
                });
            }
            // Emitter.instance.emit(EventsCode.GAME_LAYER.RECEIVE_LASER_GUN, deskStation);
            DataStore.instance.setSelfInfo({isLockGun: false, skillLock: true});
            this.btnMinus.getComponent(cc.Button).interactable = false;
            this.btnPlus.getComponent(cc.Button).interactable = false;
            if (DataStore.instance.isAutoBot()) {
                this.onPlayerSendFireLaser();
            } else {
                this.showLaserTitle();
                this.showCountDownLaser();
                this.scheduleOnce(()=>{
                    Emitter.instance.emit(EventsCode.EFFECT_LAYER.SHOW_NOTIFY_LOCK_FISH);
                }, 0.05);
            }
        }

        this.laserEffect.active = true;
        const laserEffectSpine = this.laserEffect.getComponent(sp.Skeleton);
        laserEffectSpine.timeScale = 1;
        laserEffectSpine.setAnimation(0, 'lazer_idle', true);

        this._playEffectFire(GameConfig.instance.GunSkill.LASER);
    },

    onPlayerSendFireLaser(mousePoint) {
        const listCatchLaser = [];
        if (mousePoint) {
            const fish = FishManager.instance.getFishByPoint(mousePoint);
            if (fish) {
                listCatchLaser.push(fish._FishID);
            } else {
                return;
            }
        }

        const listFish = FishManager.instance.getListFish();
        for (let i = 0; i < listFish.length; i++) {
            if (listFish[i].checkOutScene && !listFish[i].checkOutScene() && !listFish[i].checkDie()) {
                listCatchLaser.push(listFish[i]._FishID);
            }

        }

        // this.gun.angle = (this.gun.angle < 0) ? 0 : (this.gun.angle > 180 ? 180 : this.gun.angle);
        let idTargetFish = listCatchLaser.length > 0 ? listCatchLaser[0] : -1;
        const data = {
            Angle: this.gun.angle,
            ListFish: listCatchLaser.length > 0 ? listCatchLaser : [-1],
            SkillID: GameConfig.instance.SkillConfig.LASER,
            TargetFish: idTargetFish,
        };


        Emitter.instance.emit(EventsCode.GAME_LAYER.SEND_FIRE_LASER, data);
        Emitter.instance.emit(EventsCode.EFFECT_LAYER.HIDE_NOTIFY_LOCK_FISH);
        this.resetCountDownLaser();
        DataStore.instance.setSelfInfo({ isLockGun: true });
    },

    onPlayerFireLaser(data) {
        if (this.isMe) {
            if (this.effectIsMe.active) this.effectIsMe.active = false;
            DataStore.instance.setSelfInfo({isLockGun: true, skillLock: false});
            this.resetCountDownLaser();
        } else {
            this.gun.angle = data.Angle;
            this._playEffectFire(GameConfig.instance.GunSkill.LASER);

        }
        Emitter.instance.emit(EventsCode.SOUND.FIRE_LASER);
        Emitter.instance.emit(EventsCode.EFFECT_LAYER.CLEAR_DROP_GUN_LASER, data.DeskStation);
        Emitter.instance.emit(EventsCode.FISH_LAYER.CATCH_FISH_BY_SKILL, data);
        this.laserEffect.active = true;
        const laserEffectSpine = this.laserEffect.getComponent(sp.Skeleton);
        laserEffectSpine.timeScale = 2;
        laserEffectSpine.setAnimation(0, 'lazer_shoot', false);
        laserEffectSpine.setCompleteListener(() => {
            DataStore.instance.setDataStore({"listCatchLaser": []});
        });
    },
    endEffectLighting(infoReward) {
        const {DeskStation} = infoReward;
        const selfInfo = DataStore.instance.getSelfInfo();
        if(selfInfo.DeskStation === DeskStation){
            this.laserEffect.active = false;
            DataStore.instance.setSelfInfo({"isLockGun": false});
            Emitter.instance.emit(EventsCode.AUTO_BOT.TOGGLE_BUTTON,true);
            Emitter.instance.emit(EventsCode.EFFECT_LAYER.HIDE_NOTIFY_LOCK_FISH);
            if (DataStore.instance.isAutoBot()) {
                this.lockBet(true);
            } else {
                DataStore.instance.setDataStore({
                    targetState: GameConfig.instance.TARGET_LOCK.NONE,
                    currentTargetState: GameConfig.instance.TARGET_LOCK.NONE
                });
                Emitter.instance.emit(EventsCode.GAME_LAYER.INTERACTABLE_HUD, true);
                Emitter.instance.emit(EventsCode.GAME_LAYER.RESUME_OLD_TARGET);
            }
        }
        this._updateGun();
    },
    activeFreezeEffect() {
        //@TODO remove this func because Fish 5 have not FreezeGun
    },
    stopFreezeGun() {
        //@TODO remove this func because Fish 5 have not FreezeGun
    },
});
