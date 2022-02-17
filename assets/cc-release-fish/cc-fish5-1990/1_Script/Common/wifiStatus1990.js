cc.Class({
    extends: require("gfWifiStatus"),
    onPingUpdate(ms) {
        this._super(ms);
        this._lablePing.string = this._averagePing + "ms";
    },

    _enableLbl(status) {
        this._ping.active = status;
    },
});
