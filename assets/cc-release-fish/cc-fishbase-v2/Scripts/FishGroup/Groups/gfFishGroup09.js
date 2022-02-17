const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');

class gfFishGroup9 {

    static create() {
        const fishCount = [30, 16, 1, 1];
        const { AppSize } = GameConfig.instance;
        const midY = AppSize.Height / 2;
        const offsetX = 200;
        const offsetX2 = 250;
        const radius1 = 250;
        const radius2 = 170;
        const center1 = cc.v2(AppSize.Width * 0.75, midY);
        const center2 = cc.v2(AppSize.Width * 0.25, midY);
        this.createFish9Line(fishCount[0] / 2, cc.v2(-offsetX, midY + radius1), center1, 0.65);
        this.createFish9Line(fishCount[0] / 2, cc.v2(AppSize.Width + offsetX, midY - radius1), center2, 0.65);
        this.createFish9Line(fishCount[1] / 2, cc.v2(-offsetX2, midY + radius2), center1, 1.2);
        this.createFish9Line(fishCount[1] / 2, cc.v2(AppSize.Width + offsetX2, midY - radius2), center2, 1.2);
        this.createBigFish9(cc.v2(-offsetX, midY), center2, cc.v2(AppSize.Width + offsetX, midY));
        this.createBigFish9(cc.v2(AppSize.Width + offsetX, midY), center1, cc.v2(-offsetX, midY));
    }

    static createFish9Line(fishCount, startPos, center, delay) {
        startPos = FishGroupHelper.convertFlipCoordinate(startPos);
        center = FishGroupHelper.convertFlipCoordinate(center);
        const fishSpeed = 120;
        const radius = Math.abs(center.y - startPos.y);
        const circleTime = 9.75;//2 * Math.PI * radius / fishSpeed;
        const circleCount = 3;
        const moveInTime = Math.abs(center.x - startPos.x) / fishSpeed;
        const delayEach = delay;
        const dir = center.x > startPos.x ? 1 : -1;
        for (let i = 0; i < fishCount; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const delay = i * delayEach;
            const moveAction = new FishMoveActions(startPos);
            moveAction.appendAction(FISH_ACTION.Delay, { time: delay });
            moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveInTime, x: center.x - startPos.x, y: 0 });
            moveAction.appendAction(FISH_ACTION.CircleBy, { time: circleTime * circleCount, center, radius, angle: -360 * circleCount });
            moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveInTime, x: dir * moveInTime * fishSpeed, y: 0 });
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            FishGroupHelper.createFishWithDelay(data);
        }
    }

    static createBigFish9(startPos, standPos, endPos) {
        const data = FishGroupData.getNextFishData();
        if (!data) return;
        startPos = FishGroupHelper.convertFlipCoordinate(startPos);
        standPos = FishGroupHelper.convertFlipCoordinate(standPos);
        endPos = FishGroupHelper.convertFlipCoordinate(endPos);
        const fishSpeed = 120;
        const moveInTime = Math.abs(standPos.x - startPos.x) / fishSpeed;
        const moveOutTime = Math.abs(endPos.x - standPos.x) / fishSpeed;
        const moveAction = new FishMoveActions(startPos);
        moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveInTime, x: standPos.x - startPos.x, y: 0 });
        moveAction.appendAction(FISH_ACTION.Delay, { time: 40 });
        moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveOutTime, x: endPos.x - standPos.x, y: 0 });
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        data.fishAngle = standPos.x - startPos.x > 0 ? 0 : 180;
        FishGroupHelper.createFishWithDelay(data);
    }
}

module.exports = gfFishGroup9;