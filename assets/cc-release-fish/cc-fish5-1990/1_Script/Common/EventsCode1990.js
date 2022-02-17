const { mergeTwoObject } = require("gfUtilities");
const EventCode = require("gfBaseEvents");
let EventsCode1990 = {
    EFFECT_LAYER: {
        EFFECT_MINI_BOSS_DIE        :       "EFFECT_MINI_BOSS_DIE",
        SCAN_MINI_BOSS              :       "SCAN_MINI_BOSS",
        SCAN_TRANSITION             :       "SCAN_TRANSITION",
        PLAY_REWARD_GHOST_SHIP      :       "PLAY_REWARD_GHOST_SHIP",
        SHOW_POPUP_WIN_JACKPOT      :       "SHOW_POPUP_WIN_JACKPOT"
    },
    GAME_LAYER: {
        UPDATE_SIZE_BLACK_HOLE      :       "UPDATE_SIZE_BLACK_HOLE",
        UPDATE_GHOST_SHIP_STATE     :       "UPDATE_GHOST_SHIP_STATE",
        STOP_FOLLOW_GHOST_SHIP      :       "STOP_FOLLOW_GHOST_SHIP",
        START_FOLLOW_GHOST_SHIP     :       "START_FOLLOW_GHOST_SHIP",
        OPEN_SAIL_GHOST_SHIP        :       "OPEN_SAIL_GHOST_SHIP",
        CLOSE_SAIL_GHOST_SHIP       :       "CLOSE_SAIL_GHOST_SHIP",
        CATCH_FISH_BY_PLASMA        :       "CATCH_FISH_BY_PLASMA",
        CATCH_FISH_BY_LIGHTING      :       "CATCH_FISH_BY_LIGHTING",
        UPDATE_WALLET_OTHER_USER    :       "UPDATE_WALLET_OTHER_USER",
    },
    GODZILLA: {
        WARNING                     :       "WARNING",
        ON_HIT_GODZILLA             :       "ON_HIT_GODZILLA",
        GODZILLA_DROP_CRYSTAL       :       "GODZILLA_DROP_CRYSTAL",
        GODZILLA_PLASMA_EFFECT      :       "GODZILLA_PLASMA_EFFECT",
        STATE_GODZILLA              :       "STATE_GODZILLA",
        GODZILLA_SCREAM             :       "GODZILLA_SCREAM"
    },
    LIGHTING_CHAIN: {
        INFO_FISH_LIGHTING_DIE      :       "INFO_FISH_DIE",
        EFFECT_DIE                  :       "EFFECT_DIE",
        END_EFFECT                  :       "END_EFFECT_LIGHTING",
        START_EFFECT                :       "START_EFFECT-LIGHTING",
        START_EFFECT_ONE_FOR_ALL    :       "START_EFFECT_ONE_FOR_ALL"
    },
    SOUND: {
        GET_ITEM                    :       "GET_ITEM",
        MINIBOSS_MOVE               :       "MINIBOSS_MOVE",
        STOP_SOUND_MINIBOSS_MOVE    :       "STOP_SOUND_MINIBOSS_MOVE",
        GODZILLA_IN                 :       "GODZILLA_IN",
        GODZILLA_OUT                :       "GODZILLA_OUT",
        OPEN_SAIL_GHOST_SHIP        :       "OPEN_SAIL_GHOST_SHIP_SOUND",
        CLOSE_SAIL_GHOST_SHIP       :       "CLOSE_SAIL_GHOST_SHIP_SOUND",
        PLAY_SOUND_BLACK_HOLE       :       "PLAY_SOUND_BLACK_HOLE",
        STOP_SOUND_BLACK_HOLE       :       "STOP_SOUND_BLACK_HOLE",   
        GHOST_SHIP_EXPLOSION        :       "GHOST_SHIP_EXPLOSION_SOUND",
        GODZILLA_PLASMA             :       "GODZILLA_PLASMA_SOUND",
        MINI_SHIP_DIE               :       "MINISHIP_DIE",
        SIDE_SHIP_DIE               :       "SIDE_SHIP_DIE",
        PAUSE_OR_RESUME_SOUND_WIN   :       "PAUSE_OR_RESUME_SOUND_WIN",
        BIG_FISH_EXPLORE            :       "BIG_FISH_EXPLORE"
    },
    POPUP:{
        HISTORY_BLOCK_TOUCH         : 'SHOW_BLOCK_TOUCH_HISTORY'
    }


};
EventsCode1990 = mergeTwoObject(EventCode, EventsCode1990);
module.exports = EventsCode1990;
