const Localize = require('gfLocalize');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const {formatString} = require('gfUtilities');
const lodash = require('lodash');

cc.Class({
    extends: require('gfNotifyComponent'),
    properties: {
        speed: {
            default: 320,
            serializable: false
        },
        defaultFontSize: {
            default: 32,
            serializable: false,
            override: true,
        },

    },
    show(data) {
        if (!GameConfig.instance.NOTIFY_MESSAGE.position[DataStore.instance.getCurrentSceneName()] || !this.validateData(data)) return;
        this.sortDataMessage(this._lstMessage);
        if (!this._isShow) {
            this.runAnimShow();
        }
    },
    runAnimShow() {
        this.node.position = GameConfig.instance.NOTIFY_MESSAGE.position[DataStore.instance.getCurrentSceneName()];
        this._isShow = true;
        this.node.active = true;
        this.node.scaleY = 0;
        this.node.stopAllActions();
        cc.tween(this.node)
            .to(0.5, {scaleY: 1})
            .call(() => {
                this.onStackMessage();
            })
            .start();
    },
    //RECONSIDER!!!
    validateData(data) {
        let json = this.getStringDataNotify(data).replace(/'/g, '"');
        try {
            let result = !!(JSON.parse(json));
            if (result) {
                this._lstMessage.push(data);
            }
            return result;
        } catch (e) {
            return false;
        }
    },

    hide() {
        this._isShow = false;
        cc.tween(this.node)
            .to(0.5, {scaleY: 0})
            .call(() => {
                this.node.active = false;
            })
            .start();
    },

    play(data) {
        let json = this.getStringDataNotify(data).replace(/'/g, '"');
        let objMessage = JSON.parse(json);
        this.createNotifyMessage(objMessage);
        this.contentNode.getComponent(cc.Layout).updateLayout();
        let dX = (this.contentNode.width + this.node.width) / 2;
        this.contentNode.x = dX;
        this.contentNode.stopAllActions();
        cc.tween(this.node)
            .delay(0)
            .call(() => {
                // this.setupPosition();
                const timer = (2*dX) / this.speed;
                cc.tween(this.contentNode)
                    .to(timer, {x: -dX})
                    .delay(0.5)
                    .call(() => {
                        this.onStackMessage();
                    })
                    .start();
            })
            .start();
    },
    //Need review later
    getStringDataNotify(dataInput) {
        if (!Localize || !Localize.instance) return;
        const {data, message, type} = dataInput;
        let str = "";
        if (type >= 0) {
            const configTxtNotify = Localize.instance.txtNotify;
            const {NOTIFY_CONFIG, NOTIFY_TYPE} = GameConfig.instance;

            switch (type) {
                case NOTIFY_TYPE.MESSAGE_BIG_FISH: // big fish
                    str = lodash.cloneDeep(configTxtNotify.big_fish);
                    str = formatString(str,
                        [data[NOTIFY_CONFIG[type].userName],
                            data[NOTIFY_CONFIG[type].fishKind].toString(),
                            data[NOTIFY_CONFIG[type].multiple].toString(),
                            data[NOTIFY_CONFIG[type].goldReward].toString()
                        ]);
                    break;
                case NOTIFY_TYPE.MESSAGE_SPECIAL_SKILL: // special skill
                    str = lodash.cloneDeep(configTxtNotify.special_skill[data[NOTIFY_CONFIG[type].subID]]);
                    str = formatString(str, [data[NOTIFY_CONFIG[type].userName], data[NOTIFY_CONFIG[type].goldReward]]);
                    break;
                case NOTIFY_TYPE.MESSAGE_DRAGON_BALL:
                    str = lodash.cloneDeep(configTxtNotify.dragon_balls);
                    str = formatString(str, [data[NOTIFY_CONFIG[type].userName], data[NOTIFY_CONFIG[type].countBall], data[NOTIFY_CONFIG[type].goldReward]]);
                    break;
                case NOTIFY_TYPE.MESSAGE_KILL_MINIBOSS:
                    str = lodash.cloneDeep(configTxtNotify.kill_miniboss);
                    str = formatString(str, [data[NOTIFY_CONFIG[type].userName], data[NOTIFY_CONFIG[type].fishKind], data[NOTIFY_CONFIG[type].goldReward]]);
                    break;
                case NOTIFY_TYPE.MESSAGE_DROP_ITEM_MINIBOSS:
                    str = lodash.cloneDeep(configTxtNotify.drop_item_miniboss);
                    str = formatString(str,
                        [data[NOTIFY_CONFIG[type].userName],
                            data[NOTIFY_CONFIG[type].fishKind],
                            data[NOTIFY_CONFIG[type].itemID],
                            data[NOTIFY_CONFIG[type].goldReward]
                        ]);
                    break;
                case NOTIFY_TYPE.MESSAGE_EVENT:
                    str = lodash.cloneDeep(configTxtNotify.event);
                    str = formatString(str,
                        [data[NOTIFY_CONFIG[type].userName],
                            data[NOTIFY_CONFIG[type].goldReward]
                        ]);
                    break;
                default: // normal message
                    str = lodash.cloneDeep(configTxtNotify.message);
                    str = formatString(str, [message]);
                    break;
            }
        }
        return str;
    },




    //OK
    sortDataMessage() {
        this._lstMessage.sort((a, b) => ((a.type === 0 && b.type !== 0) ? -1 : (a.type !== 0 && b.type === 0) ? 1 : 0));
        this._lstMessage.sort((a, b) => {
            const _a = {};
            _a.type = a.type;
            if (_a.type > 0) {
                _a.amount = this.replaceAmountData(a);
            }
            const _b = {};
            _b.type = b.type;
            if (_b.type > 0) {
                _b.amount = this.replaceAmountData(b);
            }
            if (_a.type !== 0 && _b.type !== 0) {
                if (_a.amount > _b.amount) return -1;
                if (_a.amount < _b.amount) return 1;
            }
            return 0;
        });
        this._lstMessage = this._lstMessage.slice(0, GameConfig.instance.NOTIFY_MESSAGE.limited_stack_size);
    },
    //Revamp
    replaceAmountData(data) {
        const notifyConfig = GameConfig.instance.NOTIFY_CONFIG[data.type];
        return Number(data.data[notifyConfig.goldReward].replace(/[^0-9.-]+/g, ""));
    },
    onBeforeSceneChange(){
        this._super();
        this.node.scaleY = 0;
    },
});
