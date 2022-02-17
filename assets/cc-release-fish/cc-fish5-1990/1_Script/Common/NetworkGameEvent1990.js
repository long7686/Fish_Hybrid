const { mergeTwoObject } = require("gfUtilities");
const NetworkGameEvent = require("gfNetworkGameEvent");
let NetworkGameEvent1990 = {
    GAME_ON_HIT_GODZILLA        : 2060,
    GAME_UPDATE_GHOST_SHIP_STATE: 2061,
};
NetworkGameEvent1990 = mergeTwoObject(NetworkGameEvent, NetworkGameEvent1990);
module.exports = NetworkGameEvent1990;
