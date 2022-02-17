

const { convertAssetArrayToObject } = require('utils');
const ReferenceManager = require('gfReferenceManager');

const DELAY_TIME_SHOW_GEM = 3.5;
cc.Class({
    extends: cc.Component,

    properties: {
        arrAssetItem: {
            default: [],
            type: cc.SpriteFrame,
        },
        mainItem: cc.Node,
        eff1: cc.Node,
    },

    onLoad() {
        this.node.flyItemToPlayer = this.flyItemToPlayer.bind(this);
        this.node.flyGemToPlayer = this.flyGemToPlayer.bind(this);
        this.ASSET_ITEM = convertAssetArrayToObject(this.arrAssetItem);
    },

    flyItemToPlayer(data) {
        const {
            item, pos, scaleX, playerIndex, GoldReward, isBigWin,
        } = data;
        this.mainItem.getComponent(cc.Sprite).spriteFrame = this.ASSET_ITEM[item];
        if (!this.mainItem) {
            return;
        }
        if (!this.mainItem.active) {
            this.mainItem.active = true;
        }
        this.mainItem.scale = 0;
        this.eff1.scale = 0;
        this.eff1.opacity = 255;
        const appearTime = 0.5;
        const moveTime = 0.5;
        const standTime = 1;
        this.node.scaleX = -scaleX;
        cc.tween(this.mainItem)
            .to(appearTime, { scale: 1.5 })
            .start();
        cc.tween(this.eff1)
            .to(appearTime, { scale: 1.5 })
            .start();
        cc.tween(this.node)
            .to(appearTime, { position: cc.v2(this.node.x, this.node.y + 200) })
            .delay(standTime)
            .call(() => {
                this.eff1.scale = 0;
                this.eff1.opacity = 255;
                cc.tween(this.eff1)
                    .to(moveTime * 0.75, { scale: 1 })
                    .start();
                cc.tween(this.mainItem)
                    .to(moveTime, { scale: 1 });
            })
            .to(moveTime, { position: this.convertMovePositionEnd(pos, playerIndex) }, { easing: "cubicOut" })
            .call(() => {
                const player = ReferenceManager.instance.getPlayerByIndex(playerIndex);
                if (player.isMe && !isBigWin) {
                    player.addToDisplayWallet(GoldReward);
                }
                this.node.destroy();
            })
            .start();
    },

    flyGemToPlayer(pos, callback) {
        this.mainItem.scale = 0;
        this.eff1.scale = 0;
        this.eff1.opacity = 0;
        const appearTime = 0.5;
        const moveTime = 0.5;
        const standTime = 1;
        const tweenEffect = cc.tween(this.eff1)
            .to(appearTime, { scale: 0.6, opacity: 255 });
        const tweenMainItem = cc.tween(this.mainItem)
            .to(appearTime, { scale: 2 });
        cc.tween(this.node)
            .delay(DELAY_TIME_SHOW_GEM)
            .parallel(
                cc.tween()
                    .call(() => {
                        tweenEffect.start();
                        tweenMainItem.start();
                    }),
                cc.tween()
                    .to(appearTime, { position: cc.v2(this.node.x, this.node.y + 200) }),
            )
            .delay(standTime)
            .to(moveTime, { position: pos }, { easing: "cubicOut" })
            .call(() => {
                callback();
                this.node.removeFromParent(true);
            })
            .start();
    },
    convertMovePositionEnd(pos, playerIndex) {
        switch (playerIndex) {
            case 0:
            case 1:
                return cc.v2(pos.x, pos.y + 100);
            case 2:
            case 3:
                return cc.v2(pos.x, pos.y - 100);
            default:
                break;
        }
        return cc.v2(pos.x, pos.y + 100);
    },
});
