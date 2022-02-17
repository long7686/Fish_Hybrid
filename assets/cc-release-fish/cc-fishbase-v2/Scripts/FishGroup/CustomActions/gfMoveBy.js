

const _gfMoveBy = cc.Class({
    name: '_gfMoveBy',
    extends: cc.ActionInterval,

    __ctor__ (duration, x, y, timeSkipped = 0) {
        this._timesForRepeat = 1;
        this._positionDelta = cc.v2(x, y);
        this._startPosition = cc.v2(0, 0);
        this._timeSkipped = timeSkipped;

        this.initWithDuration(duration);
    },

    initWithDuration:function (t) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            return true;
        }
        return false;
    },

    startWithTarget:function (target) {
        if(!target) return;
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._startPosition = this.target.getPosition();
    },

    update (dt) {
        dt = (dt * this._duration + this._timeSkipped ) / (this._timeSkipped + this._duration);
        dt = this._computeEaseTime(dt);
        if (this.target) {
            const x = dt * this._positionDelta.x;
            const y = dt * this._positionDelta.y;
            const pos = cc.v2(x + this._startPosition.x, y + this._startPosition.y);
            this.target.setPosition(pos);
        }
    }
});

const gfMoveBy = function(duration, x, y, timeSkipped) {
    return new _gfMoveBy(duration, x, y, timeSkipped);
};

module.exports = gfMoveBy;