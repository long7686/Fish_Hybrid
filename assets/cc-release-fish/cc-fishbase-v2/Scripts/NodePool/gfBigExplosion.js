

cc.Class({
    extends: require('gfNode'),

    properties: {
        _animationName: "animation"
    },

    onLoad(){
        const spine = this.node.getComponent(sp.Skeleton);
        spine.setAnimation(0, this._animationName, false);
    },

    play(){
        const spine = this.node.getComponent(sp.Skeleton);
        spine.setAnimation(0, this._animationName, false);
        spine.setCompleteListener(()=>{
            this.returnPool();
        });
    }
});