const FishGroupData = require('gfFishGroupData');
const GameConfig = require('gfBaseConfig');
const FishGroupHelper = require('gfFishGroupHelper');
const {FISH_ACTION, FishMoveActions} = require('gfFishMoveActions');

class gfFishGroup12 {

    static create() {
        const width = GameConfig.instance.AppSize.Width;
        const height = GameConfig.instance.AppSize.Height;
        const offset = 200;
        const botLeftToTopRight = [
            [cc.v2(0 - offset * 2, 0 + offset), cc.v2(width + offset * 1.5, height + offset)],
            [cc.v2(0 + offset, 0 - offset / 4), cc.v2(width - offset, height + offset)],
            [cc.v2(0 - offset * 1.5, 0 + offset / 4), cc.v2(width + offset, height + offset)],
            [cc.v2(0 - offset * 1.5, 0 - offset / 4), cc.v2(width + offset, height + offset)],
            [cc.v2(0 - offset * 1.5, 0), cc.v2(width + offset, height + offset)]
        ];

        botLeftToTopRight.fish30 = [cc.v2(0 - offset * 1.5, 0), cc.v2(width + offset, height + offset)];
        botLeftToTopRight.outLine = [cc.v2(0 - offset * 2, 0 + offset * 1.75), cc.v2(width + offset, height + offset)];

        const topRightToBotLeft = [
            [cc.v2(width + offset * 2, height - offset), cc.v2(-(width + offset * 1.5), -(height + offset))],
            [cc.v2(width - offset, height + offset / 4), cc.v2(-(width - offset), -(height + offset))],
            [cc.v2(width + offset * 1.5, height - offset / 4), cc.v2(-(width + offset), -(height + offset))],
            [cc.v2(width + offset * 1.5, height + offset / 4), cc.v2(-(width + offset), -(height + offset))],
            [cc.v2(width + offset * 1.5, height), cc.v2(-(width + offset), -(height + offset))]
        ];

        topRightToBotLeft.fish30 = [cc.v2(width + offset * 1.5, height), cc.v2(-(width + offset), -(height + offset))];
        topRightToBotLeft.outLine = [cc.v2(width + offset * 2, height - offset * 1.75), cc.v2(-(width + offset), -(height + offset))];

        const botRightToTopLeft = [
            [cc.v2(width + offset * 2, 0 + offset), cc.v2(-(width + offset * 1.5), (height + offset))],
            [cc.v2(width - offset, 0 - offset / 4), cc.v2(-(width - offset), height + offset)],
            [cc.v2(width + offset * 1.5, 0 + offset / 4), cc.v2(-(width + offset), height + offset)],
            [cc.v2(width + offset * 1.5, 0 - offset / 4), cc.v2(-(width + offset), height + offset)],
            [cc.v2(width + offset * 1.5, 0), cc.v2(-(width + offset), height + offset)]

        ];

        botRightToTopLeft.fish30 = [cc.v2(width + offset * 1.5, 0), cc.v2(-(width + offset), height + offset)];
        botRightToTopLeft.outLine = [cc.v2(width + offset * 2, 0 + offset * 1.75), cc.v2(-(width + offset), (height + offset))];

        const topLeftToBotRight = [
            [cc.v2(0 - offset * 2, height - offset), cc.v2((width + offset * 1.5), -(height + offset))],
            [cc.v2(0 + offset, height + offset / 4), cc.v2((width - offset), -(height + offset))],
            [cc.v2(0 - offset * 1.5, height + offset / 4), cc.v2((width + offset), -(height + offset))],
            [cc.v2(0 - offset * 1.5, height - offset / 4), cc.v2((width + offset), -(height + offset))],
            [cc.v2(0 - offset * 1.5, height), cc.v2((width + offset), -(height + offset))]
        ];

        topLeftToBotRight.fish30 = [cc.v2(0 - offset * 1.5, height), cc.v2((width + offset), -(height + offset))];
        topLeftToBotRight.outLine = [cc.v2(0 - offset * 2, height - offset * 1.75), cc.v2((width + offset), -(height + offset))];

        if (FishGroupData.isFlipped()) {
            this._flow(botRightToTopLeft, 0);
            this._flow(botLeftToTopRight, 20);
        }
        else{
            this._flow(topLeftToBotRight, 0);
            this._flow(topRightToBotLeft, 20);
        }

    }

    static _flow(config, timeFlow) {
        for (let i = 0; i < config.length; i++) {
            this._runFlow(config[i], timeFlow, i);
        }
        this._runFish30(config.fish30, timeFlow);
        this._runFish43(config.fish30, timeFlow);
        this._runFishOutLine(config.outLine, timeFlow);
    }

    static _runFishOutLine(flow, timeFlow) {
        for (let i = 0; i < 2; i++) {
            const data = FishGroupData.getNextFishData();
            if (!data) continue;
            const moveAction = new FishMoveActions(flow[0]);
            const timeLeft = Math.max(0, 20);
            let delay = i * 8 + timeFlow;
            const config = this.randomBenzierFish(flow[0], flow[1], 0.1);
            moveAction.appendAction(FISH_ACTION.Delay, {time: delay});
            moveAction.appendAction(FISH_ACTION.gfBezierBy, {
                time: timeLeft, points: config
            });
            data.moveAction = moveAction.getActions();
            data.fishPosition = moveAction.getStartPosition();
            FishGroupHelper.createFishWithDelay(data);
        }
    }

    static _runFish30(flow, timeFlow) {
        const data = FishGroupData.getNextFishData();
        if (!data) return;
        const moveAction = new FishMoveActions(flow[0]);
        const timeLeft = Math.max(0, 15);
        const config = this.randomBenzierFish(flow[0], flow[1], 0.1);
        moveAction.appendAction(FISH_ACTION.Delay, {time: 0 + timeFlow + 7});
        moveAction.appendAction(FISH_ACTION.gfBezierBy, {
            time: timeLeft, points: config
        });
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        FishGroupHelper.createFishWithDelay(data);
    }

    static _runFish43(flow, timeFlow) {
        const data = FishGroupData.getNextFishData();
        if (!data) return;
        const moveAction = new FishMoveActions(flow[0]);
        const timeLeft = Math.max(0, 15);
        const config = this.randomBenzierFish(flow[0], flow[1], 0.1);
        moveAction.appendAction(FISH_ACTION.Delay, {time: 0 + timeFlow + 8.5});
        moveAction.appendAction(FISH_ACTION.gfBezierBy, {
            time: timeLeft, points: config
        });
        data.moveAction = moveAction.getActions();
        data.fishPosition = moveAction.getStartPosition();
        FishGroupHelper.createFishWithDelay(data);
    }

    static _runFlow(flow, timeFlow, index) {
        let totalFish = index > 1 ? 18 : 16;
        if (index < 2) {
            for (let i = 0; i < 8; i++) {
                const data = FishGroupData.getNextFishData();
                if (!data) continue;
                const moveAction = new FishMoveActions(flow[0]);
                let delay = i * 2 + timeFlow;
                const timeLeft = Math.max(0, 15);
                const config = this.randomBenzierFish(flow[0], flow[1], 0.1);
                moveAction.appendAction(FISH_ACTION.Delay, {time: delay});
                moveAction.appendAction(FISH_ACTION.gfBezierBy, {
                    time: timeLeft, points: config
                });
                data.moveAction = moveAction.getActions();
                data.fishPosition = moveAction.getStartPosition();
                FishGroupHelper.createFishWithDelay(data);
            }

            for (let i = 0; i < 8; i++) {
                const data = FishGroupData.getNextFishData();
                if (!data) continue;
                const moveAction = new FishMoveActions(flow[0]);
                let delay = (i + 0.65) * 2 + timeFlow;
                const timeLeft = Math.max(0, 15);
                const config = this.randomBenzierFish(flow[0], flow[1], 0.1);
                moveAction.appendAction(FISH_ACTION.Delay, {time: delay});
                moveAction.appendAction(FISH_ACTION.gfBezierBy, {
                    time: timeLeft, points: config
                });
                data.moveAction = moveAction.getActions();
                data.fishPosition = moveAction.getStartPosition();
                FishGroupHelper.createFishWithDelay(data);
            }
        }
        else {
            for (let i = 0; i < totalFish; i++) {
                const data = FishGroupData.getNextFishData();
                if (!data) continue;
                const moveAction = new FishMoveActions(flow[0]);
                let delay = i * 0.75 + timeFlow;
                const timeLeft = Math.max(0, 15);
                const config = this.randomBenzierFish(flow[0], flow[1], 0.1);
                if (i > 8) {
                    delay += 2.5;
                }
                moveAction.appendAction(FISH_ACTION.Delay, {time: delay});
                moveAction.appendAction(FISH_ACTION.gfBezierBy, {
                    time: timeLeft, points: config
                });
                data.moveAction = moveAction.getActions();
                data.fishPosition = moveAction.getStartPosition();
                FishGroupHelper.createFishWithDelay(data);
            }
        }
    }

    static randomBenzierFish(beganPos, endPos, radio) {
        const midPos = cc.v2(endPos.x, 0 + (0 - endPos.y) * (radio / 10));
        const bezierConfig = [
            cc.v2(0, 0),
            midPos,
            endPos,
        ];
        return bezierConfig;
    }
}


module.exports = gfFishGroup12;