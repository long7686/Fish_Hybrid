const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');

class gfFishGroup2 {

    static createGroup2SmallFish({ count, moveUp }) {
        cc.warn(1);
        const distantsBorder = 185;
        const flip = FishGroupData.isFlipped();
        const offsetX = GameConfig.instance.realSize.Width / count;
        const height = GameConfig.instance.AppSize.Height;
        moveUp = flip ? moveUp : !moveUp;
        const stopY = moveUp ? height - distantsBorder : distantsBorder;
        const endY = moveUp ? -distantsBorder : height + distantsBorder;
        for (let i = 0; i < count; ++i) {
            const fishInfo = FishGroupData.getNextFishData();
            if (!fishInfo) continue;
            const fishOffset = flip ? count - i : i;
            const startX = 10 + GameConfig.instance.SceneBox.Left + fishOffset * offsetX;
            const startY = moveUp ? height + Math.random() * 100  : Math.random() * 100 * -1;
            const timeSpent = FishGroupData.timeSkipped - fishInfo.TimeFreeze;
            const moveInTime = Math.max(0, 2 - timeSpent);
            const stayTime = Math.max(0, 40 - Math.max(0, timeSpent - 2));
            const moveOutTime = Math.max(0, 4 - Math.max(0, timeSpent - 42));
            fishInfo.fishPosition = cc.v2(startX, startY);
            if (moveInTime <= 0) {
                fishInfo.fishPosition = cc.v2(startX, stopY);
            }
            fishInfo.fishAngle = endY > startY ? 90 : -90;
            fishInfo.moveAction = cc.sequence(
                cc.moveTo(moveInTime, cc.v2(startX, stopY)),
                cc.delayTime(stayTime),
                cc.moveTo(moveOutTime, cc.v2(startX, endY)),
            );
            FishGroupHelper.createFishWithDelay(fishInfo);
        }
    }

    static createGroup2BigFish({
        count, upperLine, startX, endX,
    }) {
        const distantsBorderMore = 255;
        upperLine = FishGroupData.isFlipped() ? !upperLine : upperLine;
        const startY = upperLine ? distantsBorderMore : GameConfig.instance.AppSize.Height - distantsBorderMore;
        for (let i = 0; i < count; ++i) {
            const fishInfo = FishGroupData.getNextFishData();
            if (!fishInfo) continue;
            const delay = i * 5;
            const timeSpent = FishGroupData.timeSkipped - fishInfo.TimeFreeze;
            fishInfo.fishPosition = cc.v2(startX, startY);
            fishInfo.fishAngle = 0;
            const defaultMoveTime = 17;
            const movedTime = Math.max(0, timeSpent - delay);
            const movingTime = Math.max(0, defaultMoveTime - movedTime);
            fishInfo.fishPosition.x = startX + movedTime / defaultMoveTime * (endX - startX);
            fishInfo.moveAction = cc.sequence(
                cc.delayTime(Math.max(0, delay - timeSpent)),
                cc.moveTo(movingTime, cc.v2(endX, startY)),
            );
            FishGroupHelper.createFishWithDelay(fishInfo);
        }
    }

    static create() { // Two queues move in and wait
        const left = GameConfig.instance.SceneBox.Left - 300;
        const right = GameConfig.instance.SceneBox.Right + 300;
        this.createGroup2SmallFish({ count: 60, moveUp: false });
        this.createGroup2SmallFish({ count: 60, moveUp: true });
        this.createGroup2BigFish({
            count: 7, upperLine: false, startX: right, endX: left,
        });
        this.createGroup2BigFish({
            count: 7, upperLine: true, startX: left, endX: right,
        });
    }
}

module.exports = gfFishGroup2;