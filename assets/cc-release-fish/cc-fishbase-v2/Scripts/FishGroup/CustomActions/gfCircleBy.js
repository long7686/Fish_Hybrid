

const CircleBy = cc.Class({
    name: 'gfCircleBy',
    extends: cc.ActionInterval,

    __ctor__ (duration, center, radius, angle, timeSkipped = 0) {
        this._timesForRepeat = 1;
        this._center = center;
        this._radius = radius;
        this._angle = angle;
        this._timeSkipped = timeSkipped;

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
        const fishPos = this.target.getPosition();
        this.baseAngle = Math.atan2(fishPos.y - this._center.y, fishPos.x - this._center.x) * 180 / Math.PI;
    },

    update (dt) {
        dt = (dt * this._duration + this._timeSkipped ) / (this._timeSkipped + this._duration);
        dt = this._computeEaseTime(dt);
        if (this.target) {
            const radian = (this.baseAngle + this._angle * dt) * Math.PI / 180;
            const x = this._radius * Math.cos(radian);
            const y = this._radius * Math.sin(radian);
            // const pos = cc.v2(x + this._center.x, y + this._center.y);
            this.target.setPosition(x + this._center.x, y + this._center.y);
            // if(this.timeSpentRatio < 1) {

            // } else if(this._radius > 0) {
            //     const fishPos = this.target.getPosition();
            //     this.target.angle = Math.atan2(fishPos.y - this._center.y, fishPos.x - this._center.x) * 180 / Math.PI;
            // }
        }
    }
});

const gfCircleBy = function(duration, center, radius, angle, timeSkipped) {
    return new CircleBy(duration, center, radius, angle, timeSkipped);
};

module.exports = gfCircleBy;