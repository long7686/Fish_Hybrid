const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');


class gfFishGroup11 {

    static create() {
        const fishCount = [20, 20, 16, 16, 14, 14, 8];
        const delayEach = 3;
        let i = 0;
        this.createFish11Wave(fishCount[i], delayEach * i++);
        this.createFish11Wave(fishCount[i], delayEach * i++);
        this.createFish11Wave(fishCount[i], delayEach * i++);
        this.createFish11Wave(fishCount[i], delayEach * i++);
        this.createFish11Wave(fishCount[i], delayEach * i++);
        this.createFish11Wave(fishCount[i], delayEach * i++);
        this.createFish11Wave(fishCount[i], delayEach * i++);
    }

    static createFish11Wave(fishCount, baseDelay) {
        for (let i = 1; i <= fishCount / 2; ++i) {
            const angle = FishGroupData.flipCoord * 90 - i / fishCount * 360;
            this.createSingleFish11(baseDelay, angle);
        }

        for (let i = fishCount / 2 - 1; i >= 0; --i) {
            const angle = FishGroupData.flipCoord * 90 + i / fishCount * 360;
            this.createSingleFish11(baseDelay, angle);
        }
    }

    static createSingleFish11(baseDelay, angle) {
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
        const moveOutTime = AppSize.Width / fishSpeed;
        const radius = 400;
        this.makeBezierLine(angle, moveAction, moveInTime, radius);
        moveAction.appendAction(FISH_ACTION.MoveByDistance, { time: moveOutTime, angle: (angle - 135) * Math.PI / 180, distance: AppSize.Width });
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        FishGroupHelper.createFishWithDelay(data);
    }

    static makeBezierLine(angle, moveAction, moveOutTime, radius = 400 ) {
        let pos1 = cc.v2(radius * (Math.cos(angle * Math.PI / 180)), radius * (Math.sin(angle * Math.PI / 180)));
        let pos2 = cc.v2(radius * Math.cos((angle + 45 ) * Math.PI / 180), radius * Math.sin((angle + 45 )* Math.PI / 180));
        let pos3 = cc.v2( 0, 0);
        moveAction.appendAction(FISH_ACTION.gfBezierBy, { 
            time: moveOutTime, 
            points: [
                pos1, 
                pos2, 
                pos3, 
            ] 
        });
    }
}
module.exports = gfFishGroup11;