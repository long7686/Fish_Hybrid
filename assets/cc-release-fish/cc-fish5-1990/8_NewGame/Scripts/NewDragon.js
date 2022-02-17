const EventCode = require("EventsCode1990");
const Emitter = require('gfEventEmitter');
const ReferenceManager = require('gfReferenceManager');
cc.Class({
    extends: require("gfDragon"),

    initFishData(data){
        this._super(data);
    },

    onHitState(data){
        const {TypeWin, WinAmount, GodzillaState, BulletMultiple, DeskStation, ListFish} = data;
        this._oldState = this._state;
        this._state = GodzillaState;
        switch(TypeWin){
            case 0: //normal hit
                break;
            case 1: //drop crystal
                this.playDropCrystal(data);
                break;
            case 2: //Jackpot
                this.onCatch(data);
                
                break;
            case 3: //Plasma
            {
                const bodyPos = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length / 5 | 0].offset);
                const dataReward = {
                    ListFish,
                    WinAmount,
                    DeskStation,
                    BulletMultiple,
                    EffectPos: bodyPos
                };
                Emitter.instance.emit(EventCode.GODZILLA.GODZILLA_PLASMA_EFFECT, dataReward);
                Emitter.instance.emit(EventCode.SOUND.GODZILLA_PLASMA);
                break;
            }
            default:
                break;
        }
    },

    playDropCrystal(data){
        const {DeskStation, WinAmount, Wallet, BulletMultiple} = data;
        const dataInput = {
            BulletMultiple,
            DeskStation: DeskStation,
            FishID: this._FishID,
            GoldReward: WinAmount,
            Wallet: Wallet
        };

        const worldPos = this.node.convertToWorldSpaceAR(this.listBox[0].offset);

        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        Emitter.instance.emit(EventCode.DRAGON.DROP_BALL);
        Emitter.instance.emit(EventCode.GODZILLA.GODZILLA_DROP_CRYSTAL, {
            data: dataInput,
            worldPos,
            player,
            GoldReward: WinAmount
        });
    },

    playPlasmaEffect(callback){
        if(this._colorTween && !this._colorTween.isDone()){
            this._colorTween.stop();
            this._colorTween = null;
            this._mainMaterial.setProperty('brightness', 0.0);
        }
        if(!this._plasmaTween || this._plasmaTween.isDone()) {
            // const curAnimTime = this.curAnimTime;
            const duration = 1;
            let isRed = (this._oldState!==5) ? 1 : 0; //should be is not red
            this._plasmaTween =  cc.tween(this.fishAnim)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.15);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.3);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.45);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.6);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.75);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 0.9);
                })
                .delay(0.05 * isRed)
                .call(()=>{
                    if(isRed)
                        this._mainMaterial.setProperty('brightness', 1);
                })
                .call(() => {
                    if(isRed) {
                        if (cc.sys.isNative) {
                            this.fishAnim.useTint = true;
                            this.fishAnim.setToSetupPose();
                        }
                        // this.startMoving();
                    }
                })
                .delay(0.1 * isRed)
                .call(()=>{
                    if(isRed) {
                        this._mainMaterial.setProperty('brightness', 0.6);
                    }
                })
                .delay(0.025 * isRed)
                .call(()=>{
                    if(isRed) {
                        this._mainMaterial.setProperty('brightness', 0.3);
                    }
                })
                .delay(0.025 * isRed)
                .call(()=>{
                    this._mainMaterial.setProperty('brightness', 0);
                })

                .delay(duration*0.75)
                .call(()=>{
                    callback();
                })
                .delay(1)
                .call(()=>{
                    this.changeColor();
                })
                .start();
        } else {
            callback();
        }
    },

    onCatch(data) {
        this._isDie = true;
        Emitter.instance.emit(EventCode.SOUND.DRAGON_DIE);
        this.playEffectDie(data);
    },

    playEffectDie(data) {
        data.EffectPos = this.node.convertToWorldSpaceAR(this.listBox[this.listBox.length / 5 | 0].offset);
        this.unschedule(this.checkOutScreen);
        this.fishAnim.timeScale = 0;
        this.fishAnim.node.stopAllActions();
        this.fishAnim.setCompleteListener(() => { });
        this.fishAnim.clearTrack(0);

        const explBones = [0, 14, 6, 17, 9];
        const explPositions = [];
        for (let i = 0; i < explBones.length; ++i) {
            explPositions.push(this.node.convertToWorldSpaceAR(cc.v2(this.bone[explBones[i]].worldX, this.bone[explBones[i]].worldY)));
        }
        Emitter.instance.emit(EventCode.DRAGON.SMALL_EXPLOSION, explPositions);

        cc.tween(this.fishAnim.node)
            .by(0.1, { x: 0, y: 10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 10, y: 10 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: 10, y: 0 })
            .by(0.1, { x: 0, y: 10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 0, y: -10 })
            .by(0.1, { x: 10, y: 10 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: -10, y: 0 })
            .by(0.1, { x: 10, y: 0 })
            .call(()=>{
                Emitter.instance.emit(EventCode.EFFECT_LAYER.SHOW_POPUP_WIN_JACKPOT, data);
            })
            .start();

        this.fishAnim.node.color = cc.Color.RED;
        const blinkRed = cc.sequence(
            cc.tintTo(0.15, 255, 0, 0),
            cc.delayTime(0.35),
            cc.tintTo(0.15, 255, 255, 255),
            cc.delayTime(0.35),
        ).repeat(3);

        this.fishAnim.node.runAction(cc.sequence(
            blinkRed,
            cc.callFunc(() => {
                Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.1, amplitude: 10 });
                Emitter.instance.emit(EventCode.DRAGON.BIG_EXPLOSION, this.node.convertToWorldSpaceAR(this.listBox[8].offset));
            }),
            cc.fadeOut(0.1),
            cc.delayTime(0.75),
            cc.callFunc(() => {
                this.onDie();
            }),
        ));
    },
});
