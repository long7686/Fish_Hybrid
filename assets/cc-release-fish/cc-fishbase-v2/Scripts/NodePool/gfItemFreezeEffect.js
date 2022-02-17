

cc.Class({
    extends: require('gfNode'),
    properties: {
        freezeItemAnim: {
            default: null,
            type: cc.Animation,
        },
    },

    initAssets(config) {
        while (this.freezeItemAnim.getClips().length > 0) {
            this.freezeItemAnim.removeClip(this.freezeItemAnim.getClips()[0], true);
        }
        this.freezeItemAnim.addClip(config.asset);
        this.freezeItemAnim.play(config.asset.name);
    }
});
