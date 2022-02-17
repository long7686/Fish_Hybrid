cc.Class({
    extends: require('gfNode'),

    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        const animation = this.node.getComponent(sp.Skeleton);
        animation.setAnimation(0, "animation", false);
    },

    play(){
        const animation = this.node.getComponent(sp.Skeleton);
        animation.setAnimation(0, "animation", false);
        animation.setCompleteListener(()=>{
            animation.setCompleteListener(()=>{});
            animation.setToSetupPose();
            animation.clearTrack(0);
            this.returnPool();
        });
    },
});
