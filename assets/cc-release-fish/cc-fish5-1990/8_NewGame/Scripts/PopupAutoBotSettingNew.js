const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');

cc.Class({
    extends: require('gfPopupAutoBotSetting'),

    properties: {
        txtAllOn: cc.Label,
        txtAllOff: cc.Label,
    },

    initComponents() {
        this._timeScroller = this.timeSection.getComponentInChildren("gfItemScroller");
        this._bulletScroller = this.bulletSection.getComponentInChildren('gfBulletScroller');
        this._btnDragonOn = this.node.getChildByName("Fish_GODZILLA_On");
        this._btnBoomOff = this.node.getChildByName("Fish_Boom_Off");
        this._btnBoomOn = this.node.getChildByName("Fish_Boom_On");
    },

    onUpdatePosButtonByRoomKind() {
        this._allArray.length = 0;
        if (DataStore.instance.getCurrentRoom() === GameConfig.instance.RoomKind.VIP) {
            this._allArray = [...GameConfig.instance.LIST_FISH_ROOM_VIP];
            this.dragon.getComponent("gfFishCellAutoBot").isShow = true;
            this.dragon.active = true;
            this._btnDragonOn.getComponent("gfFishCellAutoBot").isShow = true;
        } else {
            this._allArray = [...GameConfig.instance.LIST_FISH_ROOM_NORMAL];
            this.dragon.getComponent("gfFishCellAutoBot").isShow = false;
            this.dragon.active = false;
            this._btnDragonOn.getComponent("gfFishCellAutoBot").isShow = false;
        }
    },
});
