const {formatMoney} = require('utils');
const {jackpotStatic} = require('CustomDataType');
const {formatUserName} = require('utils');
const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");

cc.Class({
    extends: require("BaseCellHistory"),

    properties: {
        jackpotType: cc.Node,
        jackpotList: {
            default: [],
            type: [jackpotStatic]
        },
        detailUserWin: {
            default: null,
            type: cc.Prefab
        },
        btnDetailInfo: {
            default: null,
            type: cc.Node
        },
        totalUser: {
            default: null,
            type: cc.Node
        },
        deskID: {
            default: null,
            type: cc.Node
        },
        btnDetail: {
            default: null,
            type: cc.Node
        },
        btnHideDetail: {
            default: null,
            type: cc.Node
        },
        background: {
            default: null,
            type: cc.Node
        },
        userKill: {
            default: null,
            type: cc.Node
        },
        height: 50
    },

    onLoad() {
        this._super();
        this.node.height = this.height;
        this.node.active = true;
        this.node.onClickHide = this.onClickHide.bind(this);
        this.btnDetail.off('click');
        this.btnDetail.on('click', (() => {
            Emitter.instance.emit(EventCode.SOUND.CLICK);
            this.onClickMore();
        }), this);
        this.btnHideDetail.off('click');
        this.btnHideDetail.on('click', (() => {
            Emitter.instance.emit(EventCode.SOUND.CLICK);
            this.onClickHide();
        }), this);
    },

    updateData(data) {
        // this._super(data);
        // if(this.jackpotType){
        //     const imageJP = this.findJackpotStaticData(data.jpType)
        //     if (imageJP) {
        //         this.jackpotType.getComponent(cc.Sprite).spriteFrame = imageJP.static;
        //     }
        // }
        this._clearData();
        if (!data) return;
        this.onClickHide();
        this.background.active = this.node.index & 0x1;
        this.time.getComponent(cc.Label).string = this.formatTimeStamp(data.time);
        this.deskID.getComponent(cc.Label).string = data.tTp === 'vip' ? 'Godzilla' : 'Tàu Ma';
        this.totalUser.getComponent(cc.Label).string = data.pl.length;
        this.winAmount.getComponent(cc.Label).string = formatMoney(data.amt);
        const moreInfo = this.node.getChildByName('Detail').getChildByName('MoreDetail');
        data.pl.sort(function (a, b) {
            return a.winAmt - b.winAmt;
        });
        this.userKill.getComponent(cc.Label).string = formatUserName(data.pl[data.pl.length - 1].dn);
        this._infolenght  = data.pl.length;
        for (let i = 0; i < data.pl.length; i++) {
            if (this.detailUserWin) {
                let detail = cc.instantiate(this.detailUserWin);
                if (detail) {
                    detail.getChildByName('NickName').getComponent(cc.Label).string = formatUserName(data.pl[i].dn);
                    detail.getChildByName('WinAmount').getComponent(cc.Label).string = formatMoney(data.pl[i].winAmt);
                    detail.active = true;
                    moreInfo.addChild(detail);
                }
            }
        }
        moreInfo.active = false;
        this.btnDetail.active = data.pl.length > 1;
    },

    onClickMore() {
        this.btnHideDetail.active = true;
        this.btnDetail.active = false;
        const moreInfo = this.node.getChildByName('Detail').getChildByName('MoreDetail');
        moreInfo.active = true;
        this.node.height = 50 + moreInfo.children.length * 50;
        this.background.height = this.node.height;
        this._hideAll();
        this.userKill.active = false;
    },

    onClickHide() {
        this.btnHideDetail.active = false;
        this.btnDetail.active = this._infolenght > 1;
        const moreInfo = this.node.getChildByName('Detail').getChildByName('MoreDetail');
        moreInfo.active = false;
        this.node.height = 50;
        this.background.height = this.node.height;
        this.userKill.active = true;
    },

    _hideAll() {
        this.node.parent.children.forEach((child) => {
            if (child !== this.node) {
                child.onClickHide();
            }
        });
    },

    _clearData() {
        const moreInfo = this.node.getChildByName('Detail').getChildByName('MoreDetail');
        moreInfo.children.length = 0;
    },


    findJackpotStaticData(jackpotType) {
        for (let i = 0; i < this.jackpotList.length; i++) {
            if (this.jackpotList[i].name == jackpotType)
                return this.jackpotList[i];
        }
        return null;
    },
});
