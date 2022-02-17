const DataStore = require('gfDataStore');
const GameConfig = require('gfBaseConfig');
const EventCode = require("gfBaseEvents");
const { registerEvent, removeEvents } = require("gfUtilities");

cc.Class({
    extends: cc.Component,
    properties: {
        notifyMessage: {
            default: null,
            type: cc.Node
        },
        notifyJackpot: {
            default: null,
            type: cc.Node
        },
        notifyStack: {
            default: null,
            type: cc.Node
        },
    },

    onLoad(){
        const loadConfigAsync = require('loadConfigAsync');
        this.LOAD_CONFIG = loadConfigAsync.getConfig();
        cc.game.addPersistRootNode(this.node);
        this.node.zIndex = GameConfig.instance.Z_INDEX.NOTIFY;
        //For better scene view in editor, set Opacity of controller to 0 - reset here
        this.node.opacity = 255;
        this.initEvents();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.SHOW_NOTIFY, this.onNotify, this);
        registerEvent(EventCode.COMMON.REMOVE_PERSIST_NODE, this.refreshPage, this);
        registerEvent(EventCode.COMMON.ON_SCREEN_RESIZE, this.updateSceneSize, this);
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, this.onBeforeSceneChange,this);
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onAfterSceneChange,this);

        this.extendInit();
    },

    updateSceneSize(){
        // this.node.position = cc.v2(GameConfig.instance.realSize.Width/2, GameConfig.instance.realSize.Height/2);
        this.node.width = GameConfig.instance.realSize.Width;
        this.node.height = GameConfig.instance.realSize.Height;
        // if(this.notifyJackpot){
        //     this.notifyJackpot.x = -GameConfig.instance.realSize.Width/2;
        // }
    },
    extendInit(){
        //@TODO: add extra init if need here
    },
    onBeforeSceneChange(){
        this.notifyMessage && this.notifyMessage.onBeforeSceneChange();
        this.notifyJackpot && this.notifyJackpot.onBeforeSceneChange();
        this.notifyStack && this.notifyStack.onBeforeSceneChange();
    },
    onAfterSceneChange(){
        this.notifyMessage && this.notifyMessage.onAfterSceneChange();
        this.notifyJackpot && this.notifyJackpot.onAfterSceneChange();
        this.notifyStack && this.notifyStack.onAfterSceneChange();
    },
    onNotify(data) {
        if (!this.validateData(data)) return;
        if (GameConfig.instance.NOTIFY_JACKPOT.array_type_notify_jackpot.indexOf(data.type) > -1) {
            const selfInfo = DataStore.instance.getSelfInfo();
            if (data.data[0] !== selfInfo.Username) {
                this.notifyJackpot && this.notifyJackpot.show(data);
            }
        }
        else if(this.notifyStack){
            if (GameConfig.instance.NOTIFY_TYPE.SYSTEM === data.type) {
                this.notifyMessage.show(data);
            } else {
                this.notifyStack.show(data);
            }
        } else {
            this.notifyMessage.show(data);
        }
    },
    validateData(data) {
        let isValid = false;
        const { LOGIN_IFRAME } = this.LOAD_CONFIG;
        const  {ALL, IFRAME, APP } = GameConfig.instance.NOTIFY_ENVIRONMENT_CONFIG;
        switch (data.environment) {
            case ALL:
                isValid = true;
                break;
            case IFRAME:
                if (LOGIN_IFRAME) isValid = true;
                break;
            case APP:
                if (!LOGIN_IFRAME) isValid = true;
                break;
            default:
                isValid = true;
                break;
        }
        return isValid;
    },

    refreshPage(){
        cc.director.off(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, this.onBeforeSceneChange,this);
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onAfterSceneChange,this);

        this.node.children.forEach((item)=>{
            item.destroy();
        });
        cc.game.removePersistRootNode(this.node);
        removeEvents(this);
    },
});
