

const {v2Distance, getRotation, registerEvent, removeEvents} = require('gfUtilities');
const {getPostionInOtherNode} = require("utils");
const EventCode = require("gfBaseEvents");
cc.Class({
    extends: cc.Component,

    properties: {
        iconTarget: {
            default: null,
            type: sp.Skeleton
        },
        iconDot: {
            default: null,
            type: cc.Sprite
        },
        _isFollowTarget: {
            default: null,
        },
        _animAimName: "aim"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._targetFish = null;
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.PLAYER_LAYER.STOP_LOCK_FISH, this.stopFollow, this);
        registerEvent(EventCode.PLAYER_LAYER.START_LOCK_FISH, this.startFollow, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
    },

    stopFollow() {
        this._isFollowTarget = false;
    },

    startFollow(fish, nodeGun) {
        if (this._canPlayeffect) {
            this._canPlayeffect = false;
            this.iconTarget.setAnimation(0, this._animAimName, false);
        }
        this.node.active = true;
        this._isFollowTarget = true;
        this._targetFish = fish;
        this._startPos = getPostionInOtherNode(this.node, nodeGun);
        this._nodeGun = nodeGun;
        this._calculatorInfo();
    },

    _calculatorInfo() {
        const endPos = this._targetFish.getLockPositionByNodeSpace(this.node);
        if(!endPos) return;
        const distance = v2Distance(this._startPos, endPos);
        this.iconDot.node.setPosition(this._startPos);
        this.iconDot.node.width = distance;
        this.iconDot.node.angle = getRotation(endPos, this._startPos);
        this.iconTarget.node.setPosition(endPos);
    },

    resetOnExit() {
        this._isFollowTarget = false;
        this._targetFish = null;
        this.node.active = false;
    },

   

    update() {
        if (!this._isFollowTarget) {
            this.node.active = false;
            this._canPlayeffect = true;
        } else if (this._targetFish && !this._targetFish._isOutScreen && !this._targetFish.checkDie()) {
            this._calculatorInfo();
        }
    },

    onDestroy() {
        removeEvents(this);
    },
});
