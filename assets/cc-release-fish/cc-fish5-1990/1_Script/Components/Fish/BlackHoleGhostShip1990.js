

const { registerEvent, removeEvents, findIntersection, findPointOnLineByRatio } = require('gfUtilities');
const EventCode = require("EventsCode1990");
const Emitter = require('gfEventEmitter');
const FishManager = require("gfFishManager");
const ReferenceManager = require('gfReferenceManager');
const { getPostionInOtherNode, getRandomInt } = require('utils');
const SMALL_FISH_AVAILABLE = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const BIG_FISH_UNAVAILABLE = [33, 44, 45];
cc.Class({
    extends: cc.Component,

    properties: {
        _listSmallFishEnter: [],
        _listBigFishEnter: [],
        _isOpenSail: false,
        _isFollowTarget: {
            default: null,
        },
        spHole: sp.Skeleton,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initEvents();
        this.resetOnExit();
    },

    initEvents() {
        registerEvent(EventCode.GAME_LAYER.UPDATE_SIZE_BLACK_HOLE, this.updateSizeBlackHole, this);
        registerEvent(EventCode.GAME_LAYER.STOP_FOLLOW_GHOST_SHIP, this.stopFollow, this);
        registerEvent(EventCode.GAME_LAYER.START_FOLLOW_GHOST_SHIP, this.startFollow, this);
        registerEvent(EventCode.GAME_LAYER.OPEN_SAIL_GHOST_SHIP, this.openSail, this);
        registerEvent(EventCode.GAME_LAYER.CLOSE_SAIL_GHOST_SHIP, this.closeSail, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
    },

    startFollow({ fishID }) {
        this._targetFishID = fishID;
        const fish = FishManager.instance.getFishById(this._targetFishID);
        if (fish && !fish.checkDie()) {
            this.node.active = true;
            this._isFollowTarget = true;
            this._calculatorInfo();
        } else {
            this.resetOnExit();
        }
    },

    stopFollow() {
        this.resetOnExit();
    },

    openSail({ fishID, isPlayAnim }) {
        if (!this._isFollowTarget) {
            cc.warn("GHOST SHIP: openSail without target");
            this.startFollow({ fishID });
        }
        this._listSmallFishEnter = [];
        this._listBigFishEnter = [];
        const fish = FishManager.instance.getFishById(this._targetFishID);
        if (fish && !fish.checkDie()) {
            this.spHole.enabled = true;
            Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BLACK_HOLE);
            if (isPlayAnim) {
                this.node.scale = 0;
                this._isPlaying = true;
                this._isOpenSail = true;
                this.node.runAction(cc.sequence(
                    //cc.delayTime(0.6),
                    cc.scaleTo(0.6, fish.node.scaleX),
                    cc.callFunc(() => {
                        this._isPlaying = false;
                    })
                ));
            } else {
                this._isOpenSail = true;
                this.node.scale = fish.node.scaleX;
            }
        } else {
            this.resetOnExit();
        }


    },

    closeSail({ fishID, isPlayAnim }) {
        if (!this._isFollowTarget) {
            cc.warn("GHOST SHIP: closeSail without target");
            this.startFollow({ fishID });
        }

        // Effect close sail
        this._listSmallFishEnter = [];
        const fish = FishManager.instance.getFishById(this._targetFishID);
        if (fish && !fish.checkDie()) {
            Emitter.instance.emit(EventCode.SOUND.STOP_SOUND_BLACK_HOLE);
            if (isPlayAnim) {
                this.node.scale = fish.node.scaleX;
                this._isPlaying = true;
                this.node.runAction(cc.sequence(
                    cc.delayTime(0.4),
                    cc.scaleTo(0.6, 0, 0),
                    cc.callFunc(() => {
                        this._isOpenSail = false;
                        this._isPlaying = false;
                        this.spHole.enabled = false;
                    })
                ));
            } else {
                this._isOpenSail = false;
                this.spHole.enabled = false;
            }
        } else {
            this.resetOnExit();
        }

        // Reset speed for all Big fish
        this._listBigFishEnter.forEach((fishID) => {
            const fish = FishManager.instance.getFishById(fishID);
            if (fish && !fish.checkDie()) {
                fish.onFreezeStop();
                fish.updateMoveAction();
            }
        });
        this._listBigFishEnter.length = 0;
    },

    onCollisionEnter(other) {
        if (!this._isOpenSail) return;
        //  Bullet enter Hole
        const bullet = other.getComponent("gfBullet");
        if (bullet && bullet.isAvailable() && !bullet.isFake()) {
            bullet.setEnterHole({ isEnter: true, fishID: this._targetFishID });
            bullet.node.stopAllActions();
            const ghostShipPos = getPostionInOtherNode(ReferenceManager.instance.getNodeFishLayer(), this.node);
            const bulletPos = bullet.getPosition();
            const bulletAngle = bullet.getAngle();
            const bulletVectorX = Math.cos(cc.misc.degreesToRadians(bulletAngle));
            const bulletVectorY = Math.sin(cc.misc.degreesToRadians(bulletAngle));
            const lastBulletPos = cc.v2(bulletPos.x - bulletVectorX, bulletPos.y - bulletVectorY);
            const intersectionPos = findIntersection(ghostShipPos, cc.v2(ghostShipPos.x - 10, ghostShipPos.y), bulletPos, lastBulletPos);
            if (intersectionPos.x > ghostShipPos.x && (intersectionPos.x - ghostShipPos.x) > 350) {
                intersectionPos.x = ghostShipPos.x + 250;
            }

            if (intersectionPos.x < ghostShipPos.x && (ghostShipPos.x - intersectionPos.x) > 350) {
                intersectionPos.x = ghostShipPos.x - 250;
            }
            const actionMove = this.randomBenzierBullet(bulletPos, ghostShipPos, intersectionPos, 1.5);
            bullet.node.runAction(
                cc.sequence(
                    cc.spawn(
                        actionMove,
                        cc.sequence(
                            cc.delayTime(0.4),
                            cc.spawn(
                                cc.scaleTo(0.5, 0.3, 0.3),
                                cc.fadeTo(0.5, 100, 100)
                            )
                        ),
                    ),
                    cc.callFunc(() => { bullet.onDie(); })
                )
            );
        }

        // Fish enter Hole
        const fish = other.getComponent("gfBaseFish");
        if (fish && !fish.checkDie() && !fish.checkFishGroup()) {
            const fishID = fish.getId();
            const fishKind = fish.getKind();
            // Small fish enter
            if (SMALL_FISH_AVAILABLE.includes(fishKind) && !this._listSmallFishEnter.includes(fishID)) {
                this._listSmallFishEnter.push(fishID);
                const posEnd = getPostionInOtherNode(ReferenceManager.instance.getNodeFishLayer(), this.node);
                fish.node.stopAllActions();
                fish.resetColor();
                const actionMove = this.randomBenzierFish(fish.node.position, posEnd, 2);
                fish.node.runAction(
                    cc.spawn(
                        actionMove,
                        cc.sequence(
                            cc.delayTime(0.5),
                            cc.spawn(
                                cc.scaleTo(1, 0.4, 0.4),
                                cc.fadeTo(1, 100, 100)
                            )
                        ),
                        cc.sequence(
                            cc.delayTime(1.5),
                            cc.callFunc(() => { fish.onDie(); })
                        )
                    )
                );
            }
            // Big fish enter
            if (!SMALL_FISH_AVAILABLE.includes(fishKind) && !BIG_FISH_UNAVAILABLE.includes(fishKind) && !this._listBigFishEnter.includes(fishID)) {
                this._listBigFishEnter.push(fishID);
                fish.onFreezed();
            }
        }
    },

    onCollisionExit(other) {
        const fish = other.getComponent("gfBaseFish");
        if (fish && !fish.checkDie() && !fish.checkFishGroup()) {
            const fishIndex = this._listBigFishEnter.indexOf(fish.getId());
            if (fishIndex != -1) {
                this._listBigFishEnter.splice(fishIndex, 1);
                fish.onFreezeStop();
                fish.updateMoveAction();

            }
        }
    },

    updateSizeBlackHole({ size, isPlayAnim }) {
        if (isPlayAnim && this.node.active && !this._isPlaying && this._isOpenSail) {
            this.node.runAction(cc.scaleTo(0.2, size));
        }
    },

    _calculatorInfo() {
        const fish = FishManager.instance.getFishById(this._targetFishID);
        if (fish && !fish.checkDie()) {
            const fishPos = fish.getLockPositionByNodeSpace(this.node.parent);
            if (!fishPos) return;
            this.lastPos = fishPos;
            this.node.setPosition(fishPos);
        }
    },

    update() {
        if (!this._isFollowTarget) {
            this.node.active = false;
        } else {
            this._calculatorInfo();
        }
    },

    randomBenzierFish(beganPos, endPos, time) {
        const midPos = cc.v2(endPos.x, beganPos.y + (beganPos.y - endPos.y) * (getRandomInt(1, 4) / 10));
        const bezierConfig = [
            beganPos,
            midPos,
            endPos,
        ];
        return cc.bezierTo(time, bezierConfig);
    },

    randomBenzierBullet(beganPos, endPos, intersectionPos, time) {
        const point1 = findPointOnLineByRatio(intersectionPos, beganPos, 0.5);
        const point2 = findPointOnLineByRatio(endPos, intersectionPos, 0.5);
        const bezierConfig = [
            point1,
            point2,
            endPos,
        ];
        return cc.bezierTo(time, bezierConfig);
    },


    resetOnExit() {
        this.spHole.active = false;
        this._listSmallFishEnter = [];
        this._listBigFishEnter = [];
        this._isPlaying = false;
        this._isFollowTarget = false;
        this._targetFishID = null;
        this.node.stopAllActions();
        this.node.active = false;
        this.node.scale = 0;

    },

    onDestroy() {
        removeEvents(this);
    },
});
