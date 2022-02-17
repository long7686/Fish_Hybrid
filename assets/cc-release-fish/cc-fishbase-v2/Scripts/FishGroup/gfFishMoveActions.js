const {autoEnum} = require('gfUtilities');
const gfBezierBy = require('gfBezierBy');
const gfCircleBy = require('gfCircleBy');
const gfMoveByDistance = require('gfMoveByDistance');
const gfMoveBy = require('gfMoveBy');
const FishGroupData = require('gfFishGroupData');

const FISH_ACTION = autoEnum([
    'Delay',
    'gfBezierBy',
    'MoveBy',
    'CircleBy',
    'MoveByDistance',
    'RotateTo'
]);

class FishMoveActions {
    constructor(startPosition, timeSkipped = 0) {
        this.timeSkipped = timeSkipped ? timeSkipped : FishGroupData.timeSkipped;
        this.moveAction = [];
        this.startPosition = startPosition;
    }

    getActions() {
        if (this.moveAction.length > 1) {
            return cc.sequence(this.moveAction);
        }
        if (this.moveAction.length > 0) {
            return this.moveAction[0];
        }
        return cc.delayTime(0);
    }

    getStartPosition() {
        return this.startPosition;
    }

    appendAction(name, prop) {
        switch (name) {
            case FISH_ACTION.Delay:
                this.appendDelay(prop);
                break;
            case FISH_ACTION.gfBezierBy:
                this.appendGfBezierBy(prop);
                break;
            case FISH_ACTION.CircleBy:
                this.appendCircleBy(prop);
                break;
            case FISH_ACTION.MoveByDistance:
                this.appendMoveByDistance(prop);
                break;
            case FISH_ACTION.MoveBy:
                this.appendMoveBy(prop);
                break;
            case FISH_ACTION.RotateTo:
                this.appendRotateTo(prop);
                break;
            default:
                cc.error('Invalid action');
        }
    }

    appendDelay(prop) {
        const {time} = prop;
        if (this.timeSkipped >= time) {
            this.timeSkipped -= time;
        } else {
            this.moveAction.push(cc.delayTime(time - this.timeSkipped));
            this.timeSkipped = 0;
        }
    }

    appendGfBezierBy(prop) {
        const {time, points} = prop;
        if (this.timeSkipped && this.timeSkipped >= time) {
            this.timeSkipped -= time;
            this.startPosition = this.startPosition.add(points.pop());
        } else {
            this.moveAction.push(gfBezierBy(time - this.timeSkipped, points, this.timeSkipped));
            this.timeSkipped = 0;
        }
    }

    appendCircleBy(prop) {
        const {time, center, radius, angle} = prop;
        if (this.timeSkipped && this.timeSkipped >= time) {
            this.timeSkipped -= time;
            const baseAngle = Math.atan2(this.startPosition.y - center.y, this.startPosition.x - center.x);
            const radian = baseAngle + angle * Math.PI / 180;
            const x = radius * Math.cos(radian);
            const y = radius * Math.sin(radian);
            this.startPosition = cc.v2(x + center.x, y + center.y);
        } else {
            this.moveAction.push(gfCircleBy(time - this.timeSkipped, center, radius, angle, this.timeSkipped));
            this.timeSkipped = 0;
        }
    }

    appendMoveByDistance(prop) {
        const {time, distance, angle} = prop;
        if (this.timeSkipped && this.timeSkipped >= time) {
            this.timeSkipped -= time;
            const vDelta = cc.v2(distance * Math.cos(angle), distance * Math.sin(angle));
            this.startPosition = this.startPosition.add(vDelta);
        } else {
            this.moveAction.push(gfMoveByDistance(time - this.timeSkipped, distance, angle, this.timeSkipped));
            this.timeSkipped = 0;
        }
    }

    appendMoveBy(prop) {
        const {time, x, y, motion} = prop;
        if (this.timeSkipped && this.timeSkipped >= time) {
            this.timeSkipped -= time;
            this.startPosition = this.startPosition.add(cc.v2(x, y));
        } else {
            const action = gfMoveBy(time - this.timeSkipped, x, y, this.timeSkipped);
            if (motion) {
                action.easing(motion);
            }
            this.moveAction.push(action);
            this.timeSkipped = 0;
        }
    }

    appendRotateTo(prop) {
        const {time, angle} = prop;
        if (this.timeSkipped && this.timeSkipped >= time) {
            this.timeSkipped -= time;
            this.moveAction.push(cc.rotateTo(0, angle));
        } else {
            this.moveAction.push(cc.rotateTo(time - this.timeSkipped, angle));
            this.timeSkipped = 0;
        }
    }
}

module.exports = {FISH_ACTION, FishMoveActions};
