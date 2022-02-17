const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');

class gfFishGroup4 {

    static create() { //  Two group make a cross.
        const width = GameConfig.instance.AppSize.Width;
        const height = GameConfig.instance.AppSize.Height;
        const offset = 150;

        const line1 = [cc.v2(0 - offset * 2, 0 - offset), cc.v2(width, height + offset)]; // [0,0] => [1,1]
        const line2 = [cc.v2(0, 0 - offset), cc.v2(width + offset * 2, height + offset)]; // [0,0] => [1,1]
        const line3 = [cc.v2(width, 0 - offset), cc.v2(0 - offset * 2, height + offset)]; // [1,0] => [0,1]
        const line4 = [cc.v2(width + offset * 2, 0 - offset), cc.v2(0, height + offset)]; // [1,0] => [0,1]

        const idx0 = FishGroupData.isFlipped() ? 1 : 0;
        const idx1 = FishGroupData.isFlipped() ? 0 : 1;
        const roadMap = [
            [line1[idx0], line1[idx1]],
            [line2[idx0], line2[idx1]],
            [line3[idx0], line3[idx1]],
            [line4[idx0], line4[idx1]],
            [line2[idx1], line2[idx0]],
            [line1[idx1], line1[idx0]],
            [line4[idx1], line4[idx0]],
            [line3[idx1], line3[idx0]],
        ];

        const delayEach = 2.5;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; ++j) {
                const fishInfo = FishGroupData.getNextFishData();
                if (!fishInfo) continue;
                const timeSpent = FishGroupData.timeSkipped - fishInfo.TimeFreeze;
                fishInfo.fishPosition = cc.v2(roadMap[i][0].x, roadMap[i][0].y);
                const movedTime = Math.max(0, timeSpent - j * delayEach);
                const timeLeft = Math.max(0, 20 - movedTime);
                fishInfo.fishPosition.x = roadMap[i][0].x + movedTime / 20 * (roadMap[i][1].x - roadMap[i][0].x);
                fishInfo.fishPosition.y = roadMap[i][0].y + movedTime / 20 * (roadMap[i][1].y - roadMap[i][0].y);
                fishInfo.moveAction = cc.sequence(
                    cc.delayTime(Math.max(0, j * delayEach - timeSpent)),
                    cc.moveTo(timeLeft, roadMap[i][1]),
                );
                FishGroupHelper.createFishWithDelay(fishInfo);
            }
        }
    }
}

module.exports = gfFishGroup4;