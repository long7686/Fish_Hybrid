const PoolManager = require("gfPoolManager");
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const GameConfig = require("gfBaseConfig");
const DataStore = require("gfDataStore");
const { randomBetween, registerEvent, removeEvents } = require('gfUtilities');
const NodePoolConfig = require("gfNodePoolConfig");
const ReferenceManager = require('gfReferenceManager');

// eslint-disable-next-line no-unused-vars
const ENABLE_LOG_DUPLICATE_LASER_CRAB = true;

const gfFishManager = cc.Class({
    ctor() {
        this.currentDragon = null;
        this.listFish = [];
        this.LockFishId = null;
        this.initEvent();
    },

    initEvent() {
        registerEvent(EventCode.GAME_LAYER.CREATE_FISH, this.createListFish, this);
        registerEvent(EventCode.GAME_LAYER.CATCH_FISH, this.catchFish, this);
        registerEvent(EventCode.FISH_LAYER.CATCH_FISH_BY_SKILL, this.catchFishSkill, this);
        registerEvent(EventCode.GAME_LAYER.FREEZE_FISH, this.freezeFish, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_ROOM_DATA, this.updateRoomData, this);
        registerEvent(EventCode.GAME_LAYER.REMOVE_FISH, this.removeFish, this);
        registerEvent(EventCode.GAME_LAYER.CREATE_FISH_GROUP, this.moveOutAllFishes, this);
        registerEvent(EventCode.GAME_LAYER.MOVE_OUT_ALL_FISHES, this.moveOutAllFishes, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.removeAll, this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.removeAll, this);
        registerEvent(EventCode.DRAGON.ON_END, this.endDragon, this);
        registerEvent(EventCode.DRAGON.ON_BALL_DROPPED, this.dragonDropBall, this);
    },

    createListFish(data) {
        for (let i = 0; i < data.length; ++i) {
            data[i].isResume = data.isResume;
            this.createFishWithData(data[i]);
        }
    },

    catchFishSkill(data) {
        const listFish = data.ListFish;
        for (let i = 0; i < listFish.length; i++) {
            const fish = listFish[i];
            const infoDetail = {
                DeskStation: data.DeskStation,
                FishID: fish.FishID,
                GoldReward: fish.GoldReward,
                BulletMultiple: data.BulletMultiple,
                itemInfo: fish.itemInfo,
                isSkill: true,
                skillID: data.SkillID,
            };
            this.catchFish(infoDetail);
        }
    },

    catchFish(data) {
        if (data.FishID === 0) return;
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (player && player.isMe) {
            player.addGoldReward(data.GoldReward);
        }
        const fish = this.getFishById(data.FishID);
        if (fish) {
            fish.onCatch(data);
        } else if (player && player.isMe) {
            if (data.itemInfo) {
                Emitter.instance.emit(EventCode.GAME_LAYER.FREEZE_EFFECT_ITEM, { DeskStation: data.DeskStation });
            }
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, { data });
        }
    },

    freezeFish(data) {
        if (data.FishKind === GameConfig.instance.FISH_KIND.MINIBOSS) return;
        const fish = this.getFishById(data.fishId);
        if (fish) {
            fish.onFreezed();
        }
    },

    updateRoomData(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.RESUME_FISH_GROUP, data);
        if (data.ListFish) {
            Emitter.instance.emit(EventCode.SOUND.RESUME_SOUND_BACKGROUND, { listFishNormal: data.ListFish, listFishGroup: data.ListParadeFish });
            data.ListFish.isResume = true;
            
            this.createListFish(data.ListFish);
        }
        if (this.LockFishId != null) {
            this.resumeLockFish(this.LockFishId);
        }
        if (DataStore.instance.isAutoPaused()) {
            Emitter.instance.emit(EventCode.GAME_LAYER.RESUME_AUTO_FIRE);
        }
    },

    resumeLockFish(fishId) {
        const lockFish = this.getFishById(fishId);
        const lockFishID = lockFish ? lockFish.getId() : null;
        DataStore.instance.setSelfInfo({ LockFish: lockFish, LockFishID: lockFishID });
    },

    getListFish() {
        return this.listFish;
    },

    getFishById(id) {
        if(id == null) return null;
        for (let i = 0; i < this.listFish.length; ++i) {
            if (this.listFish[i]._FishID === id) {
                return this.listFish[i];
            }
        }
        return null;
    },

    moveOutAllFishes() {
        for (let i = this.listFish.length - 1; i >= 0; --i) {
            this.listFish[i].moveOut();
        }
    },

    getFishByType(type, ignoreFishID = null) {
        const listFish = [];
        for (let i = 0; i < this.listFish.length; ++i) {
            const fish = this.listFish[i];
            if (fish.getKind() === type && fish.isAvailable() && fish.getId() !== ignoreFishID) {
                listFish.push(this.listFish[i]);
            }
        }
        if (listFish.length > 0) {
            return listFish[randomBetween(0, listFish.length - 1)];
        }
        return null;
    },

    isBossKind(fishKind) {
        return fishKind == GameConfig.instance.FISH_KIND.MINIBOSS || fishKind === GameConfig.instance.FISH_KIND.DRAGON;
    },

    isSpecialFish(fishKind) {
        return GameConfig.instance.LIST_SPECIAL_FISH_KIND.includes(fishKind);
    },

    getMinimumFishKind(ignoreKind) {
        let minFishKind = 9999;
        for (let i = 0; i < this.listFish.length; ++i) {
            const fish = this.listFish[i];
            if (fish.isAvailable()
                && fish.checkMultiplier() === 1
                && !this.isSpecialFish(fish.getKind())
                && fish.getKind() !== ignoreKind
                && fish.getKind() < minFishKind) {
                minFishKind = fish.getKind();
            }
        }
        return minFishKind;
    },

    getFishForTargetAll() {
        const selfInfo = DataStore.instance.getSelfInfo();
        if (selfInfo.isPriorityTargetBoss) {
            for (let i = 0; i < this.listFish.length; ++i) {
                const fish = this.listFish[i];
                if (fish.isAvailable() && this.isBossKind(fish.getKind())) {
                    selfInfo.LockFishKind = fish.getKind();
                    return fish;
                }
            }
        }

        if (selfInfo.LockFishKind > -1) {
            const oldFishId = selfInfo.LockFish ? selfInfo.LockFish.getId() : null;
            const fish = this.getFishByType(selfInfo.LockFishKind, oldFishId);
            if (fish) {
                return fish;
            }
        }

        selfInfo.LockFishKind = this.getMinimumFishKind(selfInfo.LockFishKind);
        return this.getFishByType(selfInfo.LockFishKind);
    },

    getFishByPoint(point) {
        let fishResult = null;
        const selfInfo = DataStore.instance.getSelfInfo();
        for (let i = 0; i < this.listFish.length; ++i) {
            const fish = this.listFish[i];
            if (fish && fish.isAvailable() && ((!selfInfo.LockFish) || (selfInfo.LockFish && selfInfo.LockFish.getId() !== fish.getId()))) {
                const boxList = fish.getComponents(cc.BoxCollider);
                if (boxList) {
                    for (let j = 0; j < boxList.length; ++j) {
                        if (boxList[j].world && cc.Intersection.pointInPolygon(point, boxList[j].world.points)) {
                            if ((!fishResult) || (fishResult && fish.getZIndex() > fishResult.getZIndex())) {
                                fishResult = fish;
                            }
                        }
                    }
                }
            }
        }
        return fishResult;
    },

    createFishWithData(data) {
        let fish = null;
        const prefabFish = ReferenceManager.instance.getPrefabFishByKind(parseInt(data.FishKind));
        if (data.FishKind === GameConfig.instance.FISH_KIND.DRAGON) {
            fish = this.createDragon(data);
            if(!data.isResume){
                Emitter.instance.emit(EventCode.COMMON.FISH_LOG, GameConfig.instance.FISH_LOG_CONFIG.DRAGON);
            }
        } else if (prefabFish) { // Create by prefab
            fish = cc.instantiate(prefabFish);
            fish.setParent(ReferenceManager.instance.getNodeFishLayer());
            fish = fish.getComponent("gfBaseFish");
            fish.initFishData(data);
        } else { // Create by pool
            fish = PoolManager.instance.getFishWithData(data);
        }

        if (fish) {
            this.listFish.push(fish);
            return fish;
        }
        return null;
    },

    createDragon(data) {
        this.currentDragon = PoolManager.instance.getDragonWithData(data);
        Emitter.instance.emit(EventCode.DRAGON.CREATE);
        return this.currentDragon;
    },

    /*
    ****** findFishForAutoBot ******
    ** Độ ưu tiên cá được sắp xếp theo thứ tự Rồng -> Miniboss -> cá may mắn -> cá thường
    ** Config giữa độ ưu tiên của rồng và miniboss được lưu ở GameConfig.instance.PRIORITY_FISH
    */
    findFishForAutoBot() {
        if (DataStore.instance.getSelfInfo().LockFish || DataStore.instance.getSelfInfo().isLockGun) {
            return null;
        }
        let fish = null;
        /** *** kiểm tra xem boss có trên màn hình và cắm máy có đang bật nó không để ưu tiên target boss **** */
        fish = this.getSpecialFishForAutoBot();
        if (!fish) {
            fish = this.getLuckyFishInScreen();
        }
        if (!fish) {
            fish = this.getRandomFishForAutoBot();
        }
        return fish;
    },

    getSpecialFishForAutoBot() {
        let fish = null;
        for (let index = 0; index < GameConfig.instance.PRIORITY_FISH.length; index++) {
            const fishKind = GameConfig.instance.PRIORITY_FISH[index.toString()];
            if (DataStore.instance.getBotSetting().fishKindArr.indexOf(fishKind) >= 0) {
                fish = this.getFishByType(fishKind);
                if (fish) return fish;
            }
        }
        return null;
    },

    getRandomFishForAutoBot() {
        const arrayFish = DataStore.instance.getBotSetting().fishKindArr;
        let fish; let
            currFish = null;
        this.listFish = this.listFish.sort(() => Math.random() - 0.5);
        for (let i = 0; i < this.listFish.length; i++) {
            fish = this.listFish[i];
            if (fish.isAvailable() && arrayFish.indexOf(fish.getKind()) >= 0) {
                currFish = fish;
                break;
            }
        }
        return currFish;
    },

    getLuckyFishInScreen() {
        const arrayFish = DataStore.instance.getBotSetting().fishKindArr;
        for (let i = 0; i < this.listFish.length; i++) {
            const fish = this.listFish[i];
            if (fish._multiplier > 1) {
                if (!fish.isAvailable() || arrayFish.indexOf(fish.getKind()) < 0) {
                    return null;
                }
                return fish;
            }
        }
        return null;
    },

    isDragonInGame() {
        return this.currentDragon != null;
    },

    endDragon(data) {
        if (!this.currentDragon) return;
        if (data.wonJackpot) {
            this.currentDragon.onCatch();
        } else {
            this.currentDragon.onDie();
        }
    },

    dragonDropBall(data) {
        if (!this.currentDragon) return;
        data.position = this.currentDragon.getBallDropPosition();
        Emitter.instance.emit(EventCode.DRAGON.DROP_BALL, data);
        Emitter.instance.emit(EventCode.SOUND.DRAGON_HIT_BALL);
    },

    removeFish(id) {
        for (let i = 0; i < this.listFish.length; ++i) {
            if (this.listFish[i]._FishID === id) {
                if (this.listFish[i].getKind() === GameConfig.instance.FISH_KIND.DRAGON) {
                    this.currentDragon = null;
                }
                this.listFish.splice(i, 1);
                return;
            }
        }
        cc.warn(`FISH NOT FOUND!!! ${id}`);
    },

    removeAll() {
        const { LockFishID } = DataStore.instance.getSelfInfo();
        this.LockFishId = LockFishID;
        for (let i = 0; i < this.listFish.length; ++i) {
            const fish = this.listFish[i];
            if (!NodePoolConfig.instance.checkFishPoolByKind(fish.getKind()) && cc.isValid(fish.node)) {
                fish.onDie(true);
            }
        }
        this.currentDragon = null;
        this.listFish.length = 0;
    },

    destroy() {
        removeEvents(this);
        this.removeAll();
        gfFishManager.instance = null;
    },
});

gfFishManager.instance = null;
module.exports = gfFishManager;
