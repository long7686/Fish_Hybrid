const GameConfig = require('Config1990');
const Localize = require("gfLocalize");
const lodash = require('lodash');
const { formatString } = require('gfUtilities');

cc.Class({
    extends: require("gfNotifyJackpot"),
    properties:{
        _animAppear: {
            default:'appear',
            override: true
        },
        _animIdle: {
            default:'idle',
            override: true
        },
    },
    //Override to match spine
    play(dataInput) {
        const {data, type} = dataInput;
        this.node.active = true;
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.contentNode.stopAllActions();

        this.setupSpineAnim(type);
        this.contentNode.opacity = 0;
        this.mainAnim.setAnimation(0, this._animAppear, false);
        const tweenShowRichText = cc.tween(this.contentNode)
            .delay(0.8)
            .to(0.15, { opacity: 255 });
        const { NOTIFY_CONFIG, NOTIFY_TYPE } = GameConfig.instance;

        let str = lodash.cloneDeep(Localize.instance.txtJPNotify);
        const jackpotConfig = NOTIFY_CONFIG[NOTIFY_TYPE.JACKPOT];
        str = formatString(str, [data[jackpotConfig.userName], data[jackpotConfig.goldReward]]);
        str = str.replace(/'/g, '"');
        const objMessage = JSON.parse(str);
        this.createNotifyMessage(objMessage);
        this.contentNode.getComponent(cc.Layout).updateLayout();
        tweenShowRichText.start();

        this.mainAnim.addAnimation(0, this._animIdle, true);
        this.mainAnim.setCompleteListener((trackEntry)=>{
            this.mainAnim.setCompleteListener(()=>{});
            cc.tween(this.node)
                .delay(3)
                .call(()=>{
                    this.mainAnim.clearTrack(0);
                })
                .to(0.5, { opacity: 0 })
                .call(() => {
                    this.onStackMessage();
                })
                .start();
        })
    },
});
