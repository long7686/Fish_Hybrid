const { getRandomInt } = require('utils');
const DataStore = require('gfDataStore');
const { v2Distance } = require("gfUtilities");
const SPEED_WOUNDED = 3;
const TIME_KEEPING_STATE_WOUNDED = 0.6;

cc.Class({
    extends: require("gfSpriteFish"),

    properties: {
        luckyEffect: {
            default: null,
            visible: false,
            override: true
        },
        iceEffect: {
            default: null,
            visible: false,
            override: true
        },
        lightingEffect: {
            default: null,
            type: sp.Skeleton
        },
        hitLightingEffect: {
            default: null,
            type: sp.Skeleton
        },
        _isHaveWounded: false,
        _tweenHitAction: null
    },

    initAssets(config) {
        this._super(config);
        this._isHaveWounded = config.haveWounded;
        this.node.stop = this.stop.bind(this);
        this.node.onHitLighting = this.onHitLighting.bind(this);

        this.lightingEffect = this.node.getChildByName('Lighting').getComponent(sp.Skeleton);
        this.hitLightingEffect = this.node.getChildByName('HitLighting').getComponent(sp.Skeleton);
    },
    initFishData(data){
        if (this.hitLightingEffect) {
            this.hitLightingEffect.node.active = false;
        }

        if (this.lightingEffect) {
            this.lightingEffect.node.active = false;
        }

        this._super(data);
    },

    onHit(data) {
        if (data) {
            this.triggerHit(data);
        }
        this.applyHitColor();
        cc.tween(this.node)
            .delay(0.1)
            .call(() => {
                this.resetColor();
            })
            .start();
        if (this._isHaveWounded && (!this._tweenHitAction || this._tweenHitAction.isDone())) {
            const timeNextWounded = getRandomInt(5, 10);
            this._tweenHitAction = cc.tween(this.node)
                .call(()=>{
                    this.changeAnimationSpeed(SPEED_WOUNDED);
                })
                .delay(TIME_KEEPING_STATE_WOUNDED)
                .call(()=>{
                    this.resetAnimationSpeed();
                })
                .delay(timeNextWounded);
            this._tweenHitAction.start();
        }
    },

    onCatch(data) {
        if(this._tweenHitAction && !this._tweenHitAction.isDone()){
            this._tweenHitAction.stop();
        }
        this._super(data);
    },

    unuse() {
        this._super();
        if(this._tweenHitAction && !this._tweenHitAction.isDone()){
            this._tweenHitAction.stop();
            this._tweenHitAction = null;
        }
        if (this.hitLightingEffect) {
            this.hitLightingEffect.node.active = false;
            this.hitLightingEffect.setCompleteListener(() => {
            });
        }

        if (this.lightingEffect) {
            this.lightingEffect.node.active = false;
        }
    },

    stop() {
        this.node.stopAllActions();
        this.changeAnimationSpeed(6);
    },

    bolt() {
        if(this.lightingEffect){
            this.lightingEffect.node.setPosition(this._targetPoint);
            this.lightingEffect.node.active = true;
            this.lightingEffect.node.setScale(Math.min(this.fishAnim.node.width / this.lightingEffect.node.width, 1));
        }
    },

    onHitLighting(angle) {
        if(this.hitLightingEffect) {
            this.hitLightingEffect.node.active = false;
            this.hitLightingEffect.node.active = true;
            this.hitLightingEffect.node.angle = angle;
            if(this.hitLightingEffect._skeletonCache === null){
                this.hitLightingEffect.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
            }

            this.hitLightingEffect.setAnimation(0, 'animation', false);
            this.hitLightingEffect.setCompleteListener(() => {
                this.bolt();
            });
        }
    },


    onFreezed() {
        if (!this._isFreezed) {
            this._isFreezed = true;
            if (this.moveAction) {
                this.moveAction.speed(0.5);
            }
            this.changeAnimationSpeed(0.5);
        }
    },

    updateMoveAction() {
        if(!this._points) return;
        if (this._points.length === 2) {
            const listAction = [];
            this.node.stopAction(this.moveAction);
            this._timeLost = Math.max(0, (DataStore.instance.getTime() - this._buildTick) / 1000);
            const currentPos = this.node.getPosition();
            const p2 = cc.v2(this._points[1].PosX, this._points[1].PosY);
            this._moveTime = v2Distance(currentPos, p2) / this.speed;
            listAction.push(cc.moveTo(this._moveTime, p2));
            listAction.push(cc.callFunc(() => { this.onDie(); }));
            this.moveAction = cc.sequence(listAction);
            this.node.runAction(this.moveAction);
        } else if (this._points.length === 3) {
            // speed up moveAction by onFreezeStop
        }

    },

    onFreezeStop() {
        if(this._isFreezed) {
            this._isFreezed = false;
            if (this.moveAction) {
                this.moveAction.speed(2.2);
            }
            this.changeAnimationSpeed(2);
        }
    },

    applyIcedColor() {
    },


});
