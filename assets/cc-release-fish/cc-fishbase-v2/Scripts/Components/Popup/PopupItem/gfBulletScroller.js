const { isArrayEqual } = require('gfUtilities');
const GameConfig = require('gfBaseConfig');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

cc.Class({
    extends: require('gfItemScroller'),

    initItemList(arrValue) {
        if (arrValue && !isArrayEqual(arrValue, this.arrValue)) {
            this.arrValue = arrValue;
            this.totalItem = this.arrValue.length;
        }
        let posX = 0.0;
        const paddingItem = this.itemPadding;
        for (let i = 0; i < this._items.length; ++i) {
            this._items[i].removeFromParent();
            this._items[i].destroy();
        }
        this._items.length = 0;

        this.prefabItem.parent = null;
        for (let index = 0; index < this.arrValue.length; index++) {
            const item = cc.instantiate(this.prefabItem);
            item.value = index;
            item.scale = this.scaleMin;
            item.getComponent(cc.Toggle).uncheck();
            this.node.addChild(item);

            item.x = posX;

            posX += item.width + paddingItem;
            const arrLbl = item.getComponentsInChildren(cc.Label);
            for (let i = 0; i < arrLbl.length; ++i) {
                arrLbl[i].string = this.arrValue[index];
            }
            this._items.push(item);
        }

        const curItem = this.getCurrentItem();
        curItem.getComponent(cc.Toggle).check();
        const moveDistance = -curItem.x;
        this.moveItem(moveDistance);
        this.bg.zIndex = 9999;
        this.updateLeftRightBoundary();
    },

    reset() {
        this._curItemIdx = Math.floor(this.totalItem * 0.5);
        const curItem = this.getCurrentItem();
        curItem.getComponent(cc.Toggle).check();
        const moveDistance = -curItem.x;
        this.moveItem(moveDistance);
    },

    moveToPreviousItem() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        if (this._curItemIdx > 0) {
            this.scrollToItem(this._curItemIdx - 1);
        }
    },

    scrollToItem(idx) {
        idx = parseInt(idx);
        if (idx < 0) idx = 0;
        if (idx >= this._items.length) idx = this._items.length;
        this._curItemIdx = idx;
        const curItem = this._items[idx];
        curItem.getComponent(cc.Toggle).check();
        this._autoScrollDistance = curItem.x - this._center.x;
        this.autoScrollSpeed = Math.abs(this._autoScrollDistance) / 0.2;
        this._fishScrollDirectionAutoBot = this._autoScrollDistance > 0
            ? GameConfig.instance.ScrollDirectionAutoBot.LEFT : GameConfig.instance.ScrollDirectionAutoBot.RIGHT;
        this._isAutoScrolling = true;
        this.btnMinus.interactable = !(this._curItemIdx === 0);
        this.btnPlus.interactable = !(this._curItemIdx === (this._items.length - 1));
    },

});
