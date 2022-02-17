

const MainController = require('gfMainController');
const NetworkGameEvent = require("NetworkGameEvent1990");
const NetworkParser = require('gfNetworkParser');
const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");
const DataStore = require('gfDataStore');

const TIME_WARNING_GODZILLA = 12;

const MainController1990 = cc.Class({
    extends: MainController,
    ctor() {
        MainController.instance = this;
        this._onUpdateGhostShipState = this.onUpdateGhostShipState.bind(this);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_UPDATE_GHOST_SHIP_STATE, this._onUpdateGhostShipState);
        NetworkParser.instance.registerEvent(NetworkGameEvent.GAME_ON_HIT_GODZILLA, this.onHitGodzilla.bind(this));

    },
    onListUserOnBoard(data){
        this._super(data);
        const {TimeWarningGodzilla} = data.RoomData;
        if(TimeWarningGodzilla){
            const timeRemain = TimeWarningGodzilla - DataStore.instance.getDeltaTime();
            Emitter.instance.emit(EventCode.DRAGON.WARNING, timeRemain/ 1000);
        }
    },

    onUpdateGhostShipState(data) { 
        Emitter.instance.emit(EventCode.GAME_LAYER.UPDATE_GHOST_SHIP_STATE, data);
    },
    onHitGodzilla(data){
        const {WinAmount, DeskStation, Wallet} = data;
        if(!WinAmount){
            const wlData = {
                DeskStation,
                Wallet
            };
            Emitter.instance.emit(EventCode.PLAYER_LAYER.GAME_UPDATE_WALLET, wlData);
        }

        Emitter.instance.emit(EventCode.GODZILLA.ON_HIT_GODZILLA, data);
    },
    onDragonWarning(data) {
        const timeRemain = TIME_WARNING_GODZILLA - Math.max(0, (DataStore.instance.getTime() - data.BuildTick) / 1000);
        Emitter.instance.emit(EventCode.DRAGON.WARNING, timeRemain);
    },
});
MainController1990.instance = null;
module.exports = MainController1990;