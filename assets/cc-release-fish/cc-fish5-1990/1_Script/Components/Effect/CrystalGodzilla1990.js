const { isPointInScreen } = require('gfUtilities');
const GameConfig = require('Config1990');

cc.Class({
    extends: cc.Component,

    properties: {
        mainItem: cc.Node,
        eff1: cc.Node,
    },

    onLoad() {
        this.node.flyGemToPlayer = this.flyGemToPlayer.bind(this);
    },
    flyGemToPlayer(pos, callback) {
        this.mainItem.scale = 0;
        this.eff1.scale = 0;
        this.eff1.opacity = 0;
        const appearTime = 0.25;
        const moveTime = 0.5;
        const standTime = 0.75;
        const dest = this.calculateMovePoint();
        const tweenEffect = cc.tween(this.eff1)
            .to(appearTime, { scale: 1.2, opacity: 255 });
        const tweenMainItem = cc.tween(this.mainItem)
            .to(appearTime, { scale: 2 });
        const tweenEffect2 = cc.tween(this.eff1)
            .to(moveTime, { scale: 0.6});
        const tweenMainItem2 = cc.tween(this.mainItem)
            .to(moveTime, { scale: 1 });
        cc.tween(this.node)
            .parallel(
                cc.tween()
                    .call(() => {
                        tweenEffect.start();
                        tweenMainItem.start();
                    }),
                cc.tween()
                    .to(appearTime, { position: dest }),
            )
            .delay(standTime)
            .call(() => {
                tweenEffect2.start();
                tweenMainItem2.start();
            })
            .to(moveTime, { position: pos }, { easing: "cubicOut" })
            .call(() => {
                callback();
                if(cc.isValid(this.node))
                    this.node.destroy();
            })
            .start();
    },
    calculateMovePoint(){
        let x = this.node.x;
        let y = this.node.y;

        let pos = cc.v2(this.node.x, GameConfig.instance.AppSize.Height / 2);

        while(!isPointInScreen(pos)){
            pos.x = pos.x < GameConfig.instance.AppSize.Width / 2 ? pos.x + 150 : pos.x - 150;
        }
        x = pos.x;
        pos = cc.v2(GameConfig.instance.AppSize.Width / 2, this.node.y);

        while(!isPointInScreen(pos)){
            pos.y = pos.y < GameConfig.instance.AppSize.Height / 2 ? pos.y + 150 : pos.y - 150;
        }
        return cc.v2(x,y);
    }
});
