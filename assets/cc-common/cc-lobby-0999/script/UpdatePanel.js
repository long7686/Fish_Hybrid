cc.Class({
    extends: cc.Component,

    properties: {
        info: cc.Label,
        fileProgress: cc.ProgressBar,
        fileLabel: cc.Label,
        byteProgress: cc.ProgressBar,
        byteLabel: cc.Label,
        close: cc.Node,
        checkBtn: cc.Node,
        retryBtn: cc.Node,
        updateBtn: cc.Node,
        version: cc.Label,
    },

    onLoad () {
        this.close.on(cc.Node.EventType.TOUCH_END, function () {
            this.node.active = false;
        }, this);
    }
});
