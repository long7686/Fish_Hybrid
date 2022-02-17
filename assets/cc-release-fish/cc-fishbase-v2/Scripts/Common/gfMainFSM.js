const StateMachine = require('javascript-state-machine');
const EventCode = require('gfBaseEvents');
const Emitter = require('gfEventEmitter');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Localize = require('gfLocalize');
const PoolManager = require('gfPoolManager');
const FishManager = require('gfFishManager');
const ReferenceManager = require('gfReferenceManager');
const NetworkParser = require('gfNetworkParser');

const { showFullScreenButton } = require('gfUtilities');

const TRANSITION = {
    GO_LOGIN_LOBBY: 'goLoginLobby',
    GO_LOBBY: 'goLobby',
    GO_LOGIN_GAME_ROOM: 'goLoginGameRoom',
    GO_GAME_ROOM: 'goGameRoom',
    GO_EXIT_GAME: 'goExitGame',
    GO_LOAD_GAME: 'goLoadGame',
    GO_WAIT_EXIT: "goWaitExit",
};
const STATE = {
    START: 'start',
    LOGIN_LOBBY: 'loginLobby',
    LOBBY: 'lobby',
    LOAD_GAME: 'loadGame',
    LOGIN_GAME_ROOM: 'loginGameRoom',
    GAME_ROOM: 'gameRoom',
    WAIT_EXIT: 'waitExit',
    EXIT_GAME: 'exitGame',
};

const gfMainFSM = cc.Class({
    properties: {
        // Finite State Machine
        _fsm: null,

        // binding function

        // LOGTAG
        LOGTAG: {
            default: "::gfMainFSM::",
            visible: false,
        },
    },
    ctor() {
        cc.log(this.LOGTAG, "INIT MAIN FSM");
        this.initStateMachine();
        this.initEvents();
    },

    initEvents() {
    },

    initStateMachine() {
        // if (this._fsm != null) { return; }
        this._fsm = new StateMachine({
            init: STATE.START,
            transitions: [
                { name: TRANSITION.GO_LOGIN_LOBBY, from: STATE.START, to: STATE.LOGIN_LOBBY },
                { name: TRANSITION.GO_LOGIN_LOBBY, from: STATE.GAME_ROOM, to: STATE.LOGIN_LOBBY },
                { name: TRANSITION.GO_LOGIN_LOBBY, from: STATE.LOGIN_GAME_ROOM, to: STATE.LOGIN_LOBBY },
                { name: TRANSITION.GO_LOGIN_LOBBY, from: STATE.LOBBY, to: STATE.LOGIN_LOBBY },

                { name: TRANSITION.GO_LOBBY, from: STATE.LOGIN_LOBBY, to: STATE.LOBBY },
                { name: TRANSITION.GO_LOAD_GAME, from: STATE.LOBBY, to: STATE.LOAD_GAME },
                { name: TRANSITION.GO_LOAD_GAME, from: STATE.LOGIN_LOBBY, to: STATE.LOAD_GAME },

                { name: TRANSITION.GO_LOGIN_GAME_ROOM, from: STATE.LOAD_GAME, to: STATE.LOGIN_GAME_ROOM },
                { name: TRANSITION.GO_LOGIN_GAME_ROOM, from: STATE.LOGIN_LOBBY, to: STATE.LOGIN_GAME_ROOM },

                { name: TRANSITION.GO_GAME_ROOM, from: STATE.LOGIN_GAME_ROOM, to: STATE.GAME_ROOM },
                { name: TRANSITION.GO_GAME_ROOM, from: STATE.GAME_ROOM, to: STATE.GAME_ROOM },
                { name: TRANSITION.GO_EXIT_GAME, from: "*", to: STATE.EXIT_GAME },
                { name: TRANSITION.GO_WAIT_EXIT, from: STATE.LOAD_GAME, to: STATE.WAIT_EXIT },
            ],
            methods: {
                onLoginLobby: this.onLoginLobby.bind(this),
                onLobby: this.onLobby.bind(this),
                onLoginGameRoom: this.onLoginGameRoom.bind(this),
                onGameRoom: this.onGameRoom.bind(this),
                onLeaveGameRoom: this.onLeaveGameRoom.bind(this),
                onExitGame: this.onExitGame.bind(this),
                onInvalidTransition(transition, from) {
                    cc.warn("Transition", transition, "from", from, "is not allowed");
                },
                onTransition() {
                    // cc.warn("From ", lifecycle.from, " to ", lifecycle.to);
                },
            },
        });
    },

    onLoginLobby() {
        Emitter.instance.emit(EventCode.COMMON.CONNECT_MASTER);
    },

    onLobby() {
        DataStore.instance.clearSelfInfo();
        Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
        Emitter.instance.emit(EventCode.LOBBY_LAYER.UPDATE_LOBBY_INFO);
        Emitter.instance.emit(EventCode.COMMON.UPDATE_JACKPOT, DataStore.instance.getJackpotValue());
        showFullScreenButton(true);
    },

    onLoginGameRoom() {
        Emitter.instance.emit(EventCode.COMMON.CONNECT_GAME);
    },

    onGameRoom() {
        showFullScreenButton(false);
        const selfInfo = DataStore.instance.getSelfInfo();
        Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_LIST_ITEM, selfInfo.itemInfo);
        Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_TABLE_ID);
        Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_JACKPOT_INFO);
    },

    onLeaveGameRoom() {
        // GameInfo.instance.clearGameInfo();
        // if (!GameInfo.instance.listZombieOutRoom)
        //     Emitter.instance.emit(EventCode.COMMON.EXIT_GAME_ROOM);
    },

    // Exit Game to Portal
    onExitGame() {
        Emitter.instance.emit(EventCode.COMMON.REMOVE_PERSIST_NODE);
        Emitter.instance.destroy();
        FishManager.instance.destroy();
        Localize.instance.destroy();
        NetworkParser.instance.destroy();
        GameConfig.instance.destroy();
        DataStore.instance.destroy();
        ReferenceManager.instance.destroy();
        const MainController = require('gfMainController');
        MainController.instance.destroy();
        // PopupController.instance.destroy();
        PoolManager.instance.destroy();
    },

    destroy() {
        gfMainFSM.instance = null;
    },

    isStateLobby() {
        return this._fsm.state === STATE.LOBBY;
    },

    isStateLoadGame() {
        return this._fsm.state === STATE.LOAD_GAME;
    },
    isStateLoginGameRoom() {
        return this._fsm.state === STATE.LOGIN_GAME_ROOM;
    },
    isStateLoginLobby() {
        return this._fsm.state === STATE.LOGIN_LOBBY;
    },
    isStateWaitExit(){
        return this._fsm.state === STATE.WAIT_EXIT;
    },
    isStateExit(){
        return this._fsm.state === STATE.EXIT_GAME;
    },

    isStateGameRoom() {
        return this._fsm.state === STATE.GAME_ROOM;
    },

});

gfMainFSM.instance = null;
module.exports = gfMainFSM;
