

cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad(){
        const spine = this.node.getComponent(sp.Skeleton);
        //spine.setAnimation(0, 'animation', false);
        spine.setCompleteListener(()=>{
            this.node.destroy();
        });
    },
});
