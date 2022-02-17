const EventCode = require('gfBaseEvents');
const DataStore = require("gfDataStore");
const ReferenceManager = require("gfReferenceManager");
const {registerEvent, removeEvents } = require('gfUtilities');
const POS_AUTO_BOT = {
    LEFT: cc.v2(-500, -353),
    RIGHT: cc.v2(500, -353),
};
cc.Class({
    extends: cc.Component,

    properties: {
        tableIDText: cc.Label
    },

    onLoad() {
        registerEvent(EventCode.GAME_LAYER.UPDATE_TABLE_ID, this.updateTableID, this);
        registerEvent(EventCode.GAME_LAYER.ON_AFTER_INIT_PLAYER_LIST, this.updatePosition, this);
    },

    updateTableID () {
        const selfInfo = DataStore.instance.getSelfInfo();
        this.tableIDText.string = selfInfo.DeskId;

    },

    updatePosition() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        const pos = player.index === 0 ? POS_AUTO_BOT.LEFT : POS_AUTO_BOT.RIGHT;
        this.tableIDText.node.anchorX = player.index === 0 ? 1 : 0;
        this.node.setPosition(pos);
    },

    onDestroy() {
        removeEvents(this);
    },
});
