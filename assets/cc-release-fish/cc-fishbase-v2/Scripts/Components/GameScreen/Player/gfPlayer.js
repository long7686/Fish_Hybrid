/* global ingameDeposit */

const DataStore = require("gfDataStore");
const GameConfig = require("gfBaseConfig");
const FishManager = require("gfFishManager");
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const NetworkGameEvent = require('gfNetworkGameEvent');
const Localize = require('gfLocalize');
const ReferenceManager = require('gfReferenceManager');
const { getRotation, registerEvent, removeEvents, setBetValue, getBetValue, formatUserName } = require('gfUtilities');
const { getPostionInOtherNode, formatMoney } = require("utils");

cc.Class({
    extends: cc.Component,

    properties: {
        txtUserName: {
            default: null,
            type: cc.Label,
        },
        wallet: require('gfWallet'),
        txtBet: {
            default: null,
            type: cc.Label,
        },
        gun: {
            default: null,
            type: cc.Node,
        },
        avatar: {
            default: null,
            type: cc.Sprite,
        },
        btnPlus: {
            default: null,
            type: cc.Node,
        },
        btnMinus: {
            default: null,
            type: cc.Node,
        },
        freezeGunFx: {
            default: null,
            type: sp.Skeleton,
        },
        frozenFx: {
            default: null,
            type: sp.Skeleton,
        },
        laserEffect: cc.Node,
        laserCountDown: cc.Node,
        laserTitle: cc.Node,
        _gunIndex: {
            default: 0,
        },
        _gunValue: {
            default: 0,
        },
        ballTray: require('gfBallTray'),
        _isGunSkill: false,
        _userID: null,
    },

    onLoad() {
        this.initEvents();
    },
    
    initEvents() {
        registerEvent(EventCode.AUTO_BOT.START_BOT, this.onStartBot, this);
    },
    
    initObj(data) {
        this.isMe = data.DeskStation === DataStore.instance.getSelfDeskStation();
        if(data.UserID === this._userID && !this.isMe) {
            this.updateData(data);
            return;
        }
        this.DeskStation = data.DeskStation;
        this._userID = data.UserID;
        this.reset();
        this.setActive(true);
        this.updateAvatar(data);
        this.txtUserName.string = formatUserName(data.Username);
        this.forceUpdateWallet(data.Wallet);
        this.toggleBtnPlusMinus();
        const isHaveSkill = data.skillInfo && data.skillInfo.SkillID > 0;
        if (this.isMe) {
            DataStore.instance.setSelfInfo({
                isLockGun: false,
                skillLock: false,
            });
            Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, true);
            if(!isHaveSkill){
                Emitter.instance.emit(EventCode.GAME_LAYER.RESUME_OLD_TARGET);
            }
            this.effectIsMe.setPosition(this.node.getPosition());
            this.effectMaxGun.active = false;
            this.effectMaxGun.x = this.node.x;
            if(data.BulletMultiple == 0) {
                data.BulletMultiple = getBetValue(GameConfig.instance.GameId, DataStore.instance.getCurrentRoom());
            }   
        }
        
        this.waitingText.active = false;
        this._gunIndex = DataStore.instance.getBulletIndex(data.BulletMultiple);
        
        if (DataStore.instance.isAutoBot() && this.isMe) {
            this._gunIndex = DataStore.instance.getBotSetting().bulletIndex;
            Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, false);
        }
        this._updateGun();


        if (FishManager.instance.isDragonInGame()) {
            this.resumeBallTray(data.Balls);
        } else if (data.Balls) {
            cc.warn("DRAGON SHOULD BE IN GAME");
        }
       
        if (this.isMe) {
            const config = DataStore.instance.getGunValue();
            const wallet = this.wallet.getDisplayWallet();
            const realWallet = this.wallet.getRealWallet();
            if (wallet < this._gunValue) {
                if (wallet < config[0]) {
                    if (!this.checkIfHaveDragon()) {
                        if (realWallet < config[0]) {
                            Emitter.instance.emit(EventCode.GAME_LAYER.OFF_ALL_TARGET);
                            this.showPopupNoMoney();
                        }
                    }
                } else {
                    for (let index = config.length - 1; index >= 0; index--) {
                        const gunValue = config[index];
                        if(wallet >= gunValue){
                            this._gunIndex = DataStore.instance.getBulletIndex(config[index]);
                            this._updateGun();
                        }
                    }
                }
            }
            const timeHide = DataStore.instance.getTimeHide();
            if(timeHide && timeHide >= 30000 || timeHide == null){
                this.effectIsMe.active = !isHaveSkill;
            } else {
                this.effectIsMe.active = false;
            }
            DataStore.instance.setDataStore({timeHide: null});

            // this.effectIsMe.active = !isHaveSkill;

            Emitter.instance.emit(EventCode.AUTO_BOT.TOGGLE_BUTTON, !isHaveSkill);
        }
    
        if (isHaveSkill) {
            this.changeGunSkill(data);
            if (this.isMe) {
                Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, false);
            }
        }


        if (data.IceTimeRemain) {
            this.activeFreezeEffect();
            if (this.isMe) {
                Emitter.instance.emit(EventCode.GAME_LAYER.ON_RESUME_FREEZE_GUN, data);
            }
        } else if (this.isFreezeGunActive() || data.IceTimeRemain === 0) {
            this.stopFreezeGun();
            if (this.isMe) {
                Emitter.instance.emit(EventCode.GAME_LAYER.ON_STOP_FREEZE_GUN, data);
            }
        }
    },
    changeGunSkill(data){
        // eslint-disable-next-line no-unused-vars
        const {DeskStation, skillInfo} = data;
        //should override and switch case in case of multiple skill guns
        this.changeGunLaser(DeskStation);
    },


    updateAvatar(data){
        if(this.avatarAtlas){
            let frameAvatar = this.avatarAtlas.getSpriteFrame(data.Avatar);
            if (!frameAvatar) {
                frameAvatar = this.avatarAtlas.getSpriteFrame(GameConfig.instance.DEFAULT_AVATAR);
            }
            this.avatar.spriteFrame = frameAvatar;
        }
    },

    updateData(data) {
        this.updateAvatar(data);
        this.txtUserName.string = formatUserName(data.Username);
        this.forceUpdateWallet(data.Wallet);
        this.toggleBtnPlusMinus();

        this.waitingText.active = false;
        this._gunIndex = DataStore.instance.getBulletIndex(data.BulletMultiple);

        this._updateGun();
        const isHaveSkill = data.skillInfo && data.skillInfo.SkillID > 0;

        if (isHaveSkill) {
            this.changeGunSkill(data);
        }

        if (data.IceTimeRemain) {
            this.activeFreezeEffect();
        } else if (this.isFreezeGunActive() || data.IceTimeRemain === 0) {
            this.stopFreezeGun();
        }
    },

    isActive() {
        return this.node.active;
    },
    toggleBtnPlusMinus() {
        if (this.btnMinus) this.btnMinus.active = this.isMe;
        if (this.btnPlus) this.btnPlus.active = this.isMe;
    },

    // _hideBtnPlusMinus() {
    //     if (this.btnMinus) this.btnMinus.active = false;
    //     if (this.btnPlus) this.btnPlus.active = false;
    // },

    updateGunData(gunIndex) {
        this._gunIndex = gunIndex;
        this._updateGun();
    },

    _updateGun() {
        if (this.btnMinus) this.btnMinus.getComponent(cc.Button).interactable = !(this._gunIndex === 0);
        if (this.btnPlus) this.btnPlus.getComponent(cc.Button).interactable = !(this._gunIndex === DataStore.instance.getTotalGun() - 1);
        this._gunValue = DataStore.instance.getGunValue()[this._gunIndex];
        this.txtBet.string = formatMoney(this._gunValue);
        this._playEffectChangeGun();
        if (this.isMe && (DataStore.instance.isAutoBot() || DataStore.instance.getSelfInfo().skillLock)) {
            if (this.btnPlus) this.btnPlus.getComponent(cc.Button).interactable = false;
            if (this.btnMinus) this.btnMinus.getComponent(cc.Button).interactable = false;
        }
    },

    _playEffectChangeGun(){
        this._playEffectFire();
    },

    _playEffectFire(gunName) {
        const spriteGunNode = this.gun.getChildByName('SpriteGun');
        if (spriteGunNode) {
            if (!gunName) gunName = `gun${this._gunIndex + 1}`;
            this._isGunSkill = Object.values(GameConfig.instance.GunSkill).indexOf(gunName) > -1;
            spriteGunNode.getComponent(cc.Sprite).spriteFrame = this.gunSprite[gunName];
            spriteGunNode.getComponent(cc.Animation).play();
        }
    },

    lockBet(isLock = false) {
        if (isLock) {
            if (this.btnPlus) this.btnPlus.getComponent(cc.Button).interactable = false;
            if (this.btnMinus) this.btnMinus.getComponent(cc.Button).interactable = false;
        } else {
            this._updateGun();
        }
    },

    onBtnPlus() {
        Emitter.instance.emit(EventCode.SOUND.CLICK_BET);

        this._gunIndex++;
        if (!this._checkMaxGun()) {
            this._gunIndex--;
            return;
        }
        if (this._gunIndex >= DataStore.instance.getTotalGun()) {
            this._gunIndex = 0;
        }
        this._updateGun();
    },

    _checkMaxGun() {
        if (DataStore.instance.getGunValue()[this._gunIndex] > this.wallet.getDisplayWallet()) {
            this.effectMaxGun.active = true;
            this.effectMaxGun.stopAllActions();
            this.effectMaxGun.opacity = 255;
            this.effectMaxGun.runAction(
                cc.sequence(
                    cc.delayTime(1),
                    cc.fadeOut(2),
                    cc.callFunc(() => {
                        this.effectMaxGun.active = false;
                    }),
                ),
            );
            return false;
        }
        return true;
    },

    onBtnMinus() {
        Emitter.instance.emit(EventCode.SOUND.CLICK_BET);
        this._gunIndex--;
        if (this._gunIndex < 0) {
            this._gunIndex = DataStore.instance.getTotalGun() - 1;
        }
        this._updateGun();
    },

    onUserFire(data) {
        if (this.isMe) {
            if (DataStore.instance.isReachMaxNumBullet()) return;
            Emitter.instance.emit(EventCode.SOUND.GUN_FIRE, this._gunIndex);
        }
        this.gun.angle = this.checkAngleByLockFish(data);
        if (!this.isMe) {
            this._gunIndex = DataStore.instance.getBulletIndex(data.BulletMultiple);
            this._updateGun();
        } else {
            setBetValue(GameConfig.instance.GameId, DataStore.instance.getCurrentRoom(), data.BulletMultiple);
            if (this.effectIsMe.active) this.effectIsMe.active = false;
            if (data.LockedFishID > -1) {
                this._playEffectLockFish(data);
            }
        }
        this._playEffectFire();
        Emitter.instance.emit(EventCode.GAME_LAYER.CREATE_BULLET, data);
    },

    checkAngleByLockFish(data) {
        if (data.LockedFishID >= 0) {
            const fish = FishManager.instance.getFishById(data.LockedFishID);
            const startPos = getPostionInOtherNode(ReferenceManager.instance.getNodeGameLayer(), this.gun);
            let angle = 0;
            if (fish) {
                const endPos = fish.getLockPositionByNodeSpace(ReferenceManager.instance.getNodeGameLayer());
                angle = getRotation(endPos, startPos);
                if (this.index > 1) {
                    angle += 360;
                }
                data.Angle = angle;
            }
        }
        return data.Angle;
    },
    // START LASER
    changeGunLaser() {
        if (this.isMe) {
            if (!DataStore.instance.isAutoBot()) {
                DataStore.instance.setDataStore({
                    targetState: GameConfig.instance.TARGET_LOCK.NONE,
                    currentTargetState: GameConfig.instance.TARGET_LOCK.NONE,
                });
            }
            this.lockBet(true);
            DataStore.instance.setSelfInfo({ isLockGun: false, skillLock: true });
            this.laserEffect.active = true;
            const laserEffectSpine = this.laserEffect.getComponent(sp.Skeleton);
            laserEffectSpine.setAnimation(0, 'Aim', false);
            if (DataStore.instance.isAutoBot()) {
                laserEffectSpine.setCompleteListener(() => {
                    this.onPlayerSendFireLaser();
                    laserEffectSpine.setCompleteListener(() => {});
                });
            } else {
                this.showLaserTitle();
                this.showCountDownLaser();
            }
            this.btnMinus.getComponent(cc.Button).interactable = false;
            this.btnPlus.getComponent(cc.Button).interactable = false;
        }
        this._playEffectFire(GameConfig.instance.GunSkill.LASER);
    },
    onStartBot() {
        if (!this.isMe) return;
        this.lockBet(true);
        const { isLockGun, skillLock } = DataStore.instance.getSelfInfo();
        if (isLockGun && skillLock) {
            // wait for laser item fly to gun node
        } else if (skillLock) {
            this.changeGunLaser();
        }
    },
    fireLaserImmediate() {
        if (DataStore.instance.getSelfInfo().skillLock === true && this.isMe === true) {
            this.resetCountDownLaser();
            this.onPlayerSendFireLaser();
        }
    },

    showLaserTitle() {
        this.laserTitle.active = true;
        this.laserTitle.stopAllActions();
        this.laserTitle.runAction(
            cc.sequence(
                cc.scaleTo(0, 0, 0),
                cc.scaleTo(0.7, 1, 1),
                cc.callFunc(() => {
                    this.laserTitle.runAction(cc.repeatForever(cc.sequence(
                        cc.scaleTo(0.4, 0.9, 0.9),
                        cc.scaleTo(0.4, 1.1, 1.1),
                    ).easing(cc.easeSineIn())));
                }),
            ),
        );
    },

    showCountDownLaser() {
        let countDown = GameConfig.instance.SkillConfig.TIMEOUT;
        this.laserCountDown.active = true;
        this.laserCountDown.getComponent(cc.Label).string = countDown;
        this.laserCountDown.stopAllActions();
        this.laserCountDown.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                countDown--;
                if (countDown <= 0) {
                    this.resetCountDownLaser();
                    this.onPlayerSendFireLaser();
                } else {
                    this.laserCountDown.getComponent(cc.Label).string = countDown;
                }
            }),
        ).repeat(GameConfig.instance.SkillConfig.TIMEOUT));
    },

    resetCountDownLaser() {
        this.laserCountDown.getComponent(cc.Label).string = "0";
        this.laserCountDown.stopAllActions();
        this.laserCountDown.active = false;
        this.laserTitle.stopAllActions();
        this.laserTitle.active = false;
    },

    _updateAngle(angle) {
        if (angle < 0 && angle > -90) {
            return 0;
        } if (angle < -90 && angle > -180) {
            return -180;
        }
        return angle;
    },

    rotateGun(mousePos) {
        const angle = getRotation(mousePos, this.gun.convertToWorldSpaceAR(cc.v2(0, 0)));
        this.gun.angle = this._updateAngle(angle);
    },

    onPlayerSendFireLaser() {
        const listCatchLaser = DataStore.instance.getListCatchLaser();
        this.gun.angle = this._updateAngle(this.gun.angle);
        const data = {
            Angle: this.gun.angle,
            ListFish: listCatchLaser.length > 0 ? listCatchLaser : [-1],
            SkillID: GameConfig.instance.SkillConfig.LASER,
        };
        Emitter.instance.emit(EventCode.GAME_LAYER.SEND_FIRE_LASER, data);
        this.resetCountDownLaser();
        DataStore.instance.setSelfInfo({ isLockGun: true });
    },

    activeFreezeEffect() {
        if (this.isFreezeGunActive()) return;
        this.freezeGunFx.node.active = true;
        this.isFreezed = true;
        this.freezeGunFx.setAnimation(0, "1XuatHien", false);
        this.freezeGunFx.setCompleteListener(() => {
            this.freezeGunFx.setAnimation(0, "IdleSungBang", true);
            this.freezeGunFx.setCompleteListener(() => {});
        });

        this.frozenFx.node.active = true;
        this.frozenFx.setAnimation(0, "animation", false);
        this.frozenFx.setCompleteListener(() => {
            this.frozenFx.node.active = false;
        });
    },

    isFreezeGunActive() {
        return this.isFreezed;
    },

    stopFreezeGun() {
        this.freezeGunFx.node.active = false;
        this.isFreezed = false;
    },

    onPlayerFireLaser(data) {
        if (this.isMe) {
            if (this.effectIsMe.active) this.effectIsMe.active = false;
            DataStore.instance.setSelfInfo({ isLockGun: true, skillLock: false });
            this.resetCountDownLaser();
        } else {
            this.gun.angle = data.Angle;
            this._playEffectFire(GameConfig.instance.GunSkill.LASER);
        }
        Emitter.instance.emit(EventCode.SOUND.FIRE_LASER);
        Emitter.instance.emit(EventCode.EFFECT_LAYER.CLEAR_DROP_GUN_LASER, data.DeskStation);
        this.laserEffect.active = true;
        const laserEffectSpine = this.laserEffect.getComponent(sp.Skeleton);
        laserEffectSpine.timeScale = 2;
        laserEffectSpine.setAnimation(0, 'Shoot', false);
        Emitter.instance.emit(EventCode.FISH_LAYER.CATCH_FISH_BY_SKILL, data);
        laserEffectSpine.setCompleteListener(() => {
            laserEffectSpine.setCompleteListener(() => {});
            this._completedEffectSkillLaser(data);
        });
    },

    // eslint-disable-next-line no-unused-vars
    _completedEffectSkillLaser(data){
        DataStore.instance.setDataStore({ listCatchLaser: [] });
        this.laserEffect.active = false;
        if (this.isMe) {
            DataStore.instance.setSelfInfo({ isLockGun: false });
            Emitter.instance.emit(EventCode.AUTO_BOT.TOGGLE_BUTTON, true);
            if (DataStore.instance.isAutoBot()) {
                this.lockBet(true);
            } else {
                DataStore.instance.setDataStore({
                    targetState: GameConfig.instance.TARGET_LOCK.NONE,
                    currentTargetState: GameConfig.instance.TARGET_LOCK.NONE,
                });
                Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, true);
                Emitter.instance.emit(EventCode.GAME_LAYER.RESUME_OLD_TARGET);
            }
        }
        this._updateGun();
    },
    // END LASER
    

    getGunAngle() {
        return this.gun.angle;
    },

    forceUpdateWallet(value) {
        if (this.isMe) {
            DataStore.instance.setSelfInfo({ Wallet: value });
        }
        this.wallet.forceUpdateWallet(value);

    },

    updateWallet(value) {
        if (this.isMe) {
            DataStore.instance.setSelfInfo({ Wallet: value });
            cc.log("REAL WALLET:" + formatMoney(value));
        }
        this.wallet.updateWallet(value);
    },

    addGoldReward(reward) {
        this.wallet.addGoldReward(reward);
    },

    addToDisplayWallet(amount) {
        this.wallet.addToDisplay(amount);
        if (amount > 0 && DataStore.instance.isAutoPaused()) {
            Emitter.instance.emit(EventCode.GAME_LAYER.RESUME_AUTO_FIRE);
        }
    },

    getBallHolder(index) {
        return this.ballTray.getBallHolder(index);
    },

    checkHaveBallTrayOnActived() {
        if (this.ballTray && !this.ballTray.isAppear()) {
            this.resumeBallTray(0);
        }
    },

    showBallTray() {
        if (!this.ballTray) return;
        this.scheduleOnce(() => {
            this.ballTray.appear();
        }, 1);
    },

    resumeBallTray(ballCount = 0) {
        if (!this.ballTray) return;
        this.ballTray.appear();
        Emitter.instance.emit(EventCode.DRAGON.ADD_BALL_TO_PLAYER, { ballCount, playerIndex: this.index });
        this.ballTray.onBallEnter(ballCount);
    },

    onBallDropDone() {
        this.ballTray.onBallEnter();
    },

    hideBallTray() {
        if (!this.ballTray) return;
        this.ballTray.disappear();
    },

    reset() {
        this.unscheduleAllCallbacks();
        this.isFreezed = false;
        if (this.laserEffect) {
            this.laserEffect.active = false;
            const laserEffectSpine = this.laserEffect.getComponent(sp.Skeleton);
            laserEffectSpine.timeScale = 1;
            laserEffectSpine.setCompleteListener(() => {});
        }
        if (this.laserCountDown) this.laserCountDown.active = false;
        if (this.laserTitle) this.laserTitle.active = false;
        if (this.ballTray) {
            this.ballTray.hide();
        }
    },
    resetOnExit() {
        this.unscheduleAllCallbacks();
        if (this.isMe) {
            if (this.effectIsMe.active) this.effectIsMe.active = false;
            DataStore.instance.setSelfInfo({ isLockGun: false });
        }
        this.setActive(false);
        if (this.laserEffect) this.laserEffect.active = false;
        if (this.laserCountDown) this.laserCountDown.active = false;
        if (this.laserTitle) this.laserTitle.active = false;
        if (this.ballTray) {
            this.ballTray.hide();
        }
        this.txtUserName.string = '';
        this.wallet.resetOnExit();
        this.txtBet.string = '';
        this._gunIndex = 0;
        this._gunValue = 0;
        this.avatar.spriteFrame = '';
        this.resetUserId();
    },

    setActive(active = true) {
        this.node.active = active;
    },

    resetUserId(){
        this._userID = null;
    },

    _playEffectLockFish(data) {
        const fish = FishManager.instance.getFishById(data.LockedFishID);
        if (fish) {
            Emitter.instance.emit(EventCode.PLAYER_LAYER.START_LOCK_FISH, fish, this.gun);
        }
    },

    checkUpdateGunByWallet() {
        const config = DataStore.instance.getGunValue();
        const wallet = this.wallet.getDisplayWallet();
        const realWallet = this.wallet.getRealWallet();
        if (wallet < this._gunValue) {
            if (wallet < config[0]) {
                if (!this.checkIfHaveDragon()) {
                    if (realWallet < config[0]) {
                        Emitter.instance.emit(EventCode.GAME_LAYER.OFF_ALL_TARGET);
                        this.showPopupNoMoney();
                    }
                }
                return false;
            }

            if (config[this._gunIndex] >= wallet && !DataStore.instance.isAutoBot()) {
                for (let i = this._gunIndex - 1; i >= 0; --i) {
                    if (config[i] <= wallet) {
                        this._gunIndex = i;
                        break;
                    }
                }
                this._updateGun();
            } else if (DataStore.instance.isAutoBot() && config[this._gunIndex] > realWallet) {
                Emitter.instance.emit(EventCode.AUTO_BOT.END_AUTO_BOT);
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_AUTOBOT);
                // PopupController.instance.showAutoBot();
                return false;
            }
        }
        return true;
    },

    checkIfHaveDragon() {
        const config = DataStore.instance.getGunValue();
        const effectDragon = ReferenceManager.instance.getEffectLayer().getComponent('gfEffectDragon');
        const minBet = config[0];
        if (effectDragon) {
            const ballCount = effectDragon.getMyTotalBall();
            if (ballCount === 0 && this.wallet.getRealWallet() < minBet) {
                Emitter.instance.emit(EventCode.GAME_LAYER.OFF_ALL_TARGET);
                this.showPopupNoMoney();
            } else if (ballCount > 0) {
                if(!DataStore.instance.isAutoPaused()){
                    Emitter.instance.emit(EventCode.GAME_LAYER.PAUSE_AUTO_FIRE);
                }
                const data = {
                    customMsg: Localize.instance.txtCustomNotify.NotEnoughCoin,
                    customCallbacks: {
                        confirmCallback: () => {
                            const currentBallCount = effectDragon.getMyTotalBall();
                            if (currentBallCount === 0 && this.wallet.getRealWallet() >= minBet && DataStore.instance.isAutoPaused()) {
                                Emitter.instance.emit(EventCode.GAME_LAYER.RESUME_AUTO_FIRE);
                            } else {
                                const loadConfigAsync = require('loadConfigAsync');
                                const { LOGIN_IFRAME } = loadConfigAsync.getConfig();
                                if (LOGIN_IFRAME && typeof (ingameDeposit) === 'function') {
                                    ingameDeposit();
                                }  
                            }
                        },
                        rejectCallback: () => {
                        },
                    }
                };
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, data);
            }
            return true;
        }
        return false;
    },

    isHoldingSkillGun(){
        return this._isGunSkill;
    },


    showPopupNoMoney(){
        if(!this.isMe) return;
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.MSG_CODE.NO_MONEY_IN_GAME);
    },

    onDestroy() {
        this.unscheduleAllCallbacks();
        removeEvents(this);
    },
});
