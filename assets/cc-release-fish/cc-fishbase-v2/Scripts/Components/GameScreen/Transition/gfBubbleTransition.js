

cc.Class({
    extends: cc.Component,

    properties: {

    },

    start () {
        this.node.scale = 0;
        this.node.opacity = 255;
        const offset = 5;
        const shakeTime = 0.5;
        this.node.runAction(cc.repeatForever(cc.sequence(
            cc.moveBy(shakeTime, -offset, 0),
            cc.moveBy(shakeTime, offset, 0)
        )));
        this.node.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.5, 1),
                cc.fadeOut(1),
            ),
            cc.removeSelf(true)
        ));
    },

    // update (dt) {},
});
