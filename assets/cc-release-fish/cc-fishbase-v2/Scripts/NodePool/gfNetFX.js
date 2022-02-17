
const GameConfig = require('gfBaseConfig');

cc.Class({
    extends: require('gfNode'),
    properties: {
        spine: sp.Skeleton
    },

    onLoad() {
        if (!this._animationName) {
            this._animationName = 'user';
        }
        this.spine.setAnimation(0, this._animationName, false);
    },

    initAssets(config) {
        this.spine.skeletonData = config.asset;
        if (config.kind == 2) {
            this._animationName = 'NoBang';
            this.node.zIndex = GameConfig.instance.Z_INDEX.NETFX_ICE;
            if (!config.isMe) {
                this.node.opacity = 255 * 0.8;
                this.node.scale = 0.7;
            }
        }
        else if (config.kind == 1) {
            this._animationName = 'animation';
            this.node.zIndex = GameConfig.instance.Z_INDEX.NETFX_MINIBOSS;
        }
        else {
            this._animationName = config.isMe ? 'player' : 'user';
            this.node.zIndex = GameConfig.instance.Z_INDEX.NETFX;
        }

        this.spine.setAnimation(0, this._animationName, false);
        this.spine.setCompleteListener(() => {
            this.returnPool();
        });
    },
});
