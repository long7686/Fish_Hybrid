const Localize = require('gfLocalize');
const GameConfig = require('gfBaseConfig');
const {formatString} = require('gfUtilities');
const lodash = require('lodash');
const {gfNotifyConfig} = require('gfCustomDataType');

cc.Class({
    extends: require('gfNotifyComponent'),
    properties: {
        mainAnim: sp.Skeleton,
        notifyConfig: {
            default: [],
            type: gfNotifyConfig,
        },
        _type: -1,
        _spineData: {
            default: [],
        },
    },
    onLoad() {
        this._super();
        this.notifyConfig.forEach((item)=>{
            let spineData = item.spineData;
            spineData.type = item.type;
            this._spineData.push(spineData);
        });
    },

    show(data) {
        if (!this.validateData(data)) return;
        if (this._lstMessage.length < GameConfig.instance.NOTIFY_JACKPOT.limited_stack_size) {
            this._lstMessage.push(data);
        }
        if (!this._isShow) {
            this._isShow = true;
            this.onStackMessage();
        }
    },
    onAfterSceneChange() {
        this._super();
        this._spineData.forEach((item)=>{
            let config = this.findConfigByType(item.type);
            config.spineData = item;
        });
    },

    play(dataInput) {
        const {type} = dataInput;
        this.node.active = true;
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.contentNode.stopAllActions();
        this.contentNode.opacity = 0;
        const objMessage = JSON.parse(this.getMessageText(dataInput));
        this.createNotifyMessage(objMessage);
        this.contentNode.getComponent(cc.Layout).updateLayout();
        this.setupSpineAnim(type);
        this.playAnimation(type);
    },

    playAnimation(type) {
        const notifyConfig = this.findConfigByType(type);
        if (!notifyConfig) return;
        const tweenShowRichText = cc.tween(this.contentNode).to(0.15, {opacity: 255});
        this.mainAnim.setAnimation(0, notifyConfig.animAppear, false);
        this.mainAnim.setAnimation(1, notifyConfig.animIdle, true);
        cc.tween(this.node)
            .delay(0.8)
            .call(() => {
                tweenShowRichText.start();
            })
            .delay(3)
            .call(() => {
                this.mainAnim.clearTrack(0);
            })
            .to(0.5, {opacity: 0})
            .call(() => {
                this.onStackMessage();
            })
            .start();
    },

    validateData(dataInput) {
        const str = this.getMessageText(dataInput);
        try {
            return !!(JSON.parse(str));
        } catch (e) {
            return false;
        }
    },

    hide() {
        this._isShow = false;
        this.node.active = false;
    },

    setupSpineAnim(type) {
        if (this._type !== type) {
            this._type = type;
            let spineData = this.getNotifySkeletonDataByType(this._type);
            this.mainAnim.skeletonData = (spineData && spineData.isValid) ? spineData : this.mainAnim.skeletonData;
        }
    },

    getMessageText(dataInput) {
        const {data, type} = dataInput;
        const notifyConfig = this.findConfigByType(type);
        if (!notifyConfig) return;
        const textConfig = Localize.instance[notifyConfig.languageKey];
        const {NOTIFY_CONFIG} = GameConfig.instance;
        let str = lodash.cloneDeep(textConfig);
        const dataFormat = NOTIFY_CONFIG[type];
        str = formatString(str, [data[dataFormat.userName], data[dataFormat.goldReward]]);
        str = str.replace(/'/g, '"');
        return str;
    },

    getNotifySkeletonDataByType(type) {
        const notifyConfig = this.findConfigByType(type);
        if (notifyConfig)
            return notifyConfig.spineData;
        return null;
    },

    findConfigByType(type) {
        for (let i = 0; i < this.notifyConfig.length; i++) {
            if (this.notifyConfig[i].type == type)
                return this.notifyConfig[i];
        }
        return null;
    },
});
