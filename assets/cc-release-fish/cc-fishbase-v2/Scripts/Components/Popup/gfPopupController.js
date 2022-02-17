const GameConfig = require('gfBaseConfig');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const DataStore = require('gfDataStore');
const {registerEvent, removeEvents} = require("gfUtilities");

cc.Class({
    extends: cc.Component,
    properties: {
        popupSetting: cc.Node,
        popupHistoryJackpot: cc.Node,
        popupInfo: cc.Node,
        popupTutorial: cc.Node,
        popupPrompt: cc.Node,
        popupAutobot: cc.Node,
        popupEventInfo: cc.Node,
        overlay: cc.Node,
        _popupQueue: [],
    },

    onLoad() {
        this.overlay.active = false;
        registerEvent(EventCode.COMMON.REMOVE_PERSIST_NODE, this.refreshPage, this);
        this.node.zIndex = GameConfig.instance.Z_INDEX.POPUP;
        cc.game.addPersistRootNode(this.node);
        //For better scene view in editor, set Opacity of controller to 0 - reset here
        this.node.opacity = 255;
        this.initEvents();
    },
    start(){
        const canvasSize = cc.view.getCanvasSize();
        this.node.width = canvasSize.width;
        this.node.height = canvasSize.height;
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, this.onBeforeSceneChange, this);
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onAfterSceneChange, this);
    },

    initEvents() {
        registerEvent(EventCode.POPUP.CLOSE_ALL, this.closeAll, this);
        registerEvent(EventCode.POPUP.SHOW_POPUP_TUTORIAL, this.onJoinGame, this);
        registerEvent(EventCode.POPUP.SHOW_POPUP_PROMPT, this.showPrompt, this);
        registerEvent(EventCode.POPUP.SHOW_POPUP_HISTORY, this.showJPHistory, this);
        registerEvent(EventCode.POPUP.SHOW_POPUP_INFO, this.showInfo, this);
        registerEvent(EventCode.POPUP.SHOW_POPUP_SETTING, this.showSetting, this);
        registerEvent(EventCode.POPUP.SHOW_POPUP_AUTOBOT, this.showAutoBot, this);
        registerEvent(EventCode.POPUP.SHOW_POPUP_EVENT_INFO, this.showEventInfo, this);

        registerEvent(EventCode.POPUP.CLOSE_TOP_POPUP, this.close, this);
        registerEvent(EventCode.COMMON.ON_SCREEN_RESIZE, this.updateSceneSize, this);
        // registerEvent(EventCode.COMMON.EXIT_GAME, this.refreshPage, this);
        registerEvent(EventCode.COMMON.REFRESH_PAGE, this.refreshPage, this);

    },
    onBeforeSceneChange() {
        this.closeAll();
        removeEvents(this);
    },
    onAfterSceneChange() {
        this.popupEventInfo && this.checkShowPopupEvent();
        this.initEvents();
    },
    updateSceneSize() {
        this.node.width = GameConfig.instance.realSize.Width;
        this.node.height = GameConfig.instance.realSize.Height;
    },

    checkShowPopupEvent() {
        const showEventInfo = cc.sys.localStorage.getItem(GameConfig.instance.LOCAL_STORE.SHOW_EVENT_INFO);
        if (showEventInfo) {
            if (!JSON.parse(showEventInfo)) {
                this.showEventInfo(true);
            }
        } else {
            this.showEventInfo(true);
        }
        cc.sys.localStorage.setItem(GameConfig.instance.LOCAL_STORE.SHOW_EVENT_INFO, true);
    },

    showEventInfo(data) {
        this._showPopup(this.popupEventInfo, data);
    },

    showJPHistory() {
        this._showPopup(this.popupHistoryJackpot);
    },
    showSetting() {
        this._showPopup(this.popupSetting);
    },
    showPrompt(data) {
        this._showPopup(this.popupPrompt, data);
    },
    showInfo() {
        this._showPopup(this.popupInfo);
    },
    showTutorial() {
        this._showPopup(this.popupTutorial);
    },
    showAutoBot() {
        this._showPopup(this.popupAutobot);
    },
    _showPopup(currentPopup, data = null) {
        if (!currentPopup) {
            return;
        }
        // this.node.children.forEach((popup) => {
        //     if (popup !== currentPopup) {
        //         popup.hide();
        //     }
        // })
        Emitter.instance.emit(EventCode.COMMON.HIDE_WAITING);
        this.onPopupQueue(currentPopup);
        currentPopup.show(data);
    },

    onJoinGame() {
        if (!this.joinedGame) {
            this.joinedGame = true;
            const selfInfo = DataStore.instance.getSelfInfo();
            let llv = cc.sys.localStorage.getItem(GameConfig.instance.LOCAL_STORE.LOCAL_LOGIN_VAR + selfInfo.UserID);
            if (llv) {
                llv = JSON.parse(llv);
                if (!llv[GameConfig.instance.LOCAL_STORE.NOT_SHOW_NT]) {
                    this.showTutorial();
                }
            } else {
                this.showTutorial();
            }
        }
    },
    onPopupQueue(popup) {
        let isNew = false;
        if (this._popupQueue && this._popupQueue.length > 0) {
            const currPopup = this._popupQueue[this._popupQueue.length - 1];
            if (currPopup != popup) {
                this._popupQueue[this._popupQueue.length - 1].hide();
                isNew = true;
            }
        } else {
            this.overlay.active = true;
            this.overlay.stopAllActions();
            this.overlay.runAction(
                cc.fadeTo(0.3,150)
            );
            isNew = true;
        }
        if (isNew) {
            this._popupQueue.push(popup);
        }
    },
    close() {
        const popup = this._popupQueue.pop();
        if (popup == null) {
            return;
        }
        popup.hide();
        if (this._popupQueue.length < 1) {
            this.overlay.stopAllActions();
            this.overlay.runAction(
                cc.sequence(
                    cc.fadeOut(0.3),
                    cc.callFunc(()=>{
                        this.overlay.active = false;
                    })
                )
            );
            return;
        }
        this._popupQueue[this._popupQueue.length - 1].show();
    },

    closePopupByName(popupName) {
        let popup = null;

        this._popupQueue = this._popupQueue.filter(function( child ) {
            if(child.name === popupName){
                popup = child;
            }
            return child.name !== popupName;
        });

        if (popup == null) {
            return;
        }

        popup.hide();
        if (this._popupQueue.length < 1) {
            this.overlay.stopAllActions();
            this.overlay.runAction(
                cc.sequence(
                    cc.fadeOut(0.3),
                    cc.callFunc(()=>{
                        this.overlay.active = false;
                    })
                )
            );
            return;
        }
    },

    closeAll() {
        this.node.children.forEach((popup) => {
            if (popup.active && popup !== this.overlay) {
                popup.hide(GameConfig.instance.POPUP_ANIMATION.DEFAULT);
            }
        });
        this.overlay.stopAllActions();
        this.overlay.runAction(
            cc.sequence(
                cc.fadeOut(0.3),
                cc.callFunc(()=>{
                    this.overlay.active = false;
                })
            )
        );
        this._popupQueue = [];
    },

    refreshPage() {
        cc.director.off(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, this.onBeforeSceneChange, this);
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onAfterSceneChange, this);
        removeEvents(this);
        cc.game.removePersistRootNode(this.node);
    },
    onDestroy(){
        this.refreshPage();
    },
});
