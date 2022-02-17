const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');

class gfFishGroup17 {
    static create() { 
        const yPos = GameConfig.instance.AppSize.Height / 2;
        let left = -600;
        let deltaX = 410;
        let right = GameConfig.instance.AppSize.Width - left;
        if (FishGroupData.isFlipped()) {
            [left, right] = [right, left];
            deltaX = -deltaX;
        }
        this.createCircleFishGroup({
            moveTime: 61, moveScale: 2, count: 80, startPos: cc.v2(right, yPos), radius: 250,
        });

        this.createCircleFishGroup({
            moveTime: 61, moveScale: 2, count: 30, startPos: cc.v2(right, yPos), radius: 180,
        });

        this.createCircleFishGroup({
            moveTime: 61, moveScale: 2, count: 16, startPos: cc.v2(right - deltaX, yPos), radius: 100,
        });

        this.createCircleFishGroup({
            moveTime: 61, moveScale: 2, count: 16, startPos: cc.v2(right + deltaX, yPos), radius: 100,
        });

        this.createCircleFishGroup({
            moveTime: 61, moveScale: 2, count: 1, startPos: cc.v2(right, yPos), radius: 0,
        });
    }

    static createCircleFishGroup({
        moveTime, moveScale, count, startPos, radius, isMoveRight,
    }) {
        const flip = isMoveRight ? FishGroupData.flipCoord : -FishGroupData.flipCoord;
        const moveOffset = flip * moveScale * (GameConfig.instance.AppSize.Width + 150);
        const angleStep = 360 / count;
        for (let i = 0; i < count; ++i) {
            const fishInfo = FishGroupData.getNextFishData();
            if (!fishInfo) continue;
            const timeSpent = FishGroupData.timeSkipped - fishInfo.TimeFreeze;
            const skippedDistance = moveOffset * timeSpent / moveTime;
            const timeLeft = Math.max(0, moveTime - timeSpent);
            const fishPos = cc.v2(startPos.x + Math.cos((i * angleStep) * Math.PI / 180) * radius * FishGroupData.flipCoord,
                startPos.y + Math.sin((i * angleStep) * Math.PI / 180) * radius * FishGroupData.flipCoord);
            fishPos.x += skippedDistance;
            fishInfo.fishPosition = fishPos;
            fishInfo.fishAngle = 0;
            fishInfo.moveAction = cc.moveBy(timeLeft, cc.v2((moveOffset - skippedDistance), 0));
            FishGroupHelper.createFishWithDelay(fishInfo);
        }
    }

}
module.exports = gfFishGroup17;