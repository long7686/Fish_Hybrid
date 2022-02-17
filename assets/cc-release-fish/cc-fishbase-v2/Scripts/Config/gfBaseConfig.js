

const gfBaseConfig = cc.Class({
    ctor() {
        this.baseVersion = "0.2.2";
        this.IPMasterName = "IPMaster1";
        this.IPMaster = "";
        this.IPGame = "";
        this.token4Game = "";
        this.userToken = "";
        this.token4Master = "";
        this.RoomVersion = "|1";
        this.GameId = "1999";
        this.GameVersion = "0.0.1";
        this.IsDevMode = false;
        this.RoomKind = {
            Normal: "1",
            VIP: "3",
        };
        this.MiniBossSceneKind = 1;
        this.SceneName = {
            Lobby: 'ktf1900Lobby',
            Game: 'ktf1900Game',
        };
        this.LOCAL_STORE = {
            LOCAL_LOGIN_VAR: "ktfllv",
            NOT_SHOW_NT: "NSNT",
            MUSIC_VOLUME    : "music_volume",
            EFFECT_VOLUME   : "effect_volume",
            SHOW_EVENT_INFO: "SEIF",
        };
        this.SOUND_SLIDER = false;
        this.TotalGun = 7;
        this.MaxBullet = 20;
        this.WinRate = {
            RateBigWin: 80,
        };
        this.BotState = {
            INITIALIZED: 1,
            STARTED: 2,
            STOPPED: 3,
        };
        this.AppSize = {
            Width: 1280,
            Height: 720,
            MaxWidth: 1604,
        };
        this.realSize = {
            Width: 1280,
            Height: 720,
        };
        this.SceneBox = {
            Left: 0,
            Bottom: 0,
            Right: 1280,
            Top: 720,
        };
        this.SkillMapping = {
            1: 27,
        };
        this.BulletSpeed = 1400 * 0.67;
        this.MaxBullet = 20;
        this.GunName = {
            GUN0: "gun1",
            GUN1: "gun2",
            GUN2: "gun3",
            GUN3: "gun4",
            GUN4: "gun5",
            GUN5: "gun6",
            GUN6: "gun7",
            // LASER: "gun9",
        };
        this.GunSkill = {
            LASER: "gun9"
        };
        this.NetFx = {
            NormalNet: 0,
            ExplostionNet: 1,
            IceNet: 2,
        };
        this.gunRadius = 92;
        this.TARGET_LOCK = {
            NONE: 0,
            AUTO_FIRE: 1,
            TARGET_ONE: 2,
            TARGET_ALL: 3,
            AUTO_BOT: 4,
            PAUSE: 5,
        };
        this.SkillConfig = {
            TIMEOUT: 30,
            LASER: 1,
            BOOM: 3,
            FISH_BOMB: 5,
        };
        this.SKILL_ITEM = {
            FREEZE: 1,
        };
        this.POSITION_FISH_DIE = {
            INDEX_TOP: 200,
            INDEX_BOTTOM: 200,
        };
        this.POPUP_TYPE = {
            Info: 'PopupInfo',
            Message: 'PopupNotify',
            Tutorial: 'PopupTutorial',
            Setting: 'PopupSetting',
            Chat: 'PopupChatMsg',
            Jackpot: 'PopupHistoryJackpot',
            Auto: 'PopupAutoBot',
        };
        this.POPUP_ANIMATION = {
            PULSE: 'PULSE',
            BOUNCE: 'BOUNCE',
            EASE: 'EASE',
            FADE: 'FADE',
            DEFAULT: 'DEFAULT',
        };
        this.POPUP_PROMPT = {
            JUST_CONFIRM_BUTTON: 'JUST_CONFIRM_BUTTON',
            CONFIRM_AND_CLOSE_BUTTON: 'CONFIRM_AND_CLOSE_BUTTON',
            CONFIRM_AND_REJECT_BUTTON: 'CONFIRM_AND_REJECT_BUTTON',
            NONE_BUTTON: 'NONE_BUTTON',
        };
        this.FISH_SHAKE_SCREEN = [20, 22, 23, 25, 30, 31, 43];
        this.TIME_COUNTDOWN_ITEM_FREEZE = 10000; // 10s
        this.CursorBase64 = "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ABv/uwAD/7oAAP+6AAD/ugAA/7oAAP+6AAD/tQAh/70ahv/tw///xEHD/8Mwc/+2ABj/ugAB/7sAAf+sACT/2HjF///////mr/H/qgCI/7IAL/+8AA3/ugAA/7oAAP+6AAD/ugAA/7sACP+wADP/z2Wz////////////3Y/S/7EASf+6AA7/ugAA/7oAAP+6AAD/ugAA/7wADf+wADT/sQCY//LQ/P//////2H7F/6sAJP+7AAL/uwAB/60ANP/RZsT////////////77f//xT+H/7EAD/+6AAD/ugAA/7oAAP+6AAD/tgAJ/7YEZ//++v//////////////////wjKM/7EAEP+7AAD/ugAA/7oAAP+6AAD/sgAP/8U+h//57P/////////////QZMT/rQA0/7sAAf+7AAL/rAAy/9Jqxf///////////+rB6P/BNXj/tAAQ/7oAAP+6AAD/ugAA/7oAAP+3AAn/tARd//jo//////////////////++KID/sgAQ/7sAAP+6AAD/ugAA/7oAAP+0ABD/wTR4/+i66P///////////9Joxf+tADL/uwAB/7sAAv+tACH/1W69//7+///io+z/pAB2/7MAJv+8AAn/ugAA/7oAAP+6AAD/ugAA/7sABv+xACr/wziW//LV+f/45v//0GW0/7AAO/+7AAz/ugAA/7oAAP+6AAD/ugAA/7wACv+xACr/qwCK/+7J/P/57f//13W9/60AIP+7AAL/ugAA/7kAFv+3EV7/yEbB/+/G+v+1AGz/uQAW/7oAAP+6AAD/ugAA/7oAAP+6AAD/ugAA/7wAEf+xACr/tQBg/7gHaf+wADT/ugAV/7sAAf+6AAD/ugAA/7oAAP+6AAD/uwAA/7QAHv/EL43/7sb//7gbqf+9GFz/uQAV/7oAAP+6AAD/vAAE/7QAGP+wAGb/9uL//8pIm/+wAB3/uwAA/7oAAP+6AAD/ugAA/7oAAP+6AAD/ugAA/7sABv+3AAr/tgAK/7oACP+6AAD/ugAA/7oAAP+6AAD/ugAA/7oAAP+8AAT/qwAp/9yMxf/swu//pwBH/7YAEf+8AAT/ugAA/7oAAP+6AAD/vAAE/6sALP/indX/6rvo/6gAPP+8AA3/ugAA/7oAAP+6AAD/ugAA/7oAAP+6AAD/ugAA/7oAAP+6AAD/ugAA/7oAAP+6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";
        // Custom cursor for baseScene
        // this.CursorBase64             =   "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";
        this.SOUND_ID = {
            LOBBY: 'lobby',
            IN_GAME_0: 'in_game_0',
            IN_GAME_1: 'in_game_1',
            IN_GAME_2: 'in_game_2',
            IN_GAME_3: 'in_game_3', // Boss
        };
        this.LIST_FISH_ROOM_VIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 21, 15, 17, 22, 20, 23, 25, 24, 30, 31, 32, 33, 34, 35, 36, 37, 43];
        this.LIST_FISH_ROOM_NORMAL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 21, 15, 17, 22, 20, 23, 25, 24, 30, 31, 33, 34, 35, 36, 37, 43];

        this.LIST_SPECIAL_FISH_KIND = [27, 32, 43, 33];

        this.ScrollDirectionAutoBot = cc.Enum({
            LEFT: 0,
            RIGHT: 1,
        });
        this.TouchDirectionAutoBot = cc.Enum({
            LEFT: 0,
            RIGHT: 1,
        });
        this.FISH_KIND = {
            LASER_CRAB: 27,
            DRAGON: 32,
            MINIBOSS: 33,
            BOMB: 43,
        };
        /***** PRIORITY_FISH *****/
        /* 
            cá có độ ưu tiên cao hơn sẽ được sắp xếp ở đầu mảng
        */
        this.PRIORITY_FISH = [
            this.FISH_KIND.DRAGON,
            this.FISH_KIND.MINIBOSS
        ];
        this.NOTIFY_TYPE = {
            SYSTEM: 0,
            JACKPOT: 1,
            MESSAGE_BIG_FISH: 2,
            MESSAGE_SPECIAL_SKILL: 3,
            MESSAGE_DRAGON_BALL: 4,
            MESSAGE_KILL_MINIBOSS: 5,
            MESSAGE_DROP_ITEM_MINIBOSS: 6,
            MESSAGE_EVENT: 7,
        };
        this.NOTIFY_CONFIG = {
            [this.NOTIFY_TYPE.JACKPOT] : { userName: 0, goldReward: 1 },
            [this.NOTIFY_TYPE.MESSAGE_BIG_FISH] : { userName: 0, fishKind: 1, multiple: 3, goldReward: 2},
            [this.NOTIFY_TYPE.MESSAGE_SPECIAL_SKILL] : { userName: 0, subID: 1, goldReward: 2 },
            [this.NOTIFY_TYPE.MESSAGE_DRAGON_BALL] : { userName: 0, countBall: 1, goldReward: 2 },
            [this.NOTIFY_TYPE.MESSAGE_KILL_MINIBOSS] : { userName: 0, fishKind: 1, goldReward: 3, itemID: 2, multiple: 4 },
            [this.NOTIFY_TYPE.MESSAGE_DROP_ITEM_MINIBOSS] : { userName: 0, fishKind: 1, itemID: 2, goldReward: 3, multiple: 4 },
            [this.NOTIFY_TYPE.MESSAGE_EVENT] : { userName: 0, goldReward: 1},
        };
        this.Z_INDEX = {
            NOTIFY: 2000,
            MENU: 2099,
            POPUP: 2100,
            WAITING: 2200,
            COIN: 98,
            COIN_LABEL: 99,
            BIGWIN: 100,
            DRAGON_BALL: 101,
            DRAGON: 900,
            BULLET: 999,
            NETFX_ICE: 91,
            NETFX_MINIBOSS: 92,
            NETFX: 93,
            CUTSCENE:2199
        };
        this.waiting_timeout = 7;
        this.NOTIFY_MESSAGE = {
            position: {
                [this.SceneName.Game]: cc.v2(0, 240),
                [this.SceneName.Lobby]: cc.v2(0, 240),
            },
            limited_stack_size: 10,
        };
        this.NOTIFY_JACKPOT = {
            array_type_notify_jackpot: [this.NOTIFY_TYPE.JACKPOT, this.NOTIFY_TYPE.MESSAGE_EVENT],
            limited_stack_size: 10,
        };
        this.NOTIFY_SYSTEM = {
            array_type_notify_jackpot: [this.NOTIFY_TYPE.SYSTEM],
            limited_stack_size: 10,
        };
        this.EXPLOSION_TYPE = {
            BIG: 0,
            MINI: 1,
            BOMB: 2,
        };
        this.BIG_WIN_RATIO = {
            HUGE: 180,
            SUPER: 301,
            BIG_WIN_VALUE: 80,
        };
        this.AUTO_BOT = {
            DATA_TIMER: ["0'", "30'", "60'", "90'", "120'", "∞"],
            MAX_TIME: 150,
            SPECIAL_ITEM: "i",
        };

        this.SOUND_BACKGROUND_CONFIG = {
            MINI_BOSS: "MINI_BOSS",
            DRAGON: "DRAGON",
            LOBBY: "LOBBY",
            IN_GAME: "IN_GAME",
        };
        this.DEFAULT_AVATAR = "Avatar0";
        this.ENABLE_SHOW_OTHER_COIN = false;
        this.COIN_TYPE = {
            MY_COIN: 0,
            OTHER_COIN: 1
        };
        this.POS_AUTO_BOT = {
            LEFT: cc.v2(-565, -226),
            RIGHT: cc.v2(565, -226),
        };
        this.POS_EVENT = {
            LEFT: cc.v2(-565, -100),
            RIGHT: cc.v2(565, -100),
        };
        
        this.POS_WIFI_STATUS = {
            LEFT: cc.v2(-476, -253),
            RIGHT: cc.v2(445, -255),
        };
        this.SHAKE_SCREEN_STYLE = {
            HORIZONTAL: 0,
            VERTICAL: 1,
            CROSS_1: 2, //theo hình dấu cộng
            CROSS_2: 3, //theo hình dấu nhân
            FULL:4  //kết hợp cả 2 loại style CROSS
        };
        this.NOTIFY_ENVIRONMENT_CONFIG = {
            ALL: 0,
            IFRAME: 1, 
            APP: 2,
        };

        this.ENVIRONMENT_CONFIG = {
            WEB_APP: 1,
            IFRAME: 2,
            NATIVE_APP: 3,
        };

        this.FISH_LOG_CONFIG = {
            DRAGON: "Dragon appear",
            FISH_GROUP: "Fish group appear"
        };
    },
    parseJoinGame(data) {
        this.IPGame = data.Server.indexOf('wss') > -1 ? data.Server : 'wss://' + data.Server;
        this.token4Game = data.Token;
    },

    destroy() {
        gfBaseConfig.instance = null;
    },
});
gfBaseConfig.instance = null;
module.exports = gfBaseConfig;
