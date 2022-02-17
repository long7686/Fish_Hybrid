const { toInteger } = require("lodash");
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

const NUMBER_CHILD_IN_TOGGLE = 7;

cc.Class({
    extends: cc.Component,
    properties: {
        childName: "",
        isOn: true,
        friendNode: cc.Node,
        _listChildOn: [cc.Node],
        _listChildOff: [cc.Node],
        frameOn: cc.Node,
        frameOff: cc.Node,
    },

    onLoad() {
        this._listChildOn.length = 0;
        this._listChildOff.length = 0;

        if (this.childName !== "") {
            for (let i = 0; i < NUMBER_CHILD_IN_TOGGLE; i++) {
                const fishOn = this.node.parent.getChildByName(`${this.childName + i}_On`);
                if (fishOn) {
                    this._listChildOn.push(fishOn.getComponent("gfFishCellAutoBot"));
                }
                const fishOff = this.node.parent.getChildByName(`${this.childName + i}_Off`);
                if (fishOff) {
                    this._listChildOff.push(fishOff.getComponent("gfFishCellAutoBot"));
                }
            }
        }
    },

    countChildIsChoosing() {
        let count = 0;
        this._listChildOn.forEach((fish) => {
            if (fish.node.active) {
                count++;
            }
        });
        return count;
    },

    onShow(isActive) {
        this.node.active = isActive;
    },

    onShowFrame(isActive) {
        this.frameOff.active = !isActive;
        this.frameOn.active = isActive;
    },

    onSelectAll() {
        this._listChildOn.forEach((fish) => {
            fish.show(true);
        });
        this._listChildOff.forEach((fish) => {
            fish.show(false);
        });
        this.onShowFrame(true);
    },

    onDeSelectAll() {
        this._listChildOn.forEach((fish) => {
            fish.show(false);
        });
        this._listChildOff.forEach((fish) => {
            fish.show(true);
        });
        this.onShowFrame(false);
    },

    onBtnAll(target, data) {
        this.node.parent.getComponent("gfPopupAutoBotSetting").handleBlockTouch();
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        const state = toInteger(data);
        this.node.active = !this.node.active;
        this.friendNode.active = !this.node.active;
        if (state === 1) {
            // turn on all
            this.onSelectAll();
        } else {
            // turn off all
            this.onDeSelectAll();
        }
        this._listChildOn.forEach((fish) => {
            this.node.parent.getComponent("gfPopupAutoBotSetting").onUpdateFish(state, fish.fishID, 0);
        });
    },

    getListFish() {
        return this._listChildOn;
    },
});
