
cc.Class({
    extends: require('gfBigWinWheelAvatar'),
    
    _changeImageFishIcon(data) {
        const {fishKind} = data;
        if(fishKind === '45_0'){
            this.iconMainFish.x = 0;
            this.iconMainFish.y = 110;
        }else{
            this.iconMainFish.x = 0;
            this.iconMainFish.y = 62;
        }
        this._super(data);
    },

});
