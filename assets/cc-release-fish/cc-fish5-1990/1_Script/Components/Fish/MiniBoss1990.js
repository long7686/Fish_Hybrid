

const lodash = require('lodash');
const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");
const ReferenceManager = require('gfReferenceManager');
const GameConfig = require('Config1990');
const DataStore = require('gfDataStore');
const {getRandomInt} = require('utils');
const SLOT_NAME = {
    SHIELD: [
        {
            Name: 'ChiTietPhai',
            InActive: "Empty",
        }, {
            Name: 'ChiTietTrai',
            InActive: "Empty",
        }, {
            Name: 'CucNangLuongXanh',
            InActive: "Empty",
        }
    ],
    ROCKET_L: [
        {
            Name: 'OngNangLuongPhai',
            InActive: "Empty",
        }, {
            Name: 'LuaDuoiPhai',
            InActive: "Empty",
        }, {
            Name: 'OngNangLuongPhaiShadow',
            InActive: "Empty",
        }
    ],
    ROCKET_R: [
        {
            Name: 'OngNangLuongTrai',
            InActive: "Empty",
        }, {
            Name: 'LuaDuoiTrai',
            InActive: "Empty",
        }, {
            Name: 'OngNangLuongTraiShadow',
            InActive: "Empty",
        }
    ],
    RADAR: [
        {
            Name: 'CucNangLuongVang',
            InActive: "Empty",
        }
    ],
};

const ITEM_CONFIG = {
    "FIN": { ID: 1, index: 0 },
    "ROCKET_L": { ID: 5, index: 1 },
    "ROCKET_R": { ID: 4, index: 2 },
    "RADAR": { ID: 2, index: 3 },
    "SHIELD": { ID: 3, index: 4 },
    "BODY": { ID: 6, index: 5 },
};

const ANIMATION_NAME = {
    WALK: "animation",
    DIE: "die",
};
const TIME_SCAN = [20, 20, 20]; //second
const TOTAL_ITEM = 5;
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
        fishAnim: sp.Skeleton,
        spAura: sp.Skeleton,
        listItemNode: [cc.Node],
        _initialized: false,
    },

    onLoad() {
        this.fishAnim.enableBatch = false;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
        this.listBox = this.getComponents(cc.BoxCollider);
        this.boxRocketLeft = this.listBox.find(item => item.tag == 4);
        this.boxRocketRight = this.listBox.find(item => item.tag == 2);
    },


    initFishData(data) {
        this._initialized = true;
        this._buildTick = data.buildTick ? data.buildTick : DataStore.instance.getTime();
        this._timeLost = Math.max(0, (DataStore.instance.getTime() - this._buildTick) / 1000);

        this.initUI(data);
        this._isFishGroup = true;
        this._skipRotate = false;
        this._isDie = false;
        this._FishID = data.FishID;
        this._FishKind = data.FishKind;
        this._mainMaterial = this.getMainMaterial();
        this._maxWidth = this.node.getComponent(cc.BoxCollider).size.width * this.node.scaleX;
        this._offsetX = this.node.getComponent(cc.BoxCollider).offset.x * this.node.scaleX;
        this._isOutScreen = false;
        this._isGoInScreen = !this._isOutScreen;
        this.node.zIndex = 0;
        this._targetPoint = cc.v2(0, 0);
        Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.MINI_BOSS);
    },

    calculateAnimScan(timePassed) {
        let totalTimeConfig = 0;
        const listAnimAction = [];
        TIME_SCAN.forEach((time) => {
            totalTimeConfig = totalTimeConfig + time;
            if (timePassed < totalTimeConfig) {
                const timeDelay = ((totalTimeConfig - timePassed) <= time) ? (totalTimeConfig - timePassed) : time;
                listAnimAction.push(cc.delayTime(timeDelay));
                listAnimAction.push(cc.callFunc(() => {
                    Emitter.instance.emit(EventCode.EFFECT_LAYER.SCAN_MINI_BOSS, this._FishID);
                }));
            }
        });
        if(listAnimAction.length > 0 ) {
            this.node.runAction(cc.sequence(listAnimAction));
        }
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
        this.fishAnim.setAnimation(0, ANIMATION_NAME.WALK, true);
        this.calculateAnimScan(this._timeLost);
    },

    //  ------------ SKIN -------------
    dropItemById(data, isPlayEffect = true) {
        const itemID = data.MiniBossInfo ? data.MiniBossInfo.ItemID : data;
        if (!this._initialized)
            return;
        switch (itemID) {
        case ITEM_CONFIG.FIN.ID:

            break;
        case ITEM_CONFIG.SHIELD.ID:
            Emitter.instance.emit(EventCode.SOUND.MINIBOSS_HIT);
            this.disableItemSlot(SLOT_NAME.SHIELD);
            if (isPlayEffect) {
                this.playDropItemEffect(data, itemID);
            }
            break;
        case ITEM_CONFIG.ROCKET_L.ID:
            Emitter.instance.emit(EventCode.SOUND.SIDE_SHIP_DIE);
            this.disableItemSlot(SLOT_NAME.ROCKET_L);
            this.boxRocketLeft.enabled = false;
            if (isPlayEffect) {
                this.playDropItemEffect(data, itemID);
            }
            break;
        case ITEM_CONFIG.ROCKET_R.ID:
            Emitter.instance.emit(EventCode.SOUND.SIDE_SHIP_DIE);
            this.disableItemSlot(SLOT_NAME.ROCKET_R);
            this.boxRocketRight.enabled = false;
            if (isPlayEffect) {
                this.playDropItemEffect(data, itemID);
            }
            break;
        case ITEM_CONFIG.RADAR.ID:
            Emitter.instance.emit(EventCode.SOUND.MINIBOSS_HIT);
            this.disableItemSlot(SLOT_NAME.RADAR);
            if (isPlayEffect) {
                this.playDropItemEffect(data, itemID);
            }
            break;
        default:
            break;
        }
        if (itemID > 1) {
            this._itemLeft--;
            this.updateAura();
        }
    },


    getBonePositionInWorldSpace(name) {
        const bone = this.fishAnim.findBone(name);
        return this.fishAnim.node.convertToWorldSpaceAR(cc.v2(bone.worldX, bone.worldY));
    },

    disableItemSlot(slotNames) {
        slotNames.forEach(slot => {
            this.fishAnim.setAttachment(slot.Name, slot.InActive);
        });
    },

    playDropItemEffect(data, itemId) {
        Emitter.instance.emit(EventCode.EFFECT_LAYER.MINIBOSS_DROP_ITEM, { data, itemNode: this.listItemNode[itemId - 1] });
    },
    // END SKIN

    // --------- ANIMATION --------------
    onCatch(data) {
        if (!data.MiniBossInfo) return;
        data.fishKind = this._FishKind;
        this.onPlayEffectWinInCatchFish(data);
        this.dropItemById(data, true);
        if (data.MiniBossInfo.die) {
            this.onPlayerEffectBossDie(data);
        }
    },

    onPlayerEffectBossDie(data) {
        if (this.fishAnim.animation == ANIMATION_NAME.DIE) return;
        this.node.stopAllActions();
        this.unscheduleAllCallbacks();
        this._isDie = true;
        this.spAura.node.active = false;
        this.fishAnim.setAnimation(0, ANIMATION_NAME.DIE, false);
        const durationAnimMinibossDie = this.fishAnim.findAnimation("die").duration;
        Emitter.instance.emit(EventCode.EFFECT_LAYER.EFFECT_MINI_BOSS_DIE, { data, fishNode: this.node, durationAnimMinibossDie});
        this.fishAnim.setCompleteListener(() => {
            this.node.runAction(cc.sequence(
                cc.fadeOut(1),
                cc.callFunc(() => {
                    this.onDie();
                })
            ));
        });
    },

    onPlayEffectWinInCatchFish(data) {
        const dataInfo = data.MiniBossInfo;
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (data.GoldReward >= data.BulletMultiple * GameConfig.instance.BIG_WIN_RATIO.BIG_WIN_VALUE) {

            let fishKind = this._FishKind;
            if(!dataInfo.die){
                if(dataInfo.ItemID === 4){
                    fishKind = this._FishKind + '_0';
                }else{
                    fishKind = this._FishKind + '_1';
                }
            }
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_BIG_WIN_EFFECT, {
                player: player,
                bet: data.BulletMultiple,
                gold: data.GoldReward,
                fishKind: fishKind
            });
        } else {
            const infoDetail = {
                DeskStation: data.DeskStation,
                FishID: data.FishID,
                GoldReward: data.GoldReward,
                BulletMultiple: data.BulletMultiple,
                itemInfo: data.itemInfo,
                isSkill: false
            };
            if(dataInfo.ItemID == 1) {
                const ramdomPos = cc.v2(getRandomInt(-10,10)*20, getRandomInt(-10,10)*10);
                this.listItemNode[0].position = ramdomPos;
            }
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, {
                data: infoDetail,
                fishKind: this._FishKind,
                fishPos: this.listItemNode[parseInt(dataInfo.ItemID) - 1].convertToWorldSpaceAR(cc.v2(0, 0)),
            });
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
            })
        ));
        this.auraEff();
    },

    onDie(isResume = false) {
        if(!isResume){
            Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.IN_GAME);
        }
        this._isDie = true;
        Emitter.instance.emit(EventCode.GAME_LAYER.REMOVE_FISH, this._FishID);
        if(cc.isValid(this.node)) {
            this.node.stopAllActions();
            this.node.destroy();
        } else {
            cc.warn("Clear invalid MiniBoss!");
        }
    },

    getLockPositionByNodeSpace(node) {
        if (this.currentItemTarget) {
            return node.convertToNodeSpaceAR(this.currentItemTarget.convertToWorldSpaceAR(cc.v2(0, 0)));
        } else {
            return node.convertToNodeSpaceAR(this.getLockPositionByWorldSpace());
        }
    },


    updateCurrentItemNode() {
        const itemConfig = Object.values(ITEM_CONFIG).find(obj => {
            return obj.index === (TOTAL_ITEM - this._itemLeft + 1);
        });
        if (itemConfig) {
            this.currentItemTarget = this.listItemNode[itemConfig.ID - 1];
        }
    },

    updateAura() {
        this.updateCurrentItemNode();
        this.spAura.setCompleteListener(() => { });
        this.spAura.setAnimation(0, this._itemLeft, false);
        this.spAura.setCompleteListener(() => {
            this.spAura.setAnimation(0, this._itemLeft, false);
        });
    },

    getMainMaterial() {
        return this.fishAnim.getMaterial(0);
    },

    auraEff() {
        this.spAura.setCompleteListener(() => { });
        this.spAura.setAnimation(0, this._itemLeft + 'hit', false);
        this.spAura.setCompleteListener(() => {
            this.spAura.setAnimation(0, this._itemLeft, false);
        });
    },

    updateOutScreen() {
        const lastState = this._isOutScreen;
        this._super();
        if (lastState && !this._isOutScreen) {
            Emitter.instance.emit(EventCode.FISH_LAYER.BOSS_ON_GAME);
        }
    },

    checkOutScreen() { },
    moveOut() { },
    onIced() { },
    returnPool() { }
});