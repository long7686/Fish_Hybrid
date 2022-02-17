

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const { registerEvent, removeEvents } = require('gfUtilities');
const ReferenceManager = require('gfReferenceManager');
const FishManager = require('gfFishManager');
const DataStore = require('gfDataStore');

cc.Class({
    extends: cc.Component,
    properties: {
        eventWinWheels: {
            default: [],
            type: require('gfEventWinWheel'),
        },
        eventItemFX: cc.Prefab,
        _listFXItem: []
    },

    onLoad() {
        this.initEvents();
        this.effectLayer = this.node.getComponent('gfEffectLayer');
        for (let i = 0; i < 4; ++i) {
            this._listFXItem[i] = [];
        }
    },

    initEvents() {
        registerEvent(EventCode.EFFECT_LAYER.PLAY_EFFECT_EVENT_WIN, this.playEffectEventWin, this);
        registerEvent(EventCode.EFFECT_LAYER.REMOVE_EVENT_EFFECT_PLAYER, this.removeEventEffectOfPlayer, this);
        registerEvent(EventCode.GAME_LAYER.UPDATE_EVENT_TRAY, this.playEventTrayFX, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.UPDATE_EVENT_STATUS, this.onUpdateStatusEvent, this);
    },

    onUpdateStatusEvent(data){
        const {EventStartTime, EventEndTime} = data;
        if((DataStore.instance.getTime() < EventStartTime) || (DataStore.instance.getTime() > EventEndTime)) {
            this.resetOnExit();
        }
    },

    playEventTrayFX(data) {
        if (data.ItemID == 0) return;
        const fish = FishManager.instance.getFishById(data.FishID);
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        const eventTray = ReferenceManager.instance.getEventTrayByDeskStation(data.DeskStation);
        if (fish && player && eventTray) {
            if(player.isMe && data.GoldReward > 0){
                player.addGoldReward(data.GoldReward);
            }
                    
            const eventItem = cc.instantiate(this.eventItemFX);
            if (!eventItem) return;
            const startPos = fish.getLockPositionByNodeSpace(this.node);
            const endPos = this.node.convertToNodeSpaceAR(eventTray.getPositionByWorldSpace(data.ItemID));
            const dataInfo = {
                startPos,
                endPos,
                data
            };
            this.node.addChild(eventItem);
            this._listFXItem[player.index].push(eventItem);
            eventItem.playAnimation(dataInfo, () => {
                eventTray.updateTray(data.listItem);
                if (data.GoldReward > 0) {
                    if(player.isMe){
                        Emitter.instance.emit(EventCode.EFFECT_LAYER.ADD_ANIM_TO_QUEUE_ANIM, "EVENT", data);
                    } else {
                        this.playEffectEventWin(data);
                    }
                   
                }
            });
        }
    },

    playEffectEventWin(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        const eventTray = ReferenceManager.instance.getEventTrayByDeskStation(data.DeskStation);
        if (player && eventTray) {
            if (player.isMe) {
                eventTray.reset();
                Emitter.instance.emit(EventCode.CUT_SCENE.SHOW_CUT_SCENE, "CutSceneWinEvent", data, () => {
                    Emitter.instance.emit(EventCode.EFFECT_LAYER.CHECK_QUEUE_ANIM);
                    player.addToDisplayWallet(data.GoldReward);
                });
            } else {
                eventTray.reset();
                this.eventWinWheels[player.index].playAnimation(data, () => {});
            }
        }
    },

    removeEventEffectOfPlayer(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        const listFXItem = this._listFXItem[player.index];
        listFXItem.forEach((item) => {
            item.stopAllActions();
            if (cc.isValid(item)) {
                item.destroy();
            }
        });
        listFXItem.length = 0;
    },

    resetOnExit() {
        this.unscheduleAllCallbacks();
        this._listFXItem.forEach((arr) => {
            arr.forEach((item) => { 
                item.stopAllActions();
                if (cc.isValid(item)) {
                    item.destroy();
                }
            });
            arr.length = 0;  
        });
    },

  

    onDestroy() {
        removeEvents(this);
    },

});
