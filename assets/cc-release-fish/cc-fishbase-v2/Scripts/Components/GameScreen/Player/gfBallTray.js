

const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");
cc.Class({
    extends: cc.Component,

    properties: {
        trayGlowFX: cc.Node,
        bodySpine: sp.Skeleton,
        slot7FX: cc.Node,
        electroEffect: cc.Node,
        ballHolder: [cc.Node],
        _ballInTray: 0,
        _isActive: false
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        this.bodySpine.node.opacity = 0;
        this.slot7FX.opacity = 0;
        this.slot7FX.active = false;
        this.trayGlowFX.active = false;
    },

    appear(){
        if(this._isActive) return;
        this._isActive = true;
        this.node.active = true;
        this.bodySpine.node.opacity = 255;
        this.bodySpine.setAnimation(0, 'Appear', false);
        this.bodySpine.setCompleteListener(()=>{ });
        Emitter.instance.emit(EventCode.SOUND.BALL_TRAY_SHOW);
    },

    disappear(){
        this._isActive = false;
        this.bodySpine.setAnimation(0, 'Disappear', false);
        this.bodySpine.setCompleteListener(()=>{
            this.node.active = false;
        });            
        this.hideElectroEffect();
        this.slot7FX.opacity = 0;
        this._ballInTray = 0;
        this.slot7FX.active = false;
        this.trayGlowFX.active = false;
        Emitter.instance.emit(EventCode.SOUND.BALL_TRAY_DRAW);
    },

    isAppear() {
        return this._isActive;
    },

    hide(){
        this._isActive = false;
        this.node.active = false;
        this.slot7FX.opacity = 0;
        this.slot7FX.active = false;
        this.trayGlowFX.active = false;
        this._ballInTray = 0;
        this.hideElectroEffect();
    },

    activeSlot7FX() {
        this.slot7FX.active = true;
        this.slot7FX.opacity = 255;
    },

    activeTrayGlow() {
        this.trayGlowFX.active = true;
    },

    getBallHolder(index){
        if(!this.ballHolder[index]) return this.node;
        return this.ballHolder[index];
    },

    onBallEnter(count = 1){
        this._ballInTray += count;
        this.showElectroEffect();
    },

    showElectroEffect() {
        const scaleTime = 0.2;
        if (this.electroEffect) {
            if (this._ballInTray >= 4) {
                this.electroEffect.active = true;
                this.electroEffect.stopAllActions();
                this.electroEffect.runAction(cc.sequence(
                    cc.scaleTo(scaleTime, 1.5),
                    cc.scaleTo(scaleTime, 1.4),
                ));
            } else if (this._ballInTray > 1) {
                this.electroEffect.active = true;
                this.electroEffect.stopAllActions();
                this.electroEffect.runAction(cc.sequence(
                    cc.scaleTo(scaleTime, 1.1),
                    cc.scaleTo(scaleTime, 1.0),
                ));
            }
        }
        if (this._ballInTray > 1) {
            this.activeTrayGlow();
        }
        if (this._ballInTray >= 6) {
            this.activeSlot7FX();
        }
    },

    hideElectroEffect() {
        if (this.electroEffect) {
            this.electroEffect.scale = 0.0;
            this.electroEffect.active = false;
        }
    },

});
