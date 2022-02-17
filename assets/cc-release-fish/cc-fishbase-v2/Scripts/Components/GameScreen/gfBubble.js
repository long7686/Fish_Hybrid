

const { registerEvent, removeEvents } = require("gfUtilities");
const EventCode = require("gfBaseEvents");
const POS_LIST = [
    [cc.v2(-629,13),cc.v2(-554,75),cc.v2(-4,-319),cc.v2(582,67),cc.v2(513,-275)],//Background 0
    [cc.v2(-620,69),cc.v2(-333,249),cc.v2(-500,-321),cc.v2(600,98),cc.v2(301,-331)], //Background 1
    [cc.v2(-588,134),cc.v2(-525,250),cc.v2(-555,-302),cc.v2(572,-36),cc.v2(430,-320)], //Background 2
    [cc.v2(-464,96),cc.v2(579,78),cc.v2(-587,-259),cc.v2(-200,184),cc.v2(466,-285)], //Background 3
    [cc.v2(-629,13),cc.v2(-554,75),cc.v2(-4,-319),cc.v2(582,67),cc.v2(513,-275)],//Background 0
    [cc.v2(-620,69),cc.v2(-333,249),cc.v2(-500,-321),cc.v2(600,98),cc.v2(301,-331)], //Background 1
    [cc.v2(-588,134),cc.v2(-525,250),cc.v2(-555,-302),cc.v2(572,-36),cc.v2(430,-320)], //Background 2
    [cc.v2(-464,96),cc.v2(579,78),cc.v2(-587,-259),cc.v2(-200,184),cc.v2(466,-285)], //Background 3
    [cc.v2(-464,96),cc.v2(579,78),cc.v2(-587,-259),cc.v2(-200,184),cc.v2(466,-285)], //Background 3
    [cc.v2(-464,96),cc.v2(579,78),cc.v2(-587,-259),cc.v2(-200,184),cc.v2(466,-285)], //Background 3
];
cc.Class({
    extends: cc.Component,

    properties: {
        BubbleNodes:[cc.Node],
    },

    onLoad() {
        this.initEvents();
    },
    initEvents() {
        registerEvent(EventCode.GAME_LAYER.INIT_BUBBLE, this.initBubble, this);
        registerEvent(EventCode.GAME_LAYER.CHANGE_BUBBLE, this.changeBackground, this);
    },

    initBubble(index){
        for(let i = 0; i< this.BubbleNodes.length; i++)
        {
            this.BubbleNodes[i].x = POS_LIST[index][i].x;
            this.BubbleNodes[i].y = POS_LIST[index][i].y;
        }
    },
    changeBackground(index){
        for(let i = 0; i< this.BubbleNodes.length; i++)
        {
            cc.tween(this.BubbleNodes[i])
                .to(0.5, {opacity: 0})
                .delay(0.5)
                .call(()=>{
                    this.BubbleNodes[i].x = POS_LIST[index][i].x;
                    this.BubbleNodes[i].y = POS_LIST[index][i].y;
                })
                .to(1.5, {opacity: 255})
                .start();
        }
    },
    onDestroy() {
        removeEvents(this);
    }

});
