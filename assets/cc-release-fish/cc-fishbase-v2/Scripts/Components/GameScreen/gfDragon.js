

const {DragonCacheData, BoneCacheValue} = require('gfDragonCacheData');
const GameConfig = require('gfBaseConfig');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const { isPointInScreen } = require('gfUtilities');
const DataStore = require('gfDataStore');

const animationList = [
    "Swim In", "Swim Out", "Swim Loop",
];

const TIME_ANIM_SWIM_IN = 5.997;
const TIME_ANIM_SWIM_LOOP = 29.985;
const TIME_ANIM_SWIM_OUT = 5.997;
const BASE_TIME_SCALE = 1 / 6;
const TOTAL_LIVE_TIME = 42;
const SPINE_FPS = 30;

cc.Class({
    extends: require('gfBaseFish'),

    properties: {
        fishAnim: sp.Skeleton,
        _timeRemain: null,
        _isLoaded: false,
    },

    onLoad() {
        this.node.zIndex = GameConfig.instance.Z_INDEX.DRAGON;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
        // cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    start() {
        if (!this._isLoaded) {
            this.setupBones();
        }
    },

    setupBones() {
        this.listBox = this.getComponents(cc.BoxCollider);
        this.durationMap = {};
        for (let i = 0; i < animationList.length; i++) {
            const animName = animationList[i];
            const pos = this.fishAnim.skeletonData._skeletonJson.animations[animName].paths['Path Loop'].position;
            const duration = pos[pos.length - 1].time / BASE_TIME_SCALE;
            this.durationMap[animName] = duration;
        }
        this.listBoneName = ["Head", "Body 3", "Body 6", "Body 9", "Body 12", "Body 15", "Body 18", "Body 21", "Body 24", "Body 27",
            "Body 30", "Body 33", "Body 36", "Body 39", "Body 42", "Body 45", "Body 47", "All Tail Position"];
        this.bone = [];
        if (!cc.sys.isNative) {
            for (let i = 0; i < this.listBoneName.length; i++) {
                this.bone[i] = this.fishAnim.findBone(this.listBoneName[i]);
            }
        }
        this._isLoaded = true;
    },

    initFishData(data) {
        this._isDie = false;
        this._isOutScreen = true;
        this.node.opacity = 255;
        this.node.active = true;
        this._FishID = data.FishID;
        this._FishKind = data.FishKind;
        this._mainMaterial = this.fishAnim.getMaterial(0);
        this.unscheduleAllCallbacks();
        this.fishAnim.node.color = cc.Color.WHITE;
        this.fishAnim.node.stopAllActions();
        const timeRemain = TOTAL_LIVE_TIME - (Math.max(0, (DataStore.instance.getTime() - data.BuildTick) / 1000));
        // const timeRemain = data.TimeRemain / 1000;
        if (!this._isLoaded) {
            this.setupBones();
        }
        this.startMoving(timeRemain);

        Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.DRAGON);
    },

    updateBoneCache(dt, isPrintCache = true) {
        if (this.durationMap && this.curAnimTime > this.durationMap[this.curAnimName]) return;
        if (this.curAnimName) {
            const frame = Math.round(this.curAnimTime * SPINE_FPS);
            let bones = BoneCacheValue[this.curAnimName][frame];
            if (!bones) {
                if (DragonCacheData[this.curAnimName] && DragonCacheData[this.curAnimName][frame]) {
                    bones = DragonCacheData[this.curAnimName][frame].split(',');
                    BoneCacheValue[this.curAnimName][frame] = bones;
                } else {
                    bones = [];
                    for (let i = 0; i < this.listBoneName.length; i++) {
                        const bone = this.fishAnim.findBone(this.listBoneName[i]);
                        bones.push(Math.round(bone.worldX));
                        bones.push(Math.round(bone.worldY));
                    }
                    BoneCacheValue[this.curAnimName][frame] = bones;
                    if(isPrintCache) {
                        if (!DragonCacheData[this.curAnimName]) {
                            DragonCacheData[this.curAnimName] = [];
                        }
                        DragonCacheData[this.curAnimName][frame] = bones.toString();
                    }
                }

            }
            for (let i = 0; i < bones.length; i++) {
                this.bone[i] = { worldX: bones[i * 2], worldY: bones[i * 2 + 1]};
            }
            this.curAnimTime += dt;
        }
    },

    setDragonAnim(trackInd, animName, loop, timePassed = 0) {
        if (!this._isDie) {
            if (animName === "Swim In" || animName === "Swim Out") {
                this.schedule(this.checkOutScreen, 0.2);
            } else {
                this.unschedule(this.checkOutScreen);
                this._isOutScreen = false;
            }
        }
        this.fishAnim.setAnimation(trackInd, animName, loop);
        if (timePassed > 0) {
            cc.sys.isNative ? this.fishAnim._updateRealtime(timePassed) : this.fishAnim.update(timePassed);
        }
        this.curAnimTime = timePassed;
        this.curAnimName = animName;
        if (!BoneCacheValue[animName]) {
            BoneCacheValue[animName] = [];
        }
    },

    playEffectDie() {
        this.unschedule(this.checkOutScreen);
        this.fishAnim.timeScale = 0;
        this.fishAnim.node.stopAllActions();
        this.fishAnim.setCompleteListener(() => { });
        this.fishAnim.clearTrack(0);

        const explBones = [0, 14, 6, 17, 9];
        const explPositions = [];
        for (let i = 0; i < explBones.length; ++i) {
            explPositions.push(this.node.convertToWorldSpaceAR(cc.v2(this.bone[explBones[i]].worldX, this.bone[explBones[i]].worldY)));
        }
        Emitter.instance.emit(EventCode.DRAGON.SMALL_EXPLOSION, explPositions);

        cc.tween(this.fishAnim.node)
            .by(0.1, { x: 0, y: 10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 10, y: 10 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: 10, y: 0 })
            .by(0.1, { x: 0, y: 10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 10, y: 10 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: 10, y: 0 })
            .start();

        this.fishAnim.node.color = cc.Color.RED;
        const blinkRed = cc.sequence(
            cc.tintTo(0.15, 255, 0, 0),
            cc.delayTime(0.35),
            cc.tintTo(0.15, 255, 255, 255),
            cc.delayTime(0.35),
        ).repeat(3);

        this.fishAnim.node.runAction(cc.sequence(
            blinkRed,
            cc.callFunc(() => {
                Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.1, amplitude: 10 });
                Emitter.instance.emit(EventCode.DRAGON.BIG_EXPLOSION, this.node.convertToWorldSpaceAR(this.listBox[8].offset));
            }),
            cc.fadeOut(0.1),
            cc.delayTime(0.75),
            cc.callFunc(() => {
                this.onDie();
            }),
        ));
    },

    startMoving(timeRemain) {
        this.node.setPosition(cc.v2(GameConfig.instance.AppSize.Width / 2, GameConfig.instance.AppSize.Height / 2));
        this.fishAnim.timeScale = BASE_TIME_SCALE;
        if (timeRemain <= TIME_ANIM_SWIM_OUT) {
            this.setDragonAnim(0, "Swim Out", false, TIME_ANIM_SWIM_OUT - timeRemain);
            this.fishAnim.setCompleteListener(() => { });
        } else if (timeRemain <= TIME_ANIM_SWIM_OUT + TIME_ANIM_SWIM_LOOP) {
            const swimLoopTimeLeft = timeRemain - TIME_ANIM_SWIM_OUT;
            this.setDragonAnim(0, "Swim Loop", false, TIME_ANIM_SWIM_LOOP - swimLoopTimeLeft);
            this.fishAnim.setCompleteListener(() => {
                this.setDragonAnim(0, "Swim Out", false);
                this.fishAnim.setCompleteListener(() => { });
            });
        } else {
            const swimInTimeLeft = (timeRemain - TIME_ANIM_SWIM_OUT - TIME_ANIM_SWIM_LOOP);
            const timePassed = Math.max(TIME_ANIM_SWIM_IN - swimInTimeLeft, 0);
            this.setDragonAnim(0, "Swim In", false, timePassed);
            this.fishAnim.setCompleteListener(() => {
                this.setDragonAnim(0, "Swim Loop", false);
                this.fishAnim.setCompleteListener(() => {
                    this.setDragonAnim(0, "Swim Out", false);
                    this.fishAnim.setCompleteListener(() => { });
                });
            });
        }
    },

    onHit() {
        if (this._mainMaterial) {
            this._mainMaterial.setProperty('brightness', 0.2);
            this.scheduleOnce(() => {
                this._mainMaterial.setProperty('brightness', 0.0);
            }, 0.1);
        }
    },

    onCatch() {
        this._isDie = true;
        Emitter.instance.emit(EventCode.SOUND.DRAGON_DIE);
        this.playEffectDie();
    },

    onDie(isResume = false) {
        if(!isResume){
            Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
        }
        this._isDie = true;
        Emitter.instance.emit(EventCode.GAME_LAYER.REMOVE_FISH, this._FishID);
        this.node.removeFromParent(false);
    },

    update(dt) {
        if (this._isDie) return;
        if (cc.sys.isNative) {
            this.updateBoneCache(dt, true);
        }

        for (let i = 0; i < this.listBox.length; ++i) {
            if (this.bone[i] && this.bone[i].worldX !== 0 && this.bone[i].worldY !== 0) {
                this.listBox[i].offset = cc.v2(this.bone[i].worldX, this.bone[i].worldY);
            }
        }
    },

    checkOutScreen() {
        if (!this.listBox) {
            this.listBox = this.getComponents(cc.BoxCollider);
        }
        const lastState = this._isOutScreen;
        const head = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.listBox[0].offset));
        const tail = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length - 1].offset));
        this._isOutScreen = !(isPointInScreen(head) || isPointInScreen(tail));
        if (lastState && !this._isOutScreen) {
            Emitter.instance.emit(EventCode.FISH_LAYER.BOSS_ON_GAME);
        }
    },

    getLockPositionByNodeSpace(node) {
        const head = this.node.convertToWorldSpaceAR(this.listBox[0].offset);
        const tail = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length - 1].offset);
        const body = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length / 2 | 0].offset);
        const bodyIndexList = [head, body, tail];
        for (let i = 0; i < bodyIndexList.length; ++i) {
            if (isPointInScreen(this.node.parent.convertToNodeSpaceAR(bodyIndexList[i]))) {
                return node.convertToNodeSpaceAR(bodyIndexList[i]);
            }
        }
        return node.convertToNodeSpaceAR(tail);
    },

    getBallDropPosition() {
        return this.node.convertToWorldSpaceAR(this.listBox[0].offset);
    },

    onDestroy() {
    },

    moveOut() { },
    onIced() { },
    returnPool() { },
});
