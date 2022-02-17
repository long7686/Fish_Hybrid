

const NodePool = require("gfNodePool");
const {convertAssetArrayToObject} = require('utils');
const NodePoolConfig = require("gfNodePoolConfig");
const EventCode = require("gfBaseEvents");
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const ReferenceManager = require('gfReferenceManager');
const { registerEvent, removeEvents, autoEnum } = require("gfUtilities");

const POOL_TYPE = autoEnum([
    "SpineFish",
    "SpriteFish",
    "Bullet",
    "NetFX",
    "Coin",
    "LuckyEffect",
    "FreezeEffect",
    "LabelCoin",
    "BigExplosion",
    "SmallExplosion",
    "DragonBall",
]);

const MAIN_COMPONENT = { };

const gfPoolManager =  cc.Class({
    __ctor__(listPrefab){
        this.arrPrefab = listPrefab;
        this.listPrefab = convertAssetArrayToObject(listPrefab);
        this.initPools();
        this.initEvents();
        this.listPrefab = null;
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.returnAllObjectToPool, this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.returnAllObjectToPool, this);
    },

    initPools(){
        this.pools = [];
        this.dragon = cc.instantiate(this.listPrefab["Dragon"]).getComponent('gfDragon');
        //type, prefabName, mainComponent, count
        this.initPool(POOL_TYPE.SpineFish, "SpineFish", "gfSpineFish", 120);
        this.initPool(POOL_TYPE.SpriteFish, "SpriteFish", "gfSpriteFish", 25);
        this.initPool(POOL_TYPE.Coin, "Coin", "gfCoinFX", 200);
        this.initPool(POOL_TYPE.Bullet, "Bullet", "gfBullet", 80);
        this.initPool(POOL_TYPE.NetFX, "NetFX", "gfNetFX", 20);
        this.initPool(POOL_TYPE.LuckyEffect, "LuckyEffect", "gfLuckyEffect", 1);
        this.initPool(POOL_TYPE.FreezeEffect, "ItemFreezeEffect", "gfItemFreezeEffect", 1);
        this.initPool(POOL_TYPE.DragonBall, "DragonBall", "gfDragonBall", 25);
        this.initPool(POOL_TYPE.LabelCoin, "LabelCoin", "gfCoinLabel", 50);
        this.initPool(POOL_TYPE.SmallExplosion, "SmallExplosion", "gfSmallExplosion", 20);
        this.initPool(POOL_TYPE.BigExplosion, "BigExplosion", "gfBigExplosion", 20);
    },

    initPool(type, prefabName, mainComponent, count) {
        if(!this.listPrefab[prefabName]) return;
        MAIN_COMPONENT[type] = mainComponent;
        if(MAIN_COMPONENT[type]) {
            this.pools[type] = new NodePool(MAIN_COMPONENT[type]);
        } else {
            this.pools[type] = new NodePool();
        }
        this.pools[type].init(this.listPrefab[prefabName], count);
    },

    getObjectByType(type) {
        return this.pools[type].getObj();
    },

    getObjectMainComponentByType(type){
        return this.pools[type].getObj().getComponent(MAIN_COMPONENT[type]);
    },

    getFishByKind(kind){
        const config = NodePoolConfig.instance.getFishConfig(kind);
        if(!config) return null;
        const fishType = NodePoolConfig.instance.isSpriteFish(kind) ? POOL_TYPE.SpriteFish : POOL_TYPE.SpineFish;
        const fishNode = this.getObjectByType(fishType);
        if(fishNode){
            this.updateFishComponent(fishNode, fishType, config.customComponent);
            const fish = fishNode.getComponent(MAIN_COMPONENT[fishType]);
            fish.setPoolManager(this.pools[fishType]);
            fish.node.setParent(ReferenceManager.instance.getNodeFishLayer());    
            fish.initAssets(config);
            return fish;
        }
        return null;
    },

    updateFishComponent(fishNode, fishType, customComponent){
        fishNode.getComponent('gfBaseFish')._destroyImmediate();
        fishNode.addComponent(customComponent ? customComponent : MAIN_COMPONENT[fishType]);
    },

    getFishWithData(data){
        const fish = this.getFishByKind(data.FishKind);
        if(!fish) return null;
        fish.initFishData(data);
        return fish;
    },

    getBulletByKind(data){
        const config = NodePoolConfig.instance.getBulletConfig(data);
        if(!config) return null;
        const bullet = this.getObjectMainComponentByType(POOL_TYPE.Bullet);
        bullet.initAssets(config);
        return bullet;
    },

    getBulletKindByMultiple(bulletMultiple) {
        return DataStore.instance.getBulletIndex(bulletMultiple);
    },

    getBulletWithData(data){
        const bullet = this.getBulletByKind({BulletIndex:this.getBulletKindByMultiple(data.BulletMultiple),isFreezed:data.isFreezed});
        if(!bullet) return null;
        bullet.initData(data);
        return bullet;
    },

    getCoin(kind){
        const config = NodePoolConfig.instance.getCoinConfig(kind);
        if(!config) return null;
        const coin = this.getObjectByType(POOL_TYPE.Coin);
        coin.getComponent(MAIN_COMPONENT[POOL_TYPE.Coin]).initAssets(config);
        return coin;
    },

    getLabelCoin(isMe = true) {
        let kind = isMe ? 1 : 0;
        const config = NodePoolConfig.instance.getLabelCoinFont(kind);
        if(!config) return null;
        const label =  this.getObjectMainComponentByType(POOL_TYPE.LabelCoin);
        label.initAssets(config);
        return label;
    },

    createSmallExplosion({position}){
        const explosion = this.getObjectMainComponentByType(POOL_TYPE.SmallExplosion);
        explosion.node.parent = ReferenceManager.instance.getEffectLayer();
        explosion.node.position = position;
        explosion.play();
        return explosion;
    },

    createBigExplosion({position}){
        const explosion = this.getObjectMainComponentByType(POOL_TYPE.BigExplosion);
        explosion.node.parent = ReferenceManager.instance.getEffectLayer();
        explosion.node.position = position;
        explosion.play();
        return explosion;
    },

    getFreezeFX(kind = 0){
        const config = NodePoolConfig.instance.getFreezeItemFXConfig(kind);
        if(!config) return null;
        const freezeitem = this.getObjectMainComponentByType(POOL_TYPE.FreezeEffect);
        freezeitem.initAssets(config);
        return freezeitem;
    },

    getNetFX(data) {
        let kind;
        if(data.isFreezed) {
            kind = GameConfig.instance.NetFx.IceNet;
        }
        else if(data.FishKind == GameConfig.instance.FISH_KIND.MINIBOSS){
            kind = GameConfig.instance.NetFx.ExplostionNet;
        } 
        else{
            kind = GameConfig.instance.NetFx.NormalNet;
        } 
        const config = NodePoolConfig.instance.getNetFXConfig(kind);
        if(!config) return null;
        const netfx = this.getObjectMainComponentByType(POOL_TYPE.NetFX);
        config.kind = kind;
        config.isMe = data.isMe;
        netfx.initAssets(config);
        return netfx;
    },

    getLuckyEffectWithData(data){
        const luckyeffect = this.getObjectMainComponentByType(POOL_TYPE.LuckyEffect);
        luckyeffect.initData(data);
        return luckyeffect;
    },

    getDragonBall(kind){
        const config = NodePoolConfig.instance.getDragonBallConfig(kind);
        if(!config) return null;
        const ball = this.getObjectMainComponentByType(POOL_TYPE.DragonBall);
        ball.initAssets(config);
        return ball;
    },

    getDragonWithData(data) {
        if(!this.dragon) return null;
        this.dragon.node.parent = ReferenceManager.instance.getNodeFishLayer();
        this.dragon.initFishData(data);
        return this.dragon;
    },

    returnAllObjectToPool(){
        this.pools.forEach((pool, i) => {
            cc.log("return pool: " + i);
            pool.returnAllToPool();
        });
    },

    destroy(){
        removeEvents(this);
        NodePoolConfig.instance.destroy();
        this.pools.forEach(pool => {
            pool.destroy();
        });
        if(this.dragon) {
            if(cc.isValid(this.dragon.node)){
                this.dragon.node.destroy();
            }
            this.dragon = null;
        }
        gfPoolManager.instance = null;
    } 
});

gfPoolManager.instance = null;
module.exports = gfPoolManager;