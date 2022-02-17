const Localize = require("gfLocalize");
const EventEmitter = require('gfEventEmitter');
const NetworkParser = require('gfNetworkParser');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const MainFSM = require('gfMainFSM');
const MainController = require('gfMainController');
const PoolManager = require('gfPoolManager');
const NodePoolConfig = require('gfNodePoolConfig');
const FishManager = require('gfFishManager');
const ReferenceManager = require('gfReferenceManager');
//const EventController = require('gfEventController');
//---
const EventCode = require("gfBaseEvents");
const { registerEvent } = require('gfUtilities');

cc.Class({
    extends: cc.Component,
    editor: {
        executionOrder: -1
    },
    properties: {
        jsonLocalize:{
            default : null,
            type    : cc.JsonAsset
        },
        gameObjectPrefabs           : [cc.Prefab],
        nodePoolAssetPrefab         : cc.Prefab,
    },

    onLoad () {
        this.initInstances();
        cc.game.addPersistRootNode(this.node);
        registerEvent(EventCode.COMMON.REMOVE_PERSIST_NODE, this.refreshPage, this);
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

        //EventController.instance = new EventController();
    },

    refreshPage(){
        cc.game.removePersistRootNode(this.node);
    },
});
