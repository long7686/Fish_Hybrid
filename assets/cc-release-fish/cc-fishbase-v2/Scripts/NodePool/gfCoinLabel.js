

cc.Class({
    extends: require('gfNode'),

    properties: {
    },
    onLoad(){
        this.node.getComponent(cc.Label).string = "";
    },
    initAssets(config) {
        this.node.getComponent(cc.Label).font = config;
    },
    setString(value) {
        this.node.getComponent(cc.Label).string = value;
    },
    //nodepool
    //Called whenever card object is get from Object Pool
    reuse(poolMng){
        this._super(poolMng);
        this.node.getComponent(cc.Label).string = "";
        this.node.opacity = 255;
        this.node.scale = 1;
        this.node.angle = 0;
        this.node.position = cc.v2(0,0);
    },
    unuse(){
        this.node.stopAllActions();
        this.node.active = false;
        this.node.opacity = 0;
        this.node.getComponent(cc.Label).string = "";
    }
});