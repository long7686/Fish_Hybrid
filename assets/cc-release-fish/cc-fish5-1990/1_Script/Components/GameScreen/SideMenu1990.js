cc.Class({
    extends: require('gfSideMenu'),
    properties: {
        _posShow:cc.v2(0, 0),
        _posHide:cc.v2(0, 0),
    },

    onLoad(){
        this._posShow = cc.v2(80, 0);
        this._posHide = cc.v2(160, 0);
        this.node.anchorX = 1;
        this.iconHide.scaleX = -1;
        this.node.setPosition(502, 23);
        // this.iconHide.x = 30;
        this.node.getComponent(cc.Widget).right = 138;
        
        this._super();
    },

    resetSideMenu() {
        this.unschedule(this.btnHideHandle);
        this.isHide = true;

        this.iconHide.scaleX = -1;
        this.nodeMove.stopAllActions();
        this.nodeMove.setPosition(this._posHide);
        this.isActionDone = true;

    },

    hideSideBar() {
        if (!this.isActionDone)
            return;
        this.unschedule(this.btnHideHandle);
        this.isActionDone = false;


        let pos = this._posShow;
        this.isHide = !this.isHide;
        this.iconHide.scaleX = -this.iconHide.scaleX;
        if (this.isHide) {
            pos = this._posHide;
        } else {
            this.scheduleOnce(this.btnHideHandle, 3);
        }
        let baseEasing = this.isHide ? cc.easeSineIn() : cc.easeSineOut();
        this.nodeMove.stopAllActions();
        this.nodeMove.runAction(cc.sequence(
            cc.moveTo(0.3, pos).easing(baseEasing),
            cc.callFunc(() => {
                this.isActionDone = true;
            })
        ));
    },
});
