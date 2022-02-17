const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
const serviceRest = require('serviceRest');
cc.Class({
    extends: cc.Component,

    properties: {
        table: cc.Node,
        pageIndexView: cc.Node,
        itemPerPage: 7,
        loading: cc.Node,
        backBtn: cc.Button,
        nextBtn: cc.Button,
        errorMessage: cc.Node,
        noHistoryText: cc.Node,
        cell: cc.Prefab,
        pagePrefix: "",
        _initialized: false,
    },

    onLoad() {
        if (this._initialized) { return; }
        this.currentPage = 1;
        this.stopLoading();
        this.initTableCells(this.itemPerPage);
        this.noHistoryText.active = false;
        this._initialized = true;
    },

    initData(data) {
        const { gameId, jpList, jpPrefix, url } = data;
        this.gameId = gameId;
        this.jpList = jpList;
        this.jpPrefix = jpPrefix;
        this.url = url;
    },

    openPanel(data) {
        this.initData(data);
        this.node.active = true;
        this.node.opacity = 255;
        this.currentPage = 1;
        if (this.currentPage == 1) {
            this.backBtn.interactable = false;
            this.nextBtn.interactable = false;
        }
        this.pageIndexView.getComponent(cc.Label).string = this.currentPage;
        if (this.errorMessage) this.errorMessage.active = false;
        this.playLoading();
        this.requestDataPage(this.currentPage, this.itemPerPage, this.onRequestResponse.bind(this), this.requestErr.bind(this));
        this.pageIndexView.getComponent(cc.Label).string = this.pagePrefix + this.currentPage;
    },

    closePanel() {
        this.clearTableData();
    },

    playLoading() {
        this.noHistoryText.active = false;
        this.loading.active = true;
        let anim = this.loading.getComponent(cc.Animation);
        anim.wrapMode = cc.WrapMode.Loop;
        anim.play('animLoading');
    },
    stopLoading() {
        this.loading.active = false;
        let anim = this.loading.getComponent(cc.Animation);
        anim.stop('animLoading');
    },
    onNextButton() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        this.nextBtn.interactable = false;
        this.backBtn.interactable = false;
        this.currentPage += 1;
        this.playLoading();
        this.requestDataPage(this.currentPage, this.itemPerPage, this.onRequestResponse.bind(this), this.requestErr.bind(this));
    },
    onPreviousButton() {
        Emitter.instance.emit(EventCode.SOUND.CLICK);
        if (this.currentPage == 1) return;
        this.nextBtn.interactable = false;
        this.backBtn.interactable = false;
        this.currentPage -= 1;
        this.playLoading();
        this.requestDataPage(this.currentPage, this.itemPerPage, this.onRequestResponse.bind(this), this.requestErr.bind(this));
    },
    requestDataPage(page, quantity, callback, callbackErr) {
        let from = (page - 1) * quantity;
        let requestParams = {
            serviceId: this.jpPrefix + this.gameId,
            from: from,
            size: quantity,
            type: this.jpList,
        };
        if (this.errorMessage) this.errorMessage.active = false;
        this.requestHistory(requestParams, callback, callbackErr);
    },

    onRequestResponse(res) {
        this.noHistoryText.active = !!(res.error || Object.keys(res).length <= 0 || !res.data || res.data.length <= 0);
        if (res.total) {
            this.totalPage = Math.ceil(res.total / this.itemPerPage);
        }
        this.stopLoading();
        if (!res.error) {
            if (Object.keys(res).length > 0 && res.data && res.data.length > 0) {
                this.nextBtn.interactable = true;
                this.backBtn.interactable = true;
                this.pageIndexView.getComponent(cc.Label).string = this.pagePrefix + this.currentPage;
                this.updateTableData(res.data);
                if (this.currentPage == 1) {
                    this.backBtn.interactable = false;
                }
                if (res.total <= this.currentPage * this.itemPerPage || res.data.length < this.itemPerPage) {
                    this.nextBtn.interactable = false;
                    return;
                }
            } else {
                return;
            }
        }

     
    },

    requestHistory(requestParams = {}, callback, callbackErr, headers = null) {
        if (!this.gameId) {
            cc.warn("GameId has not been set");
            callback({});
            return;
        }

        if (headers) {
            serviceRest.getWithHeader({
                url: this.url,
                params: requestParams,
                callback,
                callbackErr,
                headers
            });
        } else {
            serviceRest.get({
                url: this.url,
                params: requestParams,
                callback,
                callbackErr
            });
        }
    },
    requestErr() {
        this.stopLoading();
        if (this.errorMessage) {
            this.errorMessage.active = true;
            this.clearTableData();
        }
    },

    closeNotice() {
        if (this.errorMessage) this.errorMessage.active = false;
    },

    // Table
    initTableCells(itemPerPage) {
        for (let i = 0; i < itemPerPage; ++i) {
            const cell = cc.instantiate(this.cell);
            cell.parent = this.table;
            cell.opacity = 1;
        }
    },

    updateTableData(data) {
        this.table.children.forEach((child, index) => {
            if (index < data.length) {
                child.updateData(data[index]);
                child.active = true;
                child.opacity = 255;
            }
            else {
                child.active = false;
            }
        });
    },

    clearTableData() {
        this.table.children.forEach(child => child.active = false);
    }

});