

const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

const rotateTime = 3;
cc.Class({
    extends: require('gfNode'),
    properties: {
        circle1Node: cc.Node,
        numberNode: cc.Node,
        multiNode: [cc.Node],
        multiBright: [cc.Node],
        pinNode: cc.Node,
        glow: cc.Node,
    },

    initData(data){
        this.multiNodePosition = [];
        this.multiNode.forEach(element => {
            this.multiNodePosition.push(cc.v2(element.position));
        });

        for(let i = 0; i < this.multiNode.length; ++i) {
            this.multiNode[i].scale = 1;
            this.multiNode[i].opacity = 255;
            this.multiNode[i].position = this.multiNodePosition[i];
    
            this.multiBright[i].scale = 1;
            this.multiBright[i].opacity = 0;
        } 
        cc.tween(this.circle1Node).by(rotateTime, {angle: 360 * 4}).repeatForever().start();
        this.playEffect(data);   
    },

    playEffect(data){
        let multiplier = data.Multiplier;
        const result = multiplier - 2;
        const showTime = 0.5;
        const fadeTime = 0.2;

        this.numberNode.angle = result * 90;

        cc.tween(this.numberNode).by(rotateTime, {angle: -360 * 3, opacity: 255}, {easing: "cubicOut"}).start();
        cc.tween(this.node)
            .to(showTime, {scale: 1})
            .delay(rotateTime - showTime)
            .call(()=>{
                const resultPos = this.circle1Node.parent.convertToNodeSpaceAR(this.multiNode[result].convertToWorldSpaceAR(cc.v2(0, 0)));
                this.glow.setPosition(resultPos);
                cc.tween(this.glow)
                    .delay(fadeTime)
                    .call(()=>{
                        this.glow.opacity = 255;
                    })
                    .to(fadeTime, {scale: 2})
                    .to(showTime, {scale: 3, opacity: 0})
                    .start();
                cc.tween(this.circle1Node)
                    .to(fadeTime, {scale: 0.38, position: resultPos})
                    .delay(fadeTime * 2)
                    .to(showTime * 2, {scale: 0.76})
                    .to(fadeTime, {scale: 1, opacity: 0})
                    .start();
                cc.tween(this.pinNode).to(0.5, {opacity: 0}).start();
                cc.tween(this.multiNode[result])
                    .delay(fadeTime)
                    .to(fadeTime, {scale: 2})
                    .to(fadeTime, {scale: 1})
                    .call(()=>{
                        cc.tween(this.multiBright[result])
                            .to(fadeTime, {opacity: 255})
                            .start();
                    })
                    .to(showTime * 2, {scale: 2})
                    .to(fadeTime, {scale: 4, opacity: 0})
                    .call(()=>{ 
                        //Emit play done
                        Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_LUCKY_EFFECT_DONE, data);
                        this.returnPool();
                    })
                    .start();
                
                for(let i = 0; i < this.multiNode.length; ++i) {
                    if(i != result) {
                        cc.tween(this.multiNode[i]).to(fadeTime, {opacity: 0}).start();
                    }
                }
            })
            .start();
    },

    update () {
        this.multiNode.forEach(element => {
            element.angle = -this.numberNode.angle;
        });
    },

    //Called whenever object is get from Object Pool
    reuse(poolMng) {
        this._super(poolMng);
    },

    //Called whenever object is returned to Object Pool
    unuse() {
        this.numberNode.opacity = 0;
        this.circle1Node.stopAllActions();
        this.circle1Node.scale = 1;
        this.circle1Node.position = cc.v2(0, 0);
        this.circle1Node.opacity = 255;
        this.glow.opacity = 0;
        this.glow.scale = 1;
        this.pinNode.opacity = 255;
        this._super();
    }
});
