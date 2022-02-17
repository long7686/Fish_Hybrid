// const Emitter = require('gfEventEmitter');
const EventCode = require("EventsCode1990");
const { registerEvent, removeEvents } = require("gfUtilities");
const TIMELINE_WARNING = 5;
cc.Class({
    extends: require("gfJackpotInfo"),
    properties: {
        _isWarned: false
    },

    onLoad(){
        this._super();
        this.jackpotAnim.setAnimation(0, "animation", false);
        this.jackpotAnim.clearTracks();
    },

    initEvents() {
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.COMMON.UPDATE_JACKPOT, this.onUpdateRoomJackpot, this);
        registerEvent(EventCode.GAME_LAYER.SHOW_JACKPOT_INFO, this.onShowJackpotInfo, this);
        registerEvent(EventCode.COMMON.GAME_SHOW, this.resetOnExit, this);
        registerEvent(EventCode.GODZILLA.STATE_GODZILLA, this.onSetColorHaveBoss, this);
        registerEvent(EventCode.DRAGON.WARNING, this.onDragonWarning, this);
        registerEvent(EventCode.GODZILLA.GODZILLA_SCREAM, this.playEffectSpeedUpOscillation, this);
    },

    onDragonWarning(timeRemain){ //data:{BuildTick: ...};
        const delayTime = timeRemain - TIMELINE_WARNING;
        this.txtValue.stopAllActions();
        cc.tween(this.txtValue)
            .delay(delayTime)
            .to(0.5, {opacity: 0})
            .call(()=>{
                this.jackpotAnim.setCompleteListener(()=>{
                    this.jackpotAnim.setCompleteListener(()=>{});
                    cc.tween(this.txtValue)
                        .to(0.5, {opacity: 255})
                        .start();
                });
                this.jackpotAnim.setAnimation(0, "animation", false);
            })
            .start();

        // const color = cc.Color.WHITE;
        // const delay1 = timeRemain - TIMELINE_WARNING[0];
        // timeRemain -= delay1;
        // const delay2 = timeRemain - TIMELINE_WARNING[1];
        // timeRemain -= delay2;
        // this.tweenWarning = cc.tween(this.node)
        //     .delay(delay1 > 0 ? delay1 : 0)
        //     .call(()=>{
        //         if(delay1 > 0){
        //             //play animation mix, then change to orange
        //             this.jackpotAnim.setAnimation(0, "ECG_Mix", false);
        //             this.jackpotAnim.addAnimation(0, "ECG_Orange", true);
        //             this.txtValue.color = color.fromHEX(COLOR_ORANGE);
        //             //also play sound with volume 0.2
        //             Emitter.instance.emit(EventCode.SOUND.DRAGON_APPEAR, 0.2);
        //             //change back to green after end sound 0.5s
        //             let callback = ()=>{
        //                 this.jackpotAnim.setAnimation(0, "ECG_Mix", false);
        //                 this.jackpotAnim.addAnimation(0, "ECG_Green", true);
        //                 this.txtValue.color = color.fromHEX(COLOR_DEFAULT);
        //             };
        //             this.playEffectSpeedUpOscillation({callback});
        //         }
        //     })
        //     .delay(delay2)
        //     .call(()=>{
        //         if(delay2 > 0){
        //             //shake screen slightly
        //             Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.05, amplitude: 5 });
        //             //also play sound with volume 0.6
        //             Emitter.instance.emit(EventCode.SOUND.DRAGON_APPEAR, 0.6);
        //             //play animation mix
        //             this.jackpotAnim.setAnimation(0, "ECG_Mix", false);
        //             this.txtValue.color = color.fromHEX(COLOR_ORANGE);
        //             this.jackpotAnim.setCompleteListener(()=>{
        //                 this.jackpotAnim.timeScale = 1.5;
        //             });
        //             //play animation orange with timescale 1.5
        //             this.jackpotAnim.addAnimation(0, "ECG_Orange", true);
        //             //change back to green after end sound 0.5s
        //             let callback = ()=>{
        //                 this.jackpotAnim.setAnimation(0, "ECG_Mix", false);
        //                 this.jackpotAnim.addAnimation(0, "ECG_Green", true);
        //                 this.txtValue.color = color.fromHEX(COLOR_DEFAULT);
        //                 this.jackpotAnim.setCompleteListener(()=>{});
        //             };
        //             this.playEffectSpeedUpOscillation({callback});
        //         }
        //     })
        //     .delay(timeRemain)
        //     .call(()=>{
        //         if(timeRemain < 0) {
        //             cc.error('Wrong timeRemain, double check');
        //         } else {
        //             //shake screen strong
        //             Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.1, amplitude: 15 });
        //             //also play sound with volume 1.2
        //             Emitter.instance.emit(EventCode.SOUND.DRAGON_APPEAR, 1.2);
        //             this.jackpotAnim.setAnimation(0, "ECG_Mix", false);
        //             this.jackpotAnim.addAnimation(0, "ECG_Red", true);
        //             this.txtValue.color = color.fromHEX(COLOR_RED);
        //         }
        //     });
        // this.tweenWarning.start();
    },

    playEffectSpeedUpOscillation({callback, timeScale = 1}){
        // this.jackpotAnim.timeScale = timeScale;
        // cc.tween(this.node)
        //     .delay(DURATION_GODZILLA_SCREAM)
        //     .call(()=>{
        //         this.jackpotAnim.timeScale = 1;
        //         if(typeof callback == 'function') callback();
        //     })
        //     .start();
    },

    onSetColorHaveBoss(isHaveBoss){
        // const color = cc.Color.WHITE;
        // this.txtValue.color = isHaveBoss ? color.fromHEX(COLOR_RED) : color.fromHEX(COLOR_DEFAULT);
        // const animName = isHaveBoss ? "ECG_Red" : "ECG_Green";
        // this.jackpotAnim.setAnimation(0, "ECG_Mix", false);
        // this.jackpotAnim.addAnimation(0, animName, true);
    },

    onUpdateRoomJackpot(amount){
        if(amount && this.node.active){
            const newJP = parseInt(amount);
            this.txtValue.onUpdateValue(newJP, 3000);
        }
    },

    resetOnExit() {
        // this._super();
        // this.node.stopAllActions();
        // if(this.node.active){
        //     const color = cc.Color.WHITE;
        //     this.txtValue.color = color.fromHEX(COLOR_DEFAULT);
        //     this.jackpotAnim.setAnimation(0, "ECG_Green", true);
        // }
    },

    onDestroy() {
        this._super();
        removeEvents(this);
    },
});
