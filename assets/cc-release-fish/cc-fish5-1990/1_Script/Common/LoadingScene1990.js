

const GameConfig = require('Config1990');
cc.Class({
    extends: require('gfLoadingScene'),
    initGameConfig(){
        GameConfig.instance = new GameConfig();
    },
});
