const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');

class gfFishGroup6 {

    static create() {
        const fishCount = [20, 20, 20, 12, 12, 6, 1, 1];
        //const fishKind = [13, 3, 4, 15, 3, 5, 25, 43];
        //Duration : 59

        const { Height } = GameConfig.instance.AppSize;
        const Y1 = 150;
        const Y2 = Y1 + 20;
        const Y3 = Y2 + 20;
        const Y4 = Y3 + 50;
        const Y5 = Y4 + 50;
        const Y6 = 360;
        const outerSpace = 210;
        const space = 150;
        const speed = 83;

        //2 side line
        FishGroupHelper.createFishLine(fishCount[0] / 2, Y1, outerSpace, speed);
        FishGroupHelper.createFishLine(fishCount[0] / 2, Height - Y1, outerSpace, speed);
        FishGroupHelper.createFishLine(fishCount[1] / 2, Y2, outerSpace, speed, -outerSpace / 2);
        FishGroupHelper.createFishLine(fishCount[1] / 2, Height - Y2, outerSpace, speed, -outerSpace / 2);
        FishGroupHelper.createFishLine(fishCount[2] / 2, Y3, outerSpace, speed);
        FishGroupHelper.createFishLine(fishCount[2] / 2, Height - Y3, outerSpace, speed);

        //3 group in middle
        for (let i = 0; i < 2; ++i) {
            const count = fishCount[3] / 4;
            const xOffset = -i * 2 * space * count;
            FishGroupHelper.createFishLine(count, Y4, space, speed, xOffset);
            FishGroupHelper.createFishLine(count, Height - Y4, space, speed, xOffset);
        }

        for (let i = 0; i < 2; ++i) {
            const count = fishCount[4] / 4;
            const xOffset = -i * 2 * space * count;
            FishGroupHelper.createFishLine(count, Y5, space, speed, xOffset);
            FishGroupHelper.createFishLine(count, Height - Y5, space, speed, xOffset);
        }

        for (let i = 0; i < 2; ++i) {
            const count = fishCount[5] / 2;
            const xOffset = -i * 2 * space * count;
            FishGroupHelper.createFishLine(count, Y6, space, speed, xOffset);
        }

        //big fishes
        const bigSpace = space * fishCount[3] / 4;
        FishGroupHelper.createFishLine(1, Y6, 0, speed, -bigSpace * 1.5);
        FishGroupHelper.createFishLine(1, Y6, 0, speed, -bigSpace * 3.5);
    }
}

module.exports = gfFishGroup6;