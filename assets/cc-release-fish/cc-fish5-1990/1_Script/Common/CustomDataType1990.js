

const NetFXAsset = cc.Class({
    name: 'NetFXAsset1990',
    properties: {
        animation: cc.AnimationClip,
        _name: {
            default: '',
            visible: true
        }
    }
});

const NetFXMiniBossAsset = cc.Class({
    name: 'NetFXMiniBossAsset',
    properties: {
        animation: sp.SkeletonData,
        _name: {
            default: '',
            visible: true
        }
    }
});
module.exports = {
    NetFXAsset,
    NetFXMiniBossAsset
};
