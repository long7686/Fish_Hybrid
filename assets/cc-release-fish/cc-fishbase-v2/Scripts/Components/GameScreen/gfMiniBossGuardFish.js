

const { randRange } = require('utils');
const ANIMATION = {
    Die: "die",
    Walk: 'walk',
    Suicide: "suicide"
};

cc.Class({
    extends: require('gfSpineFish'),
    properties :{
        somecode: cc.Component,
    },


    initAnimationCacheMode(){
        this.fishAnim.enableBatch = true;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
    },

    playEffectDie(){
        this.fishAnim.setAnimation(0, ANIMATION.Die, false);
    },

    onSuicide(data) {
        if (this._isDie) return;
        this._isDie = true;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.delayTime(randRange(10, 20) / 10),
            cc.callFunc(() => {
                this.fishAnim.setAnimation(0, ANIMATION.Suicide, false);
            }),
            cc.delayTime(2),
            cc.callFunc( () => {
                this.onPlayEffectWinInCatchFish(data);
            }),
            cc.fadeOut(0.5),
        ));
    },
});
