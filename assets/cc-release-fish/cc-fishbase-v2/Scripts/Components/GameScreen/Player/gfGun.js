const NodePoolConfig = require("gfNodePoolConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        mainGun: sp.Skeleton,
    },

    onLoad(){
        this.node.onFire = this.onFire.bind(this);
        this.node.onChangeGun = this.onChangeGun.bind(this);
    },

    onFire(name){
        const gunData = NodePoolConfig.instance.getGunSkeletonData(name);
        if(!this.mainGun.skeletonData || this.mainGun.skeletonData.name != gunData.name) { 
            this.mainGun.skeletonData = gunData;
        }
        this.mainGun.setAnimation(0, 'fire', false);
    },

    onChangeGun(name){
        const gunData = NodePoolConfig.instance.getGunSkeletonData(name);
        if(!this.mainGun.skeletonData || this.mainGun.skeletonData.name != gunData.name) { 
            this.mainGun.skeletonData = gunData;
        }
        this.mainGun.setAnimation(0, 'change_gun', false);

    }

});
