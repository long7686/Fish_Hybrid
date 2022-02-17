

cc.Class({
    extends: cc.Component,
    properties: {
    },

    initAssets() {

    },

    //Called whenever object is get from Object Pool
    reuse(poolMng) {
        this.poolManager = poolMng;
        this.node.active = true;
    },
    setPoolManager(poolMng){
        this.poolManager = poolMng;
    },

    //Called whenever object is returned to Object Pool
    unuse() {
        this.node.stopAllActions();
        this.node.active = false;
        this.node.opacity = 255;
        this.node.scale = 1;
        this.node.angle = 0;
        this.node.x = 0;
        this.node.y = 0;
    },

    returnPool() {
        if (this.poolManager) {
            this.poolManager.putObj(this.node);
        } else {
            if (cc.isValid(this.node))
                this.node.destroy();
            else
                cc.warn('non valid obj');
        }
    },

   

});
