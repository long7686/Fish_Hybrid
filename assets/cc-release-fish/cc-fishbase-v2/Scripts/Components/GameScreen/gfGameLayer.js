const Emitter = require('gfEventEmitter');
const EventCode = require('gfBaseEvents');
const DataStore = require("gfDataStore");
const { getRotation, registerEvent, removeEvents } = require('gfUtilities');
const { getPostionInOtherNode } = require("utils");
const FishManager = require('gfFishManager');
const GameConfig = require('gfBaseConfig');
const ReferenceManager = require('gfReferenceManager');
const MainFSM = require('gfMainFSM');
const GameScheduler = require('gfGameScheduler');

cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad() {
        ReferenceManager.instance.setData({ CurrentScene: this.node });
        ReferenceManager.instance.setData({ GameLayer: this.node });
        DataStore.instance.setDataStore({ currentSceneName: GameConfig.instance.SceneName.Game});

        Emitter.instance.emit(EventCode.COMMON.ON_SHOW_GAME_LAYER, false);

        this.initEvents();
    },

    start() {
        if(!MainFSM.instance.isStateExit()) {
            Emitter.instance.emit(EventCode.COMMON.ON_SHOW_GAME_LAYER, true);
            DataStore.instance.setDataStore({timeHide: null});
            Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME, true);
            Emitter.instance.emit(EventCode.SOUND.EVENT_JOIN_GAME);
            GameScheduler.initInstance();
        }
        // PopupController.instance.checkShowPopupEvent();
    },

    initEvents() {
        registerEvent(EventCode.GAME_LAYER.ON_SEND_FIRE, this.sendDataPlayerFire, this);
        registerEvent(EventCode.GAME_LAYER.ON_OTHER_PLAYER_FIRE, this.onOtherPlayerFire, this);
        registerEvent(EventCode.GAME_LAYER.CATCH_FISH_BY_SKILL, this.catchFishBySkill, this);
        registerEvent(EventCode.COMMON.SHAKE_SCREEN, this.shakeScreen, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_JACKPOT_INFO, this.updateJackpotInfo, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.resetOnExit, this);
    },

    onOtherPlayerFire(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (player && player.index > 1) data.Angle += 180;
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_PLAYER_FIRE, data);
    },

    _updateAngle(angle) {
        if (angle < 0 && angle > -90) {
            return 0;
        } if (angle < -90 && angle > -180) {
            return -180;
        }
        return angle;
    },

    sendDataPlayerFire(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfDeskStation());
        if (player && player.checkUpdateGunByWallet()) {
            const outData = this.calculateDataPlayerFire(data);
            if (!DataStore.instance.isReachMaxNumBullet()) {
                Emitter.instance.emit(EventCode.GAME_LAYER.SEND_GUN_FIRE, outData);
            }
            Emitter.instance.emit(EventCode.GAME_LAYER.ON_PLAYER_FIRE, outData);
        }
    },
    
    calculateDataPlayerFire(data){
        const { point, lockFishID } = data;
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfDeskStation());
        const fish = FishManager.instance.getFishById(lockFishID);
        const startPos = getPostionInOtherNode(this.node, player.gun);
        let angle = 0;
        if (fish) {
            const endPos = fish.getLockPositionByNodeSpace(this.node);
            angle = getRotation(endPos, startPos);
        } else {
            angle = getRotation(point, player.gun.convertToWorldSpaceAR(cc.v2(0, 0)));
        }
        angle = this._updateAngle(angle);
        const outData = {
            BulletMultiple: player._gunValue,
            BulletID: Date.now(),
            FireType: DataStore.instance.getTargetState(),
            Angle: angle,
            DeskStation: DataStore.instance.getSelfDeskStation(),
            isMe: true,
            LockedFishID: lockFishID,
        };
        return outData;
    },

    catchFishBySkill(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (player) {
            switch (data.SkillID) {
                case GameConfig.instance.SkillConfig.LASER:
                    if (player.index > 1) data.Angle += 180;
                    player.onPlayerFireLaser(data);
                    break;
                case GameConfig.instance.SkillConfig.FISH_BOMB:
                    Emitter.instance.emit(EventCode.FISH_LAYER.CATCH_FISH_BY_SKILL, data);
                    break;
                default:
                    break;
            }
        }
    },

    shakeScreen({ timeOneStep, amplitude, countStep = 4, shakeStyle = GameConfig.instance.SHAKE_SCREEN_STYLE.VERTICAL }) {
        this.node.setPosition(cc.v2(0, 0));
        this.node.stopAllActions();
        let arrMoveAction = [];
        for (let i = 0; i < countStep; i++) {
            const arrAnim = this.setupAnimShake(timeOneStep, amplitude, shakeStyle);
            arrMoveAction = arrMoveAction.concat(arrAnim);
        }
        arrMoveAction.push(cc.moveTo(timeOneStep, cc.v2(0, 0)));
        this.node.runAction(cc.sequence(arrMoveAction));
    },

    setupAnimShake(timeOneStep, amplitude, shakeStyle){
        const { SHAKE_SCREEN_STYLE } = GameConfig.instance;
        const arrAnim = [];
        switch(shakeStyle){
            case SHAKE_SCREEN_STYLE.VERTICAL:
                arrAnim.push(cc.moveTo(timeOneStep, cc.v2(0, amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep, cc.v2(0, -amplitude)));
                break;
            case SHAKE_SCREEN_STYLE.HORIZONTAL:
                arrAnim.push(cc.moveTo(timeOneStep, cc.v2(amplitude, 0)));
                arrAnim.push(cc.moveTo(timeOneStep, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep, cc.v2(-amplitude, 0)));
                break; 
            case SHAKE_SCREEN_STYLE.CROSS_1:
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(amplitude, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(-amplitude, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, -amplitude)));
                break;
            case SHAKE_SCREEN_STYLE.CROSS_2:
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(amplitude, amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(-amplitude, -amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(-amplitude, amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 2, cc.v2(amplitude, -amplitude)));
                break;
            case SHAKE_SCREEN_STYLE.FULL:
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(amplitude, amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(-amplitude, -amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(-amplitude, amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(amplitude, -amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(amplitude, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(-amplitude, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, amplitude)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, 0)));
                arrAnim.push(cc.moveTo(timeOneStep / 4, cc.v2(0, -amplitude)));
                break;
        }
        return arrAnim;
    },

    updateJackpotInfo(){
        if (DataStore.instance.getCurrentRoom() === GameConfig.instance.RoomKind.VIP) {
            Emitter.instance.emit(EventCode.GAME_LAYER.SHOW_JACKPOT_INFO, { isShow: true, amount: DataStore.instance.getJackpotValue() });
        } else {
            Emitter.instance.emit(EventCode.GAME_LAYER.SHOW_JACKPOT_INFO, { isShow: false });
        }
    },

    resetOnExit(){
        this.node.stopAllActions();
        this.node.setPosition(cc.v2(0, 0));
    },

    onDestroy() {
        GameScheduler.destroy();
        if(!MainFSM.instance.isStateLoginLobby() && Emitter.instance){
            Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
        }
        removeEvents(this);
    },

});
