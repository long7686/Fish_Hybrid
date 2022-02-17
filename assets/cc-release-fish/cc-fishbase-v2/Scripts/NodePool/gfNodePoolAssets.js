

const { gfSpriteFishAsset, gfSpineFishAsset, gfBulletAsset,gfFreezeItemFXAsset, gfNetFXAsset, 
    gfDragonBallAsset, gfCoinAsset, gfLabelCoinAsset } = require('gfCustomDataType');
const {convertAssetArrayToObject} = require('utils');

cc.Class({
    extends: cc.Component,
    properties: {
        bulletSprite: [gfBulletAsset],
        coin: [gfCoinAsset],
        freezeItemFX:[gfFreezeItemFXAsset],
        netFX: [gfNetFXAsset],
        fishAnimationClip: [gfSpriteFishAsset],
        fishSkeletonData: [gfSpineFishAsset],
        dragonBall: [gfDragonBallAsset],
        labelCoin: [gfLabelCoinAsset]
    },

    initMapAssets(){
        this.bulletAssets = convertAssetArrayToObject(this.bulletSprite);
        this.freezeItemFX = convertAssetArrayToObject(this.freezeItemFX);
        this.netFXAssets = convertAssetArrayToObject(this.netFX);
        this.fishAnimationAssets = convertAssetArrayToObject(this.fishAnimationClip);
        this.fishSkeletonAssets = convertAssetArrayToObject(this.fishSkeletonData);
        this.coinAssets = convertAssetArrayToObject(this.coin);
        this.dragonBallAssets = convertAssetArrayToObject(this.dragonBall);
        this.labelCoinAssets = convertAssetArrayToObject(this.labelCoin);
    },

    getBulletSprite(kind){ 
        if(this.bulletAssets[kind] && this.bulletAssets[kind].sprite) {
            return this.bulletAssets[kind].sprite;
        }
        return null;
    },

    getCoinAsset(kind){ 
        if(this.coinAssets[kind] && this.coinAssets[kind].animation) {
            return this.coinAssets[kind].animation;
        }
        return null;
    },

    getLabelCoinAsset(kind){ 
        if(this.labelCoinAssets[kind] && this.labelCoinAssets[kind].font) {
            return this.labelCoinAssets[kind].font;
        }
        return null;
    },

    getFreezeItemFXAsset(kind){ 
        if(this.freezeItemFX[kind] && this.freezeItemFX[kind].animation) {
            return this.freezeItemFX[kind].animation;
        }
        return null;
    },

    // fish normal default: 0, fish special : 1 , ice gun :2 
    getNetFXAsset(kind){ 
        if(this.netFXAssets[kind] && this.netFXAssets[kind].animation) {
            return this.netFXAssets[kind].animation;
        }
        return null;
    },

    getFishAnimationClip(kind){
        if(this.fishAnimationAssets[kind] && this.fishAnimationAssets[kind].animation) {
            return this.fishAnimationAssets[kind].animation;
        }
        return null;
    },

    getFishSkeletonData(kind){
        if(this.fishSkeletonAssets[kind] && this.fishSkeletonAssets[kind].animation) {
            return this.fishSkeletonAssets[kind].animation;
        }
        return null;
    },

    getDragonBallAssets(kind) {
        if(this.dragonBallAssets[kind] && this.dragonBallAssets[kind].sprite) {
            return this.dragonBallAssets[kind].sprite;
        }
        return null;
    }
});
