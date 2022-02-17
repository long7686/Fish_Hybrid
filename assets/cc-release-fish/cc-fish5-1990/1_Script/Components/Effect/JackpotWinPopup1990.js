
cc.Class({
    extends: require("gfJackpotWinPopup"),

    onLoad() {
        this._super();
        this.animNode.getComponent(sp.Skeleton).useTint = true;
    },
    start() {
        this._super();
        const anim = this.animNode.getComponent(sp.Skeleton);
        anim.setAnimation(0, "appear", false);
        anim.addAnimation(0, "idle", true);
    }
});
