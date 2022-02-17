

const { formatCoin } = require('gfUtilities');

cc.Class({
    extends: require("gfWallet"),

    updateDisplay() {
        this.displayLabel.string = "$ " + formatCoin(this._displayAmount);
    },
});
