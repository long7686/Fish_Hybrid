
cc.Class({
    extends: cc.Component,
    properties: {
        txtGame: cc.Node,
        txtTable: cc.Node,
        txtBet: cc.Node,
        txtTime: cc.Node,
        lblInvited: cc.Node,
    },

    iniviteToGame(){
        let gameId = this.txtGame.getComponent(cc.EditBox).string ;
        let tableId = this.txtTable.getComponent(cc.EditBox).string ;
        let bet = this.txtBet.getComponent(cc.EditBox).string ;
        let time = this.txtTime.getComponent(cc.EditBox).string;

        this.node.getComponent("KtekEventHandler").setStaticJoinRoomData(tableId,gameId,bet,time);

        this.lblInvited.getComponent(cc.Label).string = "Success: "+gameId+", "+tableId +", "+bet+", "+time;
        this.lblInvited.stopAllActions();
        this.lblInvited.runAction(cc.sequence([
            cc.scaleTo(0.25,1,1),
            cc.delayTime(1),
            cc.scaleTo(0.25,0,0),
        ]));

    },

});
