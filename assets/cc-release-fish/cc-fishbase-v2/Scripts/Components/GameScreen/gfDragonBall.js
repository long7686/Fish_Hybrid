

const { getRandomInt, randRange } = require('utils');
const { autoEnum } = require('gfUtilities');
const Emitter = require('gfEventEmitter');
const EventCode = require('gfBaseEvents');
const GameConfig = require('gfBaseConfig');

const STATE = autoEnum([
    "Invalid",
    "Dropping",
    "InTray",
    "InJackpotStar"
]);

cc.Class({
    extends: require('gfNode'),

    properties: {
        ballSprite: cc.Sprite,
        backEff: cc.Node,
        frontEff: cc.Node,
        ballSpark: cc.Node,
        hitGlow: cc.Node,
        hitLight: cc.Node,
        fireEfx: cc.Node,
        _state: 0
    },

    initAssets(config) {
        this.ballSprite.spriteFrame = config.asset;
        this.baseScale = config.scale;
        this.kind = config.kind;
        this.node.zIndex = GameConfig.instance.Z_INDEX.DRAGON_BALL;
    },

    dropToPlayer(dragonPosition, playerBallHolder, deskStation) {
        const destination = this.node.parent.convertToNodeSpaceAR(playerBallHolder.convertToWorldSpaceAR(cc.v2(0, 0)));
        this.ballSprite.node.opacity = 0;
        this.ballSpark.opacity = 0;
        this.hitGlow.opacity = 0;
        this.hitLight.opacity = 0;
        this.frontEff.opacity = 0;
        this._state = STATE.Dropping;
        const dropTime = 0.5;
        const sparkTime = 0.25;
        const zoomTime = 1;
        const stopTime = 0.5;
        const randomX = getRandomInt(-200, 200);
        const randomY = getRandomInt(-150, 150);
        const randomPos = cc.v2(randomX, randomY);
        this.node.setPosition(dragonPosition);
        this.ballSpark.runAction(cc.sequence(
            cc.fadeIn(sparkTime),
            cc.fadeOut(sparkTime),
        ));
        this.node.runAction(
            cc.sequence(
                cc.delayTime(sparkTime),
                cc.callFunc(() => {
                    this.frontEff.active = true;
                    this.frontEff.opacity = 255;
                    this.frontEff.scale = 0;
                    this.frontEff.runAction(cc.scaleTo(zoomTime, 1));
                    this.backEff.active = true;
                    this.backEff.opacity = 255;
                    this.backEff.scale = 0;
                    this.backEff.runAction(cc.scaleTo(zoomTime, 1));
                    this.backEff.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
                    if (this.kind > 2) {
                        this.fireEfx.active = true;
                        this.fireEfx.opacity = 255;
                        this.fireEfx.scale = 0;
                        this.fireEfx.runAction(cc.scaleTo(zoomTime, 2));
                        this.fireEfx.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
                    }
                }),
                cc.delayTime(zoomTime),
                cc.spawn(
                    cc.moveTo(stopTime, randomPos),
                    cc.callFunc(() => {
                        this.frontEff.runAction(cc.fadeOut(0.1));
                        this.ballSprite.node.runAction(cc.fadeIn(0.1));
                    }),
                ),
                cc.delayTime(stopTime),
                cc.spawn(
                    cc.moveTo(dropTime, destination),
                    cc.scaleTo(dropTime, this.baseScale),
                ),
                cc.callFunc(() => {
                    this.addToPlayer(playerBallHolder);
                    this._state = STATE.InTray;
                    Emitter.instance.emit(EventCode.DRAGON.DONE_BALL_DROP, deskStation);
                }),
            ),
        );
    },

    addToPlayer(playerBallHolder) {
        this.frontEff.opacity = 0;
        this.ballSprite.node.opacity = 255;
        this.node.scale = this.baseScale;
        this.node.parent = playerBallHolder;
        this.node.position = cc.v2(0, 0);
        this.backEff.opacity = 0;
        this.fireEfx.opacity = 0;
        this.hitGlow.scale = 3;
        this.hitGlow.runAction(cc.repeatForever(cc.sequence(
            cc.fadeIn(1),
            cc.fadeOut(1),
        )));
        this.hitLight.opacity = 255;
        this.hitLight.scale = 0;
        this.hitLight.runAction(cc.sequence(
            cc.scaleTo(0.15, 4),
            cc.fadeOut(0.15),
        ));
    },

    playGlowEffect() {
        if (this.backEff.active) this.backEff.active = false;
        this.frontEff.active = true;
        this.frontEff.opacity = 0;
        this.frontEff.runAction(cc.sequence(
            cc.fadeIn(0.25),
            cc.delayTime(0.15),
            cc.callFunc(() => {
                this.frontEff.runAction(cc.repeatForever(cc.sequence(
                    cc.scaleTo(0.15, 1.1),
                    cc.scaleTo(0.15, 1),
                )));
            }),
        ));
    },

    playLightEffect() {
        if (this.frontEff.active) this.stopGlowEffect();
        this.backEff.active = true;
        this.backEff.opacity = 0;
        this.backEff.runAction(cc.sequence(
            cc.fadeIn(0.25),
            cc.callFunc(() => {
                this.backEff.runAction(cc.repeatForever(
                    cc.spawn(
                        cc.sequence(
                            cc.scaleTo(0.25, 0.9),
                            cc.scaleTo(0.25, 1.05),
                        ),
                        cc.rotateBy(0.5, -90),
                    ),
                ));
            }),
        ));
    },

    stopGlowEffect() {
        this.frontEff.stopAllActions();
        this.frontEff.scale = 1;
        this.frontEff.runAction(cc.sequence(
            cc.fadeOut(0.25),
            cc.callFunc(() => {
                this.frontEff.active = false;
            }),
        ));
    },

    moveToJackpotStar({ delay, position }) {
        this._state = STATE.InJackpotStar;
        this.playGlowEffect();
        cc.tween(this.node)
            .delay(delay)
            .to(1, { position, scale: 1 })
            .delay(0.25)
            .call(() => {
                this.playLightEffect();
            })
            .start();
    },

    flyAway(flyTime = 1) {
        const rand = randRange(10, 14) / 10;
        this.node.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(flyTime * rand, this.node.x * 15, this.node.y * 15),
                cc.scaleTo(flyTime * rand, 5),
            ),
            cc.callFunc(() => {
                this.returnPool();
            }),
        ));
    },

    moveToBigWinEffect({ ballIndex, position, playerIndex }) {
        const flyTime = 0.5;
        const delayEach = 0.2;
        this.node.runAction(cc.sequence(
            cc.delayTime(ballIndex * delayEach),
            cc.spawn(
                cc.moveTo(flyTime, position),
                cc.scaleTo(flyTime, 1),
            ),
            cc.callFunc(() => {
                Emitter.instance.emit(EventCode.SOUND.DRAGON_BALL_HIDE);
            }),
            cc.scaleTo(flyTime, 0),
            cc.callFunc(() => {
                Emitter.instance.emit(EventCode.DRAGON.BALL_ENTER_BIGWIN_WHEEL, playerIndex);
            }),
            cc.callFunc(() => {
                this.returnPool();
            }),
        ));
    },

    isDropping() {
        return this._state == STATE.Dropping;
    },

    isInJackpotStar() {
        return this._state == STATE.InJackpotStar;
    },

    unuse() {
        this._super();
        this._state = STATE.Invalid;
        this.ballSprite.node.stopAllActions();
        this.backEff.stopAllActions();
        this.frontEff.stopAllActions();
        this.ballSpark.stopAllActions();
        this.hitGlow.stopAllActions();
        this.hitLight.stopAllActions();
        this.fireEfx.stopAllActions();
    },
});
