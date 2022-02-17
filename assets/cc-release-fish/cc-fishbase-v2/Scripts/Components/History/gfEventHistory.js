cc.Class({
    extends: require("gfBaseHistory"),
    
    initData(data) {
        const {gameId, url} = data;
        this.jpPrefix = "",
        this.gameId = gameId;
        this.url = url;
    }, 

    requestDataPage(page, quantity, callback, callbackErr) {
        let from = (page - 1) * quantity;
        let requestParams = {
            serviceId: this.jpPrefix + this.gameId,
            from: from,
            size: quantity,
        };
        if (this.errorMessage) this.errorMessage.active = false;
        this.requestHistory(requestParams, callback, callbackErr);
    },

    onRequestResponse(res) {
        this.noHistoryText.active = !!(res.error || Object.keys(res).length <= 0 || !res.data || !res.data.items || res.data.items.length <= 0);
        if (res.total) {
            this.totalPage = Math.ceil(res.total / this.itemPerPage);
        }
        this.stopLoading();
        if (!res.error){
            if (Object.keys(res).length > 0 && res.data && res.data.items && res.data.items.length > 0) {
                this.nextBtn.interactable = true;
                this.backBtn.interactable = true;
                this.pageIndexView.getComponent(cc.Label).string = this.pagePrefix + this.currentPage;
                this.updateTableData(res.data.items);
                if (this.currentPage == 1){
                    this.backBtn.interactable = false;
                }
                if(res.total <= this.currentPage * this.itemPerPage || res.data.items.length < this.itemPerPage) {
                    this.nextBtn.interactable = false;
                    return;
                }
            } else {
                // Clear old history items if use tool
                this.nextBtn.interactable = false;
                this.backBtn.interactable = false;
                this.pageIndexView.getComponent(cc.Label).string = this.pagePrefix + "1";
                this.currentPage = 1;
                this.totalPage = 0;
                this.updateTableData(res.data.items);
            }
        }
    },

    
});