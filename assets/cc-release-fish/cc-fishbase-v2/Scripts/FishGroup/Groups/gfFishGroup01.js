const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const { v2Distance } = require('gfUtilities');
const { randRange } = require('utils');


class gfFishGroup1 {

    static create() {
        const COUNT_FISH = {
            TOP_TOP: 17,
            BOTTOM_BOTTOM: 17,
            TOP_BOTTOM: 36,
            BOTTOM_TOP: 36,
        };
        const Speed = 41;
        const TotalTime = 63;
        const { AppSize } = GameConfig.instance;
        const flip = !FishGroupData.isFlipped();
        const CONFIG_LINE_FISH = [
            {
                posYStart: !flip ? -100 : (AppSize.Height + 100),
                posYEnd: !flip ? 100 : (AppSize.Height - 100),
                totalFish: COUNT_FISH.TOP_TOP,
                totalTime: TotalTime,
                angle: !flip ? 90 : -90,
            },
            {
                posYStart: !flip ? (AppSize.Height + 100) : -100,
                posYEnd: !flip ? (AppSize.Height - 100) : 100,
                totalFish: COUNT_FISH.BOTTOM_BOTTOM,
                totalTime: TotalTime,
                angle: !flip ? -90 : 90,
            },
            {
                posYStart: !flip ? -100 : (AppSize.Height + 100),
                posYEnd: !flip ? 150 : (AppSize.Height - 150),
                totalFish: COUNT_FISH.TOP_BOTTOM,
                totalTime: TotalTime,
                angle: !flip ? 90 : -90,
            },
            {
                posYStart: !flip ? (AppSize.Height + 100) : -100,
                posYEnd: !flip ? (AppSize.Height - 150) : 150,
                totalFish: COUNT_FISH.BOTTOM_TOP,
                totalTime: TotalTime,
                angle: !flip ? -90 : 90,
            },
        ];

        // Formation Fish
        for (let i = 0; i < 18; ++i) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const { posStart, posEnd } = this.calculatePosByPlayerIndexGroup1(i);
            const distance = v2Distance(posEnd, posStart);
            const baseMoveTime = distance / Speed;
            const delay = Math.max(0, -FishGroupData.timeSkipped);
            const movedTime = Math.max(0, FishGroupData.timeSkipped);
            const moveTime = Math.max(0, baseMoveTime - movedTime);
            data.moveTime = 63;
            data.fishPosition = cc.v2(0, 0);
            data.fishPosition.x = posStart.x + movedTime / baseMoveTime * (posEnd.x - posStart.x);
            data.fishPosition.y = posStart.y + movedTime / baseMoveTime * (posEnd.y - posStart.y);
            data.moveAction = cc.sequence(
                cc.delayTime(delay),
                cc.moveTo(moveTime, posEnd),
            );
            FishGroupHelper.createFishWithDelay(data);
        }

        // Line fish
        for (let i = 0; i < 4; i++) {
            const config = CONFIG_LINE_FISH[i];
            const offsetX = AppSize.Width / config.totalFish;
            const moveInTime = Math.max(0, 2 - FishGroupData.timeSkipped);
            const stayTime = Math.max(0, config.totalTime - Math.max(0, FishGroupData.timeSkipped - 2));
            const moveOutTime = Math.max(0, 3 - Math.max(0, FishGroupData.timeSkipped - config.totalTime));
            for (let i = 0; i < config.totalFish; ++i) {
                const fishData = FishGroupData.getNextFishData();
                if (!fishData) continue;
                const random = randRange(500, -500);
                const endPos = (config.angle === 90) ? cc.v2(random, 720) : cc.v2(random, -720);
                const posX = flip ? ((config.totalFish - i) * offsetX - offsetX / 2) : ((i) * offsetX + offsetX / 2);
                fishData.fishPosition = cc.v2(posX, config.posYStart);
                if (moveInTime <= 0) {
                    fishData.fishPosition = cc.v2(posX, config.posYEnd);
                }
                fishData.fishAngle = config.angle;
                fishData.moveTime = config.totalTime;
                fishData.moveAction = cc.sequence(
                    cc.moveTo(moveInTime, cc.v2(posX, config.posYEnd)),
                    cc.delayTime(stayTime),
                    cc.moveBy(randRange(moveOutTime * 10 - 5, moveOutTime * 10) / 10, endPos).easing(cc.easeOut(0.4)),
                );
                fishData.moveOutAction = cc.moveBy(randRange(25, 35) / 10, endPos).easing(cc.easeOut(0.4));
                FishGroupHelper.createFishWithDelay(fishData);
            }
        }
    }

    static calculatePosByPlayerIndexGroup1(indexFish) {
        const flip = !FishGroupData.isFlipped();
        const MaxSceneSize = 1560;
        const MaxSizeGroup = 1200;
        const FixDeltaX = 140;
        const OffsetX = [874, 1355, 1110, 1175, 1110, 550, 650, 650, 570, 570, 490, 490, 410, 410, 330, 330, 250, 250];
        const OffsetY = [385, 360, 443, 360, 266, 370, 510, 210, 510, 210, 510, 210, 510, 210, 510, 210, 510, 210];
        const FlipY = [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        const posStartX = flip ? (OffsetX[indexFish] - MaxSceneSize) : (2 * (MaxSceneSize - FixDeltaX) - OffsetX[indexFish]);
        const posStartY = flip ? (OffsetY[indexFish]) : (FlipY[indexFish] ? GameConfig.instance.AppSize.Height - OffsetY[indexFish] : OffsetY[indexFish]);
        const posStart = cc.v2(posStartX, posStartY);
        const posEnd = flip ? (cc.v2(posStartX + MaxSceneSize + MaxSizeGroup, posStartY)) : (cc.v2(posStartX - MaxSceneSize - MaxSizeGroup, posStartY));
        return { posStart, posEnd };
    }
}

module.exports = gfFishGroup1;