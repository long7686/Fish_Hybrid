

const MoveByDistance = cc.Class({
    name: 'MoveByDistance',
    extends: cc.ActionInterval,

    __ctor__ (duration, distance, angle, timeSkipped = 0) {
        this._timesForRepeat = 1;
        this._distance = distance;
        this._timeSkipped = timeSkipped;
        this._startAngle = angle;

        this.initWithDuration(duration, timeSkipped);
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
        const angle =  this._startAngle != undefined || this._startAngle != null ? this._startAngle : 
            this.target.angle * Math.PI / 180;
        this.startPos = this.target.getPosition();
        this.deltaPos = cc.v2(this._distance * Math.cos(angle), this._distance * Math.sin(angle));
    },

    update (dt) {
        dt = (dt * this._duration + this._timeSkipped ) / (this._timeSkipped + this._duration);
        dt = this._computeEaseTime(dt);
        if (this.target) {
            const x = dt * this.deltaPos.x;
            const y = dt * this.deltaPos.y;
            const pos = cc.v2(x + this.startPos.x, y + this.startPos.y);
            this.target.setPosition(pos);
        }
    }
});

const gfMoveByDistance = function(duration, distance, angle, timeSkipped) {
    return new MoveByDistance(duration, distance, angle, timeSkipped);
};

module.exports = gfMoveByDistance;