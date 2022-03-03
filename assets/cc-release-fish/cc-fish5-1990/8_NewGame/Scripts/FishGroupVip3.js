const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');
const SPEED = 200;
class gfFishGroup9 {

    static create() {
        const fishCount = [13, 8, 1, 21];
        const { AppSize } = GameConfig.instance;
        const midY = AppSize.Height / 2;
        let center = cc.v2(AppSize.Width * 0.75, midY);
        let point1 = cc.v2 (0, 0);
        let point2 = cc.v2 (point1.x + 100, 0.9 * AppSize.Height + 100);
        let point3 = cc.v2 (center.x + 100, 7/8 * AppSize.Height + 100);
        const radius1 = Math.abs(point3.y - center.y - 100);
        const radius2 = Math.abs(radius1-105);

        const startPosMainFish = cc.v2(AppSize.Width +100, midY);
        const posMoveBy = cc.v2(-Math.abs(startPosMainFish.x - center.x), 0);
        const posEnd = cc.v2(-AppSize.Width, 0);
        const startPosMainFish2 = cc.v2(-100, midY);
        const posMoveBy2 = cc.v2(Math.abs(startPosMainFish.x - center.x), 0);
        const posEnd2 = cc.v2(AppSize.Width, 0);
        

        let subEndPoint = cc.v2(center.x, center.y - radius2 + 100);
        let subCircleRadius = ((point3.y - subEndPoint.y) / 2);
        let subCircleCenter = cc.v2(center.x, subCircleRadius + subEndPoint.y - 100);
        let angle = 180;
        let subTimeMove = 2 * Math.PI * subCircleRadius / (SPEED * 2);
        let subCircleData = {
            endPoint:subEndPoint,
            radius:subCircleRadius,
            center:subCircleCenter,
            angle:angle,
            timeMove:subTimeMove
        };
        this.createFishBezier2(fishCount[3], fishCount[1], cc.v2(-100,-100), center, 0.65, [point1, point2, point3], radius1, radius2, subCircleData);
        
        point2 = cc.v2(-point2.x ,point2.y);
        point3 = cc.v2(-point3.x ,point3.y);
        center = cc.v2(AppSize.Width - center.x ,center.y);
        
        subEndPoint = cc.v2(center.x, center.y - radius2 + 100);
        subCircleRadius = ((point3.y - subEndPoint.y) / 2);
        subCircleCenter = cc.v2(center.x, subCircleRadius + subEndPoint.y - 100);
        angle = 180;
        subTimeMove = 2 * Math.PI * subCircleRadius / (SPEED * 2);
        subCircleData = {
            endPoint:subEndPoint,
            radius:subCircleRadius,
            center:subCircleCenter,
            angle:angle,
            timeMove:subTimeMove
        };
        this.createFishBezier2(fishCount[3], fishCount[1], cc.v2(AppSize.Width + 100, -100), center, 0.65, [point1, point2, point3], radius1, radius2, subCircleData, true);
        this.createMainFish(startPosMainFish, posMoveBy, posEnd, 5, 10, 15);
        this.createMainFish(startPosMainFish2, posMoveBy2, posEnd2, 5, 10, 15);
    }

    static createFishBezier2(fishCount, fishCount1, startPos, center, delayEach, points, radius1, radius2, subCircleData, isReverse = false){
        startPos = FishGroupHelper.convertFlipCoordinate(startPos);
        center = FishGroupHelper.convertFlipCoordinate(center);
        const { AppSize } = GameConfig.instance;
        const dir = isReverse ? 1 : -1;
        const moveInTime = 15;
        const circleCount = 5;
        let angleMove;
        for (let i = 0; i < fishCount; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const delay = i * delayEach;
            const moveAction = new FishMoveActions(startPos);
            moveAction.appendAction(FISH_ACTION.Delay, { time: delay });
            moveAction.appendAction(FISH_ACTION.gfBezierBy, { time: moveInTime, points: points});
            if(i < fishCount1){
                // const circleCount = 30 / fishCount1;
                angleMove = 360 * circleCount - ( 360 / fishCount1);
                angleMove *= dir;
                const timeMoveCircle = 2 * Math.PI * radius2 / SPEED;
                const time = Math.abs(timeMoveCircle / 360 * angleMove);
                moveAction.appendAction(FISH_ACTION.CircleBy, {
                    time: subCircleData.timeMove, 
                    center:subCircleData.center, 
                    radius:subCircleData.radius, 
                    angle: subCircleData.angle * dir
                });
                moveAction.appendAction(FISH_ACTION.CircleBy, {
                    time: time,
                    center:center,
                    radius:radius2,
                    angle: angleMove
                });
                // moveAction.appendAction(FISH_ACTION.CircleBy, {
                //     time: time, 
                //     center:center, 
                //     radius:radius1, 
                //     angle: angleMove
                // });
            } else {
                // const circleCount = 30 / (fishCount - fishCount1);
                angleMove = 360 * circleCount - 1/4 * 360;
                angleMove *= dir;
                const timeMoveCircle = 2 * Math.PI * radius1 / SPEED;
                const time = Math.abs(timeMoveCircle / 360 * angleMove);
                moveAction.appendAction(FISH_ACTION.CircleBy, {
                    time: time, 
                    center:center, 
                    radius:radius1, 
                    angle: angleMove
                });
                const angle = 45;
                const outCircleRadius = AppSize.Width / 2 + 100;
                const outTime = 2 * Math.PI * outCircleRadius / SPEED;
                moveAction.appendAction(FISH_ACTION.CircleBy, {
                    time: 1/4 * outTime, 
                    center:cc.v2(-100, AppSize.Height/2), 
                    radius:outCircleRadius,
                    angle: angle * dir
                });
            }
            // if((isReverse && i >= fishCount1) || (!isReverse && i < fishCount1)){
            //     angleMove -= 180;
            // }
            // angleMove += i < fishCount1 ? -180 * dir : 180;
            // moveAction.appendAction(FISH_ACTION.MoveByDistance, {time: moveOutTime, distance: AppSize.Width, angle: (angleMove) * Math.PI / 180});
            // moveAction.appendAction(FISH_ACTION.CircleBy, {
            //     time: time, 
            //     center:center, 
            //     radius:radius1, 
            //     angle: angleMove
            // });
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            data.skipFlipY =true;
            FishGroupHelper.createFishWithDelay(data);
        }
    }

    static createMainFish(startPos, posMoveBy, endPos, moveInTime, delay1, delay2){
        const moveAction = new FishMoveActions(startPos);
        const data = FishGroupData.getNextFishData();
        moveAction.appendAction(FISH_ACTION.Delay, { time: delay1 });
        moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveInTime, x:posMoveBy.x, y: posMoveBy.y});
        moveAction.appendAction(FISH_ACTION.Delay, {time: delay2});
        moveAction.appendAction(FISH_ACTION.MoveBy, { time: Math.abs(endPos.x / 200), x:endPos.x, y: endPos.y});
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        data.skipFlipY =true;
        FishGroupHelper.createFishWithDelay(data);
    }
}

module.exports = gfFishGroup9;