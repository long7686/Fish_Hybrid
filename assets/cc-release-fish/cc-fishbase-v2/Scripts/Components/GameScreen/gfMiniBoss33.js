

const lodash = require('lodash');
const StateMachine = require('javascript-state-machine');
const DataStore = require('gfDataStore');
const { randRange } = require('utils');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const ReferenceManager = require('gfReferenceManager');
const FishManager = require('gfFishManager');
const GameConfig = require('gfBaseConfig');

const SLOT_NAME = {
    Shoulder: ["L_Shoulder_Armor", "L_Shoulder_Armor_Stone1",
        "L_Shoulder_Armor_Stone2", "L_Shoulder_Armor_Stone3",
        "R_Shoulder_Armor", "R_Shoulder_Armor_Stone1", "R_Shoulder_Armor_Stone2"],
    Arm: ["L_Arm_Armor", "R_Arm_armor",
        "L_Arm_Armor_Stone1", "L_Arm_Armor_Stone2", "L_Arm_Armor_Stone3", "R_Arm_armor_stone"],
    Shield: ["Shield", "Shield_Stone1",
        "Shield_Stone2", "Shield_Stone3", "Shield_Stone4", "Shield_Stone5",
        "Shield2"],
    Trident: ["Trident", "Trident_Stone1", "Trident_Stone2",
        "Trident_Stone3", "Trident_Stone4", "Trident_Stone5", "Trident_Stone6",
        "Trident_Stone7", "Trident2", "khoi_chan_nho2", "crack6", "crack7"],
    Hat: ["Head_Armor", "Head_Armor_Stone1", "Head_Armor_Stone2",
        "Head_Armor_Stone3", "crack2"],
    Empty: "Empty",
};

const BONES = {
    Shield: "Shield",
    ArmL: "L_Arm_Armor",
    ArmR: "R_Arm_armor",
    ShoulderL: "L_Shoulder_Armor",
    ShoulderR: "R_Shoulder_Armor_Stone2",
    Hat: "Head_Stone5",
    Trident: "Trident",
    Tail: "Tail_Stone9",
    Gem: "Gem",
};

const STATE = {
    SMASHTAIL: "smash",
    NORMAL: "normal",
    SHIELD: "shield",
    DIE: "die",
};

const TRANSITION = {
    GO_SMASH: "goSmash",
    GO_NORMAL: "goNormal",
    GO_SHIELD: "goShield",
    GO_DIE: "goDie",
};

const ANIMATION_NAME = {
    Walk: "Walk",
    WalkShieldOn: "Walk_wShield",
    WalkShieldOnHight: "Walk_Hand_Cover",
    WalkShieldOnRotate: "Walk_Rotate_Trident",
    Die: "Die",
    SmashTail: "Walk_Slap_Tail",
};

const STATUS = {
    Shoulder: 1,
    Hat: 2,
    Trident: 4,
    Shield: 8,
    Full: 15,
};

class BossItem {
    constructor(status = STATUS.Full) {
        this.value = status;
    }

    has(item) {
        return this.value & item;
    }

    remove(item) {
        if(this.has(item)) {
            this.value ^= item;
        }
    }

    reset(){
        this.value = STATUS.Full;
    }
}

const TOTAL_ITEM = 5;
const FishStartDelay = 4;
const TIME_MOVE = 64; // second
const TIME_DELAY_SMASH = 2; // second
const TIME_SMASH = [4.8, 17, 20.3, 30, 40.3]; // second
cc.Class({
    extends: require('gfBaseFish'),

    properties: {
        fishAnim: sp.Skeleton,
        spAura: sp.Skeleton,
        nodePosSmashTail: cc.Node,
        _initialized: false,
        _timesSmash: [],
        _fsm: false,

    },

    onLoad() {
        this.fishAnim.enableBatch = false;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);

        this.fishAnim.setMix(ANIMATION_NAME.Walk, ANIMATION_NAME.WalkShieldOn, 0.3);
        this.fishAnim.setMix(ANIMATION_NAME.Walk, ANIMATION_NAME.WalkShieldOnHight, 0.3);
        this.fishAnim.setMix(ANIMATION_NAME.Walk, ANIMATION_NAME.WalkShieldOnRotate, 0.3);
        this.fishAnim.setMix(ANIMATION_NAME.WalkShieldOn, ANIMATION_NAME.Walk, 0.3);
        this.fishAnim.setMix(ANIMATION_NAME.WalkShieldOnHight, ANIMATION_NAME.Walk, 0.3);
        this.fishAnim.setMix(ANIMATION_NAME.WalkShieldOnRotate, ANIMATION_NAME.Walk, 0.3);
        this.fishAnim.setMix(ANIMATION_NAME.SmashTail, ANIMATION_NAME.WalkShieldOn, 0.1);
        this.fishAnim.setMix(ANIMATION_NAME.SmashTail, ANIMATION_NAME.WalkShieldOnHight, 0.1);
        this.fishAnim.setMix(ANIMATION_NAME.SmashTail, ANIMATION_NAME.WalkShieldOnRotate, 0.1);
        this.fishAnim.setMix(ANIMATION_NAME.WalkShieldOn, ANIMATION_NAME.SmashTail, 0.1);
        this.fishAnim.setMix(ANIMATION_NAME.WalkShieldOnHight, ANIMATION_NAME.SmashTail, 0.1);
        this.fishAnim.setMix(ANIMATION_NAME.WalkShieldOnRotate, ANIMATION_NAME.SmashTail, 0.1);
        this.fishAnim.setMix(ANIMATION_NAME.Walk, ANIMATION_NAME.SmashTail, 0.1);
        this.fishAnim.setMix(ANIMATION_NAME.SmashTail, ANIMATION_NAME.Walk, 0.1);

        this.listBox = this.getComponents(cc.BoxCollider);
        this.boxTridentOff = this.listBox.find((item) => item.tag === 3);
        this.boxTridentOn = this.listBox.find((item) => item.tag === 5);
        this.boxTridentOn.enabled = false;
        this.boxTridentOff.enabled = true;
    },

    initFishData(data) {
        this._initialized = true;
        this._buildTick = data.buildTick ? data.buildTick : DataStore.instance.getTime();
        const timePassed = this.checkTimePassed();
        this._timesSmash = TIME_SMASH.filter((time) => time > timePassed);
        this._status = new BossItem();
        this.initStateMachine(STATE.NORMAL);
        this.initUI(data);
        this._skipRotate = true;
        this._isDie = false;
        this._FishID = data.FishID;
        this._FishKind = data.FishKind;
        this._mainMaterial = this.getMainMaterial();
        this._maxWidth = this.node.getComponent(cc.BoxCollider).size.width * this.node.scaleX;
        this._offsetX = this.node.getComponent(cc.BoxCollider).offset.x * this.node.scaleX;
        this._isOutScreen = true;
        this._isGoInScreen = !this._isOutScreen;
        this.node.zIndex = 0;
        Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.MINI_BOSS);
    },

    initUI(data) {
        this._itemLeft = TOTAL_ITEM;
        this.updateAura();
        if (data.listItem) {
            const listDropItem = lodash.difference([2, 3, 4, 5, 6], data.listItem);
            listDropItem.forEach((itemID) => {
                this.dropItemById(itemID, false);
            });
        }
    },

    initStateMachine(stateBegin) {
        // if (this._fsm) return;
        this._fsm = new StateMachine({
            init: stateBegin,
            transitions: [
                { name: TRANSITION.GO_NORMAL, from: STATE.SMASHTAIL, to: STATE.NORMAL },
                { name: TRANSITION.GO_NORMAL, from: STATE.SHIELD, to: STATE.NORMAL },
                { name: TRANSITION.GO_SHIELD, from: STATE.NORMAL, to: STATE.SHIELD },
                { name: TRANSITION.GO_SMASH, from: STATE.NORMAL, to: STATE.SMASHTAIL },
                { name: TRANSITION.GO_DIE, from: STATE.SHIELD, to: STATE.DIE },
                { name: TRANSITION.GO_DIE, from: STATE.SMASHTAIL, to: STATE.DIE },
                { name: TRANSITION.GO_DIE, from: STATE.NORMAL, to: STATE.DIE },

            ],
            methods: {
                onNormal: this.onNormal.bind(this),
                onShield: this.onShield.bind(this),
                onSmash: this.onSmash.bind(this),
                onDie: this.onBossDie.bind(this),
                onLeaveNormal: this.onLeaveNormal.bind(this),
                onLeaveSmash: this.onLeaveSmash.bind(this),
                onLeaveShield: this.onLeaveShield.bind(this),
                onInvalidTransition(transition, from) {
                    cc.warn("Transition", transition, "from", from, "is not allowed");
                },
            },
        });
    },

    // goToTransition(transition) {
    //     if (!this._fsm.can(transition)) return;
    //     switch (transition) {
    //     case TRANSITION.GO_NORMAL:
    //         this._fsm.goNormal();
    //         break;
    //     case TRANSITION.GO_SHIELD:
    //         this._fsm.goShield();
    //         break;
    //     case TRANSITION.GO_SMASH:
    //         this._fsm.goSmash();
    //         break;
    //     case TRANSITION.GO_DIE:
    //         this._fsm.goDie();
    //         break;
    //     default:
    //         this._fsm.goNormal();
    //         break;
    //     }
    // },

    onNormal() {
        this.fishAnim.setAnimation(0, ANIMATION_NAME.Walk, true);
        this.checkSmash();
    },

    onShield() {
        if (this.fishAnim.animation === ANIMATION_NAME.SmashTail) return;
        switch (this._itemLeft) {
            case 5:
                this.fishAnim.setAnimation(0, ANIMATION_NAME.WalkShieldOn, true);
                break;
            case 4:
                this.fishAnim.setAnimation(0, ANIMATION_NAME.WalkShieldOnRotate, true);
                break;
            case 3:
            case 2:
            case 1:
                this.fishAnim.setAnimation(0, ANIMATION_NAME.WalkShieldOnHight, true);
                break;
            default:
                break;
        }
        this.unschedule(this.offShield);
        this.scheduleOnce(this.offShield, 2);
    },
    onSmash() {
        this._timesSmash.shift();
        this.fishAnim.setCompleteListener(() => { });
        this.unscheduleAllCallbacks();
        this.changeAnimToSmashTail();
    },

    onBossDie() {
        if (this.fishAnim.animation === ANIMATION_NAME.Die) return;
        this.node.stopAllActions();
        this.fishAnim.setCompleteListener(() => { });
        this.unscheduleAllCallbacks();
        this._isDie = true;
        // Todo: remove SlapTail
        this.fishAnim.setAnimation(0, ANIMATION_NAME.Die, false);
        this.spAura.node.active = false;
        Emitter.instance.emit(EventCode.EFFECT_LAYER.MINIBOSS_CRITICAL, {
            worldPos: this.getBonePositionInWorldSpace(BONES.Gem),
            scaleX: this.node.scaleX,
        });
        this.scheduleOnce(this.updateItemSlot.bind(this), 0.05);

        this.fishAnim.setCompleteListener(() => {
            this.node.runAction(cc.sequence(
                cc.fadeOut(1),
                cc.callFunc(() => {
                    this.onDie();
                }),
            ));
        });

        Emitter.instance.emit(EventCode.GAME_LAYER.MOVE_OUT_ALL_FISHES);
    },

    onLeaveNormal() {
        if (!this._isGoInScreen && !this._isOutScreen) {
            this._isGoInScreen = true;
        } else {
            this.unschedule(this.smash);
            this.unschedule(this.scheduleSmash);
        }
    },

    onLeaveSmash() {
        this.unschedule(this.smash);
        this.unschedule(this.scheduleSmash);
    },

    onLeaveShield() {
        this.unschedule(this.offShield);
    },

    //  ------------ SKIN -------------
    dropItemById(data, isPlayEffect = true, player = null) {
        const itemID = data.MiniBossInfo ? data.MiniBossInfo.ItemID : data;
        const worldPos = this.getBonePositionInWorldSpace(BONES.ShoulderL);
        if (!this._initialized) { return; }
        switch (itemID) {
            case 1: // fin
                worldPos.x += randRange(-30, 30);
                worldPos.y += randRange(-65, -30) - 50;
                // Todo: play effect drop fin
                Emitter.instance.emit(EventCode.EFFECT_LAYER.MINIBOSS_DROP_FIN, {
                    data,
                    fishPos: worldPos,
                    fishKind: this._FishKind,
                });
                break;
            case 2: // arm
                Emitter.instance.emit(EventCode.SOUND.MINIBOSS_HIT);
                this._status.remove(STATUS.Shoulder);
                this.disableItemSlot(SLOT_NAME.Shoulder);
                this.disableItemSlot(SLOT_NAME.Arm);
                if (isPlayEffect) {
                    this.playDropItemEffect(BONES.ShoulderL, player, data);
                    this.playDropItemEffect(BONES.ArmL, player, data, true);
                }
                break;
            case 3: // hat
                Emitter.instance.emit(EventCode.SOUND.MINIBOSS_HIT);
                this._status.remove(STATUS.Hat);
                this.disableItemSlot(SLOT_NAME.Hat);
                if (isPlayEffect) {
                    this.playDropItemEffect(BONES.Hat, player, data);
                }
                break;
            case 4: // trident
                Emitter.instance.emit(EventCode.SOUND.MINIBOSS_HIT);
                this.boxTridentOff.enabled = false;
                this.boxTridentOn.enabled = false;
                this._status.remove(STATUS.Trident);
                this.disableItemSlot(SLOT_NAME.Trident);
                if (isPlayEffect) {
                    this.playDropItemEffect(BONES.Trident, player, data);
                }
                break;
            case 5: // shield
                Emitter.instance.emit(EventCode.SOUND.MINIBOSS_HIT);
                this._status.remove(STATUS.Shield);
                this.disableItemSlot(SLOT_NAME.Shield);
                if (isPlayEffect) {
                    this.playDropItemEffect(BONES.Shield, player, data);
                }
                break;
            case 6: // Gem
                if (player) {
                    const iWorldPos = this.getBonePositionInWorldSpace(BONES.Gem);
                    Emitter.instance.emit(EventCode.EFFECT_LAYER.MINIBOSS_DROP_GEM, {
                        data,
                        worldPos: iWorldPos,
                        player,
                        fishPos: this.node.convertToWorldSpaceAR(cc.v2(0, 0)),
                        GoldReward: data.GoldReward,
                    });
                }
                break;
            default:
                break;
        }

        if (itemID > 1) {
            this._itemLeft--;
            if (this._itemLeft === 4) {
                this.boxTridentOff.enabled = true;
                this.boxTridentOn.enabled = true;
            }
            this.offShield();
            this.updateAura();
        }
    },

    getBonePositionInWorldSpace(name) {
        const bone = this.fishAnim.findBone(name);
        return this.fishAnim.node.convertToWorldSpaceAR(cc.v2(bone.worldX, bone.worldY));
    },

    setSlot(slotName, attachName) {
        this.fishAnim.setAttachment(slotName, attachName);
    },

    disableItemSlot(slotNames) {
        slotNames.forEach((slot) => {
            this.setSlot(slot, SLOT_NAME.Empty);
        });
    },

    getBonePositionInWorldSpaceById(id) {
        switch (id) {
            case 1:
                return this.getBonePositionInWorldSpace(BONES.ShoulderL);
            case 2:
                return this.getBonePositionInWorldSpace(BONES.ShoulderL);
            case 3:
                return this.getBonePositionInWorldSpace(BONES.Hat);
            case 4:
                return this.getBonePositionInWorldSpace(BONES.Trident);
            case 5:
                return this.getBonePositionInWorldSpace(BONES.Shield);
            default:
                return this.getBonePositionInWorldSpace(BONES.Gem);
        }
    },

    playDropItemEffect(boneName, player, data, ignore = false) {
        const worldPos = this.getBonePositionInWorldSpace(boneName);
        Emitter.instance.emit(EventCode.EFFECT_LAYER.MINIBOSS_DROP_ITEM, {
            itemName: boneName,
            worldPos,
            player,
            scaleX: this.node.scaleX,
            GoldReward: data.GoldReward,
            isBigWin: data.isBigWin,
            ignoreItem: ignore,
        });
    },
    // END SKIN

    // --------- ANIMATION --------------

    changeAnimToSmashTail() {
        this.fishAnim.setAnimation(0, ANIMATION_NAME.SmashTail, false);
        this.fishAnim.setCompleteListener(() => {
            this.fishAnim.setCompleteListener(() => { });
            this._fsm.goNormal();
            // this.goToTransition(TRANSITION.GO_NORMAL);
        });
        this.node.runAction(
            cc.sequence(
                cc.delayTime(1.1),
                cc.callFunc(() => {
                    Emitter.instance.emit(EventCode.EFFECT_LAYER.MINIBOSS_SMASH, { nodeSmashTail: this.nodePosSmashTail, scaleX: this.node.scaleX });
                    Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.03, amplitude: 3 });
                }),
            ),
        );
    },

    updateItemSlot() {
        if (!(this._status.has(STATUS.Shield))) {
            this.disableItemSlot(SLOT_NAME.Shield);
        }
        if (!(this._status.has(STATUS.Trident))) {
            this.disableItemSlot(SLOT_NAME.Trident);
        }
        if (!(this._status.has(STATUS.Hat))) {
            this.disableItemSlot(SLOT_NAME.Hat);
        }
        if (!(this._status.has(STATUS.Shoulder))) {
            this.disableItemSlot(SLOT_NAME.Shoulder);
        }
    },

    onCatch(data) {
        if (!data.MiniBossInfo) return;
        const dataInfo = data.MiniBossInfo;
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (data.GoldReward >= data.BulletMultiple * GameConfig.instance.BIG_WIN_RATIO.BIG_WIN_VALUE && dataInfo.ItemID != 6) { // 6 is gem
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_BIG_WIN_EFFECT, {
                player,
                bet: data.BulletMultiple,
                gold: data.GoldReward,
            });
            data.isBigWin = true;
        }
        this.dropItemById(data, true, player);
        if (dataInfo.die) {
            this.allGuardFishSuicide(data);
            this._isDie = true;
            this._fsm.goDie();
        }
    },

    allGuardFishSuicide(data) {
        const listBonusFish = data.MiniBossInfo.BonusFish;
        if (listBonusFish && listBonusFish.length > 0) {
            listBonusFish.forEach((fishData) => {
                const fish = FishManager.instance.getFishById(fishData.FishID);
                // eslint-disable-next-line radix
                fishData.GoldReward = parseInt(fishData.GoldReward);
                fishData.BulletMultiple = data.BulletMultiple;
                fishData.DeskStation = data.DeskStation;
                fishData.skipUpdateWallet = true;
                fish.onSuicide(fishData);
            });
        }
    },

    update() {
        if (this._isDie || !this._initialized) { return; }
        this.updateAngle();
        this.updateOutScreen();
    },

    updateOutScreen() {
        const lastState = this._isOutScreen;
        this._super();
        if (lastState && !this._isOutScreen) {
            Emitter.instance.emit(EventCode.FISH_LAYER.BOSS_ON_GAME);
        }
    },

    onHit() {
        if (this._mainMaterial) {
            this.fishAnim.node.color = cc.Color.WHITE;
            this._mainMaterial.setProperty('brightness', 0.2);
        }
        this.fishAnim.node.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(() => {
                if (this._mainMaterial) {
                    this.fishAnim.node.color = cc.Color.WHITE;
                    this._mainMaterial.setProperty('brightness', 0.0);
                }
            }),
        ));
    },

    onCollisionEnter(other) {
        const bullet = other.getComponent("gfBullet");
        if (!bullet || this._isDie || this._isOutScreen) return;
        if (!bullet._LockedFish || bullet._LockedFish._FishID === this._FishID) {
            if (this._fsm.state === STATE.SHIELD) {
                this.unschedule(this.offShield);
                this.scheduleOnce(this.offShield, 2);
            } else {
                this._fsm.goShield();
            }
        }
    },

    getLockPositionByNodeSpace(node) {
        let position;
        switch (this._itemLeft) {
            case 5:
                position = this.getBonePositionInWorldSpace(BONES.Shield);
                break;
            case 4:
                position = this.getBonePositionInWorldSpace(BONES.Trident);
                break;
            case 3:
                position = this.getBonePositionInWorldSpace(BONES.ShoulderL);
                break;
            case 2:
                position = this.getBonePositionInWorldSpace(BONES.Hat);
                break;
            default:
                position = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        return node.convertToNodeSpaceAR(position);
    },

    onDie(isResume = false) {
        if(!isResume){
            Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
        }
        this._isDie = true;
        Emitter.instance.emit(EventCode.GAME_LAYER.REMOVE_FISH, this._FishID);
        this.node.stopAllActions();
        this.node.destroy();
    },

    offShield() {
        this._fsm.goNormal();
    },

    checkSmash() {
        const timePassed = this.checkTimePassed();
        if (timePassed < TIME_SMASH[0]) {
            this.scheduleSmash();
        } else {
            const remainTime = TIME_MOVE - timePassed;
            if (remainTime > TIME_DELAY_SMASH) {
                this.scheduleOnce(this.scheduleSmash, TIME_DELAY_SMASH);
            }
        }
    },
    scheduleSmash() {
        if (this._timesSmash.length < 1) return;
        const timePassed = this.checkTimePassed();
        const deltaTime = this._timesSmash[0] - timePassed;
        if (deltaTime > 0) {
            this.scheduleOnce(this.smash, deltaTime);
        } else {
            this.smash();
        }
    },

    smash() {
        this._fsm.goSmash();
    },

    updateAura() {
        this.spAura.setCompleteListener(() => { });
        this.spAura.setAnimation(0, this._itemLeft, false);
        this.spAura.setCompleteListener(() => {
            this.spAura.setAnimation(0, this._itemLeft, false);
        });
    },

    getMainMaterial() {
        return this.fishAnim.getMaterial(0);
    },

    checkTimePassed() {
        return Math.max(0, ((DataStore.instance.getTime() - this._buildTick) / 1000 - FishStartDelay));
    },

    checkOutScreen() { },
    moveOut() { },
    onIced() { },
    returnPool() { },
});
