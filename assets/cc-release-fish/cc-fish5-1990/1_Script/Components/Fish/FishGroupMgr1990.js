

const { v2Distance } = require('gfUtilities');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const FishGroupData = require('gfFishGroupData');
const FishGroup7 = require('gfFishGroup07');
const FishGroup6 = require('gfFishGroup06');

cc.Class({
    extends: require('gfFishGroupMgr'),

    createFishGroup1(){
        const Speed = 41;
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
                cc.moveTo(moveTime, posEnd)
            );
            FishGroupHelper.createFishWithDelay(data);
        }
    },

    calculatePosByPlayerIndexGroup1(indexFish){
        const flip = !FishGroupData.isFlipped();
        const MaxSceneSize = 1560;
        const MaxSizeGroup = 1200;
        const FixDeltaX = 140;
        const OffsetX = [780, 1355, 1110, 1160, 1110, 410, 1000, 1000, 850, 850, 700, 700, 550, 550, 400, 400, 250, 250];
        const OffsetY = [360, 360, 463, 360, 246, 370, 560, 160, 560, 160, 560, 160, 560, 160, 560, 160, 560, 160];
        const FlipY = [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        const posStartX = flip ? (OffsetX[indexFish] - MaxSceneSize) : (2 * (MaxSceneSize - FixDeltaX) - OffsetX[indexFish]);
        const posStartY = flip ? (OffsetY[indexFish]) : (FlipY[indexFish] ? GameConfig.instance.AppSize.Height - OffsetY[indexFish] : OffsetY[indexFish]);
        const posStart = cc.v2(posStartX, posStartY);
        const posEnd = flip ? (cc.v2(posStartX + MaxSceneSize + MaxSizeGroup, posStartY)) : (cc.v2(posStartX - MaxSceneSize - MaxSizeGroup, posStartY));
        return { posStart, posEnd };
    },

    createFishGroup2(){
        FishGroup6.create();
    },

    createFishGroup3(){
        FishGroup7.create();
    },

});