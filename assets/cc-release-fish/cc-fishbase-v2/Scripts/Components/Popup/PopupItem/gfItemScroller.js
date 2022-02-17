const { isArrayEqual } = require('gfUtilities');
const GameConfig = require('gfBaseConfig');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

cc.Class({
    extends: cc.Component,

    properties: {
        prefabItem: { default: null, type: cc.Node },
        autoScrollSpeed: { default: 0.0, type: cc.Float },
        scaleMax: { default: 1.0, type: cc.Float },
        scaleMin: { default: 0.5, type: cc.Float },
        itemPadding: { default: 50.0, type: cc.Float },
        scaleViewDistance: { default: 100.0, type: cc.Float },
        bg: cc.Node,
        btnPlus: cc.Button,
        btnMinus: cc.Button,
        spFrameStart: cc.SpriteFrame,
        spFrameEnd: cc.SpriteFrame,
    },

    onLoad() {
        this.arrValue = [];
        this.totalItem = 0;
        this._curItemIdx = 0;
        this._autoScrollDistance = 0.0;
        this._isAutoScrolling = false;
        this._fishScrollDirectionAutoBot = GameConfig.instance.ScrollDirectionAutoBot.LEFT;
        this._touchMoveDirection = GameConfig.instance.TouchDirectionAutoBot.LEFT;
        this._itemLeftBoundary = null;
        this._itemRightBoundary = null;
        this._touchPos = cc.v2(0, 0);
        this._center = cc.v2(0.0, 0.0);
        this._items = [];
        // Register Touch Event
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel.bind(this));

        this.canPlaySound = false;
    },

    start() {
        // init value
        // this.updateLeftRightBoundary();
        // this.reset();
    },

    updateLeftRightBoundary() {
        if (Array.isArray(this._items) && this._items.length > 0) {
            const { 0: firstItem, [this._items.length - 1]: lastItem } = this._items;
            this._itemLeftBoundary = firstItem;
            this._itemRightBoundary = lastItem;
        }
    },

    reset() {
        this._curItemIdx = Math.floor(this.totalItem * 0.5);
        const curItem = this.getCurrentItem();
        const moveDistance = -curItem.x;
        this.moveItem(moveDistance);
    },

    initItemList(arrValue) {
        if (arrValue && !isArrayEqual(arrValue, this.arrValue)) {
            this.arrValue = arrValue;
            this.totalItem = this.arrValue.length;
        } else {
            return;
        }
        let posX = 0.0;
        const paddingItem = this.itemPadding;

        this.prefabItem.parent = null;
        for (let index = 0; index < this.arrValue.length; index++) {
            const item = cc.instantiate(this.prefabItem);
            item.value = index;
            item.scale = this.scaleMin;
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

    update(dt) {
        this._items.forEach((item) => {
            this.updateItemStatus(item);
        });

        if (this._isAutoScrolling) {
            this._autoScroll(dt);
        }
    },

    // Private Function
    _autoScroll(dt) {
        if (this._fishScrollDirectionAutoBot == GameConfig.instance.ScrollDirectionAutoBot.RIGHT) {
            let step = this.autoScrollSpeed * dt;
            if (this._autoScrollDistance + step >= 0.0) {
                step = -this._autoScrollDistance;
                this._autoScrollDistance = 0.0;
                this._isAutoScrolling = false;
            } else {
                this._autoScrollDistance += step;
            }
            this.moveItem(step);
        } else {
            let step = this.autoScrollSpeed * dt;
            if (this._autoScrollDistance - step <= 0.0) {
                step = this._autoScrollDistance;
                this._autoScrollDistance = 0.0;
                this._isAutoScrolling = false;
            } else {
                this._autoScrollDistance -= step;
            }
            this.moveItem(-step);
        }
    },

    moveItem(offset) {
        this._items.forEach((item) => {
            if (item) {
                item.x += offset;
            }
        });
    },

    onTouchBegan(touch) {
        this._touchPos = touch.getLocation();
    },

    onTouchMoved(touch) {
        this.handleMoveLogic(touch);
    },

    onTouchEnded(touch) {
        let _isAutoScroll = false;
        if (this._touchPos.x - touch.getPreviousLocation().x != 0.0) {
            _isAutoScroll = true;
        }

        if (_isAutoScroll) {
            this.handleReleaseLogic(touch);
        }
    },

    onTouchCancel(touch) {
        this.handleReleaseLogic(touch);
    },

    handleMoveLogic(touch) {
        const touchPoint = touch.getLocation();
        const offset = touchPoint.x - touch.getPreviousLocation().x;

        if (offset < 0) {
            this._touchMoveDirection = GameConfig.instance.TouchDirectionAutoBot.LEFT;
        } else if (offset > 0) {
            this._touchMoveDirection = GameConfig.instance.TouchDirectionAutoBot.RIGHT;
        }

        this.moveItem(offset);
    },

    handleReleaseLogic() {
        let isScrollOverScreen = true;
        let scaleMaxRatio = this.scaleMin;
        this._items.forEach((item) => {
            if (item && item.scale > scaleMaxRatio) {
                scaleMaxRatio = item.scale;
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

    scrollToItem(idx) {
        idx = parseInt(idx);
        if (idx < 1) idx = 1;
        if (idx >= this._items.length) {
            idx = this._items.length - 1;
        }
        this._curItemIdx = idx;
        const curItem = this._items[idx];
        this._autoScrollDistance = curItem.x - this._center.x;
        this.autoScrollSpeed = Math.abs(this._autoScrollDistance) / 0.2;
        this._fishScrollDirectionAutoBot = this._autoScrollDistance > 0
            ? GameConfig.instance.ScrollDirectionAutoBot.LEFT : GameConfig.instance.ScrollDirectionAutoBot.RIGHT;
        this._isAutoScrolling = true;
        this.btnMinus.interactable = !(this._curItemIdx === 1);
        this.btnPlus.interactable = !(this._curItemIdx === (this._items.length - 1));
    },

    updateItemStatus(item) {
        const distance = Math.abs(item.x - this._center.x);
        const scaleRatio = Math.max(this.scaleMin, this.scaleMax - (distance * (this.scaleMax - this.scaleMin)) / this.scaleViewDistance);
        item.scale = scaleRatio;
        item.opacity = distance > (this.node.width + item.width) / 2 ? 0 : 255;
    },

    getCurrentItem() {
        if (this._curItemIdx >= 0) {
            return this._items[this._curItemIdx];
        }
    },
    getCurrentIdx() {
        return this._curItemIdx;
    },

    getItems() {
        return this._items;
    },

    moveToNextItem() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        if (this._curItemIdx < this._items.length - 1) {
            this.scrollToItem(this._curItemIdx + 1);
        }
    },

    moveToPreviousItem() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        if (this._curItemIdx > 1) {
            this.scrollToItem(this._curItemIdx - 1);
        }
    },

    canScrollPlaySound() {
        let isCenter = false;
        this._items.forEach((item) => {
            if (item.x === 0.0) {
                isCenter = true;
            }
        });

        if (!this._isAutoScrolling && this.canPlaySound) {
            if (isCenter) {
                this.canPlaySound = false;
                return true;
            }
        }
        return false;
    },
});
