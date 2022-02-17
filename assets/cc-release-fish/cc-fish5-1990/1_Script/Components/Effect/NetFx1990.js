

cc.Class({
    extends: require('gfNode'),
    properties: {
        anim: cc.Animation,
        particle: cc.ParticleSystem,
    },

    initAssets(config) {
        this.node.scale = 0.6;
        this.anim.play(config.asset.name);
        this.anim.off(cc.Animation.EventType.FINISHED);
        
        this.anim.on(cc.Animation.EventType.FINISHED, () => {
            if (this.particle.particleCount > 0) { // check if particle has fully plaed
                this.particle.stopSystem(); // stop particle system
            } 
            this.particle.resetSystem(); // restart particle system
            this.returnPool();
        });
    },
});