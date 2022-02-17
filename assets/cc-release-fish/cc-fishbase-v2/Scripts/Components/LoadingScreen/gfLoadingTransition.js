const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require('gfUtilities');
cc.Class({
    extends: cc.Component,
    editor: {
        executionOrder: 2
    },
    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.startTime = Date.now();
        this.node.position = cc.director.getScene().getChildByName('Canvas').position;
        registerEvent(EventCode.COMMON.LOADING_TRANSITION, this.transition, this);
        registerEvent(EventCode.COMMON.REMOVE_PERSIST_NODE, this.refreshPage, this);
        cc.game.addPersistRootNode(this.node);
        this.node.transition = this.transition.bind(this);
    },

    transition(){
        let delayTime = (Date.now() - this.startTime > 1) ? 0.25 : 1;
        cc.tween(this.node)
            .delay(delayTime)
            .to(0.5,{opacity: 0})
            .call(()=>{
                removeEvents(this);
                cc.game.removePersistRootNode(this.node);
                this.node.destroy();
            })
            .start();
    },

    // eslint-disable-next-line no-unused-vars
    update (dt) {
        this.node.position = cc.director.getScene().getChildByName('Canvas').position;
    },
    
    refreshPage(){
        removeEvents(this);
        cc.game.removePersistRootNode(this.node);
    },
});
