

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const { removeEvents } = require("gfUtilities");
cc.Class({
    extends: cc.Component,

    properties: {
        jpWarning: sp.Skeleton,
    },

    // LIFE-CYCLE CALLBACKS:

    onDragonWarning(){
        this.node.opacity = 255;
        Emitter.instance.emit(EventCode.SOUND.DRAGON_APPEAR);
        Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.1, amplitude: 10 });
        this.jpWarning.setAnimation(0,"animation", false);
        this.jpWarning.setCompleteListener(()=>{
            this.node.opacity = 0;
        });
    },
    resetOnExit(){
        this.jpWarning.setCompleteListener(()=>{});
        this.node.opacity = 0;
    },
    onDestroy() {
        removeEvents(this);
    },

    // update (dt) {},
});
