const { getRandomInt } = require('utils');

cc.Class({
    extends: require("SpineFish1990"),
    properties: {
        _lastHit : null,
        _curHit: null,
        _hitCount : null,
    },

    initAssets (config) {
        this._super(config);
        this.fishAnim.setMix("idle", "hit_start", 0.25);
        this.fishAnim.setMix("idle", "hit_end", 0.4);
        this.fishAnim.setMix("hit_end", "idle", 0.4);
    },

    initAnimationCacheMode(){
        this.fishAnim.enableBatch = true;
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
        this.fishAnim.premultipliedAlpha = true; 
    },

    initFishData(data) {
        this._super(data);
        this._hitCount = getRandomInt(4,15);
        this._curHit = 0;
    },
    onHit(data) {
        if (data) {
            this.triggerHit(data);
        }
        this._lastHit = Date.now();
        this.applyHitColor();
        cc.tween(this.node)
            .delay(0.1)
            .call(() => {
                this.resetColor();
            })
            .start();
        this._curHit++;
        const track = this.fishAnim.getCurrent(1);
        if(this._curHit >= this._hitCount) {
            this._curHit = 0; 
            if (!track) {
                this.fishAnim.setAnimation(1, "hit_start", false);
                this.fishAnim.addAnimation(1, "hit_mid", true);
            }
        }

        if (this._tweenHitAction) {
            this._tweenHitAction.stop();
        }
        this._tweenHitAction = cc.tween(this.node)
            .delay(1)
            .call(()=>{
                if(this._lastHit && (Date.now() - this._lastHit > 1000) && track) {
                    this.fishAnim.setAnimation(1, "hit_end", false);
                    this.fishAnim.setCompleteListener((trackEntry)=>{
                        if(trackEntry.trackIndex === 1) {
                            this.fishAnim.clearTrack(1);
                            this.fishAnim.setCompleteListener(() => {});
                        }
                    });
                }
            });
        this._tweenHitAction.start();
    },
    unuse() {
        this._super();
        this.fishAnim.setCompleteListener(() => {});
        this.fishAnim.clearTracks();
        this.fishAnim.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
        this._lastHit = null;
        this._curHit = null;
        this._hitCount = null;
    },

});
