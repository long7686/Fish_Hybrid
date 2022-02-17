

cc.Class({
    extends: require('gfNode'),

    properties: {
        _animName: 'animation'
    },

    onLoad(){
        let animation = this.node.getComponent(cc.Animation);
        if(animation){
            animation.play();
        }
        else {
            animation = this.node.getComponent(sp.Skeleton);
            animation.setAnimation(0, this._animName, false);
            animation.setCompleteListener(()=>{
                this.onFinished();
            });
        }
    },

    play(){
        let animation = this.node.getComponent(cc.Animation);
        if(animation){
            animation.play();
        }
        else {
            animation = this.node.getComponent(sp.Skeleton);
            animation.setAnimation(0, this._animName, false);
            animation.setCompleteListener(()=>{
                this.onFinished();
            });
        }
    },

    onFinished(){
        this.returnPool();
    }
});