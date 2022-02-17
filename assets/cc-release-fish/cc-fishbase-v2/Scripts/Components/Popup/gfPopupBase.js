const GameConfig = require('gfBaseConfig');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
cc.Class({
    extends: cc.Component,

    properties: {
        fadeSpeed: {
            default: 0.1
        },
        popupTitle: cc.Node,
        contents: {
            type: cc.Node,
            default: null,
        },
        // overlay: {
        //     type: cc.Node,
        //     default: null,
        //     visible: false
        // },
        _callback: null,
        popupBackground: cc.Node,
        // contents: cc.Node,
        // overlay: cc.Node,
        btnClose: cc.Node,
        // _opacityShowOverlay: 150,
        _animStyleShow: null,
        _animStyleHide: null,
        _showPosition: null,
    },
    onLoad() {
        //node param
        this.node.scale = 0;
        //custom param
        this.node.show = this.show.bind(this);
        this.node.hide = this.hide.bind(this);
        this.node.resetState = this.onResetState.bind(this);
        this.initLanguage();
        this.initObj();
        this.initEvent();
        this.setAnimPopup();
    },
    initObj() {
        if (this.contents == null) {
            this.contents = this.node;
        }
        if (this.btnClose) {
            this.btnClose.off('click');
            this.btnClose.on('click', (() => {
                Emitter.instance.emit(EventCode.SOUND.CLICK);
                this.btnClose.getComponent(cc.Button).interactable = false;
                this.onClose();
            }), this);
        }
        this._showPosition = cc.v2(this.contents.x, this.contents.y);
        this.fullScale = 1;
    },

    show() {
        this.node.stopAllActions();
        if (this.contents) {
            this.contents.stopAllActions();
        }
        // if (this.overlay) {
        //     this.overlay.stopAllActions();
        // }
        this.node.active = true;
        if (this.btnClose) {
            this.btnClose.getComponent(cc.Button).interactable = true;
        }
        this.showWithEffect();
        this.node.zIndex = GameConfig.instance.Z_INDEX.POPUP;
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.DEFAULT;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.DEFAULT;
    },

    initLanguage() {
    },

    initEvent() {
    },

    showWithEffect() {
        this.node.active = true;
        this.contents.opacity = 0;
        let animation, hidePosition, duration;
        switch (this._animStyleShow) {
            case GameConfig.instance.POPUP_ANIMATION.PULSE:
                this.node.scale = cc.v2(1, 1);
                animation = cc.spawn(
                    cc.fadeIn(0.3),
                    cc.sequence(
                        new cc.scaleTo(0.15, this.fullScale + 0.1).easing(cc.easeSineOut()),
                        new cc.scaleTo(0.15, this.fullScale).easing(cc.easeSineOut())
                    )
                );
                duration = 0.3;
                break;
            case GameConfig.instance.POPUP_ANIMATION.BOUNCE:
                this.node.scale = cc.v2(1, 1);
                this.contents.opacity = 255;
                hidePosition = cc.v2(this.contents.x, this.contents.y + this.popupBackground.height * 1.5);
                this.contents.y = hidePosition.y;
                animation = cc.moveTo(0.65, cc.v2(this._showPosition.x, this._showPosition.y)).easing(cc.easeBackOut(0.15));
                duration = 0.65;
                break;
            case GameConfig.instance.POPUP_ANIMATION.EASE:
                this.node.scale = cc.v2(1, 1);
                this.contents.opacity = 255;
                hidePosition = cc.v2(this.contents.x - this.popupBackground.width * 1.5, this.contents.y);
                this.contents.x = hidePosition.x;
                animation = cc.moveTo(0.65, this._showPosition.x, this._showPosition.y).easing(cc.easeBackOut());
                duration = 0.65;
                break;
            case GameConfig.instance.POPUP_ANIMATION.FADE:
                this.node.scale = cc.v2(1, 1);
                animation = cc.fadeIn(0.3);
                duration = 0.3;
                break;
            default:
                this.node.scale = cc.v2(1, 1);
                this.contents.opacity = 255;
                // if (this.overlay) {
                //     this.overlay.opacity = this._opacityShowOverlay;
                // }
                break;
        }

        if (animation != null) {
            console.log('duration intentionally for overlay animation', duration);
            // if (this.overlay) {
            //     this.overlay.runAction(cc.fadeTo(duration / 2, this._opacityShowOverlay));
            // }
            this.contents.runAction(animation);
        }
    },
    hideWithEffect(animStyle) {
        let animation = [];
        let duration, hidePosition = null;
        const style = animStyle || this._animStyleHide;
        switch (style) {
            case GameConfig.instance.POPUP_ANIMATION.PULSE:
                animation.push(cc.spawn(cc.fadeIn(0.3),
                    cc.sequence(new cc.scaleTo(0.15, this.fullScale + 0.1).easing(cc.easeSineIn()),
                        new cc.scaleTo(0.15, this.fullScale - 0.1).easing(cc.easeSineIn()))));
                duration = 0.3;
                break;
            case GameConfig.instance.POPUP_ANIMATION.BOUNCE:
                hidePosition = cc.v2(this.contents.x, this.contents.y + this.popupBackground.height * 1.5);
                animation.push(cc.moveTo(0.65, cc.v2(this._showPosition.x, hidePosition.y)).easing(cc.easeBackIn(0.15)));
                duration = 0.65;
                break;
            case GameConfig.instance.POPUP_ANIMATION.EASE:
                hidePosition = cc.v2(this.contents.x - this.popupBackground.width * 1.5, this.contents.y);
                animation.push(cc.moveTo(0.65, hidePosition.x, this._showPosition.y).easing(cc.easeBackIn()));
                duration = 0.65;
                break;
            case GameConfig.instance.POPUP_ANIMATION.FADE:
                animation.push(cc.fadeOut(this.fadeSpeed));
                duration = this.fadeSpeed;
                break;
            default:
                this.node.active = false;
                this.onResetState();
                if (this._callback) {
                    this._callback();
                }
                // if (this.overlay) {
                //     this.overlay.opacity = 0;
                // }
                break;
        }
        if (animation && animation.length > 0) {
            animation.push(cc.callFunc(() => {
                this.node.active = false;
                this.onResetState();
            }));
            if (this._callback)
                animation.push(cc.callFunc(this._callback.bind(this)));
            if (this.contents) {
                this.contents.runAction(cc.sequence(animation));
            }
            console.log('duration intentionally for overlay animation', duration);
            // if (this.overlay) {
            //     this.overlay.runAction(cc.fadeOut(duration));
            // }
        } else {
            this.node.active = false;
            this.onResetState();
        }
    },
    hide(animStyle) {
        this.hideWithEffect(animStyle);
    },
    onResetState() {
        if (!cc.isValid(this.node)) return;
        if (this.contents) {
            this.contents.opacity = 255;
            this.contents.position = this._showPosition;
        }
        this.node.scale = 0;
    },
    onClose() {
        Emitter.instance.emit(EventCode.POPUP.CLOSE_TOP_POPUP);
    },
});
