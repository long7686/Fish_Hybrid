

const DataStore = require("gfDataStore");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onCollisionEnter(other) {
        const listCatchLaser = DataStore.instance.getListCatchLaser();
        const fish = other.getComponent("gfBaseFish");
        const index = this.getIndexInList(fish._FishID);
        if (index === -1) {
            listCatchLaser.push(fish._FishID);
        }
    },

    onCollisionExit(other) {
        const listCatchLaser = DataStore.instance.getListCatchLaser();
        const fish = other.getComponent("gfBaseFish");
        const index = this.getIndexInList(fish._FishID);
        if (index > -1) {
            listCatchLaser.splice(index, 1);
        }
    },

    getIndexInList(fishID) {
        const listCatchLaser = DataStore.instance.getListCatchLaser();
        for (let i = 0; i < listCatchLaser.length; i++) {
            if (listCatchLaser[i] === fishID) return i;
        }
        return -1;
    },

});
