

const { getPostionInOtherNode } = require('utils');
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const GameConfig = require('gfBaseConfig');

const BallStarPos = [
    cc.v2(0, 193),
    cc.v2(153, 120),
    cc.v2(189, -43),
    cc.v2(85, -174),
    cc.v2(-83, -174),
    cc.v2(-187, -43),
    cc.v2(-151, 120),
];
cc.Class({
    extends: cc.Component,

    properties: {
        image: cc.Node,
    },

    onLoad() {
        this.node.zIndex = GameConfig.instance.Z_INDEX.POPUP;
    },

    playAnimation(ballListArr) {
        const ballList = [...ballListArr];
        const scaleTime = 1.25;
        const fadeDelay = 0.5;
        const glowDelay = 1.65;
        const scaleDelay = 0.15;
        const rotateTime = scaleTime + fadeDelay + glowDelay + scaleDelay;
        const ballFlyTime = 0.15; // fly to star
        const flyAwayTime = 0.2; // fly out of screen

        this.image.opacity = 0;
        ballList.forEach((ball, i) => {
            ball.node.position = getPostionInOtherNode(this.node, ball.node);
            ball.node.parent = this.node;
            ball.moveToJackpotStar({ delay: ballFlyTime * i, position: BallStarPos[i] });
        });

        this.node.runAction(cc.sequence(
            cc.delayTime(1 + ballFlyTime * 7),
            cc.spawn(
                cc.rotateBy(rotateTime, 720).easing(cc.easeCubicActionIn()),
                cc.sequence(
                    cc.delayTime(fadeDelay),
                    cc.callFunc(() => {
                        this.image.runAction(cc.fadeIn(0.5));
                    }),
                    cc.delayTime(glowDelay),
                    cc.callFunc(() => { ballList.forEach((ball) => { ball.playGlowEffect(); }); }),
                    cc.delayTime(scaleDelay),
                    cc.spawn(
                        cc.scaleTo(scaleTime, 0.4).easing(cc.easeCubicActionIn()),
                        cc.sequence(
                            cc.delayTime(1),
                            cc.callFunc(() => {
                                Emitter.instance.emit(EventCode.DRAGON.BIG_EXPLOSION, this.node.convertToWorldSpaceAR(cc.v2(0, 0)));
                            }),
                            cc.delayTime(0.3),
                        ),
                    ),
                    cc.callFunc(() => {
                        ballList.forEach((ball) => { ball.flyAway(flyAwayTime); });
                        this.image.runAction(cc.fadeOut(0.5));
                    }),
                    cc.delayTime(scaleDelay),
                    cc.callFunc(() => {
                        Emitter.instance.emit(EventCode.DRAGON.SHOW_JACKPOT_WINAMOUNT);
                    }),
                    cc.delayTime(0.75),
                    cc.callFunc(() => {
                        Emitter.instance.emit(EventCode.DRAGON.DONE_JACKPOT_STAR);
                    }),
                    cc.removeSelf(true),
                ),
            ),
        ));
    },

});
