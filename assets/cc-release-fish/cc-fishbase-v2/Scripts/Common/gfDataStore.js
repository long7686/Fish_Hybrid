

const { isEmpty } = require('gfUtilities');
const GameConfig = require('gfBaseConfig');

const gfDataStore = cc.Class({
    ctor() {
        this.selfInfo = {
            UserID: "",
            Wallet: 0,
            Username: "TestUser",
            Avatar: "Avatar0",
            DeskStation: null,
            LockFish: null,
            LockFishKind: -1,
            isLockGun: false,
            skillLock: false,
            autoState : 0,
            listItem: {},
            DeskId: '',
            TargetTime: null,
            isPriorityTargetBoss:false,
            isReadyToPlay: false, // Turn on when receiving 2002
            EventInfo: null,
        };
        this.lobbyWallet = require('gfWallet');
        this.listJackpotBet = "50-60-70-80-90-a0-b0";
        this.GunValue = [];
        this.targetState = 0;
        this.oldTarget = {
            targetState: null,
            LockFishKind: null,
            LockFishID : null,
        };
        this.timeHide = null;
        this.currentTargetState = 0;
        this.jackpotValue = 0;
        this.currentRoom = null;
        this.currentSceneName = null;
        this.IPGame = "";
        this.token4Game = "";
        this.token4Master = "";
        this.deltaTime = 0;
        this.ActionLastTime = 0;
        this.mousePos = null;
        this.listCatchLaser = [];
        this.isEnableBGM = false;
        this.isEnableSFX = false;
        this.currSound = 0;
        this.currMusic = 0;
        this.reachMaxNumBullet = false;
        this.ChangeTarget = 5;
        this.botSetting = {
            fishKindArr: [],
            bulletValue: 0,
            duration: 0,
            botStarted : 0,
            autoCountdown : 0    
        };

   

        this.FireSpeed = {
            NORMAL: 0.25,
            TURBO: 0.15
        };
    },

    getEventInfo(){
        return this.selfInfo.EventInfo;
    },

    clearEventInfo(){
        this.selfInfo.EventInfo = null;
    },

    setSelfInfo(data) {
        if (!isEmpty(data)) {
            Object.keys(data).forEach(key => {
                this.selfInfo[key] = data[key];
            });
        }
    },
    setLobbyWallet(wallet){
        this.lobbyWallet = wallet;
    },
    getLobbyWallet(){
        return this.lobbyWallet;
    },

    getIsReadyToPlay(){
        return this.selfInfo.isReadyToPlay;
    },

    getSelfInfo() {
        return this.selfInfo;
    },
    getJackpotValue() {
        return this.jackpotValue;
    },
    setDataStore(dataStore) {
        if (!isEmpty(dataStore)) {
            Object.keys(dataStore).forEach(key => {
                this[key] = dataStore[key];
            });
        }
    },
    parseLoginGame(data) {
        if (!isEmpty(data)) {
            Object.keys(data).forEach(key => {
                this.selfInfo[key] = data[key];
            });
            if (data.BetConfig) {
                this.parseBetConfig(data.BetConfig);
            }
            if (data.KindID) {
                this.currentRoom = data.KindID;
            }
            if (data.itemInfo) {
                this.parseListItemConfig(data.itemInfo.listItem);
            }
            if( data.FireSpeed) {
                this.FireSpeed.NORMAL = data.FireSpeed[1];
                this.FireSpeed.TURBO = data.FireSpeed[0];
            }
            if(data.TargetTime) {
                this.ChangeTarget = data.TargetTime;
            }
        }
    },

    getCurrentSceneName() {
        return this.currentSceneName;
    },

    getCurrentRoom() {
        return this.currentRoom;
    },

    //ID = 1 : ice
    parseListItemConfig(lstItem) {
        for (let i = 0; i < lstItem.length; i++) {
            this.selfInfo.listItem[lstItem[i].ID] = lstItem[i].amount;
        }
    },
    parseBetConfig(data) {
        for (let i = 0; i < data.length; ++i) {
            this.GunValue[i] = data[i];
        }
    },

    clearSelfInfo() {
        this.selfInfo.DeskId = '';
    },

    getSelfDeskStation() {
        return this.selfInfo.DeskStation;
    },

    getBulletIndex(bulletMultiple) {
        for (let i = 0; i < this.GunValue.length; ++i) {
            if (bulletMultiple == this.GunValue[i])
                return i;
        }
        return 0;
    },

    getGunValue() {
        return this.GunValue;
    },

    getTotalGun(){
        return this.GunValue.length;
    },

    checkWallet() {
        return (this.selfInfo.Wallet > 0);
    },

    getWallet() {
        return this.selfInfo.Wallet;
    },

    getTargetState() {
        return this.targetState;
    },

    getCurrentTargetStage () {
        return this.currentTargetState;
    },

    getMousePos() {
        return this.mousePos;
    },
    getListCatchLaser() {
        return this.listCatchLaser;
    },

    getIsEnableSFX() {
        return this.isEnableSFX;
    },

    getIsEnableBGM() {
        return this.isEnableBGM;
    },

    updateDeltaTime(serverTime){
        if(serverTime) {
            this.deltaTime = Date.now() - serverTime;
        } else {
            //cc.warn('No servertime data');
            this.deltaTime = 0;
        }
    },

    getTime() {
        return Date.now() - this.deltaTime;
    },
    getDeltaTime(){
        return this.deltaTime;
    },
    
    setBotSetting(data) {
        if (!isEmpty(data)) {
            Object.keys(data).forEach(key => {
                this.botSetting[key] = data[key];
            });
        }
    },
    getBotSetting() {
        return this.botSetting;
    },

    getTimeHide(){
        return this.timeHide;
    },

    isAutoBot() {
        return this.selfInfo.autoState === GameConfig.instance.BotState.STARTED;
    },

    isAutoPaused() {
        return this.targetState === GameConfig.instance.TARGET_LOCK.PAUSE;
    },

    isReachMaxNumBullet() {
        return this.reachMaxNumBullet;
    },

    saveCurrentTarget() {
        if (this.targetState === GameConfig.instance.TARGET_LOCK.NONE) return;
        this.oldTarget.targetState = this.targetState;
        this.oldTarget.LockFishKind = this.selfInfo.LockFishKind;
        if (this.selfInfo.LockFish) {
            this.oldTarget.LockFishID = this.selfInfo.LockFish._FishID;
        }
    },
    clearOldTarget() {
        this.oldTarget = {
            targetState: null,
            LockFishKind: null,
            LockFishID: null
        };
    },
    getOldTarget() {
        return this.oldTarget;
    },

    destroy() {
        gfDataStore.instance = null;
    }
});

gfDataStore.instance = null;
module.exports = gfDataStore;
