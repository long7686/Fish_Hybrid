

const gfNodePoolConfig = cc.Class({
    __ctor__(listAssets){
        this.FISH_CONFIG  = {
            "0" :  {speed: 100,   FishMultiple: -1,     zIndex: 499,    targetPoint: cc.v2(5, 0),        BoxCollider: new cc.Rect(5, 0, 22.9, 10.5)},
            "1" :  {speed: 100,   FishMultiple: -1,     zIndex: 498,    targetPoint: cc.v2(5, 0),        BoxCollider: new cc.Rect(5, 0, 54.2, 13.8)},
            "2" :  {speed: 80,    FishMultiple: -1,     zIndex: 497,    BoxCollider: new cc.Rect(-2, 2.2, 36, 19.5)},
            "3" :  {speed: 80,    FishMultiple: -1,     zIndex: 496,    targetPoint: cc.v2(3, 2),        BoxCollider: new cc.Rect(5, 2.2, 35.7, 28.5)},
            "4" :  {speed: 80,    FishMultiple: -1,     zIndex: 495,    targetPoint: cc.v2(18, 0),        BoxCollider: new cc.Rect(15, 2.2, 54.5, 29)},
            "5" :  {speed: 80,    FishMultiple: -1,     zIndex: 494,    targetPoint: cc.v2(10, 2),        BoxCollider: new cc.Rect(10, 2.2, 67.9, 18.6)},
            "6" :  {speed: 40,    FishMultiple: -1,     zIndex: 1  ,    targetPoint: cc.v2(10, 0),        BoxCollider: new cc.Rect(-10, 2.2, 59, 20)},
            "7" :  {speed: 60,    FishMultiple: -1,     zIndex: 493,    targetPoint: cc.v2(7, 0),        BoxCollider: new cc.Rect(13, 2.2, 66.4, 25.6)},
            "8" :  {speed: 60,    FishMultiple: -1,     zIndex: 100,    targetPoint: cc.v2(10, 0),        BoxCollider: new cc.Rect(15, 2.2, 52.6, 40.2)},
            "9" :  {speed: 60,    FishMultiple: -1,     zIndex: 109,    targetPoint: cc.v2(7, 0),        BoxCollider: new cc.Rect(8, 1.2, 66.4, 27.2)},
            "10" : {speed: 60,    FishMultiple: -1,     zIndex: 108,    targetPoint: cc.v2(5, 0),        BoxCollider: new cc.Rect(10, 2.2, 66.6, 32.4)},
            "11" : {speed: 60,    FishMultiple: -1,     zIndex: 107,    targetPoint: cc.v2(8, 0),        BoxCollider: new cc.Rect(15, 2.2, 66.6 , 32.4)},
            "12" : {speed: 60,    FishMultiple: -1,     zIndex: 106, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0.1, -0.2, 71.1, 51.6)},
            "13" : {speed: 40,    FishMultiple: -1,     zIndex: 492, AnimationName: ['animation'],    BoxCollider: new cc.Rect(-0.1, -0.2, 139.4, 20.2)},
            "14" : {speed: 40,    FishMultiple: -1,     zIndex: 200, AnimationName: ['animation'],    targetPoint: cc.v2(35, 0),         BoxCollider: new cc.Rect(20, -0.2, 81.5, 43.4)},
            "15" : {speed: 40,    FishMultiple: -1,     zIndex: 201, AnimationName: ['animation'],    targetPoint: cc.v2(5, 0),          BoxCollider: [new cc.Rect(5, -1.8, 41.5, 37.7),new cc.Rect(4, -0.6, 17.6, 120)]},
            "16" : {speed: 20,    FishMultiple: -1,     zIndex: 202, AnimationName: ['animation'],    targetPoint: cc.v2(-5, 0),         BoxCollider: [new cc.Rect(-4.1, 1.6, 84.9, 24.4),new cc.Rect(-17.3, 1.6, 58.3, 53.1)]},
            "17" : {speed: 40,    FishMultiple: -1,     zIndex: 203, AnimationName: ['animation'],    targetPoint: cc.v2(-10, 0),        BoxCollider: new cc.Rect(-10, 1, 65, 77.3)},
            "18" : {speed: 40,    FishMultiple: -1,     zIndex: 204, AnimationName: ['animation'],    targetPoint: cc.v2(10, 0),         BoxCollider: [new cc.Rect(11.5, 0.8, 97.1, 49.7),new cc.Rect(0, -1.5, 36.8, 123.1)]},
            "19" : {speed: 40,    FishMultiple: -1,     zIndex: 205, AnimationName: ['animation'],    targetPoint: cc.v2(0, 0),         BoxCollider: [new cc.Rect(26.5, 1.2, 232.3, 10.8),new cc.Rect(-7.8, 0.2, 110, 30.7)]},
            "20" : {speed: 40,    FishMultiple: -1,     zIndex: 206, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 0, 133.5 , 41.2)},
            "21" : {speed: 40,    FishMultiple: -1,     zIndex: 207, AnimationName: ['animation'],    BoxCollider: new cc.Rect(-1.2, -2.3, 76.3, 72.1)},
            "22" : {speed: 20,    FishMultiple: -1,     zIndex: 208, AnimationName: ['animation'],    targetPoint: cc.v2(10, 10),         BoxCollider: new cc.Rect(7, 9, 161.3, 64.5)},
            "23" : {speed: 20,    FishMultiple: -1,     zIndex: 209, AnimationName: ['animation'],    targetPoint: cc.v2(17, 0),         BoxCollider: new cc.Rect(20, 0, 159.3, 67)},
            "24" : {speed: 20,    FishMultiple: -1,     zIndex: 210, AnimationName: ['animation'],    targetPoint: cc.v2(-30, 0),        BoxCollider: new cc.Rect(27, 0, 167, 35)},
            "25" : {speed: 20,    FishMultiple: -1,     zIndex: 211, AnimationName: ['animations'],   targetPoint: cc.v2(-30, 0),        BoxCollider: new cc.Rect(-24, -3, 169, 68)},
            "27" : {speed: 20,    FishMultiple: -1,     zIndex: 2  , AnimationName: ['animation'],    customAnimProp: {angle: 90},        BoxCollider: new cc.Rect(-4, -7, 94, 73)},
            "30" : {speed: 20,    FishMultiple: -1,     zIndex: 491, AnimationName: ['animation'],    customAnimProp: {scaleX: 0.469,scaleY: 0.469},    targetPoint: cc.v2(17, 0),  BoxCollider: new cc.Rect(-41, -3, 290, 50)},
            "31" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['thantaiphai'],  BoxCollider: new cc.Rect(2, 58, 73, 159), skipRotate: true},
            "34" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['walk'],         customAnimProp: {scaleX: -1},       customComponent: 'gfMiniBossGuardFish',  targetPoint: cc.v2(15, 0),        BoxCollider: new cc.Rect(0, 0, 180, 100)},
            "35" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['walk'],         customAnimProp: {scaleX: -1},       customComponent: 'gfMiniBossGuardFish',  targetPoint: cc.v2(0, 10),        BoxCollider: new cc.Rect(0, 15, 60, 100)},
            "36" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['walk'],         customAnimProp: {scaleX: -1},       customComponent: 'gfMiniBossGuardFish',  BoxCollider: new cc.Rect(0, 0, 50, 50)},
            "37" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['walk'],         customAnimProp: {scaleX: -1},       customComponent: 'gfMiniBossGuardFish',  targetPoint: cc.v2(0, -5),        BoxCollider: new cc.Rect(8, -5, 95, 70)},
            "43" : {speed: 20,    FishMultiple: -1,     zIndex: 105, AnimationName: ['animation'],    targetPoint: cc.v2(10, 0),        BoxCollider: new cc.Rect(10, 3, 110, 88),   skipRotate: true}
        };

        this.SPRITE_FISH_KIND = [0,1,2,3,4,5,6,7,8,9,10,11];

        this.BULLET_CONFIG = {
            "0" : {BoxCollider: new cc.Rect(5, 0, 20, 20)},
            "1" : {BoxCollider: new cc.Rect(5, 0, 20, 22)},
            "2" : {BoxCollider: new cc.Rect(5, 0, 20, 20)},
            "3" : {BoxCollider: new cc.Rect(5, 0, 20, 27)},
            "4" : {BoxCollider: new cc.Rect(5, 0, 20, 67)},
            "5" : {BoxCollider: new cc.Rect(0, 0, 20, 67)},
            "6" : {BoxCollider: new cc.Rect(0, 0, 20, 91)},
            "7" : {BoxCollider: new cc.Rect(0, 0, 20, 36)},          
            "8" : {BoxCollider: new cc.Rect(0, 0, 20, 77)},
            "9" : {BoxCollider: new cc.Rect(0, 0, 20, 101)}
        };
        this.BULLET_ICE_VALUE = [7,7,7,7,8,8,9];
        this.FREEZE_ITEM_FX_CONFIG = {};

        this.NET_FX_CONFIG = {};

        this.COIN_CONFIG = {};

        this.DRAGON_BALL_CONFIG = {
            "0": { scale: 0.3},
            "1": { scale: 0.3},
            "2": { scale: 0.3},
            "3": { scale: 0.3},
            "4": { scale: 0.3},
            "5": { scale: 0.3},
            "6": { scale: 0.4},
        };
        this.initNodePoolAssets(listAssets);
       
    },

    initNodePoolAssets(listAssets){
        this.assetHolder = cc.instantiate(listAssets).getComponent("gfNodePoolAssets");
        this.assetHolder.initMapAssets();
    },

    isSpriteFish(kind){
        return this.SPRITE_FISH_KIND.includes(kind);
    },

    checkFishPoolByKind(kind){
        return this.FISH_CONFIG[kind] ? true : false;
    },

    getBulletConfig(data){
        let kind;
        if (data.isFreezed) {
            kind = this.BULLET_ICE_VALUE[data.BulletIndex];
        } else {
            kind = data.BulletIndex;
        }

        const config = this.BULLET_CONFIG[kind];
        if(!config) {
            cc.warn("Bullet kind config not found: " + kind);
            if(kind != 0) {
                return this.getBulletConfig(0);
            }
            return null;
        }
        if(!config.asset) {
            config.asset = this.assetHolder.getBulletSprite(kind);
        }
        return config;
    },

    getFishConfig(kind){
        const config = this.FISH_CONFIG[kind];
        if(!config) {
            cc.warn("Fish kind config not found: " + kind);
            return null;
        }
        if(this.isSpriteFish(kind)) {
            if(!config.asset) {
                config.asset = this.assetHolder.getFishAnimationClip(kind);
            }
        } else {
            if(!config.asset) {
                config.asset = this.assetHolder.getFishSkeletonData(kind);
            }
        }
        return config;
    },

    getCoinConfig(kind){
        const asset = this.assetHolder.getCoinAsset(kind);
        if(!this.COIN_CONFIG[kind]) {
            if(asset) {
                this.COIN_CONFIG[kind] = {};
            } else {
                // cc.warn("Coin kind config not found: " + kind);
                if(kind != 0) {
                    return this.getCoinConfig(0);
                }
                return null;
            }
        }
        const config = this.COIN_CONFIG[kind];

        if(!config.asset) {
            config.asset = asset;
        }
        return config;
    },

    getLabelCoinFont(kind){
        const font = this.assetHolder.getLabelCoinAsset(kind);
        return font;
    },

    getFreezeItemFXConfig(kind){
        const asset = this.assetHolder.getFreezeItemFXAsset(kind);
        if(!this.FREEZE_ITEM_FX_CONFIG[kind]) {
            if(asset) {
                this.FREEZE_ITEM_FX_CONFIG[kind] = {};
            } else {
                cc.warn("NetFx kind config not found: " + kind);
                if(kind != 0) {
                    return this.getFreezeItemFXConfig(0);
                }
                return null;
            }
        }
        const config = this.FREEZE_ITEM_FX_CONFIG[kind];
        if(!config.asset) {
            config.asset = asset;
        }
        return config;
    },

    getNetFXConfig(kind){
        const asset = this.assetHolder.getNetFXAsset(kind);
        if(!this.NET_FX_CONFIG[kind]) {
            if(asset) {
                this.NET_FX_CONFIG[kind] = {};
            } else {
                cc.warn("NetFx kind config not found: " + kind);
                if(kind != 0) {
                    return this.getNetFXConfig(0);
                }
                return null;
            }
        }
        const config = this.NET_FX_CONFIG[kind];
        if(!config.asset) {
            config.asset = asset;
        }
        return config;
    },

    getDragonBallConfig(kind){
        const config = this.DRAGON_BALL_CONFIG[kind];
        if(!config) {
            cc.warn("Dragon Ball kind config not found: " + kind);
            return null;
        }
        if(!config.asset) {
            config.asset = this.assetHolder.getDragonBallAssets(kind);
            config.kind = kind;
        }
        return config;
    },

    destroy(){
        this.assetHolder.destroy();
        this.assetHolder = null;
        gfNodePoolConfig.instance = null;
    }
});
gfNodePoolConfig.instance = null;
module.exports = gfNodePoolConfig;