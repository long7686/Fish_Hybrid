/* global Sentry */

const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const NetworkGameEvent = require('gfNetworkGameEvent');
const NetworkParser = require('gfNetworkParser');
const {addHtmlCursor, removeCursorInHtml, registerEvent, removeEvents} = require('gfUtilities');
const GameConfig = require('gfBaseConfig');
const MainFSM = require('gfMainFSM');
const DataStore = require('gfDataStore');
const lodash = require('lodash');
const {handleFlowOutGame} = require("gameCommonUtils");
const ReferenceManager = require('gfReferenceManager');
const FishManager = require("gfFishManager");
const gfMainController = cc.Class({
    properties: {
        arrSceneAssets: [],
        _isGameHide: false,
        _timeHide: null,
    },

    ctor() {
        // NETWORK FUNC
        this._onNetworkState = this.onNetworkState.bind(this);
        this._onLoginLobby = this.onLoginLobby.bind(this);
        this._onSystemMessage = this.onSystemMessage.bind(this);
        this._onJoinGame = this.onJoinGame.bind(this);
        this._onLoginGame = this.onLoginGame.bind(this);
        this._onUpdateLobbyWallet = this.onUpdateLobbyWallet.bind(this);
        this._onGetBotSetting = this.onGetBotSetting.bind(this);
        this._onUserFire = this.onUserFire.bind(this);
        this._onCreateListFish = this.onCreateListFish.bind(this);
        this._onCatchFish = this.onCatchFish.bind(this);
        this._onCatchFishSkill = this.onCatchFishSkill.bind(this);
        this._onFishFreeze = this.onFishFreeze.bind(this);
        this._onCreateFishGroup = this.onCreateFishGroup.bind(this);
        this._onDataJoinRoom = this.onDataJoinRoom.bind(this);
        this._onListUserOnBoard = this.onListUserOnBoard.bind(this);
        this._onUpdateJackpot = this.onUpdateJackpot.bind(this);
        this._onPlayerEnterBoard = this.onPlayerEnterBoard.bind(this);
        this._onPlayerExitBoard = this.onPlayerExitBoard.bind(this);
        this._onGameKick = this.onGameKick.bind(this);
        this._onPlayerUpdateWallet = this.onPlayerUpdateWallet.bind(this);
        this._onNotify = this.onNotify.bind(this);
        this._onActiveFreezeGun = this.onActiveFreezeGun.bind(this);
        this._onUpdateListItem = this.onUpdateListItem.bind(this);
        this._onStopFreezeGun = this.onStopFreezeGun.bind(this);
        this._onGameChangeRound = this.onGameChangeRound.bind(this);
        this._onDragonStateEnd = this.onDragonStateEnd.bind(this);
        this._onDragonBallDropped = this.onDragonBallDropped.bind(this);
        this._onDragonWarning = this.onDragonWarning.bind(this);
        this._sendUserFire = this.sendUserFire.bind(this);
        this._onUpdateEventStatus = this.onUpdateEventStatus.bind(this);
        this._onUpdateEventTray = this.onUpdateEventTray.bind(this);
        this._onUpdateLobbyOnShow = this.onUpdateLobbyOnShow.bind(this);


        // EMIT FUNC
        this._onHideGameBinding = this.onHideGame.bind(this);
        this._onShowGameBinding = this.onShowGame.bind(this);
        this.initEvents();
        this.initGame();
        this.initSentry();
        this.overrideInitFrameSizeFunc();
    },

    initSentry() {
        const loadConfigAsync = require('loadConfigAsync');
        loadConfigAsync.setUpSentry();
        if (typeof Sentry !== 'undefined') {
            Sentry.configureScope(function (scope) {
                scope.setExtra("gameVersion", GameConfig.instance.GameVersion);
            });
        }
    },

    initToken() {
        const {getUrlParam} = require('gameCommonUtils');
        const loadConfigAsync = require('loadConfigAsync');
        const CONFIG = loadConfigAsync.getConfig();
        const {
            LOGIN_IFRAME, URL_TOKEN, USER_TOKEN, DEV_ENV, TOKEN_VALUE, IS_FINISHED_REMOTE, TOKEN, FISH_CLIENT_TYPE, IS_PRODUCTION
        } = CONFIG;
        if (!IS_FINISHED_REMOTE) {
            setTimeout(() => {
                this.initToken();
            }, 100);
            return;
        }
        cc.log(FISH_CLIENT_TYPE);
        GameConfig.instance.IsDevMode = DEV_ENV != null && DEV_ENV == true;
        GameConfig.instance.IPMaster = CONFIG[GameConfig.instance.IPMasterName];
        let token = '';
        let clientType = '|1';
        let environmentType = '';
        if (LOGIN_IFRAME) {
            GameConfig.instance.GameId = getUrlParam('gameId') ? getUrlParam('gameId') : GameConfig.instance.GameId;
            GameConfig.instance.ClientType = GameConfig.instance.ClientType ? GameConfig.instance.ClientType : '';
            // clientType = getUrlParam('clientType') ? (`|${getUrlParam('clientType')}`) : (`|${defaultClientType}`);
            environmentType = (`|${GameConfig.instance.ENVIRONMENT_CONFIG.IFRAME}`);
        } else {
            // clientType = GameConfig.instance.ClientType ? GameConfig.instance.ClientType : clientType;
            if(cc.sys.isNative){
                environmentType = (`|${GameConfig.instance.ENVIRONMENT_CONFIG.NATIVE_APP}`);
            } else {
                environmentType = (`|${GameConfig.instance.ENVIRONMENT_CONFIG.WEB_APP}`);
            }
        }

        if(LOGIN_IFRAME && getUrlParam('version')){
            GameConfig.instance.RoomVersion = `|${getUrlParam('version')}`;
        } else if(IS_PRODUCTION) {
            GameConfig.instance.RoomVersion = GameConfig.instance.ProductVersion ?  GameConfig.instance.ProductVersion : GameConfig.instance.RoomVersion;
        }
        if(LOGIN_IFRAME && getUrlParam('clientType')){
            clientType = (`|${getUrlParam('clientType')}`);
        } else if (FISH_CLIENT_TYPE) {
            clientType = (`|${FISH_CLIENT_TYPE}`);
        } else {
            clientType = GameConfig.instance.ClientType ? GameConfig.instance.ClientType : clientType;
        }

        if (!GameConfig.instance.IsDevMode) {
            if (TOKEN) {
                token = TOKEN;
            }
            else if (!cc.sys.isNative && LOGIN_IFRAME) {
                if (URL_TOKEN) token = getUrlParam(URL_TOKEN);
            } else {
                token = cc.sys.localStorage.getItem(USER_TOKEN);
                if (!token && TOKEN_VALUE) token = TOKEN_VALUE;
            }
            GameConfig.instance.userToken = token;
            token += GameConfig.instance.RoomVersion + clientType + environmentType;
            GameConfig.instance.token4Master = token;
            MainFSM.instance._fsm.goLoginLobby();
        } else {
            const {userText, pwText} = require('mock');
            const dataPost = {
                userName: userText,
                password: pwText,
                fingerPrint: 'test',
            };
            const serviceRest = require('serviceRest');
            serviceRest.post({
                url: 'auth/login',
                data: dataPost,
                callback: ({data}) => {
                    GameConfig.instance.token4Master = data.data.token + GameConfig.instance.RoomVersion + clientType + environmentType;
                    MainFSM.instance._fsm.goLoginLobby();
                },
            });
        }
    },

    initGame() {
        this._isGameHide = true; // Trick to handle bug from hideGame on LoadingScene
        if (window) {
            cc.director.getCollisionManager().enabled = true;
            cc.director.getCollisionManager().enabledDebugDraw = false;
        } else {
            cc.error("window not support!");
        }
        addHtmlCursor();
    },

    initEvents() {
        // NETWORK EVENT
        NetworkParser.instance.registerEvent(NetworkGameEvent.NETWORK_EVENT, this._onNetworkState);
        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_LOGIN, this._onLoginLobby);
        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_MESSAGE, this._onSystemMessage);
        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_GET_ROOM_INFO, this._onJoinGame);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_LOGIN, this._onLoginGame);
        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_JACKPOT, this._onUpdateJackpot);
        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_UPDATE_MY_GOLD, this._onUpdateLobbyWallet);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_GET_BOT_SETTING, this._onGetBotSetting);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_USER_FIRE, this._onUserFire);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_CREATE_FISH, this._onCreateListFish);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_CATCH_FISH, this._onCatchFish);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_CATCH_FISH_SKILL, this._onCatchFishSkill);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_FISH_FREEZE, this._onFishFreeze);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_CREATE_FISH_GROUP_NEW, this._onCreateFishGroup);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_ROOM_DATA, this._onDataJoinRoom);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_LISTUSER_BOARD, this._onListUserOnBoard);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_UPDATE_JACKPOT, this._onUpdateJackpot);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_PLAYER_ENTER_BOARD, this._onPlayerEnterBoard);

        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_KICK, this._onGameKick);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_MESSAGE, this._onSystemMessage);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_USER_EXIT, this._onPlayerExitBoard);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_UPDATE_WALLET, this._onPlayerUpdateWallet);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_CHANGE_ROUND, this._onGameChangeRound);

        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_NOTIFY, this._onNotify);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_NOTIFY, this._onNotify);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_LIST_ITEM, this._onUpdateListItem);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_ACTIVE_FREEZE_GUN, this._onActiveFreezeGun);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_STOP_FREEZE_GUN, this._onStopFreezeGun);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_DRAGON_END, this._onDragonStateEnd);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_DRAGON_BALL_DROPPED, this._onDragonBallDropped);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_DRAGON_WARNING, this._onDragonWarning);
        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_UPDATE_EVENT_STATUS, this._onUpdateEventStatus);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_UPDATE_EVENT_STATUS, this._onUpdateEventStatus);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_UPDATE_EVENT_TRAY, this.onUpdateEventTray);
        NetworkParser.instance.registerEvent(NetworkGameEvent.LOBBY_ON_SHOW,this._onUpdateLobbyOnShow);
        // EMIT EVENT
        registerEvent(EventCode.COMMON.GO_LOBBY, this.goLobby, this);
        registerEvent(EventCode.GAME_LAYER.BULLET_COLLIDE_FISH, this.bulletCollideFish, this);
        registerEvent(EventCode.GAME_LAYER.SEND_GUN_FIRE, this.sendGunFire, this);
        registerEvent(EventCode.GAME_LAYER.SEND_ACTIVE_FREEZE_GUN, this.sendActiveFreezeGun, this);
        registerEvent(EventCode.GAME_LAYER.SEND_FIRE_LASER, this.sendFireLaser, this);
        registerEvent(EventCode.COMMON.REFRESH_PAGE, this.refreshPage, this);
        registerEvent(EventCode.POPUP.GET_BOT_SETTING, this.sendGetBotSetting, this);
        registerEvent(EventCode.POPUP.SET_BOT_SETTING, this.sendSetBotSetting, this);
        registerEvent(EventCode.AUTO_BOT.SEND_STOP_BOT, this.sendStopBot, this);
        registerEvent(EventCode.EVENT.SEND_GET_EVENT_INFO, this.sendGetEventInfo, this);
        registerEvent(EventCode.COMMON.ON_SHOW_GAME_LAYER, this.onShowGameLayer, this);
        registerEvent(EventCode.COMMON.SEND_EXIT_GAME_SERVER, this.sendExitGameServer, this);
        registerEvent(EventCode.LOBBY_LAYER.LOBBY_GET_ROOM_INFO, this.sendGetRoomInfo, this);
        registerEvent(EventCode.COMMON.CONNECT_MASTER, this.connectMaster, this);
        registerEvent(EventCode.COMMON.CONNECT_GAME, this.connectGame, this);

        cc.game.on(cc.game.EVENT_HIDE, this._onHideGameBinding);
        cc.game.on(cc.game.EVENT_SHOW, this._onShowGameBinding);

        if(!cc.sys.isNative) {
            window.addEventListener('beforeunload', this.onCloseTab.bind(this));
        }
    },
    onCloseTab() {
        if(DataStore.instance && GameConfig.instance) {
            if (DataStore.instance.getCurrentSceneName() == GameConfig.instance.SceneName.Game) {
                this.sendRegisterExit();
            }
        }
    },
    sendRegisterExit(){
        NetworkParser.instance.sendRegisterExit();
    },

    storeAssets(item) {
        this.arrSceneAssets.push(item);
    },

    // NETWORK FUNCTION
    onNetworkState(data) {
        if (!DataStore.instance || !Emitter.instance) {
            cc.warn('game already destroyed or either not initialized');
        }
        if (!ReferenceManager.instance.CurrentScene) {
            return;
        }
        const selfInfo = DataStore.instance.getSelfInfo();
        Emitter.instance.emit(EventCode.COMMON.NETWORK_STATUS_INFO, data);
        switch (data.EventID) {
            case NetworkGameEvent.PINGPONG:
                Emitter.instance.emit(EventCode.COMMON.UPDATE_PING, data.EventData.data);
                break;
            case NetworkGameEvent.NETWORK_CONNECT:
                if (MainFSM.instance.isStateLoginGameRoom() || MainFSM.instance.isStateGameRoom()) {
                    // Emitter.instance.emit(EventCode.POPUP.CLOSE_ALL);
                    NetworkParser.instance.sendJoinDesk(selfInfo.DeskId);
                }
                break;
            case NetworkGameEvent.NETWORK_WAITING:
                Emitter.instance.emit(EventCode.COMMON.SHOW_WAITING);
                break;
            case NetworkGameEvent.NETWORK_ERROR:
                /** Show popup network poor* */
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.NETWORK_ERROR);
                break;
            case NetworkGameEvent.NETWORK_CLOSE:
                /** Show close socket hay làm gì đó* */
                break;
            case NetworkGameEvent.NETWORK_POOR:
                /** Show popup network poor* */
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.NETWORK_POOR);
                break;
            case NetworkGameEvent.NETWORK_DIE:
                /** Show popup refesh* */
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.NETWORK_DIE);
                break;
            case NetworkGameEvent.AUTHEN_FAIL:
                if (DataStore.instance.getCurrentSceneName() == GameConfig.instance.SceneName.Game) {
                    this.goLobby();
                } else {
                    Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
                    /** Show popup login fail* */
                    Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.AUTHEN_FAIL);
                }
                break;
            case NetworkGameEvent.LOGIN_IN_OTHER_DEVICE:
                /** Show popup thiết bị khác* */
                Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.LOGIN_IN_OTHER_DEVICE);
                break;
            case NetworkGameEvent.NETWORK_RECONNECT:
                this.onReconnect();
                break;
            default:
                break;
        }
    },
    onReconnect() {
        const selfInfo = DataStore.instance.getSelfInfo();
        Emitter.instance.emit(EventCode.POPUP.CLOSE_ALL);
        Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
        Emitter.instance.emit(EventCode.CUT_SCENE.HIDE_ALL_CUT_SCENE);
        if (DataStore.instance.getCurrentSceneName() == GameConfig.instance.SceneName.Lobby) {
            // nothing todo now.
        } else {
            NetworkParser.instance.sendJoinDesk(selfInfo.DeskId);
        }
    },

    goLobby() {
        Emitter.instance.emit(EventCode.COMMON.EXIT_GAME_ROOM);
        MainFSM.instance._fsm.goLoginLobby();
    },

    onLoginLobby(data) {
        data.DeskId = null;
        DataStore.instance.clearEventInfo();
        DataStore.instance.setSelfInfo(data);
        DataStore.instance.clearOldTarget();
        DataStore.instance.updateDeltaTime(data.ServerTime);
        if (data.BetConfig) {
            DataStore.instance.listJackpotBet = lodash(data.BetConfig).values().join('-');
        }
        if (!data.isUserInGame) {
            if (DataStore.instance.getCurrentSceneName() !== GameConfig.instance.SceneName.Lobby) {
                this.loadScene(GameConfig.instance.SceneName.Lobby, () => {
                    cc.log('::LOAD LOBBY SCENE SUCCESSFULLY::');
                    if (MainFSM.instance.isStateWaitExit()) {
                        Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
                    } else if (this.checkNeedRefresh()) {
                        handleFlowOutGame();
                    } else {
                        Emitter.instance.emit(EventCode.COMMON.LOADING_TRANSITION);
                        MainFSM.instance._fsm.goLobby();
                    }
                });
            } else {
                if (MainFSM.instance._fsm.can('goLobby')) {
                    MainFSM.instance._fsm.goLobby();
                } else {
                    Emitter.instance.emit(EventCode.LOBBY_LAYER.UPDATE_LOBBY_INFO);
                    Emitter.instance.emit(EventCode.COMMON.UPDATE_JACKPOT, DataStore.instance.getJackpotValue());
                }
            }
        }
    },

    onJoinGame(data) {
        GameConfig.instance.parseJoinGame(data);
        this.loadGameScene();
    },

    loadGameScene() {
        if (DataStore.instance.getCurrentSceneName() !== GameConfig.instance.SceneName.Game) {
            MainFSM.instance._fsm.goLoadGame();
            this.loadScene(GameConfig.instance.SceneName.Game, () => {
                cc.log('::LOAD GAME SCENE SUCCESSFULLY::');
                if (MainFSM.instance.isStateWaitExit()) {
                    Emitter.instance.emit(EventCode.COMMON.REFRESH_PAGE);
                } else if (this.checkNeedRefresh()) {
                    handleFlowOutGame();
                } else {
                    Emitter.instance.emit(EventCode.COMMON.LOADING_TRANSITION);
                    MainFSM.instance._fsm.goLoginGameRoom();
                }
            });
        } else {
            Emitter.instance.emit(EventCode.COMMON.GAME_SHOW);
            MainFSM.instance._fsm.goLoginGameRoom();
        }

    },

    checkNeedRefresh() {
        return !Emitter || !Emitter.instance;
    },

    onLoginGame(data) {
        Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
        DataStore.instance.parseLoginGame(data);
        MainFSM.instance._fsm.goGameRoom();
    },

    onSystemMessage(data) {
        const {Code, message} = data;
        if (Code == NetworkGameEvent.MSG_CODE.NO_MONEY_LOBBY) {
            Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
            Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.MSG_CODE.NO_MONEY_LOBBY);
        } else if (Code == NetworkGameEvent.MSG_CODE.NO_MONEY_IN_GAME) {
            Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
            if (DataStore.instance.isAutoBot()) {
                Emitter.instance.emit(EventCode.AUTO_BOT.END_AUTO_BOT);
            }
            Emitter.instance.emit(EventCode.PLAYER_LAYER.SHOW_POPUP_NO_MONEY);
        } else if (Code == NetworkGameEvent.MSG_CODE.SERVER_MAINTAIN) {
            Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
            Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.MSG_CODE.SERVER_MAINTAIN);
        } else if (Code > 0) {
            if (Code == NetworkGameEvent.MSG_CODE.CANT_FIND_ROOM) {
                Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
            }
            Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, data);
        } else if (message) {
            Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, message);
        }
    },

    onUpdateLobbyWallet(data) {
        const newWallet = parseInt(data.Wallet);
        DataStore.instance.setSelfInfo({Wallet: newWallet});
        Emitter.instance.emit(EventCode.LOBBY_LAYER.UPDATE_LOBBY_WALLET, newWallet);
    },

    onUpdateLobbyOnShow(data) {
        Emitter.instance.emit(EventCode.LOBBY_LAYER.UPDATE_LOBBY_ON_SHOW, data);
    },

    onGetBotSetting(data) {
        Emitter.instance.emit(EventCode.POPUP.UPDATE_BOT_SETTING, data);
    },

    sendGetBotSetting(roomKind) {
        NetworkParser.instance.getBotSetting(roomKind);
    },

    sendSetBotSetting(data) {
        const {arrFkd, duration, roomKind} = data;
        NetworkParser.instance.setBotSetting(arrFkd, duration, roomKind);
    },
    sendStopBot() {
        NetworkParser.instance.stopBot();
    },
    sendGetEventInfo(){
        if(DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Lobby){
            NetworkParser.instance.sendGetLobbyEventInfo();
        } else if(DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Game){
            NetworkParser.instance.sendGetGameEventInfo();
        } else {
            cc.warn('Invalid scene');
        }
    },

    // {"DeskStation":0,"Angle":29.43551555743798,"BulletMultiple":1000,"LockedFishID":0}
    onUserFire(data) {
        if (data.DeskStation == DataStore.instance.getSelfDeskStation()) return;
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_OTHER_PLAYER_FIRE, data);
    },

    onActiveFreezeGun(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_ACTIVE_FREEZE_GUN, data);
    },

    onStopFreezeGun(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_STOP_FREEZE_GUN, data);
    },

    onUpdateListItem(data) {
        DataStore.instance.parseListItemConfig(data);
        Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_LIST_ITEM, data);
    },

    onCreateListFish(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.CREATE_FISH, data);
    },

    onCatchFish(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.CATCH_FISH, data);
    },

    onCatchFishSkill(data) {
        switch (data.SkillID) {
            case GameConfig.instance.SkillConfig.LASER:
                data.fishKind = GameConfig.instance.FISH_KIND.LASER_CRAB;
                Emitter.instance.emit(EventCode.GAME_LAYER.CATCH_FISH_BY_SKILL, data);
                break;
            case GameConfig.instance.SkillConfig.FISH_BOMB:
                data.fishKind = GameConfig.instance.FISH_KIND.BOMB;
                Emitter.instance.emit(EventCode.GAME_LAYER.CATCH_FISH_BY_SKILL, data);
                break;
        }
    },

    onFishFreeze(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.FREEZE_FISH, data);
    },

    onCreateFishGroup(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.CREATE_FISH_GROUP, data);
        data.isFishGroupToNormal = false;
        Emitter.instance.emit(EventCode.GAME_LAYER.GAME_CHANGE_ROUND, data);
        Emitter.instance.emit(EventCode.COMMON.FISH_LOG, GameConfig.instance.FISH_LOG_CONFIG.FISH_GROUP + " - "  + data.ParadeKind);
    },

    onDataJoinRoom(data) {
        cc.log("onDataJoinRoom", data);
    },

    onListUserOnBoard(data) {
        if (this._isGameHide) {
            this.onHideGame();
            return;
        }
        const {ServerTime, EventInfo, RoomData, ListUser} = data;
        DataStore.instance.updateDeltaTime(ServerTime);

        const targetState = DataStore.instance.getTargetState();
        if (!DataStore.instance.isAutoPaused()) {
            Emitter.instance.emit(EventCode.GAME_LAYER.PAUSE_AUTO_FIRE);
        }
        if(EventInfo) {
            cc.log('Game Event!');
            Emitter.instance.emit(EventCode.EVENT.UPDATE_EVENT_STATUS, EventInfo);
        }
        Emitter.instance.emit(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM);
        if (RoomData) {
            Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_ROOM_DATA, RoomData);
            // PopupController.instance.onJoinGame();
        }
        if (ListUser) {
            DataStore.instance.setSelfInfo({isReadyToPlay: true});
            Emitter.instance.emit(EventCode.PLAYER_LAYER.UPDATE_LIST_PLAYER, ListUser);
        }
        if(targetState === GameConfig.instance.TARGET_LOCK.AUTO_BOT) {
            Emitter.instance.emit(EventCode.AUTO_BOT.RESUME);
        }
        if (DataStore.instance.isAutoPaused()) {
            Emitter.instance.emit(EventCode.GAME_LAYER.RESUME_AUTO_FIRE);
        }
    },

    onUpdateJackpot(data) {
        DataStore.instance.setDataStore({jackpotValue: data.amount});
        Emitter.instance.emit(EventCode.COMMON.UPDATE_JACKPOT, data.amount);
    },

    onPlayerEnterBoard(data) {
        Emitter.instance.emit(EventCode.PLAYER_LAYER.PLAYER_JOIN_BOARD, data);
    },

    onPlayerExitBoard(data) {
        Emitter.instance.emit(EventCode.PLAYER_LAYER.PLAYER_LEAVE_BOARD, data);
        if (data.DeskStation === DataStore.instance.getSelfDeskStation()) {
            Emitter.instance.emit(EventCode.COMMON.EXIT_GAME_ROOM);
            DataStore.instance.setSelfInfo({DeskId: null});
            MainFSM.instance._fsm.goLoginLobby();
        }
    },

    onPlayerUpdateWallet(data) {
        Emitter.instance.emit(EventCode.PLAYER_LAYER.GAME_UPDATE_WALLET, data);
    },
    // send data sever
    sendUserFire(data) {
        NetworkParser.instance.sendGunFire(data);
    },

    onNotify(data) {
        if (!DataStore.instance.getCurrentSceneName()) return;
        Emitter.instance.emit(EventCode.COMMON.SHOW_NOTIFY, data);
    },

    sendActiveFreezeGun() {
        NetworkParser.instance.sendActiveFreezeGun();
    },

    onGameChangeRound(data) {
        data.isFishGroupToNormal = true;
        Emitter.instance.emit(EventCode.GAME_LAYER.GAME_CHANGE_ROUND, data);
    },
    // EMIT FUNCTION

    //= ===============================

    onShowGameLayer(isShow = false) {
        if (isShow) {
            this.onShowGame();
        } else {
            this.onHideGame();
        }
    },
    
    onShowGame() {
        Emitter.instance.emit(EventCode.COMMON.GAME_SHOW);
        this._isGameHide = false;
        DataStore.instance.setDataStore({timeHide: Date.now() - this._timeHide});
        if (NetworkParser.instance) {
            cc.log("GAME SHOW");
            if(DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Lobby){
                NetworkParser.instance.sendGetLobbyOnShow();
            } else if(DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Game) {
                NetworkParser.instance.notifyShowGame();
            }
        }
       
    },

    onHideGame() {
        DataStore.instance.setSelfInfo({isReadyToPlay: false});
        this._isGameHide = true;
        this._timeHide = Date.now();
        Emitter.instance.emit(EventCode.COMMON.GAME_HIDE);

        if (!DataStore.instance.isAutoPaused()) {
            Emitter.instance.emit(EventCode.GAME_LAYER.PAUSE_AUTO_FIRE);
        }
        if (NetworkParser.instance) {
            cc.log("GAME HIDE");
            if(DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Game)  {
                NetworkParser.instance.sendIdleMessage();
            }
        }
    },

    loadScene(sceneName, callback) {
        Emitter.instance.emit(EventCode.COMMON.CLOSE_SCENE);
        cc.director.loadScene(sceneName, (err) => {
            if (err) {
                cc.warn(err.message, err.stack);
                handleFlowOutGame();
            } else {
                this._isGameHide = false;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }

        });
    },

    refreshPage() {
        if (MainFSM.instance.isStateLoadGame()) {
            MainFSM.instance._fsm.goWaitExit();
            return;
        }
        this.onCloseTab();

        Emitter.instance.emit(EventCode.COMMON.SHOW_WAITING);
        Emitter.instance.emit(EventCode.SOUND.STOP_ALL_AUDIO);
        Emitter.instance.emit(EventCode.GAME_LAYER.BLOCK_ALL_BUTTON_WHEN_REFRESH);
        if (DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Game) {
            Emitter.instance.emit(EventCode.COMMON.EXIT_GAME_ROOM);
        }

        Emitter.instance.emit(EventCode.COMMON.EXIT_GAME);
        NetworkParser.instance.cleanup();

        // Todo: Stop all sound
        MainFSM.instance._fsm.goExitGame();


    },
    destroy() {
        this.arrSceneAssets.forEach((item) => {
            if (cc.isValid(item)) {
                cc.loader.setAutoRelease(item, true);
                cc.loader.removeItem(item);
            }
        });

        removeEvents(this);
        removeCursorInHtml();
        cc.game.off(cc.game.EVENT_HIDE, this._onHideGameBinding);
        cc.game.off(cc.game.EVENT_SHOW, this._onShowGameBinding);
        this.restoreInitFrameSizeFunc();
        const {handleCloseGameIframe} = require("gameCommonUtils");
        handleCloseGameIframe();
    },
    sendExitGameServer() {
        NetworkParser.instance.sendExitGameServer();
    },
    connectMaster() {
        NetworkParser.instance.connectMaster(GameConfig.instance.IPMaster, GameConfig.instance.token4Master);
    },
    connectGame() {
        NetworkParser.instance.connectGame(GameConfig.instance.IPGame, GameConfig.instance.token4Game);
    },
    sendGetRoomInfo(roomKind) {
        NetworkParser.instance.sendGetInfoGameRoom(roomKind);
    },

    sendGunFire(data) {
        NetworkParser.instance.sendGunFire(data);
    },

    sendFireLaser(data) {
        if (DataStore.instance.getIsReadyToPlay()) {
            NetworkParser.instance.sendCatchFishSkill(data);
        }
    },

    bulletCollideFish(data) {
        if (data.isMe) {
            NetworkParser.instance.sendCatchFish(data.FishID, data.BulletMultiple, data.BulletID, data.FireType);
        }
    },

    onDragonStateEnd(data) {
        Emitter.instance.emit(EventCode.DRAGON.ON_END, data);
    },

    onDragonBallDropped(data) {
        Emitter.instance.emit(EventCode.DRAGON.ON_BALL_DROPPED, data);
    },

    onDragonWarning() {
        Emitter.instance.emit(EventCode.DRAGON.WARNING);
    },

    onUpdateSkill() {
        // cc.error ("onUpdateSkill" + data.TargetTime);
    },

    overrideInitFrameSizeFunc() {
        const isIOSBrowser = cc.sys.os === cc.sys.OS_IOS && cc.sys.isBrowser && cc.sys.isMobile;
        if (!isIOSBrowser) return;
        this.originalInitFrameSizeFunc = cc.view._initFrameSize;
        cc.view._initFrameSize = function () {
            var locFrameSize = cc.view._frameSize;
            var w = cc.game.frame.clientWidth;
            var h = cc.game.frame.clientHeight;
            var isLandscape = w >= h;

            if (!cc.sys.isMobile ||
                (isLandscape && cc.view._orientation & cc.macro.ORIENTATION_LANDSCAPE) ||
                (!isLandscape && cc.view._orientation & cc.macro.ORIENTATION_PORTRAIT)) {
                locFrameSize.width = window.innerWidth;
                locFrameSize.height = window.innerHeight;
                cc.game.container.style['-webkit-transform'] = 'rotate(0deg)';
                cc.game.container.style.transform = 'rotate(0deg)';
                cc.view._isRotated = false;
            } else {
                locFrameSize.width = cc.game.frame.clientHeight;
                locFrameSize.height = cc.game.frame.clientWidth;
                cc.game.container.style['-webkit-transform'] = 'rotate(90deg)';
                cc.game.container.style.transform = 'rotate(90deg)';
                cc.game.container.style['-webkit-transform-origin'] = '0px 0px 0px';
                cc.game.container.style.transformOrigin = '0px 0px 0px';
                cc.view._isRotated = true;
            }
            if (cc.view._orientationChanging) {
                setTimeout(function () {
                    cc.view._orientationChanging = false;
                }, 1000);
            }
        };
    },

    restoreInitFrameSizeFunc() {
        if (this.originalInitFrameSizeFunc) {
            cc.view._initFrameSize = this.originalInitFrameSizeFunc;
            this.originalInitFrameSizeFunc = null;
        }
    },

    onDestroy() {
        this.refreshPage();
    },

    onGameKick() {
        Emitter.instance.emit(EventCode.POPUP.SHOW_POPUP_PROMPT, NetworkGameEvent.MSG_CODE.NO_ACTION);
    },


    onUpdateEventStatus(data) {
        Emitter.instance.emit(EventCode.EVENT.UPDATE_EVENT_STATUS, data);
    },

    onUpdateEventTray(data) {
        Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_EVENT_TRAY, data);
    },


    getGameId(){
        return GameConfig.instance.GameId;
    },

    getGameMeta(){
        return {
            meta: 'fish game',
            fishes: FishManager.instance ? FishManager.instance.getListFish().length : null
        };
    }
});

gfMainController.instance = null;
module.exports = gfMainController;
