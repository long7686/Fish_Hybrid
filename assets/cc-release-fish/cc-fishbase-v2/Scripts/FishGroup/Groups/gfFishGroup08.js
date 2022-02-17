const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');

class gfFishGroup8 {

    static makeBezierLine8(fishCount, circleCount, customHeight, circleTime) {
        const { AppSize } = GameConfig.instance;
        const width = (AppSize.Width + 100) / (circleCount + 1);
        const height = customHeight ? customHeight : width * 0.7;
        const startPos = cc.v2(-width / 2 - 100, AppSize.Height / 2);
        if (FishGroupData.isFlipped()) {
            startPos.x = AppSize.Width - startPos.x;
            startPos.y = AppSize.Height - startPos.y;
        }
        const y = 360 - startPos.y;
        for (let i = 0; i < fishCount; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const delay = i * 1.0;
            let flip = y > 0 ? 1 : -1;
            const moveAction = new FishMoveActions(startPos);
            moveAction.appendAction(FISH_ACTION.Delay, { time: delay });
            for (let j = 0; j < circleCount + 2; ++j) {
                moveAction.appendAction(FISH_ACTION.gfBezierBy, {
                    time: circleTime, points: [
                        cc.v2(0, flip * height),
                        cc.v2(FishGroupData.flipCoord * width, flip * height),
                        cc.v2(FishGroupData.flipCoord * width, 0)
                    ]
                });
                flip *= -1;
            }
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            FishGroupHelper.createFishWithDelay(data);
        }
    }

    static create() {
        const fishCount = [50, 50, 1, 1, 1, 1, 1, 1, 1];
        // const fishKind = [13, 3, 22, 20, 22, 43, 20, 22, 20];

        const timeEach = 5;
        const circleCount = 2;
        const { AppSize } = GameConfig.instance;
        const width = (AppSize.Width) / (circleCount + 1);
        const height = width * 0.7;

        this.makeBezierLine8(fishCount[0] / 2, circleCount, height, timeEach);
        this.makeBezierLine8(fishCount[0] / 2, circleCount, -height, timeEach);
        this.makeBezierLine8(fishCount[1] / 2, circleCount, 100, timeEach);
        this.makeBezierLine8(fishCount[1] / 2, circleCount, -100, timeEach);

        FishGroupData.updateCustomZIndex(555);
        const bigSpace = 400;
        const midY = 360;
        const bigSpeed = 95;
        for (let i = 0; i < fishCount.length - 2; ++i) {
            FishGroupHelper.createFishLine(fishCount[i + 2], midY, 0, bigSpeed, - bigSpace * i);
        }
    }
}

module.exports = gfFishGroup8;