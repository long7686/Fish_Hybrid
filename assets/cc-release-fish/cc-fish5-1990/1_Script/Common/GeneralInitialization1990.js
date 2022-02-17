

const Localize = require("gfLocalize");
const EventEmitter = require('gfEventEmitter');
const NetworkParser = require('gfNetworkParser');
const GameConfig = require('Config1990');
const DataStore = require('DataStore1990');
const MainFSM = require('gfMainFSM');
const MainController = require('MainController1990');
const PoolManager = require('PoolManager1990');
const NodePoolConfig = require('NodePoolConfig1990');
const FishManager = require('FishManager1990');
const ReferenceManager = require('gfReferenceManager');
cc.Class({
    extends: require('gfGeneralInitialization'),
    properties: {
        
    },

    initInstances(){

        //Init Localize
        Localize.instance = new Localize();
        Localize.instance.initLocalizeConfig(this.jsonLocalize.json);
        //Init Event Emitter
        EventEmitter.instance = new EventEmitter();
        //Init NetworkParser
        NetworkParser.instance = new NetworkParser();
       
        //Init GameConfig
        GameConfig.instance = new GameConfig();
        //Init Datastore
        DataStore.instance = new DataStore();

        //Init ReferenceManager
        ReferenceManager.instance = new ReferenceManager();
        
        //Init Main FSM
        MainFSM.instance = new MainFSM();
        //Init Main Controller
        MainController.instance = new MainController();

        PoolManager.instance = new PoolManager(this.gameObjectPrefabs);
        NodePoolConfig.instance = new NodePoolConfig(this.nodePoolAssetPrefab);
        FishManager.instance = new FishManager();
    },
    // update (dt) {},
});
