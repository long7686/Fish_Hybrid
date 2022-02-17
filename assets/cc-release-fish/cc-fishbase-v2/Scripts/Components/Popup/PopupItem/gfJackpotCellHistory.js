const { formatUserName } = require('gfUtilities');
cc.Class({
    extends: require("JackpotCellHistory"),
    updateData(data) {
        this._super(data);
        this.account.getComponent(cc.Label).string = formatUserName(data.dn);
    },
});
