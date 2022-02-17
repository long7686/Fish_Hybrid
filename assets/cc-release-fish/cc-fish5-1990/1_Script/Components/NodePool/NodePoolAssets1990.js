

const {convertAssetArrayToObject} = require('utils');
cc.Class({
    extends: require("gfNodePoolAssets"),

    properties: {
        freezeItemFX:{
            default: null,
            visible: false,
            override: true
        },
        dragonBall: {
            default: null,
            visible: false,
            override: true
        },
    },

    initMapAssets(){
        this._super();
        this.fishAnimationAssets = convertAssetArrayToObject(this.fishAnimationClip);
    },
});
