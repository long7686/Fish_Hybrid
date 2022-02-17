cc.Class({
    extends: cc.Component,

    properties: {
        _isShow: false,
        _lstMessage: [],
        contentNode: cc.Node,
        AtlasFishNotify: cc.SpriteAtlas,
        defaultFontSize: {
            default: 32,
        },
        defaultFont: cc.Font,
        moneyFont: cc.BitmapFont,
        _defaultSpriteSize: {
            default: cc.size(40, 40),
            serializable: false
        },
    },

    onLoad() {
        this.node.show = this.show.bind(this);
        this.node.play = this.play.bind(this);
        this.node.hide = this.hide.bind(this);
        this.node.onBeforeSceneChange = this.onBeforeSceneChange.bind(this);
        this.node.onAfterSceneChange = this.onAfterSceneChange.bind(this);
        this.node.active = false;
    },
    show() {
    },

    hide() {
    },

    onStackMessage() {
        if (this._lstMessage.length > 0) {
            const data = this._lstMessage.shift();
            this.play(data);
        }
        else {
            this.hide();
        }
    },

    createNotifyMessage(data) {
        this.contentNode.removeAllChildren(true);
        Object.values(data).forEach(element => {
            if (element.type === "label") {
                this.decorLabel(element);
            } else {
                this.decorSprite(element);
            }
        });
    },

    decorLabel(element) {
        const color = cc.Color.WHITE;
        //create node with label
        let node = new cc.Node();
        node.parent = this.contentNode;
        let label = node.addComponent(cc.Label);
        label.string = element.str;

        if (element.color) {
            node.color = color.fromHEX(element.color);
        }
        label.fontSize = (element.fontSize) ? element.fontSize : this.defaultFontSize;

        if (element.isMoney && this.moneyFont) {
            label.font = this.moneyFont;
        } else if (this.defaultFont) {
            label.font = this.defaultFont;
        } else {
            label.useSystemFont = true;
        }
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        // label.cacheMode = cc.Label.CacheMode.CHAR;
        label._updateRenderData(true);
    },

    decorSprite(element) {
        let node = new cc.Node();
        node.parent = this.contentNode;
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.AtlasFishNotify.getSpriteFrame(element.spriteFrame);
        node.width = this._defaultSpriteSize.width;
        node.height = this._defaultSpriteSize.height;
    },

    onBeforeSceneChange() {
        //reset notify
        this.node.stopAllActions();
        //Clear children
        this.contentNode && this.contentNode.removeAllChildren(true);
    },
    onAfterSceneChange() {
        this._isShow = false;
        if (this._lstMessage.length) {
            this.show(this._lstMessage.shift());
        } else {
            this.hide();
        }
    },
});
