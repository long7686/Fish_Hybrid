

const EventCode = require("gfBaseEvents");
const gameCommonUtils = require('gameCommonUtils');
const NetworkParser = require('gfNetworkParser');
const Emitter = require('gfEventEmitter');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const { formatMoney } = require('utils');
const ReferenceManager = require('gfReferenceManager');
const { registerEvent, removeEvents, formatUserName } = require("gfUtilities");
const MainFSM = require('gfMainFSM');

cc.Class({
    extends: cc.Component,

    properties: {
        wallet: require('gfWallet'),
        btnBack: cc.Node,
        txtJackpot: cc.Node,
        txtUserName: cc.Label,
        txtWallet: cc.Label,
        avatarSprite: cc.Sprite,
        avatarAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        txtVersion: cc.Label,
    },
    onLoad() {
        ReferenceManager.instance.setData({ CurrentScene: this.node });
        DataStore.instance.setDataStore({ currentSceneName: GameConfig.instance.SceneName.Lobby });
        this.initEvents();
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();
        if (LOGIN_IFRAME) {
            this.btnBack.active = gameCommonUtils.checkConditionCloseGameIframe();
        } else {
            this.btnBack.active = true;
        }
        if (this.txtVersion) {
            this.txtVersion.string = GameConfig.instance.GameVersion;
        }
        DataStore.instance.setLobbyWallet(this.wallet);
    },


    start() {
        Emitter.instance.emit(EventCode.SOUND.PLAY_SOUND_BACKGROUND, GameConfig.instance.SOUND_BACKGROUND_CONFIG.LOBBY, true);
        // PopupController.instance.checkShowPopupEvent();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.UPDATE_JACKPOT, this.onUpdateLobbyJackpot, this);
        registerEvent(EventCode.LOBBY_LAYER.UPDATE_LOBBY_INFO, this.onUpdateInfo, this);
        registerEvent(EventCode.LOBBY_LAYER.UPDATE_LOBBY_WALLET, this.onUpdateLobbyWallet, this);
        registerEvent(EventCode.LOBBY_LAYER.UPDATE_LOBBY_ON_SHOW, this.onUpdateLobbyResume, this);
    },

    onUpdateLobbyResume(data) {
        const {Wallet} = data;
        if(this.wallet) {
            this.wallet.forceUpdateWallet(Wallet);
        } else {
            this.txtWallet.string = formatMoney(Wallet);
        }
    },

    onDestroy() {
        if(!MainFSM.instance.isStateLoadGame() && Emitter.instance && !MainFSM.instance.isStateWaitExit()){
            Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
        }
        removeEvents(this);
    },

    onUpdateLobbyJackpot(amount) {
        const newJP = parseInt(amount);
        if(this.txtJackpot.getComponent("animateNumberLabel").currentValue  === undefined) {
            this.txtJackpot.getComponent("animateNumberLabel").currentValue = amount;
        }
        this.txtJackpot.onUpdateValue(newJP, 3000);
    },
    onBtnJPHistoryClick() {
        cc.log("::LobbyLayer:: onBtnJPHistoryClick");
        if (!Emitter || !Emitter.instance) return;
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_HISTORY);
        // PopupController.instance.showJPHistory();
    },
    onBtnInfoClick() {
        cc.log("::LobbyLayer:: onBtnInfoClick");
        if (!Emitter || !Emitter.instance) return;
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_INFO);
        // PopupController.instance.showInfo();
    },
    onBtnSettingClick() {
        cc.log("::LobbyLayer:: onBtnSettingClick");
        if (!Emitter || !Emitter.instance) return;
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_SETTING);
        // PopupController.instance.showSetting();
    },

    onBtnBackClick() {
        cc.log("::LobbyLayer:: onBtnBackClick");
        if (!Emitter || !Emitter.instance) return;
        Emitter.instance.emit(EventCode.COMMON.SHOW_WAITING);
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
        // gameCommonUtils.handleCloseGameIframe();
    },

    onRoomNormalClick() {
        cc.log("::LobbyLayer:: onRoomNormalClick");
        if (!Emitter || !Emitter.instance) return;
        if(!NetworkParser.instance.isAvailable()){
            cc.warn('Network socket closed');
            return;
        }
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.COMMON.SHOW_WAITING, true);
        DataStore.instance.setDataStore({ currentRoom: GameConfig.instance.RoomKind.Normal });
        Emitter.instance.emit(EventCode.LOBBY_LAYER.LOBBY_GET_ROOM_INFO,GameConfig.instance.RoomKind.Normal);
    },

    onRoomVipClick() {
        cc.log("::LobbyLayer:: onRoomVipClick");
        if (!Emitter || !Emitter.instance) return;
        if(!NetworkParser.instance.isAvailable()){
            cc.warn('Network socket closed');
            return;
        }
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        Emitter.instance.emit(EventCode.COMMON.SHOW_WAITING, true);
        DataStore.instance.setDataStore({ currentRoom: GameConfig.instance.RoomKind.VIP });
        Emitter.instance.emit(EventCode.LOBBY_LAYER.LOBBY_GET_ROOM_INFO,GameConfig.instance.RoomKind.VIP);
    },

    onUpdateInfo() {
        const selfInfo = DataStore.instance.getSelfInfo();
        this.txtUserName.string = formatUserName(selfInfo.Username);
        if(this.wallet) {
            this.wallet.forceUpdateWallet(selfInfo.Wallet);
        } else {
            this.txtWallet.string = formatMoney(selfInfo.Wallet);
        }
        if(this.avatarAtlas){
            let frameAvatar = this.avatarAtlas.getSpriteFrame(selfInfo.Avatar);
            if(!frameAvatar){
                frameAvatar = this.avatarAtlas.getSpriteFrame(GameConfig.instance.DEFAULT_AVATAR);
            }
            this.avatarSprite.spriteFrame = frameAvatar;
        }
        if(selfInfo && selfInfo.EventInfo){
            Emitter.instance.emit(EventCode.EVENT.UPDATE_EVENT_STATUS, selfInfo.EventInfo);
        }
    },
    onUpdateLobbyWallet(data) {
        if(this.wallet) {
            this.wallet.updateWallet(data);
        } else {
            this.txtWallet.string = formatMoney(data);
        }
    },
});
