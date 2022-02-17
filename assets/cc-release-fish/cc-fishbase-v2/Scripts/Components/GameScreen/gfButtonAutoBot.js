const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const ReferenceManager = require('gfReferenceManager');
const DataStore = require('gfDataStore');
const FishManager = require('gfFishManager');
const GameConfig = require('gfBaseConfig');
const { convertSecondToTime, registerEvent, removeEvents } = require('gfUtilities');

// const POS_AUTO_BOT = {
//     LEFT: cc.v2(-565, -226),
//     RIGHT: cc.v2(565, -226),
// };
cc.Class({
    extends: cc.Component,

    properties: {
        fxBtnBelow: cc.Node,
        fxBtnAbove: cc.Node,
        autoBotTitle: cc.Sprite,
        boardCountdown: cc.Sprite,
        textCountdown: cc.Label,
        _duration: 0,
    },

    onLoad() {
        this._duration = 0;
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.AUTO_BOT.START_BOT, this.startBot, this);
        registerEvent(EventCode.AUTO_BOT.STOP_BOT, this.stopBot, this);
        registerEvent(EventCode.GAME_LAYER.ON_AFTER_INIT_PLAYER_LIST, this.updateBtnAutoBotPosition, this);

        registerEvent(EventCode.AUTO_BOT.CHANGE_TARGET, this.changeTargetAutoBot, this);
        registerEvent(EventCode.FISH_LAYER.BOSS_ON_GAME, this.changeTargetAutoBot, this);
        registerEvent(EventCode.GAME_LAYER.RECEIVE_LASER_GUN, this.onPlayerChangeGunLaser, this);
        registerEvent(EventCode.AUTO_BOT.TOGGLE_BUTTON, this.toggleButton, this);

        this.node.active = false;
        this.autoBotTitle.node.active = false;
    },

    reset() {
        this.autoBotTitle.node.active = true;
        this.boardCountdown.node.active = false;
        this.textCountdown.node.active = false;
    },

    _updatePositionX(position) {
        this.node.setPosition(position);
        this.autoBotTitle.node.x = position.x;
        this.boardCountdown.node.x = position.x;
        this.textCountdown.node.x = position.x;
    },

    _onAutoBot(timeValue) {
        this.autoBotTitle.node.active = false;
        this.boardCountdown.node.active = true;
        this.textCountdown.node.active = true;
        this.textCountdown.string = timeValue;
    },

    onAutoBot() {
        if (DataStore.instance.getSelfInfo().skillLock === true || DataStore.instance.isAutoPaused()) {
            return;
        }
        const selfInfo = DataStore.instance.getSelfInfo();
        if (!selfInfo.LockFish || selfInfo.LockFish.checkDie() || selfInfo.LockFish.checkOutScene()) {
            const fish = FishManager.instance.findFishForAutoBot();
            DataStore.instance.setSelfInfo({
                LockFish: fish,
            });
        }
        if (selfInfo.LockFish && selfInfo.LockFish.isAvailable()) {
            Emitter.instance.emit(EventCode.GAME_LAYER.ON_SEND_FIRE, {
                point: selfInfo.LockFish.node.position,
                lockFishID: selfInfo.LockFish._FishID,
            });
        } else {
            Emitter.instance.emit(EventCode.PLAYER_LAYER.STOP_LOCK_FISH);
        }
    },

    startBot() {
        DataStore.instance.setSelfInfo({
            autoState: GameConfig.instance.BotState.STARTED,
        });
        DataStore.instance.setDataStore({
            targetState: GameConfig.instance.TARGET_LOCK.AUTO_BOT,
            currentTargetState: GameConfig.instance.TARGET_LOCK.AUTO_BOT,
        });
        if (this.fxBtnBelow) {
            this.fxBtnBelow.active = true;
            this.fxBtnBelow.x = this.node.x;
        }
        if (this.fxBtnAbove) {
            this.fxBtnAbove.active = true;
            this.fxBtnAbove.stopAllActions();
            this.fxBtnAbove.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
            this.fxBtnAbove.x = this.node.x;
        }

        if (DataStore.instance.getBotSetting().botStarted === 0) {
            DataStore.instance.setBotSetting({
                botStarted: Date.now(),
            });
        }
        if (DataStore.instance.getBotSetting().duration < GameConfig.instance.AUTO_BOT.MAX_TIME) {
            this._duration = DataStore.instance.getBotSetting().duration * 60;
            this._getTimeRemain();
            const currentTime = convertSecondToTime(DataStore.instance.getBotSetting().autoCountdown);
            this._onAutoBot(currentTime);
            this.schedule(this._countdown, 0.5);
        } else {
            const currentTime = GameConfig.instance.AUTO_BOT.DATA_TIMER[GameConfig.instance.AUTO_BOT.DATA_TIMER.length - 1];
            this._onAutoBot(currentTime);
            this.textCountdown.string = GameConfig.instance.AUTO_BOT.SPECIAL_ITEM;
        }

        this.schedule(this.onAutoBot, DataStore.instance.FireSpeed.TURBO);
    },

    stopBot() {
        if(DataStore.instance) {
            this._resetDataStore();
        }
        if (this.fxBtnBelow) {
            this.fxBtnBelow.active = false;
        }
        if (this.fxBtnAbove) {
            this.fxBtnAbove.active = false;
            this.fxBtnAbove.stopAllActions();
        }
        this.reset();
        this.unschedule(this._countdown);
        this.unschedule(this.onAutoBot);
        Emitter.instance.emit(EventCode.PLAYER_LAYER.STOP_LOCK_FISH);
    },

    changeTargetAutoBot() {
        if (!DataStore.instance.isAutoBot()) {
            return;
        }
        const selfInfo = DataStore.instance.getSelfInfo();
        if (selfInfo.LockFish && !selfInfo.LockFish.checkDie() && !selfInfo.LockFish.checkOutScene()) {
            const specialFish = FishManager.instance.getSpecialFishForAutoBot();
            if (specialFish && !specialFish.checkDie() && !specialFish.checkOutScene() && specialFish.getKind() !== selfInfo.LockFish.getKind()) {
                DataStore.instance.setSelfInfo({
                    LockFish: null,
                    LockFishKind: -1,
                });
                this.onAutoBot();
            } else {
                const arrayFish = DataStore.instance.getBotSetting().fishKindArr;
                if (arrayFish.indexOf(selfInfo.LockFish.getKind()) < 0) {
                    DataStore.instance.setSelfInfo({
                        LockFish: null,
                        LockFishKind: -1,
                    });
                    this.onAutoBot();
                }
            }
        }
    },

    _resetDataStore() {
        DataStore.instance.setSelfInfo({
            autoState: GameConfig.instance.BotState.STOPPED,
            LockFish: null,
            LockFishKind: -1,
        });
        DataStore.instance.setDataStore({
            targetState: GameConfig.instance.TARGET_LOCK.NONE,
            currentTargetState: GameConfig.instance.TARGET_LOCK.NONE,
        });
        DataStore.instance.setBotSetting({
            botStarted: 0,
            fishKindArr:[]
        });
    },

    _getTimeRemain() {
        const time = Date.now();
        const timePassed = Math.floor((time - DataStore.instance.getBotSetting().botStarted) / 1000);
        DataStore.instance.setBotSetting({
            autoCountdown: this._duration - timePassed,
        });
        if (timePassed > this._duration) {
            this.stopBot();
            Emitter.instance.emit(EventCode.AUTO_BOT.END_AUTO_BOT);
            Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_AUTOBOT);
            // PopupController.instance.showAutoBot();
        }
    },

    _countdown() {
        this._getTimeRemain();
        const currentTime = convertSecondToTime(DataStore.instance.getBotSetting().autoCountdown);
        this.textCountdown.string = currentTime;
    },

    updateBtnAutoBotPosition() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        if(!player) {
            cc.warn('cannot find self info');
            return;
        }
        const pos = player.index === 0 ? GameConfig.instance.POS_AUTO_BOT.LEFT : GameConfig.instance.POS_AUTO_BOT.RIGHT;
        this._updatePositionX(pos);
        this.node.active = true;
        this.autoBotTitle.node.active = !DataStore.instance.isAutoBot();
    },
    toggleButton(isOn) {
        this.node.getComponent(cc.Button).interactable = isOn;
    },

    onPlayerChangeGunLaser(DeskStation) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DeskStation);
        if (player.isMe) {
            this.toggleButton(false);
        }
    },

    resetOnExit() {
        this.unscheduleAllCallbacks();
        this.stopBot();
        this.node.active = false;
        this.autoBotTitle.node.active = false;
    },

    onDestroy() {
        this.unscheduleAllCallbacks();
        removeEvents(this);
    },

});
