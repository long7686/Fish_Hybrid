const { v2Distance } = require("gfUtilities");
const _gfMoveByThreePoints = cc.Class({
    name: '_gfMoveByThreePoints',
    extends: cc.ActionInterval,
    __ctor__(data) {
        const { speed, points, timeSpent, isResume } = data;
        this._timesForRepeat = 1;
        this.totalPoints = 100;
        const durationPerUnit = 1 / this.totalPoints;
        this._configPoints = points;
        this._duration = 0;
        this.arcLengths = new Array(this.totalPoints + 1);
        this.arcLengths[0] = 0;
        let lastPoint = cc.v2(this.x(0), this.y(0));
        for (let i = 1; i <= this.totalPoints; i += 1) {
            const currentPoint = cc.v2(this.x(i * durationPerUnit), this.y(i * durationPerUnit));
            const distance = v2Distance(lastPoint, currentPoint);
            this._duration += distance / speed;
            this.arcLengths[i] = this.arcLengths[i - 1 ] + distance;
            lastPoint = currentPoint;
        }
        this._timeSpent = isResume ? timeSpent : 0;
        const speedScale = isResume ? 1 : this._duration / (this._duration - timeSpent);
        let realDuration = isResume ? (Math.max(0, this._duration - timeSpent)) : this._duration / speedScale;
        if(speedScale > 3) {
            cc.log(`skip create fish: speedScale-${speedScale}`, speed, points, timeSpent, isResume);
            realDuration = 0;
        }
        this.initWithDuration(realDuration);
    },

    map(u) {
        const targetLength = u * this.arcLengths[this.totalPoints];
        let low = 0, high = this.totalPoints, index = 0;
        while (low < high) {
            index = low + (((high - low) / 2) | 0);
            if (this.arcLengths[index] < targetLength) {
                low = index + 1;
            } else {
                high = index;
            }
        }
        if (this.arcLengths[index] > targetLength) {
            index--;
        }

        const lengthBefore = this.arcLengths[index];
        if (lengthBefore === targetLength) {
            return index / this.totalPoints;

        } else {
            return (index + (targetLength - lengthBefore) / (this.arcLengths[index + 1] - lengthBefore)) / this.totalPoints;
        }
    },

    x(t) {
        return (1 - t) * (1 - t) * this._configPoints[0].x + 2 * (1 - t) * t * this._configPoints[1].x + t * t * this._configPoints[2].x;
    },

    y(t) {
        return (1 - t) * (1 - t) * this._configPoints[0].y + 2 * (1 - t) * t * this._configPoints[1].y + t * t * this._configPoints[2].y;
    },

    mx(u) {
        return this.x(this.map(u));
    },

    my(u) {
        return this.y(this.map(u));
    },

    update(dt) {
        dt = (dt * this._duration + this._timeSpent) / (this._timeSpent + this._duration);
        dt = this._computeEaseTime(dt);
        if (this.target) {
            this.target.setPosition(this.mx(dt), this.my(dt));
        }
    }
});

const gfMoveByThreePoints = function (data) {
    return new _gfMoveByThreePoints(data);
};

module.exports = gfMoveByThreePoints;