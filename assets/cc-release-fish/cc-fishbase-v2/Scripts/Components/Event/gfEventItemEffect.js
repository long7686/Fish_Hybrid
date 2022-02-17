cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.node.playAnimation = this.playAnimation.bind(this);
    },

    playAnimation(dataInfo, callback) {
        const {startPos} = dataInfo;
        this.callbackFunc = callback;
        const listAction = [].concat(this.onStart(dataInfo), this.onFly(dataInfo), this.onFinish(dataInfo));
        this.node.setPosition(startPos);
        this.node.runAction(cc.sequence(listAction));
    },

    onStart(){
        const listAction = [
            cc.scaleTo(0.5, 3),
            cc.delayTime(0.5)
        ];  
        return listAction;   
    },

    onFly(dataInfo){
        const {endPos } = dataInfo;
        const listAction = [
            cc.spawn(
                cc.scaleTo(0.8, 1),
                cc.moveTo(1, endPos),
            ),
            cc.delayTime(0.5)
        ];
        return listAction;  
    },

    onFinish(){
        const listAction = [
            cc.callFunc(() => {
                if (this.callbackFunc && typeof this.callbackFunc === 'function') {
                    this.callbackFunc();
                }
                this.node.destroy();
            })
        ];
        return listAction;  
    }

});
