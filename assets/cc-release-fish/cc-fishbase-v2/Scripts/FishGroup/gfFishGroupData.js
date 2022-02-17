const DataStore = require('gfDataStore');

class gfFishGroupData {

    constructor() { }

    destroy() {
        gfFishGroupData.instance = null;
    }

    _initData(data) {
        this.buildTick = data.buildTick;
        this.timeSkipped = data.timeSkipped || 0;
        this.flipCoord = DataStore.instance.getSelfDeskStation() > 1 ? -1 : 1;
        this.fishIndex = 0;
        this.listFish = data.ListFish;
        this.ParadeKind = data.ParadeKind;
        this.customZIndex = null;
    }

    _makeFishData(data) {
        if (!data || data.FishKind < 0) return null;
        data.TimeFreeze = (data.TimeFreeze || 0) / 1000 / 2;
        data.isFishGroup = true;
        data.buildTick = this.buildTick;
        data.isResume = this.timeSkipped > 0;
        if (this.customZIndex) {
            data.zIndex = this.customZIndex;
        }
        return data;
    }

    _getFishData() {
        return this._makeFishData(this.listFish[this.fishIndex]);
    }

    _updateCustomZIndex(zIndex) {
        this.customZIndex = zIndex;
    }

    static initData(data) {
        if (!gfFishGroupData.instance) {
            gfFishGroupData.instance = new gfFishGroupData();
        }
        gfFishGroupData.instance._initData(data);
    }

    static getFishData() {
        return gfFishGroupData.instance._getFishData();
    }

    static getNextFishData() {
        const data = this.getFishData();
        this.incIndex();
        return data;
    }

    static incIndex() {
        ++gfFishGroupData.instance.fishIndex;
    }

    static isFlipped() {
        return gfFishGroupData.instance.flipCoord < 0;
    }

    static get flipCoord() {
        return gfFishGroupData.instance.flipCoord;
    }

    static get timeSkipped() {
        return gfFishGroupData.instance.timeSkipped;
    }

    static updateCustomZIndex(zIndex) {
        gfFishGroupData.instance._updateCustomZIndex(zIndex);
    }
}

gfFishGroupData.instance = null;
module.exports = gfFishGroupData;