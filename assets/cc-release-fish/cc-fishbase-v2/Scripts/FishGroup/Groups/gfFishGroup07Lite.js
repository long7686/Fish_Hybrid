const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');

class gfFishGroup7Lite {

    static create(){
        const { AppSize } = GameConfig.instance;
        const fishCount = [24, 24, 24, 1, 1, 1, 1];
        // const fishKind = [13, 3, 4, 25, 43, 25];
        //Duration : 40
        const Y1 = 140;
        const space = 175;
        const speed = 150;
        FishGroupHelper.createFishLine(fishCount[0] / 2, Y1, space, speed);
        FishGroupHelper.createFishLine(fishCount[0] / 2, AppSize.Height - Y1, space, speed);

        const offsetX = 80;
        const timeEach = 5;
        this.makeBezierLine(fishCount[1] / 2, cc.v2(-100, -100), offsetX + 150, 3, timeEach);
        this.makeBezierLine(fishCount[1] / 2, cc.v2(-100, AppSize.Height + 100), offsetX + 150, 3, timeEach);
        this.makeBezierLine(fishCount[2] / 2, cc.v2(-300, 100), offsetX, 6, timeEach, timeEach / 2);
        this.makeBezierLine(fishCount[2] / 2, cc.v2(-300, AppSize.Height - 100), offsetX, 6, timeEach, timeEach / 2);

        FishGroupData.updateCustomZIndex(555);
        const bigSpace = 400;
        const midY = 360;
        const bigOffset = -1000;
        const bigSpeed = 120;
        FishGroupHelper.createFishLine(fishCount[3], midY, bigSpace, bigSpeed, bigOffset);
        FishGroupHelper.createFishLine(fishCount[4], midY, bigSpace, bigSpeed, bigOffset - fishCount[3] * bigSpace);
        FishGroupHelper.createFishLine(fishCount[5], midY, bigSpace, bigSpeed, bigOffset - (fishCount[3] + fishCount[4]) * bigSpace);
        FishGroupHelper.createFishLine(fishCount[6], midY, bigSpace, bigSpeed, bigOffset - (fishCount[3] + fishCount[4] + fishCount[5]) * bigSpace);
    }

    static makeBezierLine(fishCount, startPos, offsetX, circleCount, moveInTime, circleTime = moveInTime ) {
        const { AppSize } = GameConfig.instance;
        const width = (AppSize.Width - offsetX * 2) / circleCount;
        const height = width * 0.7;
        const x = offsetX - startPos.x;
        if(FishGroupData.isFlipped()) {
            startPos.x = AppSize.Width - startPos.x;
            startPos.y = AppSize.Height - startPos.y;
        }
        const y = 360 - startPos.y;
        for(let i = 0; i < fishCount; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const delay = +i;
            let flip = y > 0 ? 1 : -1;
            const moveAction = new FishMoveActions(startPos);
            moveAction.appendAction(FISH_ACTION.Delay, { time: delay });
            moveAction.appendAction(FISH_ACTION.gfBezierBy, { time: moveInTime, points:
                    [cc.v2(FishGroupData.flipCoord * x * 0.65, 0),
                        cc.v2(FishGroupData.flipCoord * x, y / 3),
                        cc.v2(FishGroupData.flipCoord * x, y)] });
            for(let j = 0; j < circleCount; ++j) {
                moveAction.appendAction(FISH_ACTION.gfBezierBy, { time: circleTime, points:
                        [cc.v2(0, flip * height),
                            cc.v2(FishGroupData.flipCoord * width, flip * height),
                            cc.v2(FishGroupData.flipCoord * width, 0)]});
                flip *= -1;
            }
            const flipRate = (circleCount % 2) ? -1 : 1;
            moveAction.appendAction(FISH_ACTION.gfBezierBy, { time: moveInTime, points:
                    [cc.v2(0, flipRate * y / 3),
                        cc.v2(FishGroupData.flipCoord * x * 0.35, flipRate * y),
                        cc.v2(FishGroupData.flipCoord * x, flipRate * y)]});
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            FishGroupHelper.createFishWithDelay(data);
        }
    }
}

module.exports = gfFishGroup7Lite;