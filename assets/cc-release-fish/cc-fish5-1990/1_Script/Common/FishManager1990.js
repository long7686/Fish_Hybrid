const EventCode = require("EventsCode1990");
const { registerEvent } = require('gfUtilities');
const Emitter = require('gfEventEmitter');
const FishManager = require('gfFishManager');
const GameConfig = require('Config1990');
const BaseConfig = require('gfBaseConfig');
const ReferenceManager = require('gfReferenceManager');
const FishManager1990 = cc.Class({
    extends: FishManager,
    ctor() {
        FishManager.instance = this;
        registerEvent(EventCode.GAME_LAYER.UPDATE_GHOST_SHIP_STATE, this.updateGhostShipState, this);
        registerEvent(EventCode.GODZILLA.ON_HIT_GODZILLA, this.onHitGodzilla, this);
        registerEvent(EventCode.GAME_LAYER.CATCH_FISH_BY_PLASMA, this.onPlasmaSkill, this);
        registerEvent(EventCode.GAME_LAYER.CATCH_FISH_BY_LIGHTING, this.catchFishByLightingChain, this);
    },


    isBossKind(fishKind) {
        return fishKind == GameConfig.instance.FISH_KIND.MINIBOSS ||
                fishKind === GameConfig.instance.FISH_KIND.DRAGON ||
                fishKind === GameConfig.instance.FISH_KIND.GHOST_SHIP;
    },

    isSpecialFish(fishKind){
        return GameConfig.instance.LIST_SPECIAL_FISH_KIND.includes(fishKind);
    },

    updateGhostShipState(data) {
        const fish = this.getFishById(data.FishID);
        if (fish) {
            const detailData = {
                level : data.GhostShipState,
                speedUpBuildtick : data.GhostShipSpeedUpBuildtick,
            };
            fish.updateGhostShipStatus(detailData);
        }
       
    },
    onHitGodzilla(data){
        if(!this.currentDragon) return;
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if(player.isMe){
            player.addGoldReward(data.WinAmount);
        }else{
            Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_WALLET_OTHER_USER, data);
        }

        this.currentDragon.onHitState(data);
    },
    onPlasmaSkill(data){
        const listFish = data.ListFish;
        let fish = null;
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        for (let i = 0; i < listFish.length; i++) {
            const fishInfo = listFish[i];
            if (fishInfo.FishID === 0) continue;
            const infoDetail = {
                DeskStation: data.DeskStation,
                FishID: fishInfo.FishID,
                GoldReward: fishInfo.GoldReward,
                BulletMultiple: data.BulletMultiple,
                isSkill: true,
            };
            fish  = this.getFishById(infoDetail.FishID);

            if (fish) {
                fish.onCatch(infoDetail);
            }else if(player.isMe){
                Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT,
                    { data: infoDetail,
                        fishKind: infoDetail.fishKind});
            }
        }
    },

    catchFishSkill(data) {
        const {ListFish} = data;
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (data.SkillID && data.SkillID !== BaseConfig.instance.SkillConfig.LASER) {
            this._super(data);
        } else {
            let fish = null;
            for (let i = 0; i < ListFish.length; i++) {
                fish = this.getFishById(ListFish[i].FishID);
                fish && fish.setDie(true);
            }
            if (player.isMe) {
                player.addGoldReward(data.TotalReward);
            }
            Emitter.instance.emit(EventCode.LIGHTING_CHAIN.START_EFFECT, data);
        }
    },

    catchFishByLightingChain(data) {
        const listFish = data.ListFish;
        let fish = null;
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        for (let i = 0; i < listFish.length; i++) {
            const fishInfo = listFish[i];
            if (fishInfo.FishID === 0) continue;
            const infoDetail = {
                DeskStation: data.DeskStation,
                FishID: fishInfo.FishID,
                GoldReward: fishInfo.GoldReward,
                BulletMultiple: data.BulletMultiple,
                isSkill: true,
            };
            fish  = this.getFishById(infoDetail.FishID);

            if (fish) {
                fish.onCatch(infoDetail);
            }else if(player.isMe){
                Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, {
                    data: infoDetail,
                    fishKind: infoDetail.fishKind
                });
            }
        }

    },

    catchFish(data) {
        this._super(data);
        // Note Process for Ghost Ship
        const playerKill = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        let playerShareReward = null;
        if (data.ListUser) {
            for (let i = 0; i < data.ListUser.length; i++) {
                playerShareReward = ReferenceManager.instance.getPlayerByDeskStation(data.ListUser[i].DeskStation);
                if (playerShareReward && playerKill && !playerKill.isMe && playerShareReward.isMe) {
                    playerShareReward.addGoldReward(data.ListUser[i].GoldReward);
                }
            }
        }

    },

});

FishManager1990.instance = null;
module.exports = FishManager1990;