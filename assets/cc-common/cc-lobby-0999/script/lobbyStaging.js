const authenPusher = require('authenPusher');

cc.Class({
    extends: cc.Component,

    loadScene(event, data) {
        let num = data.replace(/[A-z]/g,"");
        num = parseInt(num);
        if( num < 7000 || num > 7999){ // not cards game range id
            cc.audioEngine.stopAll();
        }
        cc.director.loadScene(data);
    },
    logOut() {
        authenPusher.leavePusher();
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_SCENE_NAME} = loadConfigAsync.getConfig();
        const nodePersist = cc.director.getScene().getChildByName('OverlayPersistent');
        if (nodePersist) {
            cc.game.removePersistRootNode(nodePersist);
        }
        cc.director.loadScene(LOGIN_SCENE_NAME);
    },

    iniviteToGame(){
        let gameId = this.txtGame.getComponent(cc.EditBox).string ;
        let tableId = this.txtTable.getComponent(cc.EditBox).string ;

        let instance = this.node.getComponent("KtekEventHandler").getInstance();
        if( instance ){
            instance.setJoinRoomData(tableId,gameId);
        }
    },

    loadLobby() {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOBBY_SCENE_NAME} = loadConfigAsync.getConfig();
        cc.director.loadScene(LOBBY_SCENE_NAME);
    }
});
