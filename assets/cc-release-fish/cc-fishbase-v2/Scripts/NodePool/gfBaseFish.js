

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const {
    v2Distance, getRotation,
    rotateAngleByCoordinate, getPointBetweenTwoPointByPercent,
    isPointInScreen,
} = require("gfUtilities");
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const ReferenceManager = require('gfReferenceManager');
const gfMoveByThreePoints = require('gfMoveByThreePoints');

cc.Class({
    extends: require('gfNode'),

    properties: {
        _maxWidth: 0,
        _maxHeight: 0,
        _offsetX: 0,
        _offsetY: 0,
        _FishID: 0,
        _FishKind: 0,
        _buildTick: 0,
        _isFishGroup: false,
        _timeLost: 0,
        _multiplier: 1,
        _isDie: false,
        _isOutScreen: true,
        _HIT_COLOR: new cc.Color(230, 30, 30, 255),
        _ICE_COLOR: new cc.Color(0, 175, 255, 255),
        _skipRotate: false,
        _lastPos: null,
        _targetPoint: new cc.Vec2(0, 0),
        _hitTime: [],
        _isFreezed: false,
        _dataCatchFish: null,
        _moveOutAction: null,
        _skipFlipY: false,
        _visibleSize: new cc.Vec2(0, 0),
        luckyEffect: cc.Node,
        iceEffect: cc.Node,
    },

    initAssets(config) {
        this.speed = config.speed;
        this.FishMultiple = config.FishMultiple;
        this.setUpBoxColliders(config.BoxCollider);
        this.updateZIndex(config.zIndex);
        this._skipRotate = !!config.skipRotate;
        if (this.fishAnim && config.customAnimProp) {
            Object.assign(this.fishAnim.node, config.customAnimProp);
        }
        if (config.targetPoint) {
            this._targetPoint = config.targetPoint;
        }
        this.updateVisibleSize(config.visibleSize);
    },

    setUpBoxColliders(boxes) {
        const fishColliderBoxes = this.node.getComponents(cc.BoxCollider);
        for (let i = 0; i < fishColliderBoxes.length; ++i) {
            fishColliderBoxes[i].enabled = false;
        }
        if (boxes.constructor === Array) {
            boxes.forEach((configBox, i) => {
                let fishBox = fishColliderBoxes[i];
                if (!fishBox) {
                    fishBox = this.node.addComponent(cc.BoxCollider);
                }
                this.setBoxCollider(fishBox, configBox);
            });
        } else {
            this.setBoxCollider(fishColliderBoxes[0], boxes);
        }
    },

    updateVisibleSize(visibleSize) {
        this._maxWidth = this.node.getComponent(cc.BoxCollider).size.width * this.node.scaleX;
        this._maxHeight = this.node.getComponent(cc.BoxCollider).size.height * this.node.scaleY;
        this._offsetX = this.node.getComponent(cc.BoxCollider).offset.x * this.node.scaleX;
        this._offsetY = this.node.getComponent(cc.BoxCollider).offset.y * this.node.scaleY;

        if(visibleSize) {
            this._visibleSize = visibleSize;
        } else {
            const x = this._maxWidth + this._offsetX + 300;
            const y = this._maxHeight + this._offsetY + 300;
            this._visibleSize = cc.v2(x, y);
        }
    },

    setBoxCollider(box, config) {
        box.enabled = true;
        box.offset.x = config.x;
        box.offset.y = config.y;
        box.size.width = config.width;
        box.size.height = config.height;
    },

    initFishData(data) {
        this._FishID = data.FishID;
        this._FishKind = data.FishKind;
        this._isFishGroup = !!data.isFishGroup;
        this._skipFlipY = (data.skipFlipY) ? data.skipFlipY : false;
        this._isDie = false;
        this._moveOutAction = data.moveOutAction;
        this.initLuckyEffect(data.multiplier);
        this.initIceEffect(data.TimeRemainFreeze);
        this.updateZIndex(data.zIndex);
        if (data.Position) {
            this._buildTick = data.BuildTick;
            this._timeLost = Math.max(0, (DataStore.instance.getTime() - this._buildTick) / 1000);
            this.moveByPoints(data.Position, data.isResume);
        }
    },

    moveByPoints(points, isResume) {
        const listAction = [];
        let moveTime = 0;
        this.convertFishCoordinateSystem(points);
        this._points = points;
        const p1 = cc.v2(points[0].PosX, points[0].PosY);
        const p2 = cc.v2(points[1].PosX, points[1].PosY);
        if (points.length === 2) {
            moveTime = v2Distance(p1, p2) / this.speed;
            this.node.setPosition(isResume ? getPointBetweenTwoPointByPercent(p1, p2, this._timeLost / moveTime) : p1);
            moveTime = Math.max(moveTime - this._timeLost, 0);
            listAction.push(cc.moveTo(moveTime, p2));
        } else if (points.length === 3) {
            const p3 = cc.v2(points[2].PosX, points[2].PosY);
            this.node.setPosition(p1);
            const config = {
                speed : this.speed,
                points: [p1,p2,p3],
                timeSpent: this._timeLost,
                isResume: isResume
            };
            listAction.push(gfMoveByThreePoints(config));
        }
        listAction.push(cc.callFunc(() => { this.onDie(); }));
        this.moveAction = cc.sequence(listAction);
        this.node.runAction(this.moveAction);
    },

    update() {
        if (this._isDie) { return; }

        if (this._isFreezed) {
            const now = DataStore.instance.getTime();
            if (now - this.freezedTime >= this._TimeRemainFreeze) {
                this.onFreezeStop();
            }
        }
        this.updateAngle();
        this.updateOutScreen();
    },

    updateAngle() {
        if (this._lastPos) {
            const curP = this.node.getPosition();
            const baseScaleX = Math.abs(this.node.scaleX);
            if (this._lastPos.x !== curP.x || this._lastPos.y !== curP.y) {
                if (this._skipRotate) {
                    this.node.scaleX = this._lastPos.x > curP.x ? -baseScaleX : baseScaleX;
                } else {
                    const angle = getRotation(curP, this._lastPos);
                    this.updateFlipY(angle);
                    this.node.angle = angle;
                }
            }
        }
        this._lastPos = this.node.getPosition();
    },

    updateFlipY(angle) {
        if(this._skipFlipY) return;
        const baseScaleY = Math.abs(this.node.scaleY);
        this.node.scaleY = angle > 90 || angle < -90 ? -baseScaleY : baseScaleY;
    },

    updateOutScreen() {
        if(isPointInScreen(this.node.getPosition())) {
            this._isOutScreen = false;
            this.node.opacity = 255;
        } else {
            const wLeftCenter = this.convertToRelativePoint(cc.v2(- this._maxWidth / 2 + this._offsetX, 0));
            const wRightCenter = this.convertToRelativePoint(cc.v2(this._maxWidth / 2 + this._offsetX, 0));
            this._isOutScreen = !(isPointInScreen(wLeftCenter) || isPointInScreen(wRightCenter));
            if(this._isOutScreen) {
                this.updateOpacity();
            } else {
                this.node.opacity = 255;
            }
        }
    },

    convertToRelativePoint(point) {
        const radian = cc.misc.degreesToRadians(this.node.angle);
        const x = this.node.x + point.x * Math.cos(radian) - point.y * Math.sin(radian);
        const y = this.node.y + point.x * Math.sin(radian) + point.y * Math.cos(radian);
        return cc.v2(x, y);
    },
    
    updateOpacity(){
        if (this._isDie) return;
        const leftPoint = cc.v2(- this._visibleSize.x / 2, 0);
        const rightPoint = cc.v2( this._visibleSize.x / 2, 0);
        const wLeftCenter = this.convertToRelativePoint(leftPoint);
        const wRightCenter = this.convertToRelativePoint(rightPoint);
        const outScreen = !(isPointInScreen(wLeftCenter) || isPointInScreen(wRightCenter));
        this.node.opacity = outScreen ? 0 : 255;
    },

    updateZIndex(zIndex) {
        if(zIndex != undefined) {
            this.node.zIndex = zIndex;
        }
    },

    onDie() {
        this._isDie = true;
        Emitter.instance.emit(EventCode.GAME_LAYER.REMOVE_FISH, this._FishID);
        this.returnPool();
    },

    initLuckyEffect(multiplier = 1) {
        this._multiplier = multiplier;
        if (this.luckyEffect) {
            this.luckyEffect.active = this._multiplier > 1;
            this.luckyEffect.scale = Math.min(2, this.node.getComponent(cc.BoxCollider).size.width / 50);
        }
    },

    initIceEffect(TimeRemainFreeze) {
        if (this.iceEffect) {
            this.iceEffect.active = TimeRemainFreeze && TimeRemainFreeze > 0;
            if (this.iceEffect.active) {
                this.onFreezed(TimeRemainFreeze);
            }
            this.iceEffect.scale = Math.min(1.5, this.node.getComponent(cc.BoxCollider).size.height / 80);
        }
    },

    resetColor() {
        this.fishAnim.node.color = cc.Color.WHITE;
    },

    applyHitColor() {
        this.fishAnim.node.color = this._HIT_COLOR;
    },

    applyIcedColor() {
        this.fishAnim.node.color = this._ICE_COLOR;
    },

    onHit(data) {
        if (data) {
            this.triggerHit(data);
        }
        if (this._isFreezed) return;
        this.applyHitColor();
        cc.tween(this.node)
            .delay(0.1)
            .call(() => {
                if (this._isFreezed) return;
                this.resetColor();
            })
            .start();
    },

    convertFishCoordinateSystem(points) {
        if (DataStore.instance.getSelfDeskStation() <= 1) return;
        const APP_SIZE = GameConfig.instance.AppSize;
        for (let i = 0; i < points.length; ++i) {
            const pointRotated = rotateAngleByCoordinate(APP_SIZE.Width / 2, APP_SIZE.Height / 2, points[i].PosX, points[i].PosY, -180);
            points[i].PosY = pointRotated.y;
            points[i].PosX = pointRotated.x;
        }
    },

    onCatch(data) {
        if (data.isCheckedFakeBullet === undefined) {
            if (this.needFakeBullet(data)) {
                this.createFakeBullet(data);
                return;
            }
        }
        this.processItemInCatchFish(data);
        this.onPlayEffectWinInCatchFish(data);
        this.node.stopAllActions();
        this.resetColor();
        this._isDie = true;
        this.playEffectDie();
        const listAction = [];
        if (this._FishKind === GameConfig.instance.FISH_KIND.BOMB) {
            Emitter.instance.emit(EventCode.EFFECT_LAYER.TRIGGER_BOMB, this.getLockPositionByWorldSpace());
            listAction.push(cc.fadeOut(0.1));
        } else if (data.SkillID > 0) {
            if (data.DeskStation === DataStore.instance.getSelfDeskStation()) {
                DataStore.instance.saveCurrentTarget();
                DataStore.instance.setSelfInfo({ isLockGun: true, skillLock: true });
                Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, false);
                Emitter.instance.emit(EventCode.COMMON.RESET_TOUCH_LISTENER);
                Emitter.instance.emit(EventCode.GAME_LAYER.RECEIVE_LASER_GUN, data.DeskStation);
            }
            Emitter.instance.emit(EventCode.EFFECT_LAYER.DROP_GUN_LASER, { fishPos: this.node.convertToWorldSpaceAR(cc.v2(0, 0)), deskStation: data.DeskStation });
            listAction.push(cc.delayTime(0.5));
            listAction.push(cc.scaleTo(0.2, 0));
        } else {
            listAction.push(cc.delayTime(1));
            listAction.push(cc.fadeOut(0.5));
        }
        listAction.push(cc.callFunc(() => { this.onDie(); }));
        this.node.runAction(cc.sequence(listAction));
    },

    processItemInCatchFish(data) {
        if (data.itemInfo) {
            if (data.itemInfo.ID === GameConfig.instance.SKILL_ITEM.FREEZE) {
                Emitter.instance.emit(EventCode.GAME_LAYER.FREEZE_EFFECT_ITEM, { DeskStation: data.DeskStation, Fish: this });
            }
        }
    },

    getLockPositionByNodeSpace(node) {
        return node.convertToNodeSpaceAR(this.getLockPositionByWorldSpace());
    },

    getLockPositionByWorldSpace() {
        return this.node.convertToWorldSpaceAR(this._targetPoint);
    },

    onPlayEffectWinInCatchFish(data) {
        if (this._multiplier > 1) {
            this.luckyEffect.active = false;
            Emitter.instance.emit(EventCode.EFFECT_LAYER.LUCKY_EFFECT_FISH, {
                data,
                fishKind: this._FishKind,
                fishPos: this.getLockPositionByWorldSpace(),
                Multiplier: this._multiplier,
            });
        } else {
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, {
                data,
                fishKind: this._FishKind,
                fishPos: this.getLockPositionByWorldSpace(),
            });
        }
    },

    moveOut() {
        if (this._isDie) return;
        if(this._isOutScreen) {
            this.onDie();
            return;
        }
        this.node.stopAllActions();
        const moveOutActions = [];
        this.changeAnimationSpeed(2.5);
        if(this._moveOutAction) {
            moveOutActions.push(this._moveOutAction);
        } else {
            const { AppSize } = GameConfig.instance;
            const yPos = this.node.y > AppSize.Height / 2 ? AppSize.Height + 400 : -400;
            const angle = this.node.y > AppSize.Height / 2 ? -90 : 90;
            if (this._skipRotate) {
                moveOutActions.push(cc.delayTime(0.325));
            } else {
                moveOutActions.push(cc.rotateTo(0.325, angle));
            }
            moveOutActions.push(cc.moveTo(1.675, this.node.x, yPos).easing(cc.easeOut(0.4)));
        }
        moveOutActions.push(cc.callFunc(() => { this.onDie(); }));
        this.moveAction = cc.sequence(moveOutActions);
        this.node.runAction(this.moveAction);
    },

    onFreezed(time = 3000) {
        this.freezedTime = DataStore.instance.getTime();
        if (!this._isFreezed) {
            this._isFreezed = true;
            if (this.moveAction) {
                this.moveAction.speed(0.5);
            }
            this._TimeRemainFreeze = time;
            this.iceEffect.active = true;
            this.changeAnimationSpeed(0.5);
            this.applyIcedColor();
        }
    },

    setDie(isDie) {
        this._isDie = isDie;
    },

    checkDie() {
        return this._isDie;
    },

    isAvailable() {
        return !this.checkDie() && !this.checkOutScene();
    },

    getKind() {
        return this._FishKind;
    },

    getZIndex() {
        return this.node.zIndex;
    },

    getId() {
        return this._FishID;
    },

    checkOutScene() {
        return this._isOutScreen;
    },

    checkFreezed(){
        return this._isFreezed;
    },

    checkMultiplier() {
        return this._multiplier;
    },

    checkFishGroup(){
        return this._isFishGroup;
    },

    onFreezeStop() {
        this._isFreezed = false;
        this.iceEffect.active = false;
        if (this.moveAction) {
            this.moveAction.speed(2);
        }
        this.changeAnimationSpeed(2);
        this.resetColor();
    },

    changeAnimationSpeed() { },

    resetAnimationSpeed() { },

    playEffectDie() { },

    needFakeBullet(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (!player) return false;

        if ((data.DeskStation !== DataStore.instance.getSelfDeskStation())
             && !data.isSkill && !this._isDie && !data.SkillID && !player.isHoldingSkillGun()) {
            return this._hitTime[data.DeskStation] ? DataStore.instance.getTime() > this._hitTime[data.DeskStation] + 1000 : true;
        }
        return false;
    },

    createFakeBullet(data) {
        this._dataCatchFish = data;
        this.scheduleOnce(() => {
            if (this.needFakeBullet(data)) {
                const bulletdata = {};
                bulletdata.Angle = 0;
                bulletdata.LockedFishID = this._FishID;
                bulletdata.isBulletFake = true;
                bulletdata.DeskStation = data.DeskStation;
                bulletdata.BulletMultiple = data.BulletMultiple;
                bulletdata.FishID = data.FishID;
                Emitter.instance.emit(EventCode.GAME_LAYER.ON_PLAYER_FIRE, bulletdata);
                Emitter.instance.emit(EventCode.GAME_LAYER.CREATE_BULLET, bulletdata);
            }
        }, 1);
    },

    triggerHit(data) {
        this._hitTime[data.DeskStation] = DataStore.instance.getTime();
        if (this._dataCatchFish && this._dataCatchFish.DeskStation === data.DeskStation) {
            this._dataCatchFish.isCheckedFakeBullet = true;
            this.onCatch(this._dataCatchFish);
            this._dataCatchFish = null;
        }
    },

    // Called whenever object is returned to Object Pool
    unuse() {
        this._super();
        this.resetColor();
        this.resetAnimationSpeed();
        this._isDie = true;
        this._isOutScreen = true;
        this._FishID = null;
        this._moveOutAction = null;
        this._lastPos = null;
        this.fishAnim.node.angle = 0;
        this.fishAnim.node.scale = 1;
        this._targetPoint = new cc.v2(0, 0);
        this._hitTime.length = 0;
        this._dataCatchFish = null;
        this._isFreezed = false;
        this.moveAction = null;
    },
});
