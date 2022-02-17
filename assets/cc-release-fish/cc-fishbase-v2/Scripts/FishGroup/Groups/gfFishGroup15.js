const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');


class gfFishGroup15 {

    static create() {
        const fishCount = [30, 30, 30, 30, 2, 2, 1, 1];
        const delayEach = 2;
        let i = 0;
        this.createFish15Arc(fishCount[i], delayEach, 100, false, ++i);
        this.createFish15Arc(fishCount[i], delayEach, 100, true, ++i);
        this.createFish15Arc(fishCount[i], delayEach, 200, false, ++i);
        this.createFish15Arc(fishCount[i], delayEach, 200, true, ++i);
        this.createFish15Direct(fishCount[i], 8, 400, 40, ++i);
        this.createFish15Direct(fishCount[i], 10, 550, 40, ++i);
        this.createSingleFish15Direct(10, 0, 40, false, ++i);
        this.createSingleFish15Direct(0, 0, 40, false, ++i);
    }

    static createFish15Arc(fishCount, baseDelay, range, haveFirstDelay) {
        for (let i = 1; i <= fishCount / 2; ++i) {
            const delay = haveFirstDelay? baseDelay * i + baseDelay / 2 : baseDelay * i ;
            this.createSingleFish15Art(delay, range, false);
        }

        for (let i = 1; i <= fishCount / 2; ++i) {
            const delay = haveFirstDelay? baseDelay * i + baseDelay / 2 : baseDelay * i ;

            this.createSingleFish15Art(delay, range, true);
        }
    }

    static createFish15Direct(fishCount, baseDelay, range, speed ) {
        for (let i = 1; i <= fishCount / 2; i++) {
            this.createSingleFish15Direct(baseDelay, range, speed, false);
        }
        for (let i = 1; i <= fishCount / 2; i++) {
            this.createSingleFish15Direct(baseDelay, range, speed, true);
        }
    }

    static createSingleFish15Art(baseDelay, range, isRight = false) {
        const data = FishGroupData.getNextFishData();
        if (!data) return;
        const { AppSize } = GameConfig.instance;
        const firstPos = {
            x: isRight ? AppSize.Width / 2 + range : AppSize.Width / 2 - range,
            y: -100
        };
        const fishSpeed = 80;
        

        const startPos = FishGroupHelper.convertFlipCoordinate(cc.v2(firstPos.x, firstPos.y));
        const moveAction = new FishMoveActions(startPos);
        const moveOutTime = AppSize.Width / fishSpeed;

        moveAction.appendAction(FISH_ACTION.Delay, { time: baseDelay });
        this.makeBezierLine(moveAction, moveOutTime, range, isRight, startPos);
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        FishGroupHelper.createFishWithDelay(data);
    }

    static makeBezierLine(moveAction, moveOutTime, range, isRight, startPos) {
        const { AppSize } = GameConfig.instance;
        let center = cc.v2(AppSize.Width / 2, AppSize.Height / 2);
        const dir = center.y > startPos.y ? 1 : -1;

        const pos1 = cc.v2(0, 0);
        const pos2 = cc.v2(pos1.x, (AppSize.Height + 200 - range / 2) * dir);
        const pos3 = cc.v2(isRight ? (AppSize.Width / 2 + range) * dir : (-AppSize.Width / 2 - range) * dir, (AppSize.Height + 200  - range) * dir);
        moveAction.appendAction(FISH_ACTION.gfBezierBy, { 
            time: moveOutTime, 
            points: [
                pos1, 
                pos2, 
                pos3, 
            ] 
        });
    }

    static createSingleFish15Direct(baseDelay, range, speed, isRight = false) {
        const data = FishGroupData.getNextFishData();
        if (!data) return;
        const { AppSize } = GameConfig.instance;
        const firstPos = {
            x: isRight ? AppSize.Width / 2 + range : AppSize.Width / 2 - range,
            y: -300
        };
        let center = cc.v2(AppSize.Width / 2, AppSize.Height / 2);
        const fishSpeed = speed;
        const startPos = FishGroupHelper.convertFlipCoordinate(cc.v2(firstPos.x, firstPos.y));
        const dir = center.y > startPos.y ? 1 : -1;
        const moveAction = new FishMoveActions(startPos);
        const moveOutTime = (AppSize.Height + 600) / fishSpeed;
        moveAction.appendAction(FISH_ACTION.Delay, { time: baseDelay });
        moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveOutTime, x: 0, y: (AppSize.Height + 600) * dir });
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        FishGroupHelper.createFishWithDelay(data);
    }
}
module.exports = gfFishGroup15;