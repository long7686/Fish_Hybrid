const GameConfig = require('gfBaseConfig');

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        const loadConfigAsync = require('loadConfigAsync');
        const { IS_PRODUCTION } = loadConfigAsync.getConfig();
        if (IS_PRODUCTION) {
            this.node.active = false;
        } else {
            this.node.zIndex = GameConfig.instance.Z_INDEX.WAITING + 100;
            const { getUrlParam } = require('gameCommonUtils');
            this.node.active = !!getUrlParam('sbt');
        }
    },

    start () {

    },
    onClick(){
        const loadConfigAsync = require('loadConfigAsync');
        const { LOBBY_SCENE_NAME } = loadConfigAsync.getConfig();
        cc.director.loadScene(LOBBY_SCENE_NAME);
    },
});
