const EventCode = require("gfBaseEvents");
const Localize = require('gfLocalize');
const Emitter = require('gfEventEmitter');

cc.Class({
    extends: require('gfPopupInfo'),

    properties: {
        nextBtn: cc.Node,
        preBtn: cc.Node,
        infoTitle: cc.Node,
        titles: {
            default: [],
            type: cc.String,
        },
        pageViewNode: cc.Node,
    },

    initObj() {
        this._super();
        this.initPage();
    },

    initPage() {
        this.curInfoID = 0;
        this.pageView = this.pageViewNode.getComponent(cc.PageView);
        this.pageView.node.on('page-turning', this.pageViewEvent, this);
        this.pageView.scrollToPage(this.curInfoID);
        this.activeButtons(this.curInfoID);
    },

    pageViewEvent() {
        this.curInfoID = this.pageView.getCurrentPageIndex();
        this.activeButtons(this.curInfoID);
    },
    initLanguage() {
        this.titles[0] = Localize.instance.popupTitle.infoHSC;
        this.titles[1] = Localize.instance.popupTitle.infoTNDB;
        this.titles[2] = Localize.instance.popupTitle.infoKN;
        this.titles[3] = Localize.instance.popupTitle.infoHuRong;
        this.titles[4] = Localize.instance.popupTitle.infoHuRong;
        this.titles[5] = Localize.instance.popupTitle.miniboss;
        this.titles[6] = Localize.instance.popupTitle.miniboss;
    },
    next() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.pageView.scrollToPage(this.curInfoID + 1);
        this.curInfoID++;
        this.activeButtons(this.curInfoID);
    },
    previous() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.pageView.scrollToPage(this.curInfoID - 1);
        this.curInfoID--;
        this.activeButtons(this.curInfoID);
    },
    activeButtons(id) {
        const { nextBtn, preBtn, popupTitle } = this;

        const totalInfo = this.pageView.node.getChildByName('view').getChildByName('content').children.length;
        if (id >= totalInfo - 1) {
            id = totalInfo - 1;
            nextBtn.getComponent(cc.Button).interactable = false;
        } else {
            nextBtn.getComponent(cc.Button).interactable = true;
        }

        if (id <= 0) {
            id = 0;
            preBtn.getComponent(cc.Button).interactable = false;
        } else {
            preBtn.getComponent(cc.Button).interactable = true;
        }
        this.curInfoID = id;
        if (popupTitle) {
            if (popupTitle.getComponent(cc.Label)) {
                // const textData = this.titles;
                popupTitle.getComponent(cc.Label).string = this.titles[this.curInfoID];// textData[this.curInfoID];
            }
        }
    },
    resetInfo() {
        this.pageView.scrollToPage(0, 0.01);
        this.curInfoID = 0;
        this.activeButtons(this.curInfoID);
    },

    onClose() {
        this._super();
        this.resetInfo();
    },
});
