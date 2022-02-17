

const Localize = require("gfLocalize");
const BaseConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const { toInteger } = require('lodash');
cc.Class({
    extends: require('gfPopupAutoBotSetting'),

    properties: {
        ghostShip : cc.Node,
        txtTarget : cc.Label,
        txtSpecialFish: cc.Label,
        txtFishMatrix: cc.Label,
        txtTimer: cc.Label,
        txtBulletType: cc.Label,
        txtButtonAllOn: cc.Label,
        txtButtonAllOff: cc.Label,
        txtStart: cc.Label,
        txtStop: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    initLanguage(){
        this.popupTitle.getComponent(cc.Label).string = Localize.instance.popupTitle.autoBot;
        this.txtTimer.string = Localize.instance.txtPopup.txtThoiLuong;
        this.txtTarget.string = Localize.instance.txtPopup.txtMucTieu;
        this.txtBulletType.string = Localize.instance.txtPopup.txtLoaiDan;
        this.txtButtonAllOn.string = Localize.instance.buttonName.btnAll;
        this.txtButtonAllOff.string = Localize.instance.buttonName.btnUnchecked;
        this.txtStart.string = Localize.instance.buttonName.btnStart;
        this.txtStop.string = Localize.instance.buttonName.btnEnd;
        this.txtFishMatrix.string = Localize.instance.txtPopup.txtFishMatrix;
        this.txtSpecialFish.string = Localize.instance.txtPopup.txtMucTieuDB;
    },

    _updateBtnAll(state) {
        this.btnAllOff.getComponent(cc.Button).interactable = !(this._arrFishID.length <= 0);
        this.btlAllOn.getComponent(cc.Button).interactable =  state ? false : true;
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
        this._arrFishID.length = 0;
        this._arrFishID = state ? [...this._allArray] : [];
        this._updateBtnAll(state);
        if (this._arrFishID.length <= 0 && DataStore.instance.isAutoBot()) {
            // stop
            this.onClickStop();
        } else if (DataStore.instance.isAutoBot()) {
            this._setBotSetting();
        }
    },

    onUpdatePosButtonByRoomKind(){
        if(DataStore.instance.getCurrentRoom() === BaseConfig.instance.RoomKind.VIP) { 
            this._allArray = BaseConfig.instance.LIST_FISH_ROOM_VIP;
            this.dragon.getComponent("gfFishCellAutoBot").isShow = true;
            this.dragon.active = true;
            this.node.getChildByName("Fish_GODZILLA_Off").getComponent("gfFishCellAutoBot").isShow = true;
        } else {
            this._allArray = BaseConfig.instance.LIST_FISH_ROOM_NORMAL;
            this.dragon.getComponent("gfFishCellAutoBot").isShow = false;
            this.dragon.active = false;
            this.node.getChildByName("Fish_GODZILLA_On").getComponent("gfFishCellAutoBot").isShow = false;
        }
    },

    _updateSetting(state) {
        this._super(state);
        this.txtTimer.string = state ? Localize.instance.txtPopup.txtThoiLuong : Localize.instance.txtPopup.txtThoiGianCon;
        this.timeSection.active = true;
        this.timeSection.children.forEach(child => {
            child.active = state ? true : false;
        });
        this.countDownLabel.node.active = state ? false : true;
    },
    
    updateToggleGroup(state, toggleGroupId) {
        let toggleName = "BtnFishMini";
        switch(toggleGroupId) {
            case 2:
                toggleName = "BtnFishMid";
                break;
            case 3:
                toggleName = "BtnFishBig";
                break;
            case 4:
                toggleName = "BtnFishHuge";
                break;            
        }
        let toggleOff = this.node.getChildByName(toggleName + "Off").getComponent("gfGroupToggle");
        let numberFishIsChoosing = toggleOff.countChildIsChoosing();
        let isFull = numberFishIsChoosing == toggleOff.getListFish().length ? true : false;
        toggleOff.node.active = !isFull;
        toggleOff.onShowFrame(isFull);
        this.node.getChildByName(toggleName + "On").active = isFull;
    },
});
