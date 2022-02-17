const EventCode = require("EventsCode1990");
const {registerEvent, removeEvents, getRotation, v2Distance} = require("gfUtilities");
const {getPostionInOtherNode, getRandomInt} = require("utils");
const FishManager = require('gfFishManager');

cc.Class({
    extends: cc.Component,
    properties: {
        spine: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.node.playEffectLight = this.playEffectLight.bind(this);
        this.node.reset = this.reset.bind(this);
        this.node.getTimeMove = this.getTimeMove.bind(this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.reset, this);
    },

    playEffectLight(infoTargetFrom, infoTargetTo, callBack, isDie = true, isFishDead = false) {
        this.callBack = callBack;
        this.node.active = true;
        if (infoTargetFrom != null) {
            if (!FishManager.instance.getFishById(infoTargetFrom.getId())) {
                this.reset();
                if (typeof this.callBack === 'function')
                    this.callBack();
                return;
            }
            const startPoint = infoTargetFrom.getLockPositionByNodeSpace(this.node.parent);
            this.node.setPosition(startPoint);
        }

        const timeMove = this._playAnimationLightingChain(infoTargetTo, isDie, isFishDead);

        return timeMove;

    },

    _playAnimationLightingChain(infoTargetTo, isDie, isFishDead = false) {
        const data = this._calculateInfo(infoTargetTo);
        if(!data) {
            if (typeof this.callBack === 'function'){
                this.callBack();
            }
            return;
        }
        const {timeMove, angle, point, size, endPos} = data;
        this.node.angle = angle;
        this.spine.scaleY = 0;
        if (data && point) {
            let duration = this.spine.getComponent(sp.Skeleton).findAnimation('animation').duration;
            let dt = getRandomInt(0, duration * 10) / 10;
            this.spine.getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
            this.spine.getComponent(sp.Skeleton).timeScale = size;
            cc.sys.isNative ? this.spine.getComponent(sp.Skeleton)._updateRealtime(dt) : this.spine.getComponent(sp.Skeleton).update(dt);

            this.spine.runAction(
                cc.sequence(
                    cc.scaleTo(timeMove, 0.5, size),
                    cc.callFunc(() => {
                        if (isDie && infoTargetTo && (!infoTargetTo.checkDie() || isFishDead) && infoTargetTo.stop){
                            infoTargetTo.stop();
                        }
                        if (infoTargetTo && infoTargetTo.onHitLighting){
                            infoTargetTo.onHitLighting(angle);
                        }
                        this.node.scaleY = -1;
                        this.node.setPosition(endPos);
                        this.spine.runAction(
                            cc.sequence(
                                cc.delayTime(0.4),
                                cc.callFunc(() => {
                                    this.spine.getComponent(sp.Skeleton).setAnimation(0, 'disappear', false);
                                    let dt = getRandomInt(10, 20) * 0.1;
                                    this.spine.getComponent(sp.Skeleton).timeScale = dt;

                                    this.spine.getComponent(sp.Skeleton).setCompleteListener(() => {
                                        this.spine.removeFromParent(true);
                                        this.spine.destroy();

                                        this.node.removeFromParent(true);
                                        this.node.destroy();
                                    });
                                })
                            )
                        );

                        if (typeof this.callBack === 'function'){
                            this.callBack();
                        }
                    })
                )
            );
        } else {
            if (typeof this.callBack === 'function')
                this.callBack();
        }

        return timeMove;

    },

    _calculateInfo(infoTargetTo) {
        if (this.node.parent === null || !FishManager.instance.getFishById(infoTargetTo.getId())) {
            cc.log("LightingChain - invalid fish");
            this.reset();
            if (typeof this.callBack === 'function')
                this.callBack();
            return;
        }
        const endPos = infoTargetTo.getLockPositionByNodeSpace(this.node.parent);
        const startPos = this.node.getPosition();

        const distance = v2Distance(this.node.convertToWorldSpaceAR(cc.v2(0, 0)), endPos);
        const point = getPostionInOtherNode(this.node.parent, infoTargetTo.node);
        // const point = getPostionInOtherNode(this.node.parent, infoTargetTo.node);
        const angle = getRotation(endPos, startPos) - 90;

        const size = distance / 330;

        const timeMove = distance / 3000;

        return {timeMove, angle, point, size, endPos};

    },

    getTimeMove(infoTargetFrom, infoTargetTo){
        if (infoTargetFrom != null) {
            if(!FishManager.instance.getFishById(infoTargetFrom.getId())) {
                this.reset();
                if (typeof this.callBack === 'function')
                    this.callBack();
                return;
            }
            const startPoint = infoTargetFrom.getLockPositionByNodeSpace(this.node.parent);
            this.node.setPosition(startPoint);
        }
        const data = this._calculateInfo(infoTargetTo);
        let timeMove = (data && (data.timeMove + 0.4)) || 1;
        return timeMove;

    },

    reset() {
        if (this.node) {
            this.node.stopAllActions();
            this.spine.stopAllActions();
            this.node.removeFromParent(true);
            this.node.destroy();
        }

    },

    onDestroy() {
        removeEvents(this);
    }


});

