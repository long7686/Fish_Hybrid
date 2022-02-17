

const {isEmpty} = require('gfUtilities');
const gfReferenceManager = cc.Class({
    ctor () {
        this.CurrentScene = null;
        this.FishLayer = null;
        this.PlayerLayer = null;
        this.HUDLayer = null;
        this.EffectLayer = null;
        this.GameLayer = null;
        this.EventTrayLayer = null;
    },

    setData(data){
        if(!isEmpty(data)){
            Object.keys(data).forEach ( key => {
                this[key] = data[key];
            });
        }
    },

    getBtnFreezeHUD(){
        return this.HUDLayer.getBtnFreeze();
    },

    getNodeFishLayer(){
        return this.FishLayer;
    },

    getNodeGameLayer(){
        return this.GameLayer;
    },

    getPrefabFishByKind(fishKind){
        return this.FishLayer && this.FishLayer.getPrefabFishByKind(fishKind);
    },

    getPlayerByIndex(index){
        return this.PlayerLayer && this.PlayerLayer.getPlayerByIndex(index);
    },
    getPlayerByDeskStation(deskStation){
        return this.PlayerLayer && this.PlayerLayer.getPlayerByDeskStation(deskStation);
    },

    getEventTrayByDeskStation(deskStation){
        return this.EventTrayLayer && this.EventTrayLayer.getEventTrayByDeskStation(deskStation);
    },

    getEffectLayer(){
        return this.EffectLayer;
    },

    destroy(){
        gfReferenceManager.instance = null;
    }
});

gfReferenceManager.instance = null;
module.exports = gfReferenceManager;
