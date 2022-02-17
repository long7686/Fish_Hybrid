const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { FISH_ACTION, FishMoveActions } = require('gfFishMoveActions');
const { randRange } = require('utils');

class gfFishGroup16 {

    static create() {

        const COUNT_FISH = {
            TOP_BOTTOM: 20,
            TOP_TOP: 9,
            TOP_TOP_SUB: 8,
            BOTTOM_BOTTOM_SUB: 8,
            BOTTOM_BOTTOM: 9,
            BOTTOM_TOP: 20,
        };
        const TotalTime = 35;
        const { AppSize } = GameConfig.instance;
        const flip = !FishGroupData.isFlipped();
        const CONFIG_LINE_FISH = [
            {
                posYStart: !flip ? -120 : (AppSize.Height + 120),
                posYEnd: !flip ? 150 : (AppSize.Height - 150),
                totalFish: COUNT_FISH.TOP_BOTTOM,
                totalTime: TotalTime,
                angle: !flip ? 90 : -90,
            },
            {
                posYStart: !flip ? (AppSize.Height + 120) : -120,
                posYEnd: !flip ? (AppSize.Height - 150) : 150,
                totalFish: COUNT_FISH.BOTTOM_TOP,
                totalTime: TotalTime,
                angle: !flip ? -90 : 90,
            },
            {
                posYStart: !flip ? -120 : (AppSize.Height + 120),
                posYEnd: !flip ? 100 : (AppSize.Height - 100),
                totalFish: COUNT_FISH.TOP_TOP,
                totalTime: TotalTime,
                angle: !flip ? 90 : -90,
            },
            {
                posYStart: !flip ? (AppSize.Height + 120) : -120,
                posYEnd: !flip ? (AppSize.Height - 100) : 100,
                totalFish: COUNT_FISH.BOTTOM_BOTTOM,
                totalTime: TotalTime,
                angle: !flip ? -90 : 90,
            },
            {
                posYStart: !flip ? -120 : (AppSize.Height + 120),
                posYEnd: !flip ? 100 : (AppSize.Height - 100),
                totalFish: COUNT_FISH.TOP_TOP_SUB,
                totalTime: TotalTime,
                angle: !flip ? 90 : -90,
            },
            {
                posYStart: !flip ? (AppSize.Height + 120) : -120,
                posYEnd: !flip ? (AppSize.Height - 100) : 100,
                totalFish: COUNT_FISH.BOTTOM_BOTTOM_SUB,
                totalTime: TotalTime,
                angle: !flip ? -90 : 90,
            },
           
        ];

        const yPos = GameConfig.instance.AppSize.Height / 2;
        let left = -400;
        let right = GameConfig.instance.AppSize.Width - left;
        if (FishGroupData.isFlipped()) {
            [left, right] = [right, - right];
        }
        const fishSpeed = 90;

        //Leader
        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 0.0
        });

        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos + 100), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 4.3
        });

        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 2.9
        });

        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos - 100), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 4.3
        });

        //Selena
        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 6.1
        });
        //Khoan  
        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos + 98), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 9.1, distanceTime : 1.9
        });
        //Gian
        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos - 98), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 9.1, distanceTime : 1.9
        });
       
        this.createLineFishGroup({
            count: 1, startPos: cc.v2(left, yPos), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 11.2
        });

        this.createLineFishGroup({
            count: 6, startPos: cc.v2(left, yPos + 120), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 12.9, distanceTime : 1.0
        });

        this.createLineFishGroup({
            count: 6, startPos: cc.v2(left, yPos), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 12.9, distanceTime : 1.0
        });

        this.createLineFishGroup({
            count: 6, startPos: cc.v2(left, yPos - 120), isMoveRight: true, distanceX: right, fishSpeed: fishSpeed, delayTime : 12.9, distanceTime : 1.0
        });

        //Line fish
        for (let i = 0; i < 4; i++) {
            const config = CONFIG_LINE_FISH[i];
            this.createMiniLineFishGroup(AppSize, flip, config);           
        }
       
    }

    static createMiniLineFishGroup(AppSize, flip, config) {

        const offsetX = AppSize.Width / config.totalFish;
        const moveInTime = 2.0;
        const stayTime =  config.totalTime;
        const moveOutTime = 3.0;
        for (let i = 0; i < config.totalFish; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const random = randRange(500, -500);
            const endPos = (config.angle === 90) ? cc.v2(random, 720) : cc.v2(random, -720);
            let posX = flip ? ((config.totalFish - i) * offsetX - offsetX / 2) : ((i) * offsetX + offsetX / 2);
            let startPos = cc.v2(posX, config.posYStart);
            if (moveInTime <= 0) {
                startPos = cc.v2(posX, config.posYEnd);
            }
            const moveAction = new FishMoveActions(startPos);
            const distanceY = config.posYEnd - startPos.y;
            moveAction.appendAction(FISH_ACTION.MoveBy, { time: moveInTime, x: 0, y:  distanceY});
            moveAction.appendAction(FISH_ACTION.Delay, { time: stayTime });
            const timeMove = randRange(moveOutTime * 10 - 5, moveOutTime * 10) / 10;
            moveAction.appendAction(FISH_ACTION.MoveBy, { time: timeMove, x: 0, y: endPos.y, motion : cc.easeOut(0.4)});

            data.fishAngle = config.angle;
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            FishGroupHelper.createFishWithDelay(data);

        }
    }

    static createLineFishGroup({
        count, startPos, distanceX, fishSpeed, delayTime, distanceTime }) {
        if(!distanceTime) {
            distanceTime = 0;
        }
        const { AppSize } = GameConfig.instance;
        let center = cc.v2(AppSize.Width / 2, AppSize.Height / 2);
        const dir = center.x > startPos.x ? 1 : -1;
        const moveInTime = Math.abs(distanceX) / fishSpeed;
        for (let i = 0; i < count; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const delay = i * distanceTime + delayTime;
            const moveAction = new FishMoveActions(startPos);
            moveAction.appendAction(FISH_ACTION.Delay, { time: delay });
            moveAction.appendAction(FISH_ACTION.MoveBy, {
                time: moveInTime, x : distanceX + (200 * dir), y : 0
            });
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            FishGroupHelper.createFishWithDelay(data);
        }
    }


}
module.exports = gfFishGroup16;