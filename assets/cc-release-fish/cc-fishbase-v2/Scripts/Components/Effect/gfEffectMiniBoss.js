

const { registerEvent, removeEvents } = require("gfUtilities");
const EventCode = require("gfBaseEvents");
const BaseConfig = require('gfBaseConfig');
const Emitter = require('gfEventEmitter');
const { getPostionInOtherNode } = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        finMiniBoss: cc.Prefab,
        itemMiniboss: cc.Prefab,
        effHitMiniboss: cc.Prefab,
        gemMiniBoss: cc.Prefab,
        criticalMiniBoss: cc.Prefab,
        _lstEffectMiniboss: [],
    },

    onLoad() {
        this.initEvent();
    },
    initEvent() {
        registerEvent(EventCode.EFFECT_LAYER.MINIBOSS_DROP_ITEM, this.playMiniBossDropItem, this);
        registerEvent(EventCode.EFFECT_LAYER.MINIBOSS_DROP_GEM, this.playMiniBossDropGem, this);
        registerEvent(EventCode.EFFECT_LAYER.MINIBOSS_CRITICAL, this.playCriticalMiniBoss, this);
        registerEvent(EventCode.EFFECT_LAYER.MINIBOSS_DROP_FIN, this.playMiniBossDropFin, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.resetOnExit, this);
    },

    playMiniBossDropFin(dataInput) {
        const { data, fishPos, fishKind } = dataInput;
        const finMiniBoss = cc.instantiate(this.finMiniBoss);
        finMiniBoss.parent = this.node;
        finMiniBoss.position = this.node.convertToNodeSpaceAR(fishPos);
        const angle = parseInt(Math.random() * 360);
        finMiniBoss.getChildByName("image").angle = angle;
        const animFinDrop = finMiniBoss.getComponent(cc.Animation);
        animFinDrop.off(cc.Animation.EventType.FINISHED);
        animFinDrop.on(cc.Animation.EventType.FINISHED, () => {
            if(!data.isBigWin) {
                Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, {
                    data,
                    fishKind,
                    fishPos
                });
            }
            finMiniBoss.removeFromParent(true);
            finMiniBoss.destroy();
        });
        this._lstEffectMiniboss.push(finMiniBoss);
    },

    playCriticalMiniBoss(data) {
        const { worldPos, scaleX } = data;
        const criticalMiniBoss = cc.instantiate(this.criticalMiniBoss);
        criticalMiniBoss.parent = this.node;
        criticalMiniBoss.position = this.node.convertToNodeSpaceAR(worldPos);
        if (scaleX == -1) {
            criticalMiniBoss.getComponent(cc.Animation).play('cristicalMiniBossR');
        } else {
            criticalMiniBoss.getComponent(cc.Animation).play('cristicalMiniBossL');
        }
        const animCrit = criticalMiniBoss.getComponent(cc.Animation);
        animCrit.off(cc.Animation.EventType.FINISHED);
        animCrit.on(cc.Animation.EventType.FINISHED, () => {
            criticalMiniBoss.removeFromParent(true);
            criticalMiniBoss.destroy();
        });
        this._lstEffectMiniboss.push(criticalMiniBoss);
    },

    playMiniBossDropGem(dataInput) {
        const {
            data, worldPos, player, fishPos,
        } = dataInput;

        const gem = cc.instantiate(this.gemMiniBoss);
        gem.parent = this.node;
        gem.position = this.node.convertToNodeSpaceAR(worldPos);
        gem.y -= 100;
        const dest = getPostionInOtherNode(this.node, player.node);
        gem.flyGemToPlayer(dest, () => {
            Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, {
                data,
                fishKind: BaseConfig.instance.FISH_KIND.MINIBOSS,
                fishPos,
                skipUpdateWallet: true,
            });
        });
        this._lstEffectMiniboss.push(gem);
    },

    playMiniBossHitEffect(worldPos) {
        const effHitMiniboss = cc.instantiate(this.effHitMiniboss);
        effHitMiniboss.parent = this.node;
        effHitMiniboss.position = this.node.convertToNodeSpaceAR(worldPos);
        const animEffHit = effHitMiniboss.getComponent(cc.Animation);
        animEffHit.off(cc.Animation.EventType.FINISHED);
        animEffHit.on(cc.Animation.EventType.FINISHED, () => {
            effHitMiniboss.removeFromParent(true);
            effHitMiniboss.destroy();
        });
        this._lstEffectMiniboss.push(effHitMiniboss);
    },

    playMiniBossDropItem(data) {
        const {
            itemName, worldPos, player, scaleX, GoldReward, isBigWin, ignoreItem,
        } = data;
        this.playMiniBossHitEffect(worldPos);
        if (ignoreItem) return;
        const item = cc.instantiate(this.itemMiniboss);
        item.parent = this.node;
        item.position = this.node.convertToNodeSpaceAR(worldPos);
        item.y -= 100;
        const pos = getPostionInOtherNode(this.node, player.node);
        item.flyItemToPlayer({
            item: itemName,
            pos,
            scaleX,
            playerIndex: player.index,
            GoldReward,
            isBigWin,
        });
        this._lstEffectMiniboss.push(item);
    },

    resetOnExit() {
        this.unscheduleAllCallbacks();
        this._lstEffectMiniboss.forEach((effect) => {
            effect.stopAllActions();
            effect.removeFromParent(true);
            if (cc.isValid(effect)) {
                effect.destroy();
            }
        });
        this._lstEffectMiniboss.length = 0;
    },

    onDestroy() {
        this.unscheduleAllCallbacks();
        removeEvents(this);
    },
});
