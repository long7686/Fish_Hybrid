const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const FishGroupData = require('gfFishGroupData');
const MoveByThreePoints = require('gfMoveByThreePoints');
const SPEED = 50;
class FishGroup02 {

    static makeBezierLine(fishCount, startPos, endPos, controlPos, delayTime = 1) {
        // const { AppSize } = GameConfig.instance;
        // // const width = (AppSize.Width - offsetX * 2) / circleCount;
        // // const height = width * 0.7;
        // // const x = offsetX - startPos.x;
        // if(FishGroupData.isFlipped()) {
        //     startPos.x = AppSize.Width - startPos.x;
        //     startPos.y = AppSize.Height - startPos.y;
        // }
        // const y = 360 - startPos.y;
        for(let i = 0; i < fishCount; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const delay = i * delayTime;
            // let flip = y > 0 ? 1 : -1;
            data.fishPosition = startPos;
            data.moveAction = cc.sequence(
                cc.delayTime(delay),
                MoveByThreePoints({
                    speed: SPEED,
                    points: [startPos, controlPos, endPos],
                    timeSpent: 0,
                    isResume: false
                })
            );
            FishGroupHelper.createFishWithDelay(data);
        }
    }

    static createVerticalLine(fishCount, xCoord, space, speed, yOffset = 0){
        const { AppSize } = GameConfig.instance;
        let Bottom = -200;
        let Top = AppSize.Height + 500;
        const distance = Math.abs(Top - Bottom) + fishCount * space - yOffset;
        for (let i = 0; i < fishCount; ++i) {
            const startY = Bottom - (i * space - yOffset) * FishGroupData.flipCoord;
            FishGroupHelper.createSimpleMovingFish(
                cc.v2(xCoord, startY),
                cc.v2(xCoord, startY + distance * FishGroupData.flipCoord),
                0,
                speed);
        }
    }

    static create() {
        const topLeftPosStart = cc.v2(-100, GameConfig.instance.SceneBox.Top + 100);
        const topRightPosStart = cc.v2(GameConfig.instance.SceneBox.Right + 100, GameConfig.instance.SceneBox.Top+ 100);
        const bottomLeftPosStart = cc.v2(-100,-100);
        const bottomRightPosStart = cc.v2(GameConfig.instance.SceneBox.Right + 100, -100);
        const pointMoveOutLeft = cc.v2(-100, GameConfig.instance.SceneBox.Top/2);
        const pointMoveOutRight = cc.v2(GameConfig.instance.SceneBox.Right + 100, GameConfig.instance.SceneBox.Top/2);
        const controlPointOutLeft = cc.v2(3/4 * GameConfig.instance.SceneBox.Right, GameConfig.instance.SceneBox.Top/2);
        const controlPointOutRight = cc.v2(GameConfig.instance.SceneBox.Right/4, GameConfig.instance.SceneBox.Top/2);
        const delayTime = 1.5;
        // const topLeftPosStart2 = cc.v2(topLeftPosStart.x + 50, topLeftPosStart.y);
        // const bottomLeftPosStart2 = cc.v2(bottomLeftPosStart.x + 50, bottomLeftPosStart.y);
        // const controlPointOutRight2 = cc.v2(controlPointOutRight.x + 50, controlPointOutRight.y);
        // const controlPointOutLeft2 = cc.v2(controlPointOutLeft.x - 50, controlPointOutLeft.y);
        // const topRightPosStart2 = cc.v2(topRightPosStart.x -50, topRightPosStart.y);
        // const bottomRightPosStart2 = cc.v2(bottomRightPosStart.x - 50, bottomRightPosStart.y);


        this.makeBezierLine(10, bottomLeftPosStart, pointMoveOutRight, controlPointOutRight, delayTime);
        this.makeBezierLine(10, topLeftPosStart, pointMoveOutRight, controlPointOutRight, delayTime);
        this.makeBezierLine(10, bottomRightPosStart, pointMoveOutLeft, controlPointOutLeft, delayTime);
        this.makeBezierLine(10, topRightPosStart, pointMoveOutLeft, controlPointOutLeft, delayTime);

        // this.makeBezierLine(5, bottomLeftPosStart2, pointMoveOutRight, controlPointOutRight2, 1.5);
        // this.makeBezierLine(5, topLeftPosStart2, pointMoveOutRight, controlPointOutRight2, 1.5);
        // this.makeBezierLine(5, bottomRightPosStart2, pointMoveOutLeft, controlPointOutLeft2, 1.5);
        // this.makeBezierLine(5, topRightPosStart2, pointMoveOutLeft, controlPointOutLeft2, 1.5);

        this.createVerticalLine(3, GameConfig.instance.SceneBox.Right/2, 500, SPEED, -150);
        this.createVerticalLine(6, GameConfig.instance.SceneBox.Left + 100, 200, SPEED, -150);
        this.createVerticalLine(6, GameConfig.instance.SceneBox.Right - 100, 200, SPEED, -150);
    }

}

module.exports = FishGroup02;