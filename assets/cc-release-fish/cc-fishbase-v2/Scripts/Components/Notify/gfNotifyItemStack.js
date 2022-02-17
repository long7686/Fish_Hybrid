const { formatUserName } = require('gfUtilities');
cc.Class({
    extends: cc.Component,

    properties: {
        userName: cc.Label,
        winAmount: cc.Label,
        iconImage: cc.Sprite,
        atlasIconFish: cc.SpriteAtlas,
        _iconPrefix: "",
        _isShow: false,
    },
    initObj(index) {
        this._index = index;
        this._config = {
            SPACING: 30,
            HEIGHT: this.node.height,
            WIDTH: this.node.width,
            TIME_MOVE: 0.25,
        };
        this.reset();
        this.extendInit();
    },

    extendInit() {
    },


    updateData(dataInput) {
        let {data} = dataInput;
        // Override here
        this.userName.string = formatUserName(data.userName) + " ";
        this.winAmount.string = data.goldReward;
        this.iconImage.spriteFrame = this.atlasIconFish.getSpriteFrame(this._iconPrefix + data.itemKind);
    },

    moveToIndex(newIndex, lastItem = false) {
        if (!this.checkShow()) {
            this.node.stopAllActions();
            this.setIndex(newIndex);
            return;
        }
        const { SPACING, HEIGHT, TIME_MOVE } = this._config;
        const postStartY = -this._index * (SPACING + HEIGHT);
        const postEndY = -newIndex * (SPACING + HEIGHT);
        const posStart = cc.v2(0, postStartY);
        const posEnd = cc.v2(0, postEndY);
        this.setIndex(newIndex);
        this.node.stopAllActions();
        this.node.setPosition(posStart);
        this.node.active = true;
        this.node.opacity = 255;
        this.node.zIndex = 1;
        if (lastItem) {
            this._isShow = false;
            cc.tween(this.node)
                .to(TIME_MOVE, { position: posEnd, opacity: 0 })
                .start();
        } else {
            cc.tween(this.node)
                .to(TIME_MOVE, { position: posEnd })
                .start();
        }

    },

    showItem(data) {
        const { WIDTH, TIME_MOVE } = this._config;
        const posStart = cc.v2(-WIDTH, 0);
        const posEnd = cc.v2(0, 0);
        this.setIndex(0);
        this.node.stopAllActions();
        this.node.setPosition(posStart);
        this.node.active = true;
        this.node.opacity = 255;
        this.node.zIndex = 2;
        cc.tween(this.node)
            .call(() => {
                this._isShow = true;
                this.updateData(data);
            })
            .to(TIME_MOVE, { position: posEnd})
            .start();
    },

    hideAfterDeltaTime({idleTime, timeMove}){
        this.node.stopAllActions();
        cc.tween(this.node)
            .delay(idleTime)
            .to(timeMove, { opacity: 0 })
            .call(() => {
                this._isShow = false;
                this.reset();
            })
            .start();
    },

    getIndex() {
        return this._index;
    },

    setIndex(index) {
        this._index = index;
    },

    checkShow() {
        return this._isShow;
    },

    reset() {
        this.node.stopAllActions();
        this._isShow = false;
        this.node.active = false;
    }
});
