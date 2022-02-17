
const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");
const DataStore = require('gfDataStore');
const ReferenceManager = require('gfReferenceManager');
cc.Class({
    extends: cc.Component,

    properties: {
        listEventTray: [require('gfEventTray')],
    },


    onLoad() {
        ReferenceManager.instance.setData({ EventTrayLayer: this.node });
        this.node.getEventTrayByDeskStation = this.getEventTrayByDeskStation.bind(this);
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.EVENT_TRAY_LAYER.RESET_EVENT_TRAY, this.resetAllEventTray, this);
        registerEvent(EventCode.EVENT.EVENT_COMING, this.onEventComing, this);
        registerEvent(EventCode.EVENT.EVENT_PLAYING, this.onEventPlaying, this);
        registerEvent(EventCode.EVENT.EVENT_END, this.onEventEnd, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.hideAllEventTray, this);
    },

    onEventComing(){
        this.listEventTray.forEach((eventTray, index) => {
            const player = ReferenceManager.instance.getPlayerByIndex(index);
            if (player && player.isActive()) {
                eventTray.hide();
            }
        });
    },

    onEventEnd(){
        this.listEventTray.forEach((eventTray, index) => {
            const player = ReferenceManager.instance.getPlayerByIndex(index);
            if (player && player.isActive()) {
                eventTray.hide();
            }
        });
    },

    onEventPlaying(){
        this.listEventTray.forEach((eventTray, index) => {
            const player = ReferenceManager.instance.getPlayerByIndex(index);
            if (player && player.isActive()) {
                eventTray.reset();
            }
        });
    },


    getEventTrayByDeskStation(deskStation) {
        if (!this.listEventTray) return null;
        let index = deskStation;
        if (DataStore.instance.getSelfDeskStation() >= 2) {
            index = [2, 3, 0, 1][deskStation];
        }
        return this.listEventTray[index];
    },

  

    hideEventTray(DeskStation) {
        const eventTray = this.getEventTrayByDeskStation(DeskStation);
        if (eventTray) {
            eventTray.hide();
        }
    },

    restEventTray(DeskStation) {
        const eventTray = this.getEventTrayByDeskStation(DeskStation);
        if (eventTray) {
            eventTray.rest();
        }
    },

    hideAllEventTray(){
        this.listEventTray.forEach((eventTray) => {
            eventTray.hide();
        });
    },

    resetAllEventTray() {
        this.listEventTray.forEach((eventTray) => {
            eventTray.reset();
        });
    },

    onDestroy() {
        removeEvents(this);
    },



});
