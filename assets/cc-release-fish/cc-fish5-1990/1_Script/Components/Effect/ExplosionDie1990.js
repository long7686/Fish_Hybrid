

cc.Class({
    extends: cc.Component,
    properties: { 
        spineAnim: sp.Skeleton,
    },

    onLoad() {
        this.node.playAnimation = this.playAnimation.bind(this);
    },

    playAnimation(scale = 1, callback){
        this.node.scale = scale;
        this.node.opacity = 255;
        const duration = this.spineAnim.findAnimation('animation').duration;
        this.spineAnim.setAnimation(0, 'animation', false);
        this.node.runAction(cc.sequence(
            cc.delayTime(duration),
            cc.callFunc(()=>{
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }),
            cc.removeSelf(true)
        ));
    }

    
});
