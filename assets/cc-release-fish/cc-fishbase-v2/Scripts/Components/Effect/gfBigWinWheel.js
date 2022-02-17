const {formatCoin} = require('gfUtilities');
const BaseConfig = require('gfBaseConfig');
const {getPostionInOtherNode} = require('utils');
const ReferenceManager = require('gfReferenceManager');
const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const {removeEvents} = require('gfUtilities');
const SKIN_NAME = cc.Enum({
    WIN: "Thang",
    BIG_WIN: "Thang Lon",
    SUPER_WIN: "Thang Cuc Lon",
    MEGA_WIN: "Thang Sieu Lon",
});

cc.Class({
    extends: cc.Component,
    properties: {
        txtCoin: {
            default: null,
            type: cc.Label,
        },
        txtCoinOther: {
            default: null,
            type: cc.Label,
        },
        spine: {
            default: null,
            type: sp.Skeleton,
        },
        coinValue: {
            visible: false,
            get() {
                return this._coinValue;
            },
            set(value) {
                this._coinValue = value;
                this._updateCoinWin();
            },
        },
        _animShow: {
            default: "AllAppear",
            serializable: false,
        },
        _animIdle: {
            default: "AllIdle",
            serializable: false,
        },
        _animHide: {
            default: "AllDisappear",
            serializable: false,
        },
        _coinValue: 0,
        _winValue: 0,
        _tweenRL: null,
        _duration: 2.5,
        _ballWaiting: 0,
        _isDragonBigWin: false,
        _currentSkinName: '',
        _existBoard: false,
    },

    onLoad() {
        this.lblCoin = null;
        this._originPos = this.node.getPosition();
        this.initEvent();
    },

    initEvent() {
        //@TODO: split dragon ball to dedicated games
        // registerEvent(EventCode.DRAGON.BALL_ENTER_BIGWIN_WHEEL, this.onBallEnter, this);
    },
    showAnimation(data) {
        if (!this.node.active) {
            this.show(data);
        } else {
            this.updateData(data);
        }
    },
    show(data) {
        const {gold, bet, isMe} = data;
        if (!gold) {
            cc.warn('BigWin without Gold!!!');
            return;
        }
        this.node.active = true;
        this.reset();
        this.lblCoin = (isMe) ? this.txtCoin : this.txtCoinOther;
        this.lblCoin.node.active = true;
        this._winValue += gold;
        this._tweenCoin({winAmount: this._winValue, isMe});
        const skinName = this.getSkinByBet(bet);
        this._playSpinAnim(skinName);
    },
    reset() {
        this.resetLabels();
        this.node.stopAllActions();
        if (!this._originPos) this._originPos = this.node.getPosition();
        this.node.position = this._originPos;
        this.node.scale = 1;
        this.node.opacity = 255;
    },
    resetLabels() {
        let arr = [this.txtCoin, this.txtCoinOther];
        arr.forEach((item) => {
            item.node.stopAllActions();
            item.node.angle = 0;
            item.node.scale = 1;
            item.node.active = false;
            item.string = "";
        });
        arr.length = 0;
    },
    getSkinByBet(bet) {
        let skinName = SKIN_NAME.BIG_WIN;
        if (this._winValue >= bet * BaseConfig.instance.BIG_WIN_RATIO.SUPER) {
            skinName = SKIN_NAME.MEGA_WIN;
        } else if (this._winValue >= bet * BaseConfig.instance.BIG_WIN_RATIO.HUGE) {
            skinName = SKIN_NAME.SUPER_WIN;
        }
        return skinName;
    },
    _playSpinAnim(skinName) {
        this._currentSkinName = skinName;
        this.spine.setSkin(skinName);
        if (cc.sys.isNative) {
            this.spine.setToSetupPose();
        }
        this.spine.setAnimation(0, this._animShow, false);
        this.spine.addAnimation(0, this._animIdle, true);
        cc.tween(this.node)
            .delay(0.5)
            .call(() => {
                skinName === SKIN_NAME.MEGA_WIN
                    ? Emitter.instance.emit(EventCode.SOUND.MEGA_WIN)
                    : Emitter.instance.emit(EventCode.SOUND.BIG_WIN);
            })
            .start();
    },

    updateData(data) {
        const {gold, bet, isMe} = data;
        const skinName = this.getSkinByBet(bet);
        if (this.tweenCoin && !this.tweenCoin.isDone()) {
            if (!gold) {
                cc.warn('BigWin without Gold!!!');
                return;
            }
            if (skinName !== this._currentSkinName) {
                this._playSpinAnim(skinName);
            }
            this._winValue += gold;
            this._tweenCoin({winAmount: this._winValue, isMe});
        } else { //closing
            this.show(data);
        }
    },

    onBallEnter() {
        this.node.active = true;
        const {isMe} = ReferenceManager.instance.getPlayerByIndex(this.index);
        this.lblCoin = isMe ? this.txtCoin : this.txtCoinOther;
        this._resetTxtAngle();
        --this._ballWaiting;
        if (this._ballWaiting === 0) {
            this.spine.setAnimation(0, "RibbonAppear", false);
            this.spine.addAnimation(0, "AllIdle", true);
            this._tweenCoin({winAmount: this._winValue, isMe});
            Emitter.instance.emit(EventCode.DRAGON.DONE_PLAYER_BIGWIN);
        }
    },

    showDragonBalls({winValue, ballCount}) {
        this.node.active = true;
        if (this.tweenCoin) {
            this._coinValue = 0;
            this.tweenCoin.stop();

            const player = ReferenceManager.instance.getPlayerByIndex(this.index);
            if (player.isMe) {
                player.addToDisplayWallet(this._winValue);
            }
        }

        const {isMe} = ReferenceManager.instance.getPlayerByIndex(this.index);
        this.lblCoin = isMe ? this.txtCoin : this.txtCoinOther;
        this.reset();
        this._ballWaiting = ballCount;
        this._isDragonBigWin = true;
        const skiName =
            ballCount > 5 ? SKIN_NAME.MEGA_WIN : ballCount > 4 ? SKIN_NAME.SUPER_WIN : ballCount > 2 ? SKIN_NAME.BIG_WIN : SKIN_NAME.WIN;
        this.spine.setSkin(skiName);
        if (cc.sys.isNative) {
            this.spine.setToSetupPose();
        }
        this._winValue = winValue | 0;
        this.lblCoin.string = "";
        this.spine.setAnimation(0, "SpinnerAppear", false);
        this.spine.addAnimation(0, "SpinnerIdle", true);
    },

    showDragonBallsJackpot({winValue}) {
        this.node.active = true;
        this.lblCoin = this.txtCoinOther;
        this.reset();
        this._skiName = SKIN_NAME.MEGA_WIN;
        this.spine.setSkin(SKIN_NAME.MEGA_WIN);
        if (cc.sys.isNative) {
            this.spine.setToSetupPose();
        }
        this._winValue = winValue | 0;
        this.lblCoin.string = "";
        this.lblCoin.node.active = true;
        this.spine.setAnimation(0, this._animShow, false);
        this.spine.addAnimation(0, this._animIdle, true);
        this._tweenCoin({winAmount: this._winValue, isMe: false});
    },

    _updateCoinWin() {
        this.lblCoin.string = formatCoin(this._coinValue);
        this.lblCoin.node.angle = 0;
    },

    _tweenCoin(data) {
        const {winAmount, isMe} = data;
        if (this.tweenCoin) {
            this.tweenCoin.stop();
            this._resetTxtAngle();
        }
        this.tweenCoin = cc.tween(this)
            .to(this._duration, {coinValue: winAmount}, {easing: "sineInOut"})
            .delay(1)
            .call(() => {
                this.hideAnimation(true);
            });
        this.tweenCoin.start();

        if (isMe) {
            cc.tween(this.lblCoin.node)
                .delay(this._duration)
                .repeat(5,
                    cc.tween(this.lblCoin.node)
                        .to(0.25, {angle: -10})
                        .to(0.25, {angle: 10})
                        .start(),
                )
                .to(0.25, {angle: 0})
                .start();
        }
    },

    _resetTxtAngle() {
        this.txtCoinOther.node.angle = 0;
        this.txtCoin.node.angle = 0;
        if (this.lblCoin) {
            this.lblCoin.node.active = true;
            this.lblCoin.node.stopAllActions();
            this.lblCoin.node.angle = 0;
        }
    },
    //@TODO: REFACTOR THIS!!!!
    hideAnimation(playEffect = true) {
        const winValue = this._winValue;
        if (playEffect) {
            let stepMoveOut = 20;
            if (this.index > 1) {
                stepMoveOut *= -1;
            }
            const player = ReferenceManager.instance.getPlayerByIndex(this.index);
            let endPos = this._originPos;
            if (player) endPos = getPostionInOtherNode(this.node.parent, player.gun);
            this.spine.setAnimation(0, "AllDisappear", false);
            if(this.lblCoin) {
                cc.tween(this.lblCoin.node)
                    .to(0.25, {scale: 0})
                    .start();
            }

            cc.tween(this.node)
                .to(0.23, {position: cc.v2(this.node.x, this.node.y + stepMoveOut)})
                .delay(0.1)
                .to(0.4, {position: endPos, scale: 0})
                .call(() => {
                    if (player.isMe) {
                        player.addToDisplayWallet(winValue);
                    }
                    this.onFinish();
                })
                .start();
        } else {
            if (this.tweenCoin) {
                this.tweenCoin.stop();
            }
            if (this._ballWaiting > 0) {
                Emitter.instance.emit(EventCode.DRAGON.DONE_PLAYER_BIGWIN);
            }
            this.onFinish();
        }
    },

    onFinish() {
        this.reset();
        this.node.active = false;
        this._isDragonBigWin = false;
        this._coinValue = 0;
        this._winValue = 0;
    },

    isShowingDragonBall() {
        return this._isDragonBigWin;
    },

    onDestroy() {
        removeEvents(this);
        if (this.tweenCoin) {
            this.tweenCoin.stop();
        }
    },

});
