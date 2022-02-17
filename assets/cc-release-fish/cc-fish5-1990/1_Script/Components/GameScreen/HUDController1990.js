

const {convertAssetArrayToObject} = require('utils');
cc.Class({
    extends: require('gfHUDController'),
    properties: {
        btnFreeze: {
            default: null,
            visible: false,
            override: true
        },
        fxBtnBelow: {
            default: null,
            visible: false,
            override: true
        },
    },

    onLoad(){
        this._super();
        this._posBTN = [cc.v2(-100, -312.937), cc.v2(100, -312.937), cc.v2(0, -312.937)];
    },

    updateLockFishImg(fishKind = 0) {
        const assetFishes = convertAssetArrayToObject(this.listFishNotify);
        if (assetFishes[fishKind]) {
            this.fishNotifyImg.active = true;
            this.fishNotifyImg.getComponent(cc.Sprite).spriteFrame = assetFishes[fishKind];
            const scaleFactor = 0.5;
            this.fishNotifyImg.stopAllActions();
            this.fishNotifyImg.runAction(
                cc.sequence(
                    cc.scaleTo(0, scaleFactor, scaleFactor),
                    cc.scaleTo(0.1, scaleFactor + 0.25, scaleFactor + 0.25),
                    cc.scaleTo(0.1, scaleFactor, scaleFactor)
                )
            );
        }
    },
});
