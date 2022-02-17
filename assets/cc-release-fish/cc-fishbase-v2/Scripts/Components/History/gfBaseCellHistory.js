const { formatMoney } = require('utils');
const { formatUserName, formatTimeStamp } = require('gfUtilities');
cc.Class({
    extends: cc.Component,

    properties: {
        time: cc.Node,
        account: cc.Node,
        bet: cc.Node,
        winAmount: cc.Node,
        height: 50
    },

    onLoad() {
        this.node.updateData = this.updateData.bind(this);
        this.node.height = this.height;
    },

    updateData(data) {
        if (!data) return;
        this.time.getComponent(cc.Label).string = formatTimeStamp(data.time);
        this.account.getComponent(cc.Label).string = formatUserName(data.dn);
        this.bet.getComponent(cc.Label).string = formatMoney(data.betAmt);
        this.winAmount.getComponent(cc.Label).string = formatMoney(data.jpAmt);
    },
    

});
