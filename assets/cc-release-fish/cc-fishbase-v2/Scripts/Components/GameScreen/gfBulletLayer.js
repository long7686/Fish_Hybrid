
const PoolManager = require('gfPoolManager');
const EventCode = require("gfBaseEvents");
const { getPointByDegrees, registerEvent, removeEvents } = require('gfUtilities');
const GameConfig = require("gfBaseConfig");
const ReferenceManager = require('gfReferenceManager');
const DataStore = require('gfDataStore');

cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad() {
        this.initEvent();
        this.numBullet = 0;
    },

    initEvent() {
        registerEvent(EventCode.GAME_LAYER.CREATE_BULLET, this.createBullet, this);
        registerEvent(EventCode.GAME_LAYER.BULLET_COLLIDE_FISH, this.countDownBullet, this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.onResumeGame, this);
    },

    createBullet(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        if (player) {
            const posFire = this.node.convertToNodeSpaceAR(player.gun.convertToWorldSpaceAR(cc.v2(0, 0)));
            const realPosFire = getPointByDegrees(posFire.x, posFire.y, posFire.x + GameConfig.instance.gunRadius, posFire.y, Number.parseFloat(data.Angle));
            data.position = realPosFire;
            if (player.isFreezeGunActive()) {
                data.isFreezed = true;
            }
            if (player.isMe) {
                if (this.numBullet < GameConfig.instance.MaxBullet) {
                    data.FireType = DataStore.instance.getTargetState();
                    this.createBulletPool(data);
                    this.countBullet(true);
                } else {
                    this.onReachMaxNumBullet(true);
                }
            } else {
                this.createBulletPool(data);
            }
        }
    },

    createBulletPool(data) {
        const bullet = PoolManager.instance.getBulletWithData(data);
        bullet.node.setParent(this.node);
    },

    countBullet(plus = true) {
        this.numBullet += (plus) ? 1 : -1;
        if (this.numBullet < 0) {
            this.numBullet = 0;
        } else if (this.numBullet >= GameConfig.instance.MaxBullet) {
            this.onReachMaxNumBullet(true);
        }
        if (DataStore.instance.isReachMaxNumBullet()) {
            if (this.numBullet < GameConfig.instance.MaxBullet) {
                this.onReachMaxNumBullet(false);
            }
        }
    },

    countDownBullet(data) {
        if (data.isMe) {
            this.countBullet(false);
        }
    },

    onResumeGame() {
        this.numBullet = 0;
        this.onReachMaxNumBullet(false);
    },

    onReachMaxNumBullet(isMax) {
        DataStore.instance.setDataStore({
            reachMaxNumBullet: isMax,
        });
    },

    onDestroy() {
        removeEvents(this);
    },

});
