const EventCode = require('gfBaseEvents');
const { convertAssetArrayToObject } = require('utils');
const { registerEvent, removeEvents } = require('gfUtilities');
const GameConfig = require('gfBaseConfig');
cc.Class({
    extends: cc.Component,

    properties: {
        listCutScene: [cc.Prefab],
        _listNodeCutScene : []
    },


    onLoad() {
        this.node.zIndex = GameConfig.instance.Z_INDEX.CUTSCENE;
        this.cutSceneAssets = convertAssetArrayToObject(this.listCutScene);
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
        registerEvent(EventCode.CUT_SCENE.SHOW_CUT_SCENE, this.showCutScene, this);
        registerEvent(EventCode.CUT_SCENE.HIDE_CUT_SCENE, this.hideCutScene, this);
        registerEvent(EventCode.CUT_SCENE.HIDE_ALL_CUT_SCENE, this.hideAllCutScene, this);
    },

    showCutScene(name = "", content = null, callback) {
        const cutScenePrefab = this.cutSceneAssets[name];
        if (!cutScenePrefab) return;
        const cutSceneItem = cc.instantiate(cutScenePrefab);
        cutSceneItem.parent = this.node;
        cutSceneItem.show(content, callback);
        this._listNodeCutScene.push(cutSceneItem);
    },
    
    hideCutScene() {
        //TODO: implement later
    },

    hideAllCutScene() {
        this._listNodeCutScene.forEach((item)=> {
            if(cc.isValid(item)){
                item.resetOnExit();
                item.destroy();
            }
        });
        this._listNodeCutScene.length = 0;
    },

    resetOnExit(){
        this.hideAllCutScene();
    },

    onDestroy() {
        removeEvents(this);
    },
});
