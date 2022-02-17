const { formatMoney } = require('utils');

cc.Class({
    extends: require("BaseCellHistory"),

    properties: {
        session: cc.Node,
        betDenom: cc.Node,
        betLines: cc.Node,
        totalbet: cc.Node,
        detailBtn: cc.Node,
        featureGroup: cc.Node,
        freeCircle: cc.Node,
        bonusCircle: cc.Node,
    },

    onLoad() {
        this._super();
        if (this.node.config.PAY_LINE_ALLWAYS) {
            if (JSON.stringify(this.node.config.TABLE_FORMAT) === "[3,3,3,3,3]")
                this.totalLineCount = '243';
            else
                this.totalLineCount = 'All ways';
        }
    },

    updateData(data) {
        this.detailBtn.active = false;

        if (!data) return;
        this.playSessionId = data.sessionId;
        this.session.getComponent(cc.Label).string = "#" + data.sessionId.substring(data.sessionId.length-8, data.sessionId.length);
        this.time.getComponent(cc.Label).string = this.formatTimeStamp(parseInt(data.time));
        this.betDenom.getComponent(cc.Label).string = parseInt(data.betDenom);
        this.totalbet.getComponent(cc.Label).string = formatMoney(parseInt(data.totalBetAmount));
        this.winAmount.getComponent(cc.Label).string = formatMoney(data.totalWinAmount);

        if (this.node.config.PAY_LINE_ALLWAYS)
            this.betLines.getComponent(cc.Label).string = this.totalLineCount;
        else
        {
            this.betLines.getComponent(cc.Label).string = (data.bettingLines.match(/,/g) || []).length + 1;
        }

        this.detailBtn.active = true;

        this.dataDetail = data;
        if(this.featureGroup){
            this.freeCircle.active = data.freeGameTotal > 0;
            this.bonusCircle.active = data.totalBonusWinAmount > 0;
        }
    },

    onClickDetail() {
        this.clickItemEvent = new cc.Event.EventCustom('OPEN_BET_DETAIL', true);
        this.clickItemEvent.setUserData({
            sessionId: this.playSessionId,
            summaryData: this.dataDetail,
        });
        this.node.dispatchEvent(this.clickItemEvent);
        if (this.node.soundPlayer) this.node.soundPlayer.playSFXClick();
    },
});

