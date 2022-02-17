

const { isArrayEqual } = require('gfUtilities');

cc.Class({
    extends: require("gfItemScroller"),

    initItemList(arrValue) {
        if (arrValue && !isArrayEqual(arrValue, this.arrValue)) {
            this.arrValue = arrValue;
            this.totalItem = this.arrValue.length;
        } else {
            return;
        }
        let posX = 0.0;
        let paddingItem = this.itemPadding;

        this.prefabItem.parent = null;
        for (let index = 0; index < this.arrValue.length; index++) {
            let item = cc.instantiate(this.prefabItem);
            item.value = index;
            if(item.getChildByName("LbBet")){
                item.getChildByName("LbBet").scale = this.scaleMin;
            }
            else{
                item.scale = this.scaleMin;
            }
            if (index === 0) {
                item.getComponentInChildren(cc.Sprite).spriteFrame = this.spFrameStart;
            }
            if (index === this.arrValue.length - 1) {
                item.getComponentInChildren(cc.Sprite).spriteFrame = this.spFrameEnd;
            }
            this.node.addChild(item);

            item.x = posX;
            item.on(cc.Node.EventType.TOUCH_END, () => {
                this.scrollToItem(item.value);
            });
            posX += item.getBoundingBox().width + paddingItem;
            item.getChildByName('LbBet').getComponent(cc.Label).string = this.arrValue[index];
            this._items.push(item);
        }
        this.prefabItem.destroy();
        this.bg.zIndex = 9999;
    },
    
    updateItemStatus(item) {
        let distance = Math.abs(item.x - this._center.x);
        let scaleRatio = Math.max(this.scaleMin, this.scaleMax - (distance * (this.scaleMax - this.scaleMin)) / this.scaleViewDistance);
        if(item.getChildByName("LbBet")){
            item.getChildByName("LbBet").scale = scaleRatio;
        }
        else{
            item.scale = this.scaleMin;
        }
        item.opacity = distance > (this.node.width + item.width) / 2 ? 0 : 255;
    },

    handleReleaseLogic() {
        let isScrollOverScreen = true;
        let scaleMaxRatio = this.scaleMin;
        this._items.forEach(item => {
            if (item && item.getChildByName("LbBet").scale > scaleMaxRatio) {
                scaleMaxRatio = item.getChildByName("LbBet").scale;
                this._curItemIdx = item.value;
                isScrollOverScreen = false;
            }
        });

        if (isScrollOverScreen) {
            if (this._itemLeftBoundary && this._itemLeftBoundary.x > this._center.x) {
                this._curItemIdx = 0;
            } else if (this._itemRightBoundary && this._itemRightBoundary.x < this._center.x) {
                this._curItemIdx = this._items.length - 1;
            }
        }

        this.scrollToItem(this._curItemIdx);
        this.canPlaySound = true;
    },
});
