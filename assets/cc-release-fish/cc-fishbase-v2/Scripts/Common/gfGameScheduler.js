const { registerEvent, removeEvents } = require('gfUtilities');
const EventCode = require('gfBaseEvents');
class gfGameScheduler {

    static get instance () {
        if(!this._instance) {
            cc.error('GameScheduler is destroyed');
            return null;
        }
        return this._instance;
    }

    static initInstance() {
        this._instance = new gfGameScheduler();
    }

    constructor(){
        this._scheduler = cc.director.getScheduler();
        this._scheduler.enableForTarget(this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this._unScheduleAll, this);
    }

    _schedule(callback, interval, repeat, delay, paused = false){
        this._scheduler.schedule(callback, this, interval, repeat, delay, paused);
    }

    _scheduleOnce(callback, delay) {
        this._scheduler.schedule(callback, this, 0, 0, delay, false);
    }

    _unScheduleAll() {
        this._scheduler.unscheduleAllForTarget(this);
    }

    _unschedule(callback) {
        this._scheduler.unschedule(callback, this);
    }

    _destroy() {
        removeEvents(this);
        this._unScheduleAll();
        this._scheduler = null;
    }

    static schedule(callback, interval, repeat, delay, paused = false){
        gfGameScheduler.instance._schedule(callback, interval, repeat, delay, paused);
    }

    static scheduleOnce(callback, delay) {
        gfGameScheduler.instance._scheduleOnce(callback, delay);
    }

    static unschedule(callback) {
        gfGameScheduler.instance._unschedule(callback);
    }

    static destroy() {
        if(gfGameScheduler.instance) {
            gfGameScheduler.instance._destroy();
            gfGameScheduler._instance = null;
        }
    }
}

module.exports = gfGameScheduler;
