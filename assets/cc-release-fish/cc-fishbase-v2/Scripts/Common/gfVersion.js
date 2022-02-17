const GameConfig = require('gfBaseConfig');

cc.Class({
    extends: cc.Component,

    properties: {
        versionText: cc.Label
    },

    onLoad () {
        this.versionText.string = GameConfig.instance.GameVersion;
        cc.log("- GAME VERSION - ", GameConfig.instance.GameVersion);

    },
});
