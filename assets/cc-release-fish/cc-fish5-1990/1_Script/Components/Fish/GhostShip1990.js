

const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");
const { v2Distance, getPointBetweenTwoPointByPercent } = require("gfUtilities");
const DataStore = require('gfDataStore');
const SPEED = {
    Normal: 38.5,
    Slow: 26.95
};
const ANIMATION_NAME = {
    IdleNoSail: "1 idle_nosail",
    IdleSail: "3 idle_sail",
    CloseSail: "4 closed_sail",
    OpenSail: "2 open_sail",
};

const ACTION_TAG = {
    MOVE: "MOVE_ACTION",
    SAIL: "SAIL_ACTION",
};
const TIME_CONFIG = [15, 5, 15, 5, 15, 5, 15, 5, 15, 5];
cc.Class({
    extends: require('gfBaseFish'),

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
        goldEffect: cc.Node,
        fishAnim: sp.Skeleton,
    },

    onLoad() {
        this.node.active = false;
        this.fishAnim.enableBatch = false;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
        this.listBox = this.getComponents(cc.BoxCollider);
        //Set mix all animation
        let arrAnimation = Object.keys(ANIMATION_NAME);
        for (let i = 0; i < arrAnimation.length; ++i) {
            for (let j = i + 1; j < arrAnimation.length; j++) {
                if (this.fishAnim.findAnimation(ANIMATION_NAME[arrAnimation[i]]) && this.fishAnim.findAnimation(ANIMATION_NAME[arrAnimation[j]])) {
                    this.fishAnim.setMix(ANIMATION_NAME[arrAnimation[i]], ANIMATION_NAME[arrAnimation[j]], 0.3);
                }
            }
        }
    },

    initFishData(data) {
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
        this.node.active = true;
        this._initialized = true;
        this._maxWidth = this.node.getComponent(cc.BoxCollider).size.width * this.node.scaleX;
        this._offsetX = this.node.getComponent(cc.BoxCollider).offset.x * this.node.scaleX;
        this._FishID = data.FishID;
        this._FishKind = data.FishKind;
        this._isFishGroup = false;
        this._multiplier = data.multiplier || 1;
        this._isDie = false;
        this._skipRotate = false;
        this._buildTick = data.BuildTick;
        this._buildTickUpSpeed = data.GhostShipSpeedUpBuildtick;
        this._timeLost = Math.max(0, (DataStore.instance.getTime() - this._buildTick) / 1000);
        this._speed = data.GhostShipState > 6 ? SPEED.Slow : SPEED.Normal;
        this._level = data.GhostShipState != null ? data.GhostShipState : 1;
        this.updateUI();
        this.updateMoveAction(data.Position, data.isResume);
        this._mainMaterial = this.getMainMaterial();
        this.node.zIndex = 500;
        this._targetPoint = cc.v2(0, 0);
    },


    updateUI(){
        this.scheduleOnce(this.updateAnimSail, 0.1);
        const desScale = 1 + 0.02 * (this._level - 1);
        this.node.scale = desScale;
        this.fishAnim.setSkin("gold" + this._level);
        this.goldEffect.active = this._level > 6;
    },

    updateMoveAction(points, isResume) {
        this.convertFishCoordinateSystem(points);
        this._points = points;
        this.node.stopAllActions();
        const p1 = cc.v2(points[0].PosX, points[0].PosY);
        const p2 = cc.v2(points[1].PosX, points[1].PosY);
        if (this._buildTickUpSpeed && isResume) {
            let moveTime = v2Distance(p1, p2) / SPEED.Normal;
            let posUpSpeed = getPointBetweenTwoPointByPercent(p1, p2, ((this._buildTickUpSpeed - this._buildTick) / 1000) / moveTime);
            moveTime = v2Distance(posUpSpeed, p2) / SPEED.Slow;
            let timeUpdatedSpeed = Math.max(0, (DataStore.instance.getTime() - this._buildTickUpSpeed) / 1000);
            let currentPos = getPointBetweenTwoPointByPercent(posUpSpeed, p2, timeUpdatedSpeed / moveTime);
            moveTime = Math.max(moveTime - timeUpdatedSpeed, 0);
            this.node.setPosition(currentPos);
            this.moveAction = cc.sequence(
                cc.moveTo(moveTime, p2),
                cc.callFunc(() => { this.onDie(); })
            );
        } else {
            let moveTime = v2Distance(p1, p2) / this._speed;
            this.node.setPosition(isResume ? getPointBetweenTwoPointByPercent(p1, p2, this._timeLost / moveTime) : p1);
            moveTime = Math.max(moveTime - this._timeLost, 0);
            this.moveAction = cc.sequence(
                cc.moveTo(moveTime, p2),
                cc.callFunc(() => { this.onDie(); })
            );
        }
        const action = this.node.runAction(this.moveAction);
        action.setTag(ACTION_TAG.MOVE);
    },

    updateAnimSail() {
        Emitter.instance.emit(EventCode.GAME_LAYER.START_FOLLOW_GHOST_SHIP, { fishID: this._FishID});
        let totalTimeConfig = 0;
        const listAnimAction = [];
        TIME_CONFIG.forEach((time, index) => {
            totalTimeConfig = totalTimeConfig + time;
            if (this._timeLost < totalTimeConfig) {
                const isOpenSail = index % 2 == 0 ? false : true;
                if (listAnimAction.length == 0) {
                    this.fishAnim.setAnimation(0, isOpenSail ? ANIMATION_NAME.IdleSail : ANIMATION_NAME.IdleNoSail, true);
                    this.isOpenSail = isOpenSail;
                    if (isOpenSail) {
                        Emitter.instance.emit(EventCode.GAME_LAYER.OPEN_SAIL_GHOST_SHIP, { fishID: this._FishID, isPlayAnim: false});
                    } else {
                        Emitter.instance.emit(EventCode.GAME_LAYER.CLOSE_SAIL_GHOST_SHIP, { fishID: this._FishID, isPlayAnim: false});
                    }

                }
                listAnimAction.push(cc.callFunc(() => { this.updateSail(isOpenSail); }));
                const timeDelay = ((totalTimeConfig - this._timeLost) <= time) ? (totalTimeConfig - this._timeLost) : time;
                listAnimAction.push(cc.delayTime(timeDelay));
            }
        });
        if (listAnimAction.length > 0) {
            const action = this.node.runAction(cc.sequence(listAnimAction));
            action.setTag(ACTION_TAG.SAIL);

        }

    },

    updateSail(open = false) {
        if (this.isOpenSail == open) return;
        this.isOpenSail = open;
        if (this.isOpenSail) {
            this.fishAnim.setAnimation(0, ANIMATION_NAME.OpenSail, false);
            this.fishAnim.addAnimation(0, ANIMATION_NAME.IdleSail, true);
            Emitter.instance.emit(EventCode.SOUND.OPEN_SAIL_GHOST_SHIP);
            Emitter.instance.emit(EventCode.GAME_LAYER.OPEN_SAIL_GHOST_SHIP, { fishID: this._FishID, isPlayAnim: true });

        } else {
            this.fishAnim.setAnimation(0, ANIMATION_NAME.CloseSail, false);
            this.fishAnim.addAnimation(0, ANIMATION_NAME.IdleNoSail, true);
            Emitter.instance.emit(EventCode.SOUND.CLOSE_SAIL_GHOST_SHIP);
            Emitter.instance.emit(EventCode.GAME_LAYER.CLOSE_SAIL_GHOST_SHIP, { fishID: this._FishID, isPlayAnim: true });
        }
    },

    updateGhostShipStatus(data) {
        if (this.checkDie()) return;
        const { level, speedUpBuildtick } = data; // eslint-disable-line
        if (this._level != level) {
            this._level = level;
            const desScale = 1 + 0.02 * (this._level - 1);
            Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_SIZE_BLACK_HOLE, { size: desScale, isPlayAnim: true });
            this.fishAnim.clearTrack(1);
            this.fishAnim.setAnimation(1, "Change_Color", false);
            this.node.runAction(cc.scaleTo(0.4, desScale, this.node.scaleY > 0 ? desScale : -desScale).easing(cc.easeBounceOut()));             
            this.fishAnim.setSkin("gold" + this._level);
            this.goldEffect.active = this._level > 6;
            if (level == 7 ) { // slow down
                this._speed = SPEED.Slow;
                const p2 = cc.v2(this._points[1].PosX, this._points[1].PosY);
                this.node.stopActionByTag(ACTION_TAG.MOVE);
                let currentPos = this.node.getPosition();
                let moveTime = v2Distance(currentPos, p2) / this._speed;
                this.moveAction = cc.sequence(
                    cc.moveTo(moveTime, p2),
                    cc.callFunc(() => { this.onDie(); })
                );
                const action = this.node.runAction(this.moveAction);
                action.setTag(ACTION_TAG.MOVE);

            }
        }
    },


    onCatch(data) {
        Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_GHOST_SHIP, {
            listUserWin : data.ListUser,
            fishKind : this._FishKind,
            fishPos  : this.getLockPositionByWorldSpace(),
            userKill : data.DeskStation
        }); 
        this.node.stopAllActions();
        this._isDie = true;
        Emitter.instance.emit(EventCode.SOUND.GHOST_SHIP_EXPLOSION);
        this.node.runAction(cc.sequence(
            cc.fadeOut(0.5),
            cc.callFunc(()=> { this.onDie();})
        ));
        for( let i = 0 ; i < data.ListUser.length ; i++){
            Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_WALLET_OTHER_USER, data.ListUser[i]);
        }
        cc.warn("GHOST DIE", data);
    },

    update() {
        if (this._isDie || !this._initialized)
            return;
        this.updateAngle();
        this.updateOutScreen();
    },

    onHit() {
        if (this._mainMaterial) {
            this.fishAnim.node.color = cc.Color.WHITE;
            this._mainMaterial.setProperty('brightness', 0.2);
        }
        this.fishAnim.node.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(function () {
                if (this._mainMaterial) {
                    this.fishAnim.node.color = cc.Color.WHITE;
                    this._mainMaterial.setProperty('brightness', 0.0);
                }
            }.bind(this))
        ));
    },

    onDie() {
        this._isDie = true;
        Emitter.instance.emit(EventCode.GAME_LAYER.STOP_FOLLOW_GHOST_SHIP, { isPlayAnim: true });
        Emitter.instance.emit(EventCode.GAME_LAYER.REMOVE_FISH, this._FishID);
        if(cc.isValid(this.node)) {
            this.node.stopAllActions();
            this.node.destroy();
        } else {
            cc.warn("Clear invalid GhostShip!");
        }
    },


    onCollisionEnter(other) {
        const bullet = other.getComponent("gfBullet");
        if (bullet && bullet.isAvailable() && !bullet.isFake()) {
            bullet.onHit(this);
        }
    },
    checkOpenSail() {
        return this.isOpenSail;
    },

    getMainMaterial() {
        return this.fishAnim.getMaterial(0);
    },

    updateOutScreen() {
        const lastState = this._isOutScreen;
        this._super();
        if (lastState && !this._isOutScreen) {
            Emitter.instance.emit(EventCode.FISH_LAYER.BOSS_ON_GAME);
        }
    },
    checkOutScreen() { },
    onIced() { },
    returnPool() { }
});