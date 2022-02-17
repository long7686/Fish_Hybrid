

const fishBaseFish = require("gfBaseFish");
cc.Class({
    extends: fishBaseFish,

    properties: {
        fishAnim:{
            default:null,
            type:cc.Animation
        },
    },

    start () {
    },

    initAssets(config) {
        if(!this.fishAnim){
            this.fishAnim = this.node.getChildByName('MainFish').getComponent(cc.Animation);
            this.luckyEffect = this.node.getChildByName('LuckyCircle');
            this.iceEffect = this.node.getChildByName('iceEffect');
        }
        this._super(config);
        while(this.fishAnim.getClips().length > 0) {
            this.fishAnim.removeClip(this.fishAnim.getClips()[0], true);
        }
        this.fishAnim.addClip(config.asset);
        this.fishAnim.play(config.asset.name);
        this.clipName = this.fishAnim.getClips()[0].name;
    },

    playEffectDie(){
        this.fishAnim.getAnimationState(this.clipName).speed = 2;
    },

    changeAnimationSpeed(multiple = 1){
        this.fishAnim.getAnimationState(this.clipName).speed *= multiple;
    },

    resetAnimationSpeed() {
        if(this.fishAnim.getClips().length > 0) {
            this.fishAnim.getAnimationState(this.clipName).speed = 1;
        }
    },
});
