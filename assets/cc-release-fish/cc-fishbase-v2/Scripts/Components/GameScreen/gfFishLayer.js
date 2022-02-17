

const ReferenceManager = require('gfReferenceManager');
const { convertAssetArrayToObject } = require('utils');
const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
cc.Class({
    extends: cc.Component,
    properties: {
        listPrefabFish: {
            default: [],
            type: cc.Prefab,
        },
    },

    onLoad() {
        ReferenceManager.instance.setData({ FishLayer: this.node });
        this.fishObjects = convertAssetArrayToObject(this.listPrefabFish);
        this.node.getPrefabFishByKind = this.getPrefabFishByKind.bind(this);
        this.initEvents();
    },
    
    initEvents() {
        registerEvent(EventCode.COMMON.FISH_LOG, this.fishLog, this);
    },
    getPrefabFishByKind(fishKind) {
        return this.fishObjects[fishKind];
    },

    fishLog(meta = 'fishLog'){
        const fishLogEvent = new cc.Event.EventCustom('FISH_LOG', true);
        fishLogEvent.setUserData({meta});
        this.node.dispatchEvent(fishLogEvent);
    },

    onDestroy() {
        removeEvents(this);
    },

});
