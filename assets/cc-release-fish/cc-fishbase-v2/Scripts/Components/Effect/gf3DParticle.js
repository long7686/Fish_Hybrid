
const configParticle = require('configParticle');
const PoolManager = require('gfPoolManager');
const GameConfig = require('gfBaseConfig');
const { getRandomInt } = require('utils');

cc.Class({
    extends: cc.Component,

    properties: {
        particlePerSpawn: 0,
        spawnInterval: 0.1,
        speed: {
            type: configParticle,
            default:{}
        },
        gravity: 0,
        angle: {
            type: configParticle,
            default:{}
        },
        size: {
            type: configParticle,
            default: {}
        },
        lifetime: 0,
        radius: 0,
        duration: -1,
        coinAnimSpeed: 1,
        _isMe: true,
    },

    onLoad(){
        this.node.setSpawnRate = this.setSpawnRate.bind(this);
        this.node.setGravity = this.setGravity.bind(this);
        this.node.setItemSpeed = this.setItemSpeed.bind(this);
        this.node.setSpawnInterval = this.setSpawnInterval.bind(this);
        this.node.setLifetime = this.setLifetime.bind(this);
        this.node.startAnimation = this.startAnimation.bind(this);
        this.node.stopAnimation = this.stopAnimation.bind(this);
        this.node.setDuration = this.setDuration.bind(this);
        this.node.setIsMe = this.setIsMe.bind(this);
        this.isPlaying = false;
    },
    startAnimation(){
        this.isPlaying = true;
        this.spawnTimer = this.spawnInterval;
        this.timer = 0;
    },
    setSpawnRate(perSpawn){
        this.particlePerSpawn = perSpawn;
    },
    setSpawnInterval(interval){
        this.spawnInterval = interval;
        this.spawnTimer = this.spawnInterval;
    },
    setItemSpeed(minSpeed, maxSpeed) {
        this.speed = {
            start: minSpeed,
            end: maxSpeed
        };
    },
    setGravity(gravity){
        this.gravity = gravity;
    },
    setDuration(duration){
        this.duration = duration;
    },
    setLifetime(lifeTime){
        this.lifetime = lifeTime;
    },
    setIsMe(isMe){
        this._isMe = isMe;
    },
    stopAnimation(){
        this.isPlaying = false;
        this.timer = 0;
        while(this.node.children.length > 0){
            this.node.children[0].stopAnimation();
        }
    },
    update(dt) {
        if((this.duration < 0 || this.timer <= this.duration) && this.isPlaying == true) {
            this.timer += dt;
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer -= this.spawnInterval;
                for (let i = 0; i < this.particlePerSpawn; i++) {
                    let node = this._isMe ? PoolManager.instance.getCoin(GameConfig.instance.COIN_TYPE.MY_COIN) : PoolManager.instance.getCoin(GameConfig.instance.COIN_TYPE.OTHER_COIN);
                    node.parent = this.node;
                    node.angle = getRandomInt(0,360);
                    node.opacity = 255;
                    node.scale = this.size.start + Math.random() * (this.size.end - this.size.start) * 2;
                    let angle = cc.misc.degreesToRadians(this.angle.start) + Math.random() * (cc.misc.degreesToRadians(this.angle.end) - cc.misc.degreesToRadians(this.angle.start));
                    node.position = (this.radius === 0) ? cc.v2(0,0) : this.generatePoint(angle);
                    let speed = this.speed.start + Math.random() * (this.speed.end - this.speed.start);
                    node.startAnimation(1,this.coinAnimSpeed,Math.cos(angle) * speed, Math.sin(angle) * speed, 0, this.gravity, this.lifetime);
                }
            }
        }
    },
    generatePoint(angle){
        let x = Math.cos(angle)*this.radius;
        let y = Math.sin(angle)*this.radius;
        return cc.v2(x,y);
    },
});
