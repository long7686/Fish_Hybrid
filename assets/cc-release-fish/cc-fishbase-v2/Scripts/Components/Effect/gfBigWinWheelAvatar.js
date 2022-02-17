const {formatCoin} = require('gfUtilities');
const {convertAssetArrayToObject} = require('utils');
const ActionEffect = require('ActionEffect');
const ReferenceManager = require('gfReferenceManager');
const BaseConfig = require('gfBaseConfig');
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');

cc.Class({
    extends: require('gfBigWinWheel'),
    properties: {
        iconMainFish: cc.Node,
        ribbon: cc.Node,
        _listEffect: [],
        _currentFishKind: 0
    },

    onLoad() {
        this.iconMainFish.sizeByTyeWin = 0.8;
        this._setUpConstantsVariable();
        this.spine.setMix(this.ANIMATION_NAME.APPEAR, this.ANIMATION_NAME.IDLE, 0.1);
    },

    _setUpConstantsVariable(){
        this.SKIN_NAME = cc.Enum({
            WIN: "Thang",
            BIG_WIN: "ThangLon",
            SUPER_WIN: "ThangCucLon",
            MEGA_WIN: "ThangSieuLon"
        });

        this.ANIMATION_NAME = cc.Enum({
            APPEAR: "AllAppear",
            IDLE: "AllIdle",
            DISAPPEAR: "RibbonAppear"
        });

        this.TWEEN_COIN_DURATION = {
            DEFAULT: 2.5,
            FAST: 1,
        };
    },

    setUpListAvatarIcon(listIcon){
        this._listFishFrame = listIcon;
    },

    setUpListTextFrame(listTextFrame){
        this._listTextFrame = listTextFrame;
    },

    showAnimation({gold, bet, isMe, fishKind = 17, isTextImage, isKill}) {
        this.txtCoin.node.active = isMe;
        this.txtCoinOther.node.active = !isMe;
        if (!gold) return;
        if (!this._isShowing) {
            this._reset(isMe);
            this._playAnim({ gold, bet, isMe, fishKind, isTextImage, isKill });
        } else {
            this._listEffect.push({gold, bet, isMe, fishKind, isTextImage, isKill});
        }
    },

    _playAnim({gold, bet, isMe, fishKind, isTextImage, isKill}) {

        this.lblCoin = (isMe) ? this.txtCoin : this.txtCoinOther;
        this.lblCoin.node.active = true;
        this._winValue += gold;
        const skinName = this._setSkinByBet(bet);
        Emitter.instance.emit(EventCode.SOUND.PAUSE_OR_RESUME_SOUND_WIN, false);
        skinName == this.SKIN_NAME.MEGA_WIN ? Emitter.instance.emit(EventCode.SOUND.MEGA_WIN) : Emitter.instance.emit(EventCode.SOUND.BIG_WIN);
        const delayTimeTweenCoin = this._currentSkinName === '' ? 1 : 0;

        this._tweenCoin({ winAmount: this._winValue, delay: delayTimeTweenCoin });

        let delayTime = this._currentSkinName !== skinName ? 0.5 : 0;
        this._playSpinAnim(skinName);
        this._playActionIconMainFish({ delayTime, fishKind, isTextImage, isKill, gold });
        this._isShowing = true;
    },

    hideAnimation(playEffect = true) {
        if (!this._isShowing) return;
        if (playEffect) {
            this._checkHideAnim();
        } else {
            this.resetAllAction();
            this.node.active = false;
        }

    },

    _playSpinAnim(skinName) {
        if (this._currentSkinName !== skinName) {
            this.spine.setSkin(skinName);
            if (cc.sys.isNative) {
                this.spine.setToSetupPose();
            }
            this._currentSkinName = skinName;
            this.spine.setAnimation(0, this.ANIMATION_NAME.APPEAR, false);
            this.spine.setCompleteListener(this._completeAppear.bind(this));

        } else {
            this.spine.setAnimation(0, this.ANIMATION_NAME.IDLE, true);
        }
    },

    _setSkinByBet(bet) {
        let skinName = this.SKIN_NAME.BIG_WIN;
        this.iconMainFish.sizeByTyeWin = 0.8;
        if (this._winValue >= bet * BaseConfig.instance.BIG_WIN_RATIO.SUPER) {
            skinName = this.SKIN_NAME.MEGA_WIN;
            this.iconMainFish.sizeByTyeWin = 1;
        } else if (this._winValue >= bet * BaseConfig.instance.BIG_WIN_RATIO.HUGE) {
            skinName = this.SKIN_NAME.SUPER_WIN;
            this.iconMainFish.sizeByTyeWin = 0.9;
        }
        return skinName;
    },

    _completeAppear() { // eslint-disable-line
        this.spine.setAnimation(0, this.ANIMATION_NAME.IDLE, true);
        this.spine.setCompleteListener(() => {

        });
    },

    _changeImageFishIcon(data) {
        const {fishKind, isTextImage, isKill} = data;
        this.iconMainFish.stopAllActions();
        this.iconMainFish.runAction(
            cc.sequence(
                cc.scaleTo(.1, 0).easing(cc.easeBackOut()),
                cc.callFunc(() => {
                    this._updateImage(fishKind, isTextImage, isKill);
                }),
                cc.scaleTo(.5, this.iconMainFish.sizeByTyeWin).easing(cc.easeBackOut()),
                cc.callFunc(() => {
                    const effect = ActionEffect.shake(this.iconMainFish, .5, 0);
                    this.iconMainFish.runAction(effect);
                })
            )
        );
    },

    _updateImage(fishKind, isTextImage, isKill){
        const assetFishes = convertAssetArrayToObject(this._listFishFrame);
        let sprite = null;
        if (isTextImage) {
            if (isKill) {
                sprite = assetFishes['Avatar_' + fishKind];
            } else {
                sprite = this._listTextFrame[0];
            }

        } else {

            if (assetFishes['Avatar_' + fishKind]) {
                sprite = assetFishes['Avatar_' + fishKind];
            } else {
                sprite = assetFishes['Avatar_' + 22];
            }

        }

        this.iconMainFish.getComponent(cc.Sprite).spriteFrame = sprite;
    },

    _tweenCoin(data) {
        const {winAmount} = data;
        if (this.tweenCoin) {
            this.tweenCoin.stop();
        }
        this.tweenCoin = cc.tween(this)
            .call(()=>{
                Emitter.instance.emit(EventCode.SOUND.PAUSE_OR_RESUME_SOUND_WIN, false);
            })
            .to(this._duration, {coinValue: winAmount}, {easing: "sineInOut"})
            .call(() => {
                Emitter.instance.emit(EventCode.SOUND.PAUSE_OR_RESUME_SOUND_WIN, true);
                this._checkHideAnim(true);
            });
        this.tweenCoin.start();
    },

    _playActionIconMainFish(data) {
        const { delayTime, fishKind } = data;
        this.spine.node.runAction(
            cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(() => {
                    if (this._currentFishKind !== fishKind) {
                        this._changeImageFishIcon(data);
                        this._currentFishKind = fishKind;
                    }
                })
            )
        );
    },

    _checkHideAnim() {
        if (!this._checkPlayNext()) {
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(() => {
                        if (!this._checkPlayNext()) {
                            Emitter.instance.emit(EventCode.SOUND.STOP_BIG_WIN);
                            this._playAnimHideEffect();
                        }
                    })
                )
            );
        }
    },

    _checkPlayNext() {
        if (this._listEffect.length > 0) {
            this._duration = this.TWEEN_COIN_DURATION.FAST;
            const info = this._listEffect.shift();
            this._playAnim(info);
            return true;
        }

        return false;
    },

    _playAnimHideEffect() {
        this.spine.setAnimation(0, this.ANIMATION_NAME.DISAPPEAR, false);
        this.spine.setCompleteListener(()=>{
            this.node.active = false;
            this.spine.setCompleteListener(()=>{});
        });
        this.lblCoin.node.runAction(
            cc.scaleTo(.2, 0),
        );
        this.iconMainFish.stopAllActions();
        this.iconMainFish.runAction(
            cc.scaleTo(.2, 0),
        );
        this.ribbon.runAction(
            cc.scaleTo(.2, 0),
        );
        const player = ReferenceManager.instance.getPlayerByIndex(this.index);
        if (player.isMe) {
            player.addToDisplayWallet(this._winValue);
        }

        this._resetInfo();
    },

    _updateCoinWin() {
        this.lblCoin.string = formatCoin(this._coinValue);
        if (this.lblCoin.node.width > this.ribbon.width - 120) {
            this.ribbon.width += 5;
        }
    },

    _resetInfo() {
        this._winValue = 0;
        this.coinValue = 0;
        this._isShowing = false;
        this._currentSkinName = '';
        this._currentFishKind = 0;
        this.iconMainFish.sizeByTyeWin = 0.8;
        this._duration = this.TWEEN_COIN_DURATION.DEFAULT;
        this.ribbon.width = 250;
        this.lblCoin.string = '';
        if (this.tweenCoin) {
            this.tweenCoin.stop();
        }
    },

    _reset(isMe) {
        this.node.active = true;
        this.iconMainFish.setScale(0);
        this.ribbon.setScale(0);
        this.lblCoin = (isMe) ? this.txtCoin : this.txtCoinOther;
        this.lblCoin.string = '';
        this.lblCoin.node.setScale(0);
        this.lblCoin.node.runAction(
            cc.scaleTo(.5, 1).easing(cc.easeBounceOut()),
        );
        this.ribbon.runAction(
            cc.scaleTo(.5, 1).easing(cc.easeBounceOut()),
        );
    },

    resetAllAction() {
        this.node.stopAllActions();
        this.ribbon.stopAllActions();
        this.lblCoin.node.stopAllActions();
        this.spine.node.stopAllActions();
        this.iconMainFish.stopAllActions();
        if (this.tweenCoin) {
            this.tweenCoin.stop();
        }
        this._listEffect = [];
        this.spine.setToSetupPose();
        this.spine.clearTrack(0);
        this.iconMainFish.setScale(0);
        this._isShowing = false;
        this._resetInfo();
    },

});
