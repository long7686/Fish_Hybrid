

const fishBaseFish = require("gfBaseFish");
cc.Class({
    extends: fishBaseFish,

    properties: {
        fishAnim:{
            default: null,
            type: sp.Skeleton
        }
    },

    initAssets(config) {
        if(!this.fishAnim){
            this.fishAnim = this.node.getChildByName('MainFish').getComponent(sp.Skeleton);
            this.luckyEffect = this.node.getChildByName('LuckyCircle');
            this.iceEffect = this.node.getChildByName('iceEffect');
        }
        this._super(config);
        if(!this.fishAnim.skeletonData || this.fishAnim.skeletonData.name != config.asset.name) { 
            this.fishAnim.skeletonData = config.asset;
        }
        this.initAnimationCacheMode();
        this.fishAnim.setAnimation(0, config.AnimationName[0], true);
      
    },

    initAnimationCacheMode(){
        this.fishAnim.enableBatch = true;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
    },
    
    getMainMaterial(){
        return this.fishAnim.getMaterial(0);
    },

    playEffectDie(){
        this.fishAnim.timeScale = 2;
    },

    changeAnimationSpeed(multiple = 0.5){
        this.fishAnim.timeScale *= multiple;
    },

    resetAnimationSpeed() {
        this.fishAnim.timeScale = 1;
    }
});
