const { convertAssetArrayToObject } = require('utils');
cc.Class({
    extends: cc.Component,

    properties: {
        listItem: [cc.Node],
        listIcon: [cc.SpriteFrame]
    },

    onLoad() {
        this.node.active = false;
        this.assetIcon = convertAssetArrayToObject(this.listIcon);
    },

    updateTray(listItem = []) {
        if (!Array.isArray(listItem)) return;
        this.reset();
        listItem.forEach((itemId) => {
            this.listItem[itemId - 1].getComponent(cc.Sprite).spriteFrame = this.assetIcon[(itemId - 1) + "_pick"];
        });
    },

    hide() {
        this.node.active = false;
    },

    reset() {
        this.node.active = true;
        this.listItem.forEach((item, index) => {
            item.getComponent(cc.Sprite).spriteFrame = this.assetIcon[index + "_normal"];
        });
    },

    cloneListItem() {
        const listItemClone = [];
        this.listItem.forEach((item) => {
            listItemClone.push(cc.instantiate(item));
        });
        return listItemClone;

    },

    getPositionByWorldSpace(itemID) {
        return this.node.convertToWorldSpaceAR(this.listItem[itemID - 1].position);
    },
});
