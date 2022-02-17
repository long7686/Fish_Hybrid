const FishManager = require('gfFishManager');
const GameScheduler = require('gfGameScheduler');
const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const { v2Distance } = require('gfUtilities');
const FishStartDelay = 4;
const OutScreenPos = cc.v2(-1000, -1000);

class FishGroupHelper {

    constructor() {
        this.fishDelay = 0;
    }

    static get instance() {
        if (!this._instance) {
            this._instance = new FishGroupHelper();
        }
        return this._instance;
    }

    resetDelayCounting() {
        this.fishDelay = 0;
    }

    _getDelayTime() {
        return ++this.fishDelay / 100;
    }

    static initFishGroupData(data) {
        FishGroupHelper.instance.resetDelayCounting();
        FishGroupData.initData(data);
    }

    static createFishWithDelay(data) {
        const delay = this.getDelayTime();
        if (!data.isResume) {
            GameScheduler.scheduleOnce(() => {
                this.createAndRunFish(data, delay);
            }, delay);
        } else {
            this.createAndRunFish(data);
        }
    }

    static getDelayTime() {
        return FishGroupHelper.instance._getDelayTime();
    }

    static createAndRunFish(data, delay = -1) {
        const fish = FishManager.instance.createFishWithData(data);
        if (!fish) return;
        fish.moveTime = data.moveTime;
        fish.node.angle = data.fishAngle || 0;
        fish.node.setPosition(data.fishPosition);
        fish.moveAction = cc.sequence(
            data.moveAction,
            cc.callFunc(() => { fish.onDie(); }),
        );
        if (delay > -1) {
            fish.node.setPosition(OutScreenPos);
            fish.setDie(true);
            fish.node.runAction(cc.sequence(
                cc.delayTime(FishStartDelay - delay),
                cc.callFunc(() => {
                    fish.node.setPosition(data.fishPosition);
                    fish.setDie(false);
                    fish.node.runAction(fish.moveAction);
                    if (fish.checkFreezed()) {
                        fish.moveAction.speed(0.5);
                    }
                }),
            ));
        } else {
            fish.node.runAction(fish.moveAction);
        }
    }

    static createFishLine(fishCount, yCoord, space, speed, xOffset = 0) {
        const { AppSize } = GameConfig.instance;
        let LEFT = -200;
        let RIGHT = AppSize.Width + 500;
        if (FishGroupData.isFlipped()) {
            [LEFT, RIGHT] = [RIGHT, LEFT];
            yCoord = AppSize.Height - yCoord;
        }
        const distance = Math.abs(RIGHT - LEFT) + fishCount * space - xOffset;

        for (let i = 0; i < fishCount; ++i) {
            const startX = LEFT - (i * space - xOffset) * FishGroupData.flipCoord;
            this.createSimpleMovingFish(
                cc.v2(startX, yCoord),
                cc.v2(startX + distance * FishGroupData.flipCoord, yCoord),
                0,
                speed);
        }
    }

    static createSimpleMovingFish(startPos, destPos, baseDelay, speed) {
        const data = FishGroupData.getNextFishData();
        if (!data) return;
        data.fishPosition = startPos;
        const distance = v2Distance(destPos, startPos);
        const baseMoveTime = distance / speed;
        const delay = Math.max(0, baseDelay - FishGroupData.timeSkipped);
        const movedTime = Math.max(0, FishGroupData.timeSkipped - baseDelay);
        const moveTime = Math.max(0, baseMoveTime - movedTime);
        if (movedTime > 0) {
            data.fishPosition.x = startPos.x + movedTime / baseMoveTime * (destPos.x - startPos.x);
            data.fishPosition.y = startPos.y + movedTime / baseMoveTime * (destPos.y - startPos.y);
        }
        data.moveAction = cc.sequence(
            cc.delayTime(delay),
            cc.moveTo(moveTime, destPos)
        );
        FishGroupHelper.createFishWithDelay(data);
    }

    static convertFlipCoordinate(point) {
        if (FishGroupData.isFlipped()) {
            const { AppSize } = GameConfig.instance;
            return cc.v2(AppSize.Width - point.x, AppSize.Height - point.y);
        }
        return point;
    }
}

module.exports = FishGroupHelper;
