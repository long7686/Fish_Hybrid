

const EventCode = require("gfBaseEvents");
const { convertAssetArrayToObject } = require('utils');
const ReferenceManager = require('gfReferenceManager');
const { registerEvent, removeEvents } = require("gfUtilities");
const DataStore = require('gfDataStore');
const Emitter = require('gfEventEmitter');

cc.Class({
    extends: cc.Component,

    properties: {
        listPlayer: {
            default: [],
            type: require('gfPlayer'),
        },
        listWaiting: {
            default: [],
            type: cc.Node,
        },
        listGunSprite: {
            default: [],
            type: cc.SpriteFrame,
        },
        avatarAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        effectIsMe: cc.Node,
        effectMaxGun: cc.Node,
    },

    onLoad() {
        this.node.getPlayerByDeskStation = this.getPlayerByDeskStation.bind(this);
        this.node.getPlayerByIndex = this.getPlayerByIndex.bind(this);

        this.initEvents();
        this.configAllPlayer();
        this.hideAllPlayer();
        ReferenceManager.instance.setData({ PlayerLayer: this.node });
    },

    initEvents() {
        registerEvent(EventCode.PLAYER_LAYER.UPDATE_LIST_PLAYER, this.updateListPlayer, this);
        registerEvent(EventCode.PLAYER_LAYER.PLAYER_JOIN_BOARD, this.playerJoinBoard, this);
        registerEvent(EventCode.PLAYER_LAYER.PLAYER_LEAVE_BOARD, this.playerLeaveBoard, this);
        registerEvent(EventCode.PLAYER_LAYER.GAME_UPDATE_WALLET, this.playerUpdateWallet, this);
        registerEvent(EventCode.PLAYER_LAYER.HIDE_IS_ME, this.hideIsMe, this);
        registerEvent(EventCode.GAME_LAYER.CATCH_FISH, this.playerCatchFish, this);
        registerEvent(EventCode.GAME_LAYER.CATCH_FISH_BY_SKILL, this.playerCatchFishBySkill, this);
        registerEvent(EventCode.GAME_LAYER.ON_PLAYER_FIRE, this.playerFire, this);
        registerEvent(EventCode.PLAYER_LAYER.FREEZE_EFFECT, this.activeFreezeEffect, this);
        registerEvent(EventCode.GAME_LAYER.ON_STOP_FREEZE_GUN, this.stopFreezeGun, this);
        registerEvent(EventCode.PLAYER_LAYER.CHANGE_GUN_LASER, this.playerChangeGunLaser, this);
        registerEvent(EventCode.DRAGON.WARNING, this.onDragonWarning, this);
        registerEvent(EventCode.DRAGON.DONE_ALL_BIGWIN, this.hideBallTray, this);
        registerEvent(EventCode.DRAGON.CREATE, this.onDragonCreated, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_ROOM_DATA, this.onUpdateRoomData, this);
        registerEvent(EventCode.GAME_LAYER.GAME_CHANGE_ROUND, this.onChangeRound, this);
        registerEvent(EventCode.DRAGON.DONE_BALL_DROP, this.onBallDropDone, this);
        registerEvent(EventCode.GAME_LAYER.RECEIVE_LASER_GUN, this.onReceiveLaser, this);
        registerEvent(EventCode.PLAYER_LAYER.SHOW_POPUP_NO_MONEY, this.playerShowPopupNoMoney, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.hideAllPlayer, this);
    },

    configAllPlayer(){
        for (let i = 0; i < this.listPlayer.length; i++) {
            this.listPlayer[i].gunSprite = convertAssetArrayToObject(this.listGunSprite);
            this.listPlayer[i].avatarAtlas = this.avatarAtlas;
            this.listPlayer[i].waitingText = this.listWaiting[i];
            this.listPlayer[i].index = i;
            this.listPlayer[i].effectIsMe = this.effectIsMe;
            this.listPlayer[i].effectMaxGun = this.effectMaxGun;
        }
    },
    
    onReceiveLaser(DeskStation){
        const player = this.getPlayerByDeskStation(DeskStation);
        if (player && player.isMe) {
            player.lockBet(true);
        }
    },

    playerShowPopupNoMoney(){
        const player = this.getPlayerByDeskStation( DataStore.instance.getSelfDeskStation());
        if (player) {
            player.showPopupNoMoney();
        }
    },

    updateListPlayer(data) {
        for (let i = 0; i < data.length; i++) {
            const userInfo = data[i];
            const player = this.getPlayerByDeskStation(userInfo.DeskStation);
            if (player) {
                player.resetUserId();
                player.initObj(userInfo);
            }
        }
        //Make sure init position after init all player
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_AFTER_INIT_PLAYER_LIST);
        Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_TUTORIAL);
    },

    playerJoinBoard(userInfo = null) {
        const player = this.getPlayerByDeskStation(userInfo.DeskStation);
        if (player) {
            player.initObj(userInfo);
            player.waitingText.active = false;
        }
    },

    playerLeaveBoard(data = null) {
        const player = this.getPlayerByDeskStation(data.DeskStation);
        if (player) {
            player.resetOnExit();
            player.waitingText.active = true;
            if(!player.isMe) {
                Emitter.instance.emit(EventCode.PLAYER_LAYER.REMOVE_BALL, data);
            }
        }
    },

    playerFire(data = null) {
        const player = this.getPlayerByDeskStation(data.DeskStation);
        if (player) {
            player.onUserFire(data);
        }
    },

    playerUpdateWallet(data) {
        const player = this.getPlayerByDeskStation(data.DeskStation);
        if (player) {
            player.updateWallet(data.Wallet);
        }
    },
    hideIsMe(){
        this.effectIsMe.active = false;
    },

    playerCatchFish(data) {
        const player = this.getPlayerByDeskStation(data.DeskStation);
        if (player && !player.isMe) {
            if(data.Wallet || data.Wallet === 0) {
                player.updateWallet(data.Wallet);
            }
        }
    },

    playerCatchFishBySkill(data) {
        const player = this.getPlayerByDeskStation(data.DeskStation);
        if (player && !player.isMe) {
            if(data.Wallet || data.Wallet === 0) {
                player.updateWallet(data.Wallet);
            }
        }
    },

    playerChangeGunLaser(DeskStation) {
        const player = this.getPlayerByDeskStation(DeskStation);
        if (player) {
            player.changeGunLaser(DeskStation);
        }
    },

    activeFreezeEffect(DeskStation) {
        const player = this.getPlayerByDeskStation(DeskStation);
        if (player) {
            player.activeFreezeEffect();
        }
    },

    stopFreezeGun(data) {
        const player = this.getPlayerByDeskStation(data.DeskStation);
        if (player) {
            player.stopFreezeGun();
        }
    },

    getPlayerByIndex(index) {
        return this.listPlayer[index];
    },

    getPlayerByDeskStation(deskStation) {
        if(!this.listPlayer) return null;
        let index = deskStation;
        if (DataStore.instance.getSelfDeskStation() >= 2) {
            index = [2, 3, 0, 1][deskStation];
        }
        return this.listPlayer[index];
    },

    onDragonWarning() {
        this.listPlayer.forEach((player) => {
            if (player.isActive()) {
                player.showBallTray();
            }
        });
    },

    onDragonCreated() {
        this.listPlayer.forEach((player) => {
            if (player.isActive()) {
                player.checkHaveBallTrayOnActived();
            }
        });
    },

    hideBallTray() {
        this.listPlayer.forEach((player) => {
            if (player.isActive()) {
                player.hideBallTray();
            }
        });
    },

    hideAllPlayer() {
        for (let i = 0; i < this.listPlayer.length; ++i) {
            this.listPlayer[i].resetOnExit && this.listPlayer[i].resetOnExit();
            this.listPlayer[i].waitingText.active = true;
        }
        this.effectIsMe.active = false;
    },

    onChangeRound(data) {
        if (data.SceneKind == 1) { // miniboss round
            this.listPlayer.forEach((player) => {
                if (player.isActive()) {
                    player.stopFreezeGun();
                }
            });
        }
    },

    onUpdateRoomData(data) {
        if (data.SceneKind == 1) { // miniboss round
            this.listPlayer.forEach((player) => {
                if (player.isActive()) {
                    player.stopFreezeGun();
                }
            });
        }
    },

    onBallDropDone(deskStation) {
        const player = this.getPlayerByDeskStation(deskStation);
        if (player) {
            player.onBallDropDone(deskStation);
        }
    },

  
    onDestroy() {
        removeEvents(this);
    },

});
