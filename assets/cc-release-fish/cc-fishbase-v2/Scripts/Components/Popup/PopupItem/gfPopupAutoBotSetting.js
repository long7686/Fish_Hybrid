const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const {toInteger} = require('lodash');
const {formatMoney} = require('utils');
const {convertSecondToTime, isArrayEqual, registerEvent, removeEvents,} = require("gfUtilities");
const Localize = require("gfLocalize");
const ReferenceManager = require('gfReferenceManager');

const MAX_CHILD_IN_TOGGLE = 7;
const TIMER_TEXT = {
    START: "THỜI LƯỢNG",
    RUNNING: "THỜI GIAN CÒN",
};
const BOOM_POS = {
    LEFT: -390,
    CENTER: -287,
};
const TIME_LOCK_CLICK = 0.15;

cc.Class({
    extends: require('gfPopupBase'),
    properties: {
        btnStart: cc.Button,
        btnStop: cc.Button,
        btlAllOn: cc.Node,
        btnAllOff: cc.Node,
        bulletSection: cc.Node,
        timeSection: cc.Node,
        countDownLabel: cc.Label,
        listToggleGroup: [require("gfGroupToggle")],
        listSpecialFish: [require("gfFishCellAutoBot")],
        boom: cc.Node,
        dragon: cc.Node,
        _gunVal: null,
        _arrFishID: null,
        _allArray: null,
        _bulletValue: 0,
        bulletValue: {
            visible: false,
            get() {
                return this._bulletValue;
            },
            set(value) {
                this._bulletValue = value;
                this._updateBullet();
            },
        },
        blockTouchLayer: cc.Node,
        _tweenLockTouch: null,
        _timeScroller: null,
        _bulletScroller: null,
        _btnDragonOn: null,
        _btnBoomOff: null,
        _btnBoomOn: null,
        _isShow: false
    },

    onLoad() {
        this._super();
        this._isShow = false;
        this._arrFishID = [];
        this._allArray = [];
        this._gunVal = [];
        this.initComponents();

        registerEvent(EventCode.POPUP.UPDATE_BOT_SETTING, this.onReceiveSetting, this);
        registerEvent(EventCode.PLAYER_LAYER.GAME_UPDATE_WALLET, this.onUpdateCoin, this);
        registerEvent(EventCode.AUTO_BOT.RESUME, this.onResumeGame, this);
        registerEvent(EventCode.AUTO_BOT.END_AUTO_BOT, this.onAutoBotEnd, this);
    },

    setAnimPopup() {
        this._animStyleShow = GameConfig.instance.POPUP_ANIMATION.FADE;
        this._animStyleHide = GameConfig.instance.POPUP_ANIMATION.FADE;
    },

    initComponents() {
        this._timeScroller = this.timeSection.getComponentInChildren("gfItemScroller");
        this._bulletScroller = this.bulletSection.getComponentInChildren('gfBulletScroller');
        this._btnDragonOn = this.node.getChildByName("Fish_Dragon_On");
        this._btnBoomOff = this.node.getChildByName("Fish_Boom_Off");
        this._btnBoomOn = this.node.getChildByName("Fish_Boom_On");
    },

    initLanguage() {
        this.popupTitle && (this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.autoBot);
    },

    _checkBulletValue() {
        return DataStore.instance.getSelfInfo().Wallet < this._gunVal[this.bulletValue];
    },

    onClickStart() {
        this.handleBlockTouch();
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        if (this._checkBulletValue()) {
            let data = {
                customMsg: Localize.instance.txtAutoBot.txtInsufficientGold,
                customCallbacks: {
                    confirmCallback: () => {
                        this._resetBulletSelection();
                    },
                    rejectCallback: () => {
                    },
                },
            };
            Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, data);
        } else if (this._arrFishID.length === 0) {
            let data = {
                customMsg: Localize.instance.txtAutoBot.txtNotChoosingFish,
            };
            Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, data);
        } else {
            this._isShow = false;
            this._setBotSetting();
            Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, false);
            Emitter.instance.emit(EventCode.AUTO_BOT.START_BOT);
            this.unschedule(this._countdown);
            this.onClose();
        }
    },

    onResumeGame() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        if (DataStore.instance.isAutoBot() && player) {
            Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, false);
            Emitter.instance.emit(EventCode.AUTO_BOT.CHANGE_TARGET);
            const {bulletIndex} = DataStore.instance.getBotSetting();
            player.updateGunData(bulletIndex);
            this._setBotSetting();
            //Resume send setting info to server
            // if(this._arrFishID.length > 0) {
            //     this._setBotSetting();
            // }
        } else {
            this.onAutoBotEnd();
        }
        this.blockTouchLayer.active = false;
        this._clearTween();
    },

    _clearTween() {
        if (this._tweenLockTouch) {
            this._tweenLockTouch.stop();
            this._tweenLockTouch = null;
        }
    },

    onClickStop() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.onAutoBotEnd();
    },

    onAutoBotEnd() {
        Emitter.instance.emit(EventCode.AUTO_BOT.STOP_BOT);
        Emitter.instance.emit(EventCode.AUTO_BOT.SEND_STOP_BOT);
        const selfInfo = DataStore.instance.getSelfInfo();
        if (!selfInfo.skillLock) {
            Emitter.instance.emit(EventCode.GAME_LAYER.INTERACTABLE_HUD, true);
            const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
            player.lockBet(false);
        }
        this.unschedule(this._countdown);
        this._updateSetting(true);
    },

    show() {
        this._super();
        this._isShow = true;
        Emitter.instance.emit(EventCode.COMMON.SHOW_WAITING);
        this.reset();
        const listCurrentFishId = DataStore.instance.getBotSetting().fishKindArr;
        if (listCurrentFishId && listCurrentFishId.length > 0) {
            this._fillFishData(listCurrentFishId);
        }
        this._gunVal = DataStore.instance.getGunValue();
        this.onUpdatePosButtonByRoomKind();
        const isStarted = DataStore.instance.isAutoBot();
        this._updateSetting(!isStarted);
        this.setBulletValue();
        if (isStarted) {
            if (DataStore.instance.getBotSetting().duration < GameConfig.instance.AUTO_BOT.MAX_TIME) {
                this.countDownLabel.string = "";
                this._countdown();
                this.schedule(this._countdown, 0.5);
            } else {
                this.countDownLabel.string = GameConfig.instance.AUTO_BOT.SPECIAL_ITEM;
            }
        }
        // call get botSetting data
        Emitter.instance.emit(EventCode.POPUP.GET_BOT_SETTING, DataStore.instance.getCurrentRoom());
        this.blockTouchLayer.active = false;
        this._clearTween();
    },

    handleBlockTouch() {
        this.blockTouchLayer.active = true;
        if (!this._tweenLockTouch) {
            this._tweenLockTouch = cc.tween(this.blockTouchLayer)
                .delay(TIME_LOCK_CLICK)
                .call(() => {
                    this.blockTouchLayer.active = false;
                    this._tweenLockTouch.stop();
                    this._tweenLockTouch = null;
                });
            this._tweenLockTouch.start();
        }
    },

    onUpdatePosButtonByRoomKind() {
        this._allArray.length = 0;
        if (DataStore.instance.getCurrentRoom() === GameConfig.instance.RoomKind.VIP) {
            this._allArray = [...GameConfig.instance.LIST_FISH_ROOM_VIP];
            this.dragon.getComponent("gfFishCellAutoBot").isShow = true;
            this.dragon.active = true;
            this._btnDragonOn.getComponent("gfFishCellAutoBot").isShow = true;
            this._btnBoomOff.x = BOOM_POS.LEFT;
            this._btnBoomOn.x = BOOM_POS.LEFT;
        } else {
            this._allArray = [...GameConfig.instance.LIST_FISH_ROOM_NORMAL];
            this.dragon.getComponent("gfFishCellAutoBot").isShow = false;
            this.dragon.active = false;
            this._btnDragonOn.getComponent("gfFishCellAutoBot").isShow = false;
            this._btnBoomOff.x = BOOM_POS.CENTER;
            this._btnBoomOn.x = BOOM_POS.CENTER;
        }
    },
    onUpdateCoin(data) {
        if (!data) {
            return;
        }
        const {DeskStation, Wallet} = data;
        // is Me and is using autoBot
        if (DataStore.instance.getSelfInfo().DeskStation === DeskStation && DataStore.instance.isAutoBot()) {
            if (Wallet <= 0) {
                this.onClickStop();
            } else if (this._checkBulletValue()) {
                this.onClickStop();
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_AUTOBOT);
                // PopupController.instance.showAutoBot();
            }
        }
    },

    _setBotSetting() {
        let duration = this._timeScroller.getCurrentIdx();
        if (DataStore.instance.isAutoBot()) {
            duration = DataStore.instance.getBotSetting().duration;
            duration /= 30;
        }
        Emitter.instance.emit(EventCode.POPUP.SET_BOT_SETTING, {
            arrFkd: this._arrFishID,
            duration: duration * 1,
            roomKind: DataStore.instance.getCurrentRoom(),
        });
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        const bulletIndex = this._bulletScroller.getCurrentIdx();
        player.updateGunData(bulletIndex);
        DataStore.instance.setBotSetting({
            fishKindArr: this._arrFishID.slice(),
            duration: duration * 30,
            bulletIndex: bulletIndex * 1,
        });
    },

    _fillFishData(listFishId) {
        this.listToggleGroup.forEach((toggle) => {
            if (!toggle.isOn) {
                const listFish = toggle.getListFish();
                const {toggleGroupId} = listFish[0];
                listFish.forEach((fish) => {
                    if (listFishId.indexOf(fish.fishID) >= 0) {
                        fish.show(true, true);
                        if (this._arrFishID.indexOf(fish.fishID) < 0) {
                            this._arrFishID.push(fish.fishID);
                        }
                    }
                });
                this.updateToggleGroup(true, toggleGroupId);
            }
        });
        // update in special fish
        this.listSpecialFish.forEach((fish) => {
            if (listFishId.indexOf(fish.fishID) >= 0 && fish.isSelect) {
                fish.show(true, true);
                if (this._arrFishID.indexOf(fish.fishID) < 0) {
                    this._arrFishID.push(fish.fishID);
                }
            }
        });
    },

    onReceiveSetting(data) {
        cc.log(this.logtag, "onReceiveSetting", data);
        if (!data.FishKind) data.FishKind = [];
        const listFishInCome = data.FishKind;
        this._fillFishData(listFishInCome);
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        this.bulletValue = player._gunValue;
        this._bulletScroller.scrollToItem(player._gunIndex);

        if (data.timeToExpire >= 0) {
            this._timeScroller.scrollToItem(parseInt(data.timeToExpire));
        } else {
            this._timeScroller.scrollToItem(1);
        }
        const state = this._arrFishID.length - this._allArray.length === 0;
        this._updateBtnAll(state);
        Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
    },

    setBulletValue() {
        const arrValue = [];
        for (let i = 0; i < this._gunVal.length; ++i) {
            const val = formatMoney(this._gunVal[i]);
            arrValue.push(val);
        }
        this._bulletScroller.initItemList(arrValue);
    },

    onUpdateFish(isSelect, fishID, toggleGroupId) {
        if (!this._isShow) {
            return;
        }
        if (isSelect) {
            if (this._arrFishID.indexOf(fishID) < 0) {
                this._arrFishID.push(fishID);
            }
        } else {
            const idx = this._arrFishID.indexOf(fishID);
            if (idx >= 0) {
                this._arrFishID.splice(idx, 1);
            }
        }
        const _state = this._arrFishID.length - this._allArray.length === 0;
        this._updateBtnAll(_state);
        if (toggleGroupId > 0) {
            this.updateToggleGroup(isSelect, toggleGroupId);
        }
        if (DataStore.instance.isAutoBot()) {
            if (this._arrFishID.length <= 0) {
                this.onClickStop();
            } else if (!isArrayEqual(this._arrFishID, DataStore.instance.getBotSetting().fishKindArr)) {
                this._setBotSetting();
                Emitter.instance.emit(EventCode.AUTO_BOT.CHANGE_TARGET);
            }
        }
    },

    updateToggleGroup(state, toggleGroupId) {
        let toggleName = "BtnFishMini";
        switch (toggleGroupId) {
            case 2:
                toggleName = "BtnFishMid";
                break;
            case 3:
                toggleName = "BtnFishBig";
                break;
            case 4:
                toggleName = "BtnFishHuge";
                break;
            default:
                toggleName = "BtnFishMini";
                break;
        }
        const toggleOff = this.node.getChildByName(`${toggleName}Off`).getComponent("gfGroupToggle");
        const numberFishIsChoosing = toggleOff.countChildIsChoosing();
        const isFull = numberFishIsChoosing === MAX_CHILD_IN_TOGGLE;
        toggleOff.node.active = !isFull;
        toggleOff.onShowFrame(isFull);
        this.node.getChildByName(`${toggleName}On`).active = isFull;
    },

    reset() {
        this.listSpecialFish.forEach((fish) => {
            if (fish.isSelect) {
                fish.reset();
            }
        });
        this.listToggleGroup.forEach((toggle) => {
            const listFish = toggle.getListFish();
            listFish.forEach((fish) => {
                if (fish.isSelect) {
                    fish.reset();
                }
            });
        });
        this._arrFishID.length = 0;
    },

    onClickAll(target, data) {
        this.handleBlockTouch();
        const state = toInteger(data);
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.listToggleGroup.forEach((toggle) => {
            if (toggle.isOn) {
                toggle.onShow(state);
                if (state) {
                    toggle.onSelectAll();
                } else {
                    toggle.onDeSelectAll();
                }
            } else {
                toggle.onShow(!state);
            }
        });
        // update list special fish
        this.listSpecialFish.forEach((_fish) => {
            if (_fish.isSelect) {
                _fish.show(state, state);
            } else {
                _fish.show(!state, !state);
            }
        });
        this._updateBtnAll(state);
        this._arrFishID.length = 0;
        this._arrFishID = state ? [...this._allArray] : [];
        if (this._arrFishID.length <= 0 && DataStore.instance.isAutoBot()) {
            // stop
            this.onClickStop();
        } else if (DataStore.instance.isAutoBot()) {
            this._setBotSetting();
        }
    },

    _resetBulletSelection() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        if (player) {
            this._bulletScroller.scrollToItem(player._gunIndex);
        } else {
            this._bulletScroller.scrollToItem(0);
        }
    },

    _countdown() {
        this.countDownLabel.string = convertSecondToTime(DataStore.instance.getBotSetting().autoCountdown);
    },

    _updateBtnAll(state) {
        this.btnAllOff.active = !!state;
        this.btlAllOn.active = !state;
        this.node.getChildByName("TextBtnAllOff").active = !!state;
        this.node.getChildByName("TextBtnAllOn").active = !state;
    },
    _updateSetting(state) {
        this.btnStart.node.active = !!state;
        this.btnStop.node.active = !state;
        this.node.getChildByName("TextBtnStart").active = !!state;
        this.node.getChildByName("TextBtnStop").active = !state;

        this.timeSection.active = !!state;
        this.countDownLabel.node.active = !this.timeSection.active;
        this.node.getChildByName("TextTimer").getComponent(cc.Label).string = state ? TIMER_TEXT.START : TIMER_TEXT.RUNNING;

        this._timeScroller.initItemList(GameConfig.instance.AUTO_BOT.DATA_TIMER);
        if (!state) {
            this._timeScroller.reset();
        }
    },

    _updateBullet() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(DataStore.instance.getSelfInfo().DeskStation);
        if (DataStore.instance.isAutoBot()
            && this.bulletValue !== player._gunIndex) {
            if (this._checkBulletValue()) {
                let data = {
                    customMsg: Localize.instance.txtAutoBot.txtInsufficientGold,
                    customCallbacks: {
                        confirmCallback: () => {
                            this._resetBulletSelection();
                        },
                        rejectCallback: () => {
                        },
                    },
                };
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, data);
            } else {
                this._setBotSetting();
            }
        }
    },

    update() {
        this.btnStart.interactable = this._arrFishID.length !== 0;
        if (this.bulletValue !== this._bulletScroller.getCurrentIdx()) {
            this.bulletValue = this._bulletScroller.getCurrentIdx();
        }
    },

    onResetState() {
        this._super();
        this._isShow = false;
    },

    onDestroy() {
        this._clearTween();
        removeEvents(this);
    },
});
