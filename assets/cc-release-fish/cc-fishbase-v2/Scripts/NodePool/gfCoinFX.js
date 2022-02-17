

const TYPE_COIN = ["COIN_3D","COIN_PARTICLE"];
const GameConfig = require('gfBaseConfig');
cc.Class({
    extends: require('gfNode'),

    properties: {
        anim: cc.Animation,
        _animState: null
    },
    onLoad(){
        this.timer = 0;
        this.velX = 0;
        this.velY = 0;
        this.aclX = 0;
        this.aclY = 0;
        this.node.startAnimation = this.startAnimation.bind(this);
        this.node.stopAnimation = this.stopAnimation.bind(this);
        this.node.returnPool = this.returnPool.bind(this);
        this.screenSize = GameConfig.instance.realSize;
        this.type = TYPE_COIN[0];
    },
    initAssets(config) {
        this._animState = this.anim.play(config.asset.name);
    },

    startAnimation (type = 0, coinAnimSpeed = 1, velX, velY, aclX, aclY, lifetime = -1, ) {
        this.type = TYPE_COIN[type];
        this.velX = velX;
        this.velY = velY;
        this.aclX = aclX;
        this.aclY = aclY;
        this.lifetime = lifetime;
        this._animState.speed = coinAnimSpeed;

    },
    stopAnimation () {
        let anim = this.node.getComponent(cc.Animation);
        anim.stop();
        this.returnPool();
    },
    update (dt) {
        if(this.type != TYPE_COIN[1]) return;
        if(this.lifetime >=0) {
            this.lifetime -= dt;
            if (this.lifetime <= 0) {
                cc.tween(this.node)
                    .to(0.5, {opacity:0})
                    .call(()=>{this.stopAnimation();})
                    .start();
                // this.stopAnimation();
                return;
            }
        }
        this.node.x += this.velX * dt;
        this.node.y += this.velY * dt;
        this.velX += this.aclX * dt;
        this.velY += this.aclY * dt;
        let pos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        if( pos.x < -this.screenSize.Width * 0.25 ||
            pos.x > this.screenSize.Width * 1.25 ||
            pos.y < -this.screenSize.Height * 0.25 ||
            pos.y > this.screenSize.Height * 1.25){
            this.stopAnimation();
        }
    },
    //nodepool
    //Called whenever card object is get from Object Pool
    reuse(poolMng){
        this._super(poolMng);
        this.type = TYPE_COIN[0];
        this.node.opacity = 255;
        this.node.scale = 1;
        this.node.angle = 0;
        this.node.position = cc.v2(0,0);
    },
});