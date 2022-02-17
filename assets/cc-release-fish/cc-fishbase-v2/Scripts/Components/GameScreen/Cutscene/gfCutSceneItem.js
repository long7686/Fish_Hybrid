
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.node.active = false;
        this.node.opacity = 0;
        this.node.show = this.show.bind(this);
        this.node.hide = this.hide.bind(this);
        this.node.resetOnExit = this.resetOnExit.bind(this);
    },

    show(content, callback) {
        this.node.active = true;
        this.node.opacity = 255;
        this.extendShow(content, callback);
    },

    extendShow(content, callback) {
        // Overwrite here
        this.node.runAction(
            cc.sequence(
                cc.callFunc(() => {
                    cc.log("Content", content);
                }),
                cc.delayTime(2),
                cc.callFunc(() => {
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                    this.hide();
                })
            ),
        );
    },

    hide() {
        this.node.stopAllActions();
        this.node.active = false;
        this.node.opacity = 0;
        this.node.removeFromParent(true);
        this.node.destroy();
    },


    resetOnExit(){

    }


});
