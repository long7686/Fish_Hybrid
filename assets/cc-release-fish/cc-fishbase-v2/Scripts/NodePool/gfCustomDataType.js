

const gfSpriteFishAsset = cc.Class({
    name: 'gfSpriteFishAsset',
    properties: {
        animation: cc.AnimationClip,
        _name: {
            default: '',
            visible: true
        }
    }
});

const gfSpineFishAsset = cc.Class({
    name: 'gfSpineFishAsset',
    properties: {
        animation: sp.SkeletonData,
        _name: {
            default: '',
            visible: true
        }
    }
});

const gfBulletAsset = cc.Class({
    name: 'gfBulletAsset',
    properties: {
        sprite: cc.SpriteFrame,
        _name: {
            default: '',
            visible: true
        }
    }
});

const gfFreezeItemFXAsset = cc.Class({
    name: 'gfFreezeItemFXAsset',
    properties: {
        animation: cc.AnimationClip,
        _name: {
            default: '',
            visible: true
        }
    }
});

const gfNetFXAsset = cc.Class({
    name: 'gfNetFXAsset',
    properties: {
        animation: sp.SkeletonData,
        _name: {
            default: '',
            visible: true
        }
    }
});

const gfCoinAsset = cc.Class({
    name: 'gfCoinAsset',
    properties: {
        animation: cc.AnimationClip,
        _name: {
            default: '',
            visible: true
        }
    }
});

const gfDragonBallAsset = cc.Class({
    name: 'gfDragonBallAsset',
    properties: {
        sprite: cc.SpriteFrame,
        _name: {
            default: '',
            visible: true
        }
    }
});

const gfLabelCoinAsset = cc.Class({
    name: 'gfLabelCoinAsset',
    properties: {
        font: cc.Font,
        _name: {
            default: '0',
            visible: true
        }
    }
});

const gfNotifyConfig = cc.Class({
    name: 'gfNotifyConfig',
    properties: {
        animAppear: {
            default: '',
            serializable: true,
        },
        animIdle: {
            default: '',
            serializable: true,
        },
        animDisappear: {
            default: '',
            serializable: true,
        },
        languageKey: "txtJPNotify",
        spineData: sp.SkeletonData,
        type: {
            default: '',
            visible: true
        }
    }
});


module.exports = {
    gfNotifyConfig,
    gfSpriteFishAsset,
    gfSpineFishAsset,
    gfBulletAsset,
    gfFreezeItemFXAsset,
    gfNetFXAsset,
    gfCoinAsset,
    gfDragonBallAsset,
    gfLabelCoinAsset
};
