const EventCode = require("EventsCode1990");
const {registerEvent, removeEvents} = require("gfUtilities");
const BaseConfig = require('gfBaseConfig');
const FishManager = require('gfFishManager');
const ReferenceManager = require('gfReferenceManager');
const {getRotation} = require("gfUtilities");
const {getPostionInOtherNode} = require("utils");
const Emitter = require('gfEventEmitter');


cc.Class({
    extends: cc.Component,
    properties: {
        lightEffectPrefab: {
            default: null,
            type: cc.Prefab
        },
        listLighting: []
    },

    onLoad() {
        registerEvent(EventCode.LIGHTING_CHAIN.START_EFFECT, this.playEffectLighting, this);
        registerEvent(EventCode.LIGHTING_CHAIN.START_EFFECT_ONE_FOR_ALL, this.playEffectLightingOneForAll, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
    },

    playEffectLighting(rewardData) {
        const infoReward = rewardData;

        const {ListFish, TargetFish, DeskStation} = rewardData;

        const player = ReferenceManager.instance.getPlayerByDeskStation(DeskStation);

        const {fishTarget, isDie, listFishRight, listFishLeft} = this._processListFish(ListFish, TargetFish);

        if (fishTarget) {
            const endPos = fishTarget.getLockPositionByNodeSpace(this.node);
            const startPos = getPostionInOtherNode(this.node, player.gun);
            player.gun.angle = getRotation(endPos, startPos);
            const lighting = this._getLighting();
            lighting.setPosition(this.node.convertToNodeSpaceAR(player.gun.convertToWorldSpaceAR(cc.v2(0, 0))));
            lighting.playEffectLight(null, fishTarget, this._onCompleteFirstLighting.bind(this, fishTarget, listFishRight, listFishLeft, infoReward, fishTarget, ListFish.length), isDie);
        } else {
            this._sendEndEffect(infoReward);
        }

    },

    playEffectLightingOneForAll(data){
        const { infoTargetFrom, listBonusFish } = data;
        listBonusFish.forEach(info => {
            const fish = FishManager.instance.getFishById(info.FishID);
            const lighting = this._getLighting();
            lighting.setPosition(this.node.convertToNodeSpaceAR(infoTargetFrom.node.convertToWorldSpaceAR(cc.v2(0, 0))));
            lighting.playEffectLight(infoTargetFrom, fish, null, true, true);
        });
    },

    _getLighting() {
        const lighting = cc.instantiate(this.lightEffectPrefab);
        this.node.addChild(lighting);
        lighting.active = false;
        return lighting;
    },


    _processListFish(listFish, idTargetFish) {
        let listFishRight = [];
        let listFishLeft = [];
        let fishTarget = null;
        let fish = null;
        let isDie = true;


        for (let i = 0; i < listFish.length; i++) {
            fish = FishManager.instance.getFishById(listFish[i].FishID);
            if (fish !== null && fish !== undefined) {
                if (fish.getId() === idTargetFish) {
                    fishTarget = fish;
                } else {
                    if (fish.node.x > BaseConfig.instance.AppSize.Width / 2) {
                        listFishRight.push(fish);
                    } else {
                        listFishLeft.push(fish);
                    }
                }
            }

        }

        listFishRight.sort((function (a, b) {
            return a.node.x - b.node.x;
        }));
        listFishLeft.sort((function (a, b) {
            return b.node.x - a.node.x;
        }));

        if (fishTarget === null) {
            fishTarget = FishManager.instance.getFishById(idTargetFish);
            if (fishTarget) {
                isDie = false;
            } else {
                let fishTargetInfo;
                if (listFishRight.length > 0) {
                    fishTargetInfo = listFishRight.shift();
                } else {
                    fishTargetInfo = listFishLeft.shift();
                }
                if (fishTargetInfo) {
                    fishTarget = FishManager.instance.getFishById(fishTargetInfo.FishID);
                }

            }
        }
        return {fishTarget, isDie, listFishRight, listFishLeft};

    },

    _onCompleteFirstLighting(fishTarget, listFishRight, listFishLeft, infoReward) {
        const lightingLeft = this._getLighting();
        const lightingRight = this._getLighting();

        if (listFishRight.length === 0 && listFishLeft.length === 0) {
            this.scheduleOnce(this._sendEndEffect.bind(this, infoReward), 1);
            return;
        } else {
            let infoRewardEndLeft = null;
            let infoRewardEndRight = null;

            if (listFishRight.length > listFishLeft.length) {
                infoRewardEndRight = infoReward;
            } else if (listFishLeft.length > listFishRight.length) {
                infoRewardEndLeft = infoReward;
            } else {
                infoRewardEndRight = infoReward;
            }

            const fishInfoLeft = listFishLeft.shift();
            const fishInfoRight = listFishRight.shift();

            if (fishInfoLeft && lightingLeft.parent) {
                lightingLeft.playEffectLight(fishTarget, fishInfoLeft, this._onCompleteLighting.bind(this, fishInfoLeft, listFishLeft, infoRewardEndLeft), true);
            }
            if (fishInfoRight && lightingRight.parent){
                lightingRight.playEffectLight(fishTarget, fishInfoRight, this._onCompleteLighting.bind(this, fishInfoRight, listFishRight, infoRewardEndRight), true);
            }


            if (listFishRight.length === 0 && listFishLeft.length === 0) {
                this.scheduleOnce(this._sendEndEffect.bind(this, infoReward), 1);
            }
        }


    },

    _onCompleteLighting(fishTarget, array, infoReward) {
        if (array.length === 0) {
            return;
        }

        const fishInfo1 = array.shift();
        const fishInfo2 = array.shift();
        let timeMove1 = 0;
        let timeMove2 = 0;

        let lighting1, lighting2;


        if (fishInfo1) {
            lighting1 = this._getLighting();
        }

        if (fishInfo2) {
            lighting2 = this._getLighting();
        }

        if (array.length === 0) {
            if (infoReward){
                if(lighting1)
                    timeMove1 = lighting1.getTimeMove(fishTarget, fishInfo1);
                if(lighting2)
                    timeMove2 = lighting2.getTimeMove(fishTarget, fishInfo2);
                this.scheduleOnce(this._sendEndEffect.bind(this, infoReward), 1 + Math.max(timeMove1 ,timeMove2));
            }

            infoReward = null;
        }

        if (lighting1 && lighting1.parent) {
            lighting1.playEffectLight(fishTarget, fishInfo1, this._onCompleteLighting.bind(this, fishInfo1, array, infoReward), true);
        }

        if (lighting2 && lighting2.parent) {
            lighting2.playEffectLight(fishTarget, fishInfo2, this._onCompleteLighting.bind(this, fishInfo2, array, infoReward), true);
        }

    },


    _sendEndEffect(infoReward) {
        Emitter.instance.emit(EventCode.LIGHTING_CHAIN.END_EFFECT, infoReward);
        Emitter.instance.emit(EventCode.GAME_LAYER.CATCH_FISH_BY_LIGHTING, infoReward);
        Emitter.instance.emit(EventCode.LIGHTING_CHAIN.EFFECT_DIE, infoReward);
    },

    resetOnExit() {
        this.unscheduleAllCallbacks();
    },

    onDestroy() {
        removeEvents(this);
    },


});


