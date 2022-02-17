const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');


class gfFishGroup13 {

    static create() {

        const yPos = GameConfig.instance.AppSize.Height / 2;
        let left = -200;
        let right = GameConfig.instance.AppSize.Width - left;
        let isFlipScreen = false;
        if (FishGroupData.isFlipped()) {
            [left, right] = [right, left];
            isFlipScreen = true;
        }
        const fishSpeed = 70;
        const radius = 200;
        const numberStep = 5;
        const numberFishPerLine = 22;

        //appear in right
        this.createSinFishGroup({
            count: numberFishPerLine, startPos: cc.v2(right, yPos), numberStep: numberStep, isMoveRight: isFlipScreen, distanceX: GameConfig.instance.AppSize.Width + 200, fishSpeed: fishSpeed, radius: radius, isMoveUp: isFlipScreen
        });
        this.createSinFishGroup({
            count: numberFishPerLine, startPos: cc.v2(right, yPos), numberStep: numberStep, isMoveRight: isFlipScreen, distanceX: GameConfig.instance.AppSize.Width + 200, fishSpeed: fishSpeed, radius: radius, isMoveUp: !isFlipScreen
        });

        //appear in left
        this.createSinFishGroup({
            count: numberFishPerLine, startPos: cc.v2(left, yPos), numberStep: numberStep, isMoveRight: !isFlipScreen, distanceX: GameConfig.instance.AppSize.Width + 200, fishSpeed: fishSpeed, radius: radius, isMoveUp: isFlipScreen
        });

        this.createSinFishGroup({
            count: numberFishPerLine, startPos: cc.v2(left, yPos), numberStep: numberStep, isMoveRight: !isFlipScreen, distanceX: GameConfig.instance.AppSize.Width + 200, fishSpeed: fishSpeed, radius: radius, isMoveUp: !isFlipScreen
        });
    }

    static createSinFishGroup({
        count, startPos, numberStep, isMoveRight, distanceX, isMoveUp, radius, fishSpeed }) {
        const dir = isMoveRight ? 1 : -1;
        const sub = isMoveUp ? 0 : 1;
        const distanceMini = distanceX * 1.25 / numberStep;
        const moveInTime = ((distanceX / fishSpeed)) / numberStep;
        const delayEach = 1;
        for (let i = 0; i < count; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const delay = i * delayEach;
            const moveAction = new FishMoveActions(startPos);
            moveAction.appendAction(FISH_ACTION.Delay, { time: delay });
            for (let j = 0; j <= numberStep; j++) {
                const y = radius * Math.pow(-1, j + sub);
                moveAction.appendAction(FISH_ACTION.gfBezierBy, {
                    time: moveInTime, points: [
                        cc.v2(dir * distanceMini * 0.25, y),
                        cc.v2(dir * distanceMini * 0.75, y),
                        cc.v2(dir * distanceMini, 0)
                    ]
                });
            }
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            FishGroupHelper.createFishWithDelay(data);
        }
    }
}
module.exports = gfFishGroup13;