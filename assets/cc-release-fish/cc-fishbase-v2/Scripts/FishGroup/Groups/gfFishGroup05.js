const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');
const FishGroupHelper = require('gfFishGroupHelper');

class gfFishGroup5 {

    static create() { // Two cirle rotating then spread out
        const width = GameConfig.instance.AppSize.Width / 2;
        const height = GameConfig.instance.AppSize.Height / 2;
        const offsetX = 480 * 0.67 * FishGroupData.flipCoord;
        const radismain = 360 * 0.67;

        this.circleCallback(30, cc.v2(width - offsetX, height), radismain, 16, 720);
        this.circleCallback(30, cc.v2(width + offsetX, height), radismain, 18, 720 + 90);

        this.circleCallback(30, cc.v2(width - offsetX, height), radismain - 34.5, 20, 720 + 180);
        this.circleCallback(30, cc.v2(width + offsetX, height), radismain - 36, 21, 720 + 180 + 45);

        this.circleCallback(18, cc.v2(width - offsetX, height), radismain - 36 - 56, 22, 720 + 180 + 90);
        this.circleCallback(18, cc.v2(width + offsetX, height), radismain - 34.5 - 58.5, 22.66, 720 + 180 + 90 + 30);

        this.circleCallback(8, cc.v2(width - offsetX, height), radismain - 58 - 65 - 34.5, 23.33, 720 + 180 + 90 + 60);
        this.circleCallback(8, cc.v2(width + offsetX, height), radismain - 36 - 56 - 68, 24, 720 + 180 + 90 + 60 + 30);

        this.circleCallback(1, cc.v2(width - offsetX, height), 0, 24.66, -90);
        this.circleCallback(1, cc.v2(width + offsetX, height), 0, 25.33, -90);
    }

    static circleCallback(index, center, radius, fishDuration, angle) {
        const { AppSize } = GameConfig.instance;
        const angleStep = 360 / index;
        const angleOffset = FishGroupData.isFlipped() ? 180 : 0;
        for (let i = 0; i < index; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const startAngle = (i * angleStep + angleOffset) * Math.PI / 180;
            const x = center.x + Math.cos(startAngle) * radius;
            const y = center.y + Math.sin(startAngle) * radius;
            const timeSpent = FishGroupData.timeSkipped - data.TimeFreeze;
            const moveAction = new FishMoveActions(cc.v2(x, y), timeSpent);
            const speed = 180;
            moveAction.appendAction(FISH_ACTION.CircleBy, { time: fishDuration, center, radius, angle });
            moveAction.appendAction(FISH_ACTION.MoveByDistance, {
                time: AppSize.Width / speed, distance: AppSize.Width,
                angle: startAngle + angle * Math.PI / 180 + Math.PI / 2
            });
            data.fishPosition = moveAction.getStartPosition();
            data.moveAction = moveAction.getActions();
            data.fishAngle = Math.atan2(y - center.y, x - center.x) * 180 / Math.PI;
            data.skipFlipY = true;
            if (x !== center.x || y !== center.y) data.fishAngle -= 90;
            FishGroupHelper.createFishWithDelay(data);
        }
    }
}

module.exports = gfFishGroup5;