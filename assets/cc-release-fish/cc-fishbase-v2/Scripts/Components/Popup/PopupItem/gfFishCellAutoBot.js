const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

cc.Class({
    extends: cc.Component,
    properties: {
        friendNode: cc.Node,
        textNode: cc.Node,
        isSelect: true,
        fishID: 0,
        toggleGroupId: 0,
        isShow: true,
    },

    onLoad() {
        this.isShow = true;
    },

    onclick() {
        this.node.parent.getComponent("gfPopupAutoBotSetting").handleBlockTouch();
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.node.active = !this.node.active;
        this.friendNode.active = !this.node.active;
        if (this.textNode) {
            if (!this.isSelect) {
                this.textNode.getComponent(cc.Label).node.color = cc.Color.YELLOW;
            } else {
                this.textNode.getComponent(cc.Label).node.color = cc.Color.WHITE;
            }
        }
        this.node.parent.getComponent("gfPopupAutoBotSetting").onUpdateFish(!this.isSelect, this.fishID, this.toggleGroupId);
    },

    show(isActive, isActiveLabel = false) {
        if (!this.isShow) {
            this.node.active = false;
            this.friendNode.active = false;
            return;
        }
        this.node.active = isActive;
        this.friendNode.active = !isActive;
        if (this.textNode) {
            if ((!isActive && !this.isSelect) || isActiveLabel) {
                this.textNode.getComponent(cc.Label).node.color = cc.Color.YELLOW;
            } else {
                this.textNode.getComponent(cc.Label).node.color = cc.Color.WHITE;
            }
        }
    },

    reset() {
        this.isShow = true;
        this.node.active = false;
        this.friendNode.active = true;
        if (this.textNode) {
            this.textNode.getComponent(cc.Label).node.color = cc.Color.WHITE;
        }
    },
});
