const MainFSM = require('gfMainFSM');
const EventCode = require('gfBaseEvents');
const DataStore = require('gfDataStore');
const {registerEvent, removeEvents} = require('gfUtilities');
const FishGroupHelper = require('gfFishGroupHelper');

const FishGroup1 = require('gfFishGroup01');
const FishGroup2 = require('gfFishGroup02');
const FishGroup3 = require('gfFishGroup03');
const FishGroup4 = require('gfFishGroup04');
const FishGroup5 = require('gfFishGroup05');

const FishStartDelay = 4;

cc.Class({
    extends: cc.Component,
    properties: {},

    start() {
        if (MainFSM.instance.isStateExit()) return;
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.GAME_LAYER.CREATE_FISH_GROUP, this.createFishGroup, this);
        registerEvent(EventCode.GAME_LAYER.RESUME_FISH_GROUP, this.resumeFishGroup, this);
    },

    resumeFishGroup(data) {
        if (data.ParadeKind >= 0) {
            this.createFishGroup({
                ListFish: data.ListParadeFish,
                ParadeKind: data.ParadeKind,
                timeSkipped: (DataStore.instance.getTime() - data.TimeBuildFishParade) / 1000 - FishStartDelay,
                buildTick: data.TimeBuildFishParade,
            });
        }
    },

    createFishGroup(data) {
        FishGroupHelper.initFishGroupData(data);

        switch (data.ParadeKind) {
            case 0:
                this.createFishGroup1();
                break;
            case 1:
                this.createFishGroup2();
                break;
            case 2:
                this.createFishGroup3();
                break;
            case 3:
                this.createFishGroup4();
                break;
            case 4:
                this.createFishGroup5();
                break;
            default:
                cc.error(`WRONG PARADE KIND: ${data.ParadeKind}`);
        }
    },


    createFishGroup1() {
        FishGroup1.create();
    },

    createFishGroup2() {
        FishGroup2.create();
    },

    createFishGroup3() { // Two circle group go facing each other
        FishGroup3.create();
    },

    createFishGroup4() { //  Two group make a cross.
        FishGroup4.create();
    },

    createFishGroup5() { // Two cirle rotating then spread out
        FishGroup5.create();
    },

    onDestroy() {
        removeEvents(this);
    },
});
