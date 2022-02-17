

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const { registerEvent, removeEvents } = require("gfUtilities");
const ReferenceManager = require('gfReferenceManager');

cc.Class({
    extends: cc.Component,

    properties: {
        txtFreeze: cc.Label,
        textFreezeCountdown: cc.Label,
        frzCDPrgss: cc.ProgressBar,
        btnFreeze: cc.Button,
    },

    onLoad() {
        this.isLockByMiniBoss = false;
        this.isLockByLaser = false;
        this.lastNumSkill = -1;
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.GAME_LAYER.FREEZE_ADD_ITEM, this.addFreezeItem, this);
        registerEvent(EventCode.GAME_LAYER.ON_ACTIVE_FREEZE_GUN, this.activeFreezeGun, this);
        registerEvent(EventCode.GAME_LAYER.ON_RESUME_FREEZE_GUN, this.resumeFreezeGun, this);
        registerEvent(EventCode.GAME_LAYER.ON_STOP_FREEZE_GUN, this.stopFreezeGun, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_LIST_ITEM, this.updateListItem, this);
        registerEvent(EventCode.GAME_LAYER.GAME_CHANGE_ROUND, this.onChangeRound, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_ROOM_DATA, this.onUpdateRoomData, this);
        registerEvent(EventCode.GAME_LAYER.RECEIVE_LASER_GUN, this.onPlayerHaveGunLaser, this);
        registerEvent(EventCode.AUTO_BOT.TOGGLE_BUTTON, this.onPlayFireLaser, this);
    },

    update() {
        this.updateFreezeCooldown();
    },

    updateFreezeCooldown() {
        if (!this.freezeTime || !this.isLock || this.frzCDPrgss.progress === 1 || DataStore.instance === null) return;
        const timeStart = DataStore.instance.getTime() - this.freezeTime;
        this.frzCDPrgss.progress = Math.max(0, Math.min(1.0, (DataStore.instance.getTime() - this.freezeTime) / GameConfig.instance.TIME_COUNTDOWN_ITEM_FREEZE));
        this.textFreezeCountdown.string = Math.ceil((GameConfig.instance.TIME_COUNTDOWN_ITEM_FREEZE - timeStart) / 1000);
    },

    addFreezeItem() {
        this.lastNumSkill += 1;
        this.updateFreezeItem();
    },

    updateListItem(data) {
        for (let i = 0; i < data.listItem.length; i++) {
            const itemInfo = data.listItem[i];
            if (itemInfo.ID === GameConfig.instance.SKILL_ITEM.FREEZE) {
                if (this.lastNumSkill < 0) {
                    this.lastNumSkill = data.listItem[i].amount;
                }
            }
        }
    },

    updateFreezeItem() {
        this.txtFreeze.string = `${this.lastNumSkill}/9`;
        const isLockByLaser = DataStore.instance.getSelfInfo().skillLock;
        this.btnFreeze.interactable = !isLockByLaser && !this.isLock && !this.isLockByMiniBoss && this.lastNumSkill > 0;
    },

    unlockFreezeSkill() {
        this.isLock = false;
        this.frzCDPrgss.node.active = false;
        const isLockByLaser = DataStore.instance.getSelfInfo().skillLock;
        if (this.lastNumSkill > 0 && !this.isLock && !this.isLockByMiniBoss && !isLockByLaser) {
            this.btnFreeze.interactable = true;
        } else {
            this.btnFreeze.interactable = false;
        }
    },

    activeFreezeGun(data) {
        Emitter.instance.emit(EventCode.PLAYER_LAYER.FREEZE_EFFECT, data.DeskStation);
        if (data.DeskStation === DataStore.instance.getSelfDeskStation()) {
            this.lockButton();
            this.lastNumSkill -= 1;
            this.updateFreezeItem();
        }
    },

    stopFreezeGun(data) {
        if (data.DeskStation === DataStore.instance.getSelfDeskStation()) {
            this.unlockFreezeSkill();
        }
    },

    onChangeRound(data) {
        if (data.SceneKind === GameConfig.instance.MiniBossSceneKind) {
            this.frzCDPrgss.node.active = false;
            this.isLockByMiniBoss = true;
        } else {
            this.isLockByMiniBoss = false;
        }
        this.updateFreezeItem();
    },

    lockButton() {
        this.isLock = true;
        this.btnFreeze.interactable = false;
        this.frzCDPrgss.node.active = true;
        this.frzCDPrgss.progress = 0;
        this.freezeTime = DataStore.instance.getTime();
    },

    resumeFreezeGun(data) {
        if (data.IceTimeRemain > 0) {
            this.updateFreezeButton(data.IceTimeRemain);
        }
    },

    updateFreezeButton(timeRemain) {
        this.isLock = true;
        this.btnFreeze.interactable = false;
        this.frzCDPrgss.node.active = true;
        const timePassed = GameConfig.instance.TIME_COUNTDOWN_ITEM_FREEZE - timeRemain;
        this.frzCDPrgss.progress = timePassed / GameConfig.instance.TIME_COUNTDOWN_ITEM_FREEZE; // should calculate by timeRemain/totalTime
        this.freezeTime = DataStore.instance.getTime() - timePassed; // should calculate based on timeRemain
    },

    onUpdateRoomData(data) {
        this.onChangeRound(data);
    },

    onPlayerHaveGunLaser(DeskStation) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DeskStation);
        if (player.isMe) {
            this.updateFreezeItem();
        }
    },

    onPlayFireLaser() {
        this.updateFreezeItem();
    },

    onDestroy() {
        removeEvents(this);
    },

});
