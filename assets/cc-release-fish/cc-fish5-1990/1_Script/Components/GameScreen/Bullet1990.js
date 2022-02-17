const { getRotation } = require("gfUtilities");
const FishManager = require("gfFishManager");
cc.Class({
    extends: require('gfBullet'),
    properties: {
        _isEnterHole: false,
    },

    setEnterHole({ isEnter, fishID }) {
        const ghostShip = FishManager.instance.getFishById(fishID);
        if (ghostShip && ghostShip.isAvailable()) {
            this._LockedFish = ghostShip;
            this._isEnterHole = isEnter;
        }
    },

    isAvailable() {
        return !this.checkDie() && !this._isEnterHole;
    },
    update(dt) {
        if (this._isDie) {
            this.onDie();
            return;
        }
        if (this._isEnterHole) {
            if(this._LockedFish) {
                if(!this._LockedFish.isAvailable()) {
                    this._isEnterHole = false;
                    this._LockedFish = null;
                    if (this._isFake) {
                        this.onDie();
                        return;
                    }
                }
            }
            if (this._lastPos) {
                const angle = getRotation(this.node.getPosition(), this._lastPos);
                if(angle != 0){
                    this.node.angle = angle;
                }
            }
            this._lastPos = this.node.getPosition();
            return;
        }
        this._super(dt);
    },

    unuse() {
        this._super();
        this._isEnterHole = false;

    }
});
