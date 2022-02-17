

const PoolManager = require("gfPoolManager");
const { autoEnum } = require("gfUtilities");
const GameConfig = require('gfBaseConfig');
const NodePoolConfig = require("gfNodePoolConfig");
const FishManager = require('gfFishManager');
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
    "NetFXMiniBoss"
]);
const PoolManager1990 = cc.Class({
    extends: PoolManager,
    __ctor__(listPrefab){
        PoolManager.instance = this;
        PoolManager.call(this, listPrefab);
    },
    initPools(){
        this.pools = [];
        this.dragon = cc.instantiate(this.listPrefab["Godzilla1990"]).getComponent('Godzilla1990');

        //type, prefabName, mainComponent, count
        this.initPool(POOL_TYPE.SpineFish, "SpineFish1990", "SpineFish1990", 25);
        this.initPool(POOL_TYPE.SpriteFish, "SpriteFish1990", "SpriteFish1990", 25);
        this.initPool(POOL_TYPE.Coin, "Coin1990", "gfCoinFX", 150);
        this.initPool(POOL_TYPE.Bullet, "Bullet1990", "Bullet1990", 100);
        this.initPool(POOL_TYPE.NetFX, "NetFX", "gfNetFX", 10);
        this.initPool(POOL_TYPE.NetFXMiniBoss, "NetFXMiniBoss", "gfNetFX", 10);
        this.initPool(POOL_TYPE.LabelCoin, "LabelCoin1990", "gfCoinLabel", 5);
        this.initPool(POOL_TYPE.BigExplosion, "ExplosionFX1990", "gfSmallExplosion", 10);
        this.initPool(POOL_TYPE.SmallExplosion, "ExplosionFX1990", "gfSmallExplosion", 20);
        //init done
        this.listPrefabs = null;
    },


    getNetFX(data) {
        let kind;
        let netfx = null;
        const fish = FishManager.instance.getFishById(data.FishID);  
        if(fish && fish.isAvailable() && fish.getKind() == GameConfig.instance.FISH_KIND.MINIBOSS){
            netfx = this.getObjectMainComponentByType(POOL_TYPE.NetFXMiniBoss);
            kind = 1;  // Explosion net
        } else{
            netfx = this.getObjectMainComponentByType(POOL_TYPE.NetFX);
            kind = 0;  // normal net
        } 
        const config = NodePoolConfig.instance.getNetFXConfig(kind);
        if(!config) return null;
        config.kind = kind;
        config.isMe = data.isMe;
        netfx.initAssets(config);
        return netfx;
    },
});
PoolManager1990.instance = null;
module.exports = PoolManager1990;