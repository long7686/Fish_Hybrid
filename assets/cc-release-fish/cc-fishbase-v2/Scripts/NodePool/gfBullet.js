

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const GameConfig =require('gfBaseConfig');
const { getRotation, v2Distance } = require("gfUtilities");
const FishManager = require('gfFishManager');

cc.Class({
    extends: require('gfNode'),
    properties: {
        _BulletMultiple:0,
        _LockedFish:null,
        _DeskStation:null,
        _BulletID:null,
        _isMe:false,
        _lastPos: undefined,
        _vectorX:0,
        _vectorY:0,
        _isDie: false,
        _isFreezed:false,
        _FireType: 0,
    },

    initAssets(config) {
        this.node.getComponent(cc.Sprite).spriteFrame = config.asset;
        const box = this.node.getComponent(cc.BoxCollider);
        box.offset.x = config.BoxCollider.x;
        box.offset.y = config.BoxCollider.y;
        box.size.width = config.BoxCollider.width;
        box.size.height = config.BoxCollider.height;
        this.node.zIndex = GameConfig.instance.Z_INDEX.BULLET;
    },

    initData(data) {
        this.node.setPosition(data.position);
        this.node.angle = data.Angle;
        this._BulletMultiple = data.BulletMultiple;
        this._LockedFish = FishManager.instance.getFishById(data.LockedFishID);
        this._DeskStation = data.DeskStation;
        this._BulletID = data.BulletID;
        this._isMe = data.isMe;
        this._isFake = data.isBulletFake;
        this._isFreezed = data.isFreezed;
        this._FireType = data.FireType;
        this._vectorX = Math.cos(cc.misc.degreesToRadians(this.node.angle));
        this._vectorY = Math.sin(cc.misc.degreesToRadians(this.node.angle));
    },

    update(dt) {
        if(this._isDie) {
            this.onDie();
            return;
        }
        if(this._LockedFish) {
            if(this._isFake){
                if(this._LockedFish.checkDie()){
                    this._LockedFish = null;
                    this.onDie();
                    return;
                }
            } else {
                if(!this._LockedFish.isAvailable()){
                    this._LockedFish = null;
                }
            }
        }
        if (this._lastPos) {
            this.updatePosition(dt);
            this.limitPositionForTarget();
            this.node.angle = getRotation(this.node.getPosition(), this._lastPos);
        }
        this._lastPos = this.node.getPosition();
    },

    updatePosition(dt){
        let delta = dt * GameConfig.instance.BulletSpeed;
        if(this._LockedFish)
        {
            this.node.angle = getRotation(this._LockedFish.getLockPositionByNodeSpace(this.node.parent), this._lastPos);
            this._vectorX = Math.cos(cc.misc.degreesToRadians(this.node.angle));
            this._vectorY = Math.sin(cc.misc.degreesToRadians(this.node.angle));
        } else {
            const SceneBox = GameConfig.instance.SceneBox;
            if (this.node.x > SceneBox.Right) {
                this._vectorX *= -1;
                this.node.x = SceneBox.Right;
            } else if (this.node.x < SceneBox.Left) {
                this._vectorX *= -1;
                this.node.x = SceneBox.Left;
            }
            if (this.node.y > SceneBox.Top) {
                this._vectorY *= -1;
                this.node.y = SceneBox.Top;
            } else if (this.node.y < SceneBox.Bottom) {
                this._vectorY *= -1;
                this.node.y = SceneBox.Bottom;
            }
        }
        this.node.x += this._vectorX * delta;
        this.node.y += this._vectorY * delta;
    },

    onCollisionEnter (other) {
        if(this._isDie) return;
        let fish = other.getComponent("gfBaseFish");
        if(!fish || fish.checkDie()) return;
        if(this._LockedFish) {
            if(fish._FishID != this._LockedFish._FishID) {
                return;
            }
        }
        this.onHit(fish);
    },

    limitPositionForTarget() {
        if(this._LockedFish) {
            const fishPos = this._LockedFish.getLockPositionByNodeSpace(this.node.parent);
            if (v2Distance(this.node.position, this._lastPos) > v2Distance(this._lastPos, fishPos)) {
                this.node.position = fishPos;
                this.onHit(this._LockedFish);
            }
        }
    },

    onHit(fish) {
        const data = this.makeBulletCollisionData(fish);
        fish.onHit(data);
        if (!this._isFake) {
            Emitter.instance.emit(EventCode.GAME_LAYER.BULLET_COLLIDE_FISH, data);
        } else {
            Emitter.instance.emit(EventCode.EFFECT_LAYER.ON_PLAY_NETFX, data);
        }
        this._isDie = true;
    },
    

    makeBulletCollisionData(fish) {
        const data = {};
        data.bullet = this;
        data.position = this.node.position;
        data.FishID = fish._FishID;
        data.FishKind = fish.getKind();
        data.BulletMultiple = this._BulletMultiple;
        data.isMe = this._isMe;
        data.BulletID = this._BulletID;
        data.isFreezed = this._isFreezed;
        data.DeskStation = this._DeskStation;
        data.FireType = this._FireType;
        return data;
    },
    
    onDie() {
        this.returnPool();
    },

    checkDie() {
        return this._isDie;
    },

    isAvailable() {
        return !this.checkDie();
    },

    isFake(){
        return this._isFake;
    },

    getPosition() {
        return this.node.getPosition();
    },

    getAngle() {
        return this.node.angle;
    },

    //Called whenever object is get from Object Pool
    reuse(poolMng) {
        this._super(poolMng);
    },

    //Called whenever object is returned to Object Pool
    unuse() {
        this._BulletMultiple = 0;
        this._LockedFish = null;
        this._DeskStation = null;
        this._BulletID = null;
        this._isMe = false;
        this._lastPos = undefined;
        this._vectorX = 0;
        this._vectorY = 0;
        this._isDie = false;
        this._super();
    }
});
