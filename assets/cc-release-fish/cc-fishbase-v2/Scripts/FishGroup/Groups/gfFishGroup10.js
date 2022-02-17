const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');


class gfFishGroup10 {

    static create() {
        const fishCount = [30, 20, 20, 20, 20, 20, 20];
        const delayEach = 3;
        let i = 0;
        this.createFish10Wave(fishCount[i], delayEach * i++);
        this.createFish10Wave(fishCount[i], delayEach * i++);
        this.createFish10Wave(fishCount[i], delayEach * i++);
        this.createFish10Wave(fishCount[i], delayEach * i++);
        this.createFish10Wave(fishCount[i], delayEach * i++);
        this.createFish10Wave(fishCount[i], delayEach * i++);
        this.createFish10Wave(fishCount[i], delayEach * i++);
    }

    static createFish10Wave(fishCount, baseDelay) {
        const totalRotateTime = 0.5;
        for (let i = 1; i <= fishCount / 2; ++i) {
            const angle = FishGroupData.flipCoord * 90 - i / fishCount * 360;
            const rotateTime = totalRotateTime * i / fishCount;
            this.createSingleFish10(baseDelay, angle, rotateTime, totalRotateTime / 2 - rotateTime);
        }

        for (let i = fishCount / 2 - 1; i >= 0; --i) {
            const angle = FishGroupData.flipCoord * 90 + i / fishCount * 360;
            const rotateTime = totalRotateTime * i / fishCount;
            this.createSingleFish10(baseDelay, angle, rotateTime, totalRotateTime / 2 - rotateTime);
        }
    }

    static createSingleFish10(baseDelay, angle, rotateTime) {
        const data = FishGroupData.getNextFishData();
        if (!data) return;
        const { AppSize } = GameConfig.instance;
        const startPos = FishGroupHelper.convertFlipCoordinate(cc.v2(AppSize.Width / 2, - 100));
        const center = cc.v2(AppSize.Width / 2, AppSize.Height / 2);
        const fishSpeed = 80;
        const moveInTime = Math.abs(center.y - startPos.y) / fishSpeed;
        const moveAction = new FishMoveActions(startPos);
        moveAction.appendAction(FISH_ACTION.Delay, { time: baseDelay });
        moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveInTime, x: 0, y: center.y - startPos.y });
        moveAction.appendAction(FISH_ACTION.RotateTo, { time: rotateTime, angle });
        // moveAction.appendAction(FISH_ACTION.Delay, { time: standTime });
        const moveOutTime = AppSize.Width / fishSpeed;
        moveAction.appendAction(FISH_ACTION.MoveByDistance, { time: moveOutTime, angle: angle * Math.PI / 180, distance: AppSize.Width });
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        FishGroupHelper.createFishWithDelay(data);
    }
}

module.exports = gfFishGroup10;