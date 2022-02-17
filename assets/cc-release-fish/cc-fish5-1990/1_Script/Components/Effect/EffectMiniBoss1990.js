

const { getPostionInOtherNode } = require('utils');
const FishManager = require('gfFishManager');
const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");
const { registerEvent, removeEvents } = require("gfUtilities");

cc.Class({
    extends: require('gfEffectMiniBoss'),

    properties: {
        finMiniBoss: {
            default: null,
            visible: false,
            override: true
        },
        effHitMiniboss: {
            default: null,
            visible: false,
            override: true
        },
        gemMiniBoss: {
            default: null,
            visible: false,
            override: true
        },
        criticalMiniBoss: {
            default: null,
            visible: false,
            override: true
        },
        itemMiniboss: {
            default: null,
            visible: false,
            override: true
        },
        explosionDie: cc.Prefab,
    },

    initEvent() {
        this._super();
        registerEvent(EventCode.EFFECT_LAYER.EFFECT_MINI_BOSS_DIE, this.playMiniBossDie, this);
    },

    playMiniBossDie(dataInput) {
        const {data, fishNode, durationAnimMinibossDie} = dataInput;
        const listBonusFish = data.MiniBossInfo.BonusFish;
        const minibossComp = fishNode.getComponent("MiniBoss1990");
        Emitter.instance.emit(EventCode.SOUND.MINIBOSS_DEAD);

        

        cc.tween(this.node)
            .call(()=>{
                if(listBonusFish && listBonusFish.length > 0){
                    this.playEffectMiniSubmarineDie(dataInput);
                }
            })
            .delay(durationAnimMinibossDie)
            .call(()=>{
                if(listBonusFish && listBonusFish.length > 0) {
                    Emitter.instance.emit(EventCode.LIGHTING_CHAIN.START_EFFECT_ONE_FOR_ALL, {
                        infoTargetFrom: minibossComp,
                        listBonusFish
                    });
                }
                this.playEffectMinibossDie(fishNode);
            })
            .start();
    },

    playEffectMiniSubmarineDie(dataInput){
        const {data, durationAnimMinibossDie} = dataInput;
        const listBonusFish = data.MiniBossInfo.BonusFish;
        listBonusFish.forEach((item) =>{  
            const fishItem = FishManager.instance.getFishById(item.FishID);  
            if(fishItem){
                const infoDetail = {
                    DeskStation: data.DeskStation,
                    FishID: item.FishID,
                    GoldReward: item.GoldReward,
                    isSkill: false,
                    isHaveLighting: true
                };
                fishItem.setDie(true);

                this.scheduleOnce(()=>{
                    const scheduleExplosion = ()=>{
                        const pos = getPostionInOtherNode(this.node, fishItem.node);
                        const explosionSmall = cc.instantiate(this.explosionDie);
                        explosionSmall.parent = this.node;
                        explosionSmall.setPosition(pos);
                        explosionSmall.playAnimation(0.2);
                        const durationExplosion = explosionSmall.getComponent(sp.Skeleton).findAnimation("animation").duration;
                        cc.tween(fishItem.node)
                            .delay(durationExplosion / 4)
                            .call(()=>{
                                Emitter.instance.emit(EventCode.SOUND.MINI_SHIP_DIE);
                                Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.05, amplitude: 5 });
                            })
                            .to(durationExplosion / 2, {opacity: 0})
                            .call(()=>{
                                Emitter.instance.emit(EventCode.GAME_LAYER.CATCH_FISH, infoDetail);
                            })
                            .start();
                        this._lstEffectMiniboss.push(explosionSmall);
                    };
                    this.scheduleOnce(scheduleExplosion, 0.75);
                }, durationAnimMinibossDie + 0.5);
            }
        });
    },

    playEffectMinibossDie(fishNode){
        // Eff Kill boss   
        const pos = getPostionInOtherNode(this.node, fishNode);
        const explosion = cc.instantiate(this.explosionDie);
        explosion.parent = this.node;
        explosion.setPosition(pos);
        explosion.playAnimation(1); 
        this.scheduleOnce(()=>{
            Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.05, amplitude: 5 });
        }, 0.5);
        this._lstEffectMiniboss.push(explosion);
    },

    playMiniBossDropItem({data, itemNode}) { // eslint-disable-line
        const pos = getPostionInOtherNode(this.node, itemNode);
        const explosion = cc.instantiate(this.explosionDie);
        explosion.parent = this.node;
        explosion.setPosition(pos);
        explosion.playAnimation(0.2);
        this._lstEffectMiniboss.push(explosion);
    },
    resetOnExit() {
        this._super();
        this.node.stopAllActions();
    },

    onDestroy() {
        this._super();
        this.node.stopAllActions();
        removeEvents(this);
    },
});
