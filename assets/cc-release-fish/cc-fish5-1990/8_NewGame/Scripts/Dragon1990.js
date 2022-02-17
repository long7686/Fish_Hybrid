const Dragon = require("gfDragon");
// const {DragonCacheData, BoneCacheValue} = require('gfDragonCacheData');
// const GameConfig = require('gfBaseConfig');
// const Emitter = require('gfEventEmitter');
// const EventCode = require("gfBaseEvents");
// const { isPointInScreen } = require('gfUtilities');
// const DataStore = require('gfDataStore');

const animationList = [
    "Swim In", "Swim Out", "Swim Loop",
];

const TIME_ANIM_SWIM_IN = 5.997;
const TIME_ANIM_SWIM_LOOP = 29.985;
const TIME_ANIM_SWIM_OUT = 5.997;
const BASE_TIME_SCALE = 1 / 6;
const TOTAL_LIVE_TIME = 42;
const SPINE_FPS = 30;
cc.Class({
    extends: Dragon,

});
