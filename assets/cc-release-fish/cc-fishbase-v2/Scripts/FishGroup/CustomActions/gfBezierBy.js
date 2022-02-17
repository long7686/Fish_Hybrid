
const _gfBezierBy = cc.Class({
    name: '_gfBezierBy',
    extends: cc.ActionInterval,

    __ctor__(t, c, timeSkipped) {
        this._timesForRepeat = 1;
        this._config = [];
        this._startPosition = cc.v2(0, 0);
        this._previousPosition = cc.v2(0, 0);
        this._timeSkipped = 0;
        c && this.initWithDuration(t, c, timeSkipped);
    },

    initWithDuration:function (t, c, timeSkipped) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._config = c;
            this._timeSkipped = timeSkipped;
            return true;
        }
        return false;
    },

    startWithTarget:function (target) {
        if(!target) return;
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._previousPosition.x = target.x;
        this._previousPosition.y = target.y;
        this._startPosition.x = target.x;
        this._startPosition.y = target.y;
    },

    bezierAt (a, b, c, d, t) {
        return (Math.pow(1 - t, 3) * a +
            3 * t * (Math.pow(1 - t, 2)) * b +
            3 * Math.pow(t, 2) * (1 - t) * c +
            Math.pow(t, 3) * d );
    },

    update:function (dt) {
        dt = (dt * this._duration + this._timeSkipped ) / (this._timeSkipped + this._duration);
        dt = this._computeEaseTime(dt);
        if (this.target) {
            var locConfig = this._config;
            var xa = 0;
            var xb = locConfig[0].x;
            var xc = locConfig[1].x;
            var xd = locConfig[2].x;

            var ya = 0;
            var yb = locConfig[0].y;
            var yc = locConfig[1].y;
            var yd = locConfig[2].y;

            var x = this.bezierAt(xa, xb, xc, xd, dt);
            var y = this.bezierAt(ya, yb, yc, yd, dt);

            var locStartPosition = this._startPosition;
            if (cc.macro.ENABLE_STACKABLE_ACTIONS) {
                var targetX = this.target.x;
                var targetY = this.target.y;
                var locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
                locPreviousPosition.x = x;
                locPreviousPosition.y = y;
                this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    }
});

const gfBezierBy = function(t, c, timeSkipped = 0) {
    return new _gfBezierBy(t, c, timeSkipped);
};

module.exports = gfBezierBy;