

const {DragonCacheData, BoneCacheValue} = require('GodCacheData1990');
const GameConfig = require('Config1990');
const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");
const { isPointInScreen } = require('gfUtilities');
const ReferenceManager = require('gfReferenceManager');

const animationName = "Swim";

const electroColor = [
    cc.color(100, 200, 255),
    cc.color(255, 245, 125),
    cc.color(255, 200, 100),
    cc.color(255, 150, 100),
    cc.color(255, 50, 50),
];
const smokeColor = [
    cc.color(0, 165, 255, 150),
    cc.color(225, 255, 0, 40),
    cc.color(255, 175, 0, 45),
    cc.color(255, 90, 0, 65),
    cc.color(255, 40, 0, 100),
];
const dustColor = [
    {start : cc.color(100, 200, 255, 255), end: cc.color(0, 150, 255, 255)},
    {start : cc.color(255, 245, 125, 175), end: cc.color(255, 185, 0, 255)},
    {start : cc.color(255, 200, 125, 190), end: cc.color(255, 165, 0, 255)},
    {start : cc.color(255, 180, 125, 200), end: cc.color(255, 90, 0, 255)},
    {start : cc.color(255, 150, 125, 175), end: cc.color(255, 25, 0, 255)},
];
const boneParticle = ["Particle_1","Particle_2","Particle_3"];
const BASE_TIME_SCALE = 0.25;
const ANIMATION_DURATION = 42;
const SPINE_FPS = 30;
const SKIN_NAME = [
    "Default",
    "LV1",
    "LV2",
    "LV3",
    "LV4",
    "LV5"
];
const MAIN_TRACK = 0;
const SUB_TRACK = 1;
cc.Class({
    extends: require('gfBaseFish'),

    properties: {
        fishAnim: sp.Skeleton,
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
        arrDust: [cc.ParticleSystem],
        arrSmoke: [cc.ParticleSystem],
        arrElectro: [cc.ParticleSystem],
        nodeDust: [cc.Node],
        nodeSmoke : [cc.Node],
        nodeElectro: [cc.Node],
        _timeRemain: null,
        _isWaitingToMove: false,
        _isLoaded: false,
        _state: 1,
        _oldState: 1,
        _colorTween: null,
        _plasmaTween: null,
        _duration: 0,
    },

    onLoad() {
        this._isOutScreen = false;
        this.listBox = this.getComponents(cc.BoxCollider);
        this.node.zIndex = GameConfig.instance.Z_INDEX.DRAGON;
        this.fishAnim.enableBatch = false;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
    },

    start() {
        if (!this._isLoaded) {
            this.setupBones();
        }
    },

    setupBones(){
        const obj = this.fishAnim.skeletonData._skeletonJson.animations[animationName].paths;
        let paths = Object.keys(obj);
        for(let i = 0; i < paths.length; ++i){
            const pos = obj[paths[i]].position;
            this._duration += pos[pos.length - 1].time / BASE_TIME_SCALE;
        }


        this.listBoneName = ["Head_Collider", "Body_1", "Body_2", "Body_3", "Body_4",
            "Body_5", "Body_6", "Body_7", "Body_8", "Body_9",
            "Body_10", "Body_11", "Body_12", "Body_13", "Body_14", "Foot_Left"];
        this.bone = [];
        if (!cc.sys.isNative) {
            for (let i = 0; i < this.listBoneName.length; i++) {
                this.bone[i] = this.fishAnim.findBone(this.listBoneName[i]);
            }
        }
        this._isLoaded = true;

    },
    updateParticlePos(){
        for(let i = 0; i < 3; ++i){
            let bone = this.fishAnim.findBone(boneParticle[i]);
            {
                let particle = this.nodeDust[i];
                if (particle) {
                    particle.x = bone.worldX;
                    particle.y = bone.worldY;
                    particle.angle = bone.rotation + 90;
                }
            }
            {
                let particle = this.nodeSmoke[i];
                if (particle) {
                    particle.x = bone.worldX;
                    particle.y = bone.worldY;
                    particle.angle = bone.rotation + 90;
                }
            }
            {
                let particle = this.nodeElectro[i];
                if (particle) {
                    particle.x = bone.worldX;
                    particle.y = bone.worldY;
                    particle.angle = bone.rotation + 90;
                }
            }
        }
    },

    initFishData(data) {
        this.node.setPosition(cc.v2(GameConfig.instance.AppSize.Width / 2, GameConfig.instance.AppSize.Height / 2));

        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
        this._isDie = false;
        this._isOutScreen = true;

        this.node.opacity = 255;
        this.node.active = true;
        const {FishID, FishKind, GodzillaState,TimeRemain} = data;
        this._FishID = FishID;
        this._FishKind = FishKind;
        this._state = GodzillaState;
        this.fishAnim.setSkin(SKIN_NAME[this._state]);
        this.updateParticle(this._state);
        if(cc.sys.isNative){
            this.fishAnim.useTint = true;
            this.fishAnim.setToSetupPose();
        }
        this._mainMaterial = this.fishAnim.getMaterial(0);
        this._mainMaterial.setProperty('brightness', 0.0);
        this.unscheduleAllCallbacks();
        for(let i = 0; i < 3; ++i){
            {
                let particle = this.nodeDust[i];
                if (particle) {
                    particle.active = false;
                }
            }
            {
                let particle = this.nodeSmoke[i];
                if (particle) {
                    particle.active = false;
                }
            }
            {
                let particle = this.nodeElectro[i];
                if (particle) {
                    particle.active = false;
                }
            }
        }
        this.fishAnim.node.color = cc.Color.WHITE;
        this._timeRemain = TimeRemain / 1000;
        if (!this._isLoaded) {
            this.setupBones();
        }
        this.startMoving();
        this.schedule(this.checkOutScreen, 0.2, cc.macro.REPEAT_FOREVER, 0);
        Emitter.instance.emit(EventCode.GODZILLA.STATE_GODZILLA, true);
    },

    updateParticle(state){
        state-=1;
        for(let i = 0; i < this.arrDust.length; ++i){
            this.arrDust[i].startColor = dustColor[state].start;
            this.arrDust[i].endColor = dustColor[state].end;
        }
        for(let i = 0; i < this.arrSmoke.length; ++i){
            this.arrSmoke[i].startColor = smokeColor[state];
        }
        for(let i = 0; i < this.arrElectro.length; ++i){
            this.arrElectro[i].startColor = electroColor[state];
        }
    },

    onHitState(data){
        const {TypeWin, WinAmount, GodzillaState, BulletMultiple, DeskStation, ListFish} = data;
        this._oldState = this._state;
        this._state = GodzillaState;
        switch(TypeWin){
        case 0: //normal hit
            if(this._oldState !== GodzillaState){
                this.changeColor();
            }
            break;
        case 1: //drop crystal
            if(this._oldState !== GodzillaState){
                this.changeColor();
            }
            this.playDropCrystal(data);
            break;
        case 2: //Jackpot
            this.playEffectDie(data);
            break;
        case 3: //Plasma
            // eslint-disable-next-line no-case-declarations
            let callback = ()=> {
                const bodyPos = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length / 5 | 0].offset);
                const dataReward = {
                    ListFish,
                    WinAmount,
                    DeskStation,
                    BulletMultiple,
                    EffectPos: bodyPos
                };
                Emitter.instance.emit(EventCode.GODZILLA.GODZILLA_PLASMA_EFFECT, dataReward);
                Emitter.instance.emit(EventCode.SOUND.GODZILLA_PLASMA);
            };
            this.playPlasmaEffect(callback);
            break;
        default:
            break;
        }
    },
    //Change color of Godzilla without stop it
    changeColor(){
        if(this._plasmaTween && !this._plasmaTween.isDone())
            return;
        if(!this._colorTween || this._colorTween.isDone()) {
            this._colorTween = cc.tween(this.fishAnim)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0.25);
                })
                .delay(0.05)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0.5);
                })
                .delay(0.05)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0.75);
                })
                .delay(0.05)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 1);
                })
                .call(() => {
                    this.fishAnim.setSkin(SKIN_NAME[this._state]);
                    this.updateParticle(this._state);
                    if (cc.sys.isNative) {
                        this.fishAnim.useTint = true;
                        this.fishAnim.setToSetupPose();
                    }
                    this.startMoving();
                })
                .delay(0.05)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0.75);
                })
                .delay(0.05)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0.5);
                })
                .delay(0.05)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0.25);
                })
                .delay(0.05)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0);
                })
                .start();
        }
    },
    //Godzilla stop and change color
    playPlasmaEffect(callback){
        if(this._colorTween && !this._colorTween.isDone()){
            this._colorTween.stop();
            this._colorTween = null;
            this._mainMaterial.setProperty('brightness', 0.0);
        }
        if(!this._plasmaTween || this._plasmaTween.isDone()) {
            // const curAnimTime = this.curAnimTime;
            const duration = this.fishAnim.findAnimation("Plasma").duration;
            let isRed = (this._oldState!==5) ? 1 : 0; //should be is not red
            this._plasmaTween =  cc.tween(this.fishAnim)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.15);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.3);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.45);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.6);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.75);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.9);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 1);
                })
                .call(() => {
                    if(isRed) {
                        this.fishAnim.setSkin("LV5");
                        this.updateParticle(5);
                        if (cc.sys.isNative) {
                            this.fishAnim.useTint = true;
                            this.fishAnim.setToSetupPose();
                        }
                        this.startMoving();
                    }
                })
                .delay(0.1 * isRed)
                .call(()=>{
                    if(isRed) {
                        this._mainMaterial.setProperty('brightness', 0.6);
                    }
                })
                .delay(0.025 * isRed)
                .call(()=>{
                    if(isRed) {
                        this._mainMaterial.setProperty('brightness', 0.3);
                    }
                })
                .delay(0.025 * isRed)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0);
                    this.fishAnim.setAnimation(SUB_TRACK, "Plasma", false);
                })

                .delay(duration*0.75)
                .call(()=>{
                    callback();
                })
                .delay(1)
                .call(()=>{
                    this.changeColor();
                })
                .start();
        } else {
            callback();
        }
    },
    playDropCrystal(data){
        const {DeskStation, WinAmount, Wallet, BulletMultiple} = data;
        const dataInput = {
            BulletMultiple,
            DeskStation: DeskStation,
            FishID: this._FishID,
            GoldReward: WinAmount,
            Wallet: Wallet
        };

        const worldPos = this.node.convertToWorldSpaceAR(this.listBox[0].offset);

        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        Emitter.instance.emit(EventCode.DRAGON.DROP_BALL);
        Emitter.instance.emit(EventCode.GODZILLA.GODZILLA_DROP_CRYSTAL, {
            data: dataInput,
            worldPos,
            player,
            GoldReward: WinAmount
        });
    },

    playEffectDie(data) {
        this.unschedule(this.checkOutScreen);
        this.fishAnim.timeScale = 0;
        this.fishAnim.node.stopAllActions();
        this.fishAnim.setCompleteListener(() => { });
        if(this._colorTween) {
            this._colorTween.stop();
            this._colorTween = null;
        }
        if(this._plasmaTween) {
            this._plasmaTween.stop();
            this._plasmaTween = null;
        }
        this._mainMaterial.setProperty('brightness', 0);
        const curAnimTime = this.curAnimTime;
        this._isDie = true;
        Emitter.instance.emit(EventCode.SOUND.DRAGON_DIE);

        cc.tween(this.fishAnim.node)
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.15);
            })
            .by(0.05, { x: 0, y: 10 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.3);
            })
            .by(0.065, { x: 0, y: -10 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.45);
            })
            .by(0.065, { x: 0, y: -10 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.65);
            })
            .by(0.065, { x: 10, y: 10 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.8);
            })
            .by(0.065, { x: -10, y: 0 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 1.0);
                this.fishAnim.setSkin("LV5");
                this.updateParticle(5);
                this.fishAnim.useTint = true;
                this.fishAnim.setToSetupPose();
                cc.sys.isNative ? this.fishAnim._updateRealtime(curAnimTime) : this.fishAnim.update(curAnimTime);
            })
            .by(0.065, { x: -10, y: 0 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.8);
            })
            .by(0.065, { x: 10, y: 0 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.65);
            })
            .by(0.065, { x: 0, y: 10 })
            .call(()=>{
                this._mainMaterial.setProperty('brightness', 0.5);
            })
            .by(0.065, { x: 0, y: -10 })
            .call(()=>{
                data.EffectPos = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length / 5 | 0].offset);
                Emitter.instance.emit(EventCode.EFFECT_LAYER.SHOW_POPUP_WIN_JACKPOT, data);
            })
            .by(0.065, { x: 0, y: -10 })
            .by(0.065, { x: 10, y: 10 })
            .call(()=>{
                const explBones = [0, 4,8,12];
                const explPositions = [];
                for (let i = 0; i < explBones.length; ++i) {
                    explPositions.push(this.node.convertToWorldSpaceAR(cc.v2(this.bone[explBones[i]].worldX, this.bone[explBones[i]].worldY)));
                }
                Emitter.instance.emit(EventCode.DRAGON.SMALL_EXPLOSION, explPositions);
            })
            .by(0.065, { x: -10, y: 0 })
            .by(0.065, { x: -10, y: 0 })
            .by(0.065, { x: 10, y: 0 })
            .by(0.1, { x: -10, y: 10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 10, y: 0 })
            .by(0.1, { x: 0, y: 10 })
            .call(()=>{
                this.onDie();
            })
            .start();

    },

    updateBoneCache(dt, isPrintCache = true) {
        if(this._duration && this.curAnimTime > this._duration) {
            cc.log('invalid');
            return;
        }
        const frame = Math.round(this.curAnimTime * SPINE_FPS);
        let bones = BoneCacheValue[animationName][frame];
        if (!bones) {
            if (DragonCacheData[animationName] && DragonCacheData[animationName][frame]) {
                bones = DragonCacheData[animationName][frame].split(',');
                BoneCacheValue[animationName][frame] = bones;
            } else {
                bones = [];
                for (let i = 0; i < this.listBoneName.length; i++) {
                    const bone = this.fishAnim.findBone(this.listBoneName[i]);
                    bones.push(Math.round(bone.worldX));
                    bones.push(Math.round(bone.worldY));
                }
                BoneCacheValue[animationName][frame] = bones;
                if(isPrintCache) {
                    if (!DragonCacheData[animationName]) {
                        DragonCacheData[animationName] = [];
                    }
                    DragonCacheData[animationName][frame] = bones.toString();
                }
            }

        }
        for (let i = 0; i < bones.length; i++) {
            this.bone[i] = { worldX: bones[i * 2], worldY: bones[i * 2 + 1]};
        }
    },

    setDragonAnim(trackInd, animName, loop, timePassed = 0) {
        this.fishAnim.setAnimation(trackInd, animName, loop);
        cc.sys.isNative ? this.fishAnim._updateRealtime(timePassed) : this.fishAnim.update(timePassed);
        this.curAnimTime = timePassed;
        if (!BoneCacheValue[animName]) {
            BoneCacheValue[animName] = [];
        }
    },



    startMoving() {
        Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.GODZILLA);
        this.fishAnim.timeScale = BASE_TIME_SCALE;
        this.setDragonAnim(MAIN_TRACK, animationName, false, ANIMATION_DURATION - this._timeRemain);
        this.fishAnim.setCompleteListener((trackEntry) => {
            if(trackEntry.trackIndex === MAIN_TRACK) {
                this.fishAnim.setCompleteListener(() => {
                });
                this.onDie();
            }
        });
    },

    onHit() {
        if(this._colorTween && !this._colorTween.isDone())
            return;
        if(this._plasmaTween && !this._plasmaTween.isDone())
            return;
        else{
            if (this._mainMaterial) {
                this._mainMaterial.setProperty('brightness', 0.2);
                this.scheduleOnce(() => {
                    this._mainMaterial.setProperty('brightness', 0.0);
                }, 0.1);
            }
        }
    },

    // onCatch() {
    //     this._isDie = true;
    //     Emitter.instance.emit(EventCode.SOUND.DRAGON_DIE);
    //     this.playEffectDie();
    // },

    onDie(isResume = false) {
        this.unscheduleAllCallbacks();
        if(!isResume){
            Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
            Emitter.instance.emit(EventCode.SOUND.GODZILLA_OUT);
            Emitter.instance.emit(EventCode.GODZILLA.STATE_GODZILLA, false);
        }
        this._isDie = true;
        Emitter.instance.emit(EventCode.GAME_LAYER.REMOVE_FISH, this._FishID);
        if(this.node) this.node.removeFromParent(false);
    },

    update(dt) {
        if (this._isDie) return;
        if (cc.sys.isNative) {
            this.updateBoneCache(dt, true);
        }

        this._timeRemain = this._timeRemain - dt > 0 ? this._timeRemain-=dt : this._timeRemain;
        this.curAnimTime += dt;
        for (let i = 0; i < this.listBox.length; ++i) {
            if (this.bone[i] && this.bone[i].worldX != 0 && this.bone[i].worldY != 0) {
                this.listBox[i].offset = cc.v2(this.bone[i].worldX, this.bone[i].worldY);
            }
        }
    },

    checkOutScreen() {
        if(!this.node.parent) return;
        if (!this.listBox) {
            this.listBox = this.getComponents(cc.BoxCollider);
        }
        const lastState = this._isOutScreen;
        const head = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.listBox[0].offset));
        const foot = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length - 1].offset));
        const tail = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length - 2].offset));
        this._isOutScreen = (!isPointInScreen(head) && !isPointInScreen(tail) && !isPointInScreen(foot));
        if(lastState &&  !this._isOutScreen) {
            this.updateParticlePos();
            for(let i = 0; i < 3; ++i){
                {
                    let particle = this.nodeDust[i];
                    if (particle) {
                        particle.active = true;
                    }
                }
                {
                    let particle = this.nodeSmoke[i];
                    if (particle) {
                        particle.active = true;
                    }
                }
                {
                    let particle = this.nodeElectro[i];
                    if (particle) {
                        particle.active = true;
                    }
                }
            }
            this.schedule(this.updateParticlePos, 0.2, cc.macro.REPEAT_FOREVER, 0);
            Emitter.instance.emit(EventCode.FISH_LAYER.BOSS_ON_GAME);
        }
    },

    getLockPositionByNodeSpace(node) {
        const head = this.node.convertToWorldSpaceAR(this.listBox[3].offset);
        const tail = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length - 2].offset);
        const foot = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length - 1].offset);
        const bodyIndexList = [head, foot, tail];

        for (let i = 0; i < bodyIndexList.length; ++i) {
            if (isPointInScreen(bodyIndexList[i])) {
                return node.convertToNodeSpaceAR(bodyIndexList[i]);
            }
        }
        return node.convertToNodeSpaceAR(head);
    },

    getBallDropPosition() {
    },

    onDestroy() {
    },

    moveOut() { },
    onIced() { },
    returnPool() { }
});
