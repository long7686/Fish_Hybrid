const { formatMoney } = require('utils');
const { formatUserName, formatTimeStamp } = require("gfUtilities");
cc.Class({
    extends: require("gfBaseCellHistory"),

    updateData(data) {
        if (!data) return;
        this.time.getComponent(cc.Label).string = formatTimeStamp(parseInt(data.time));
        this.account.getComponent(cc.Label).string = formatUserName(data.dn);
        this.bet.getComponent(cc.Label).string = formatMoney(data.betAmt);
        this.winAmount.getComponent(cc.Label).string = formatMoney(data.winAmt);
    },

});