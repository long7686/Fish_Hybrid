

const Localize = require('gfLocalize');
const GameConfig = require('Config1990');
const { formatString } = require('gfUtilities');
const lodash = require('lodash');

cc.Class({
    extends: require("gfNotifyMessage"),

    getStringDataNotify(dataInput){
        if (!Localize || !Localize.instance) return;
        const { data, message, type } = dataInput;
        let str = "";
        if (type >= 0) {
            const configTxtNotify = Localize.instance.txtNotify;
            const { NOTIFY_CONFIG, NOTIFY_TYPE } = GameConfig.instance;

            switch (type) {
            case NOTIFY_TYPE.MESSAGE_BIG_FISH: // big fish
                str = lodash.cloneDeep(configTxtNotify.big_fish);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName], 
                        data[NOTIFY_CONFIG[type].fishKind].toString(), 
                        data[NOTIFY_CONFIG[type].multiple].toString(), 
                        data[NOTIFY_CONFIG[type].goldReward].toString()
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_SPECIAL_SKILL: // special skill
                str = lodash.cloneDeep(configTxtNotify.special_skill[data[NOTIFY_CONFIG[type].subID]]);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName], 
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_DRAGON_BALL:
                str = lodash.cloneDeep(configTxtNotify.dragon_balls);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName], 
                        data[NOTIFY_CONFIG[type].countBall], 
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_KILL_MINIBOSS:
                str = lodash.cloneDeep(configTxtNotify.kill_miniboss);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName], 
                        data[NOTIFY_CONFIG[type].fishKind], 
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_DROP_ITEM_MINIBOSS:
                str = lodash.cloneDeep(configTxtNotify.drop_item_miniboss);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName], 
                        data[NOTIFY_CONFIG[type].fishKind], 
                        data[NOTIFY_CONFIG[type].itemID], 
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_KILL_GHOST_SHIP:
                str = lodash.cloneDeep(configTxtNotify.kill_ghost_ship);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName],
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_SUPPORT_KILL_GHOST_SHIP:
                str = lodash.cloneDeep(configTxtNotify.suport_kill_ghost_ship);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName],
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_CRYSTAL_GODZILLA:
                str = lodash.cloneDeep(configTxtNotify.crystal_godzilla);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName],
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            case NOTIFY_TYPE.MESSAGE_PLASMA_GODZILLA:
                str = lodash.cloneDeep(configTxtNotify.plasma_godzilla);
                str = formatString(str, 
                    [   data[NOTIFY_CONFIG[type].userName],
                        data[NOTIFY_CONFIG[type].goldReward]
                    ]);
                break;
            default: //normal message
                str = lodash.cloneDeep(configTxtNotify.message);
                str = formatString(str, [message]);
                break;
            }
        }
        return str;
    },
});
