

const GameConfig = require('gfBaseConfig');
const Config1990 = cc.Class({
    extends : GameConfig,
    ctor() {
        GameConfig.instance = this;
        this.GameId  =   "1990";
        this.IPMasterName  =   "IPMaster7";
        this.RoomVersion =   "|3";
        this.SceneName =  {
            Lobby: 'ktf1990Lobby',
            Game:  'ktf1990Game'
        };
        this.GameVersion = "1.3.8";
        this.NOTIFY_MESSAGE = {
            position : {
                [this.SceneName.Game]   : cc.v2(0, 240),
                [this.SceneName.Lobby]  : cc.v2(0, 240)
            },
            limited_stack_size: 10
        };
        this.AUTO_BOT = {
            DATA_TIMER : ["0'","30'","60'","90'","120'","∞"],
            MAX_TIME : 150,
            SPECIAL_ITEM : "∞"
        };
        this.FISH_KIND = {
            LASER_CRAB  : 27,
            DRAGON      : 45,
            MINIBOSS    : 33,
            BOMB        : 43,
            GHOST_SHIP  : 44,
        };
        this.NOTIFY_TYPE = {
            JACKPOT: 1,
            MESSAGE_BIG_FISH: 2,
            MESSAGE_SPECIAL_SKILL: 3,
            MESSAGE_DRAGON_BALL: 4,
            MESSAGE_KILL_MINIBOSS: 5,
            MESSAGE_DROP_ITEM_MINIBOSS: 6,
            MESSAGE_KILL_GHOST_SHIP: 7,
            MESSAGE_SUPPORT_KILL_GHOST_SHIP: 8,
            MESSAGE_CRYSTAL_GODZILLA: 9,
            MESSAGE_PLASMA_GODZILLA: 10
        };
        this.NOTIFY_CONFIG = {
            [this.NOTIFY_TYPE.JACKPOT] : { userName: 0, goldReward: 1 },
            [this.NOTIFY_TYPE.MESSAGE_BIG_FISH] : { userName: 0, fishKind: 1, multiple: 3, goldReward: 2},
            [this.NOTIFY_TYPE.MESSAGE_SPECIAL_SKILL] : { userName: 0, subID: 1, goldReward: 2 },
            [this.NOTIFY_TYPE.MESSAGE_DRAGON_BALL] : { userName: 0, countBall: 1, goldReward: 2 },
            [this.NOTIFY_TYPE.MESSAGE_KILL_MINIBOSS] : { userName: 0, fishKind: 1, goldReward: 3, itemID: 2, multiple: 4 },
            [this.NOTIFY_TYPE.MESSAGE_DROP_ITEM_MINIBOSS] : { userName: 0, fishKind: 1, itemID: 2, goldReward: 3, multiple: 4 },
            [this.NOTIFY_TYPE.MESSAGE_KILL_GHOST_SHIP] : { userName: 0, goldReward: 1},
            [this.NOTIFY_TYPE.MESSAGE_SUPPORT_KILL_GHOST_SHIP] : { userName: 0, goldReward: 1},
            [this.NOTIFY_TYPE.MESSAGE_CRYSTAL_GODZILLA] : { userName: 0, goldReward: 1},
            [this.NOTIFY_TYPE.MESSAGE_PLASMA_GODZILLA] : { userName: 0, goldReward: 1},
        };
        this.NOTIFY_JACKPOT = {
            array_type_notify_jackpot: [this.NOTIFY_TYPE.JACKPOT],
            limited_stack_size: 10,
        };
        this.SOUND_SLIDER = true;

        this.NOTIFY_MESSAGE = {
            position: {
                [this.SceneName.Game]: cc.v2(0, 265),
                [this.SceneName.Lobby]: cc.v2(0, 330),
            },
            limited_stack_size: 10,
        };
        this.LOCAL_STORE = {
            LOCAL_LOGIN_VAR: "ktfllv_1990",
            NOT_SHOW_NT: "NSNT",
            MUSIC_VOLUME    : "ktf1990_music_volume",
            EFFECT_VOLUME   : "ktf1990_effect_volume"
        };
        
        this.SOUND_BACKGROUND_CONFIG = {
            MINI_BOSS: "MINI_BOSS",
            GODZILLA: "GODZILLA",
            LOBBY: "LOBBY",
            IN_GAME: "IN_GAME",
        };
        this.LIST_SPECIAL_FISH_KIND = [27, 45, 43, 33, 44];
        this.LIST_FISH_ROOM_VIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 21, 15, 17, 22, 20, 23, 25, 24, 30, 33, 34, 35, 36, 37, 43, 44, 45];
        this.LIST_FISH_ROOM_NORMAL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 21, 15, 17, 22, 20, 23, 25, 24, 30, 33, 34, 35, 36, 37, 43, 44];
        /***** PRIORITY_FISH *****/
        /* 
            cá có độ ưu tiên cao hơn sẽ được sắp xếp ở đầu mảng
        */
        this.PRIORITY_FISH = [
            this.FISH_KIND.DRAGON,
            this.FISH_KIND.MINIBOSS,
            this.FISH_KIND.GHOST_SHIP
        ];
        this.SkillConfig = {
            TIMEOUT: 30,
            LASER: 1,
            BOOM: 3,
            FISH_BOMB: 5,
            PLASMA: 99 //@TODO: FAKE SKILL FOR GODZILLA
        };

        this.POS_WIFI_STATUS = {
            LEFT: cc.v2(-440, -263),
            RIGHT: cc.v2(440, -263),
        };

    } 
});
Config1990.instance = null;
module.exports = Config1990;