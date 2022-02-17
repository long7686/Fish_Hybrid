

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const FishManager = require('gfFishManager');
const { convertAssetArrayToObject } = require('utils');
const { registerEvent, removeEvents } = require('gfUtilities');
const ReferenceManager = require('gfReferenceManager');

cc.Class({
    extends: cc.Component,

    properties: {
        fxBtnBelow: cc.Node,
        fxBtnAbove: cc.Node,
        listTextBtn: [cc.Node],
        fishNotifyImg: cc.Node,
        listFishNotify: {
            default: [],
            type: cc.SpriteFrame,
        },
        listBtn: {
            default: [],
            type: cc.Node,
        },
        _posBTN: [],
        btnFreeze: cc.Button,
        bntAutoBot: require("gfButtonAutoBot"),
        _scaleFactor: 0.6
    },

    onLoad() {
        this.targetButtonsOff();
        this.node.getBtnFreeze = this.getBtnFreeze.bind(this);
        DataStore.instance.setDataStore({ "": GameConfig.instance.TARGET_LOCK.NONE });
        ReferenceManager.instance.setData({ HUDLayer: this.node });
        this.initEvents();
        this._posBTN = [cc.v2(-114, -316), cc.v2(37, -316), cc.v2(-37, -316)];
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_LOCK_FISH_IMAGE, this.updateLockFishImg, this);
        registerEvent(EventCode.GAME_LAYER.CHOOSE_FISH_BY_POINT, this.chooseFishByPoint, this);
        registerEvent(EventCode.GAME_LAYER.OFF_ALL_TARGET, this.resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.INTERACTABLE_HUD, this.interactableHUD, this);
        registerEvent(EventCode.GAME_LAYER.PAUSE_AUTO_FIRE, this.pauseAutoFire, this);
        registerEvent(EventCode.GAME_LAYER.RESUME_AUTO_FIRE, this.resumeAutoFire, this);
        registerEvent(EventCode.FISH_LAYER.BOSS_ON_GAME, this.changeTargetToBoss, this);
        registerEvent(EventCode.GAME_LAYER.RESUME_OLD_TARGET, this.resumeOldTarget, this);
    },

    resumeOldTarget() {
        const oldTarget = DataStore.instance.getOldTarget();
        if (!oldTarget.targetState) return;
        if (oldTarget.targetState === GameConfig.instance.TARGET_LOCK.TARGET_ONE) {
            if (oldTarget.LockFishKind >= 0) {
                this.updateLockFishImg(oldTarget.LockFishKind);
            } else {
                DataStore.instance.clearOldTarget();
                return;
            }

        }
        if (oldTarget.LockFishID) {
            const lockFish = FishManager.instance.getFishById(oldTarget.LockFishID);
            const lockFishID = lockFish ? lockFish.getId() : null;
            DataStore.instance.setSelfInfo({ LockFish: lockFish, LockFishID: lockFishID });
        }
        if (oldTarget.LockFishKind >= 0) {
            DataStore.instance.setSelfInfo({ LockFishKind: oldTarget.LockFishKind });
        }
        this.changeStatusGroupButton(oldTarget.targetState);
        DataStore.instance.clearOldTarget();
    },

    pauseAutoFire() {
        const TARGET_TYPE = GameConfig.instance.TARGET_LOCK;
        if (!DataStore.instance.isAutoPaused() && DataStore.instance.getTargetState() !== TARGET_TYPE.NONE) {
            DataStore.instance.setDataStore({
                targetState: TARGET_TYPE.PAUSE,
            });
        }
        Emitter.instance.emit(EventCode.PLAYER_LAYER.STOP_LOCK_FISH);
    },

    resumeAutoFire() {
        const currentTargetState = DataStore.instance.getCurrentTargetStage();
        const TARGET_TYPE = GameConfig.instance.TARGET_LOCK;
        if (currentTargetState !== TARGET_TYPE.NONE && DataStore.instance.isAutoPaused()) {
            this.changeStatusGroupButton(currentTargetState);
        }
    },

    onClickAutoBot() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_AUTOBOT);
        // PopupController.instance.showAutoBot();
    },
    onClickTargetBtn(event, data) {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfDeskStation());
        const currentTargetState = DataStore.instance.getCurrentTargetStage();
        if(player){
            if(currentTargetState === parseInt(data) || !player.checkUpdateGunByWallet()){
                this.changeStatusGroupButton(GameConfig.instance.TARGET_LOCK.NONE);
            } else {
                this.changeStatusGroupButton(parseInt(data));
            }
        }
      
    },

    changeStatusGroupButton(type = GameConfig.instance.TARGET_LOCK.NONE) {
        const selfInfo = DataStore.instance.getSelfInfo();
        const TARGET_TYPE = GameConfig.instance.TARGET_LOCK;
        this.unschedule(this.onAutoFire);
        this.unschedule(this.onAutoFireTargetAll);
        this.unschedule(this.onAutoTargetOne);
        this.targetButtonsOff();
        if (DataStore.instance.getTargetState() == type) {
            type = TARGET_TYPE.NONE;
        }
        DataStore.instance.setDataStore({
            targetState: type,
            currentTargetState: type,
        });
        switch (type) {
            case TARGET_TYPE.NONE:
                this.resetLockFish();
                break;
            case TARGET_TYPE.AUTO_FIRE:
                this.targetButtonOn(TARGET_TYPE.AUTO_FIRE);
                this.schedule(this.onAutoFire, DataStore.instance.FireSpeed.TURBO);
                this.resetLockFish();
                break;
            case TARGET_TYPE.TARGET_ONE:
                this.targetButtonOn(TARGET_TYPE.TARGET_ONE);
                this.schedule(this.onAutoTargetOne, DataStore.instance.FireSpeed.TURBO);
                if (!selfInfo.LockFish && selfInfo.LockFishKind < 0) {
                    Emitter.instance.emit(EventCode.EFFECT_LAYER.SHOW_NOTIFY_LOCK_FISH);
                } else {
                    this.updateLockFishImg(selfInfo.LockFishKind);
                }

                break;
            case TARGET_TYPE.TARGET_ALL:
                DataStore.instance.setSelfInfo({isPriorityTargetBoss: true});
                if (selfInfo.TargetTime == null) {
                    selfInfo.TargetTime = DataStore.instance.ChangeTarget;
                }
                this.TargetLockTime = selfInfo.TargetTime;
                this.targetButtonOn(TARGET_TYPE.TARGET_ALL);
                this.schedule(this.onAutoFireTargetAll, DataStore.instance.FireSpeed.TURBO);
                break;
        }

    },

    onClickFreezeBtn() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.GAME_LAYER.SEND_ACTIVE_FREEZE_GUN);
    },

    changeTargetToBoss() {
        DataStore.instance.setSelfInfo({ isPriorityTargetBoss: true });
        this.TargetLockTime = 0;
    },

    isBossKind(fishKind) {
        return FishManager.instance.isBossKind(fishKind);
    },

    onAutoFire() {
        if (DataStore.instance.isAutoPaused()) {
            return;
        }
        let point = cc.v2(GameConfig.instance.realSize.Width / 2, GameConfig.instance.realSize.Height / 2);
        const mousePos = DataStore.instance.getMousePos();
        if (mousePos) {
            point = mousePos;
        }
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_SEND_FIRE, { point, lockFishID: -1 });
    },

    checkChangeTargetCondition() {
        const { LockFish, LockFishKind } = DataStore.instance.getSelfInfo();
        return !LockFish || !LockFish.isAvailable()
            || (!this.isBossKind(LockFishKind) && this.TargetLockTime <= 0);
    },

    onAutoFireTargetAll() {
        if (DataStore.instance.isAutoPaused()) {
            return;
        }
        const selfInfo = DataStore.instance.getSelfInfo();
        this.TargetLockTime -= DataStore.instance.FireSpeed.TURBO;
        if (this.checkChangeTargetCondition()) {
            const lockFish = FishManager.instance.getFishForTargetAll();
            const lockFishID = lockFish ? lockFish.getId() : null;
            DataStore.instance.setSelfInfo({ LockFish: lockFish, LockFishID: lockFishID});
            this.TargetLockTime = selfInfo.TargetTime;
        }

        if (selfInfo.LockFish && selfInfo.LockFish.isAvailable()) {
            Emitter.instance.emit(EventCode.GAME_LAYER.ON_SEND_FIRE, {
                point: selfInfo.LockFish.node.position,
                lockFishID: selfInfo.LockFish.getId(),
            });
        } else {
            this.resetLockFish();
        }
    },

    onAutoTargetOne() {
        if (DataStore.instance.isAutoPaused()) {
            return;
        }
        const selfInfo = DataStore.instance.getSelfInfo();
        if (selfInfo.LockFishKind > -1) {
            if (!selfInfo.LockFish || !selfInfo.LockFish.isAvailable()) {
                const lockFish = FishManager.instance.getFishByType(selfInfo.LockFishKind);
                const lockFishID = lockFish ? lockFish.getId() : null;
                DataStore.instance.setSelfInfo({ LockFish: lockFish, LockFishID: lockFishID });
            }
            if (selfInfo.LockFish && selfInfo.LockFish.isAvailable()) {
                Emitter.instance.emit(EventCode.GAME_LAYER.ON_SEND_FIRE, {
                    point: selfInfo.LockFish.node.position,
                    lockFishID: selfInfo.LockFish._FishID,
                });
            } else {
                this.changeStatusGroupButton(GameConfig.instance.TARGET_LOCK.NONE);
                this.resetLockFish();
            }
        }
    },

    chooseFishByPoint(point) {
        const selfInfo = DataStore.instance.getSelfInfo();
        const fish = FishManager.instance.getFishByPoint(point);
        if (!fish) return;
        DataStore.instance.setSelfInfo({ LockFish: fish, LockFishKind: fish.getKind(), LockFishID: fish.getId() });

        if (DataStore.instance.getTargetState() === GameConfig.instance.TARGET_LOCK.TARGET_ONE) {
            Emitter.instance.emit(EventCode.EFFECT_LAYER.HIDE_NOTIFY_LOCK_FISH);
            this.updateLockFishImg(fish.getKind());
        } else if (DataStore.instance.getTargetState() === GameConfig.instance.TARGET_LOCK.TARGET_ALL) {
            this.TargetLockTime = selfInfo.TargetTime;
            DataStore.instance.setSelfInfo({ isPriorityTargetBoss: this.isBossKind(fish.getKind()) });
        }
    },

    resetLockFish() {
        DataStore.instance.setSelfInfo({ LockFish: null, LockFishKind: -1, LockFishID: null });
        Emitter.instance.emit(EventCode.PLAYER_LAYER.STOP_LOCK_FISH);
    },

    targetButtonOn(type) {
        if (this.fxBtnBelow) {
            this.fxBtnBelow.active = true;
            this.fxBtnBelow.setPosition(this._posBTN[type - 1]);
        }
        if (this.fxBtnAbove) {
            this.fxBtnAbove.active = true;
            this.fxBtnAbove.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
            this.fxBtnAbove.setPosition(this._posBTN[type - 1]);
        }
        this.listTextBtn[type - 1].active = false;
    },

    targetButtonsOff() {
        Emitter.instance.emit(EventCode.EFFECT_LAYER.HIDE_NOTIFY_LOCK_FISH);
        this.fishNotifyImg.active = false;
        if (this.fxBtnBelow) {
            this.fxBtnBelow.active = false;
        }
        if (this.fxBtnAbove) {
            this.fxBtnAbove.stopAllActions();
            this.fxBtnAbove.active = false;
        }
        this.listTextBtn.forEach((item) => {
            item.active = true;
        });
        this.listBtn.forEach((button) => {
            button.getComponent(cc.Button).interactable = true;
        });
    },

    updateLockFishImg(fishKind = 0) {
        const assetFishes = convertAssetArrayToObject(this.listFishNotify);
        if (assetFishes[fishKind]) {
            this.fishNotifyImg.active = true;
            this.fishNotifyImg.getComponent(cc.Sprite).spriteFrame = assetFishes[fishKind];
            this.fishNotifyImg.stopAllActions();
            this.fishNotifyImg.runAction(
                cc.sequence(
                    cc.scaleTo(0, this._scaleFactor, this._scaleFactor),
                    cc.scaleTo(0.1, this._scaleFactor + 0.5, this._scaleFactor + 0.5),
                    cc.scaleTo(0.1, this._scaleFactor, this._scaleFactor),
                ),
            );
        }
    },

    interactableHUD(interactable = true) {
        if (!interactable) this.resetOnExit();
        this.listBtn.forEach((button) => {
            button.getComponent(cc.Button).interactable = interactable;
        });
    },

    getBtnFreeze() {
        return this.btnFreeze.node;
    },

    resetOnExit() {
        this.unschedule(this.onAutoFire);
        this.unschedule(this.onAutoFireTargetAll);
        this.unschedule(this.onAutoTargetOne);
        DataStore.instance.setSelfInfo({ LockFish: null, LockFishKind: -1, LockFishID: null, targetState: 0, currentTargetState: 0 });
        Emitter.instance.emit(EventCode.PLAYER_LAYER.STOP_LOCK_FISH);
        this.targetButtonsOff();
        this.unscheduleAllCallbacks();
    },

    onDestroy() {
        removeEvents(this);
    },
});
