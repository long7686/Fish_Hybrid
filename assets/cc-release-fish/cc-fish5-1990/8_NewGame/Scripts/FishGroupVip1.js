const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const SPEED = 75;
class FishGroup02 {
    static mutiLine({amountLine, fishPerLine, spaceFish, spaceLine, startY, xOffset}){
        if(!spaceFish){
            spaceFish = 0;
        }
        for(let i = 0; i < amountLine; ++i){
            const posY = startY + (spaceLine * i);
            FishGroupHelper.createFishLine(fishPerLine, posY, spaceFish , SPEED, xOffset);
        }
    }

    static create() {
        const center = GameConfig.instance.SceneBox.Top / 2;

        const padY1 = 150;
        const amountLine1 = 2;
        const spaceLine1 = (GameConfig.instance.SceneBox.Top - (2 * padY1))/(amountLine1 - 1);
        const xOffset1 = -150;

        const padY2 = 220;
        const amountLine2 = 2;
        const spaceLine2 = (GameConfig.instance.SceneBox.Top - (2 * padY2))/(amountLine2 - 1);
        const xOffset2 = -220;

        const amountLine3 = 6;
        const spaceLine3 = (GameConfig.instance.SceneBox.Top - (2 * padY2))/(amountLine3 - 1);
        const xOffset3 = -1000;

        FishGroupHelper.createFishLine(1, center, 0 , SPEED);
        this.mutiLine({amountLine: amountLine1, fishPerLine: 1, spaceLine: spaceLine1, startY: padY1, xOffset: xOffset1});
        this.mutiLine({amountLine: amountLine2, fishPerLine: 6, spaceFish: 130, spaceLine: spaceLine2, startY: padY2, xOffset: xOffset2});
        FishGroupHelper.createFishLine(3, center, 330, SPEED, xOffset2);
        FishGroupHelper.createFishLine(2, center, 335, SPEED, xOffset2 - 125);
        this.mutiLine({amountLine: amountLine3, fishPerLine: 6, spaceFish: 75, spaceLine: spaceLine3, startY: padY2, xOffset: xOffset3});
    }

}

module.exports = FishGroup02;