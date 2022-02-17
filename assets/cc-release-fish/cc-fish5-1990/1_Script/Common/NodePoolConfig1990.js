

const NodePoolConfig = require('gfNodePoolConfig');
const NodePoolConfig1990 = cc.Class({
    extends : NodePoolConfig,
    __ctor__(listAssets) {
        NodePoolConfig.call(this, listAssets);
        NodePoolConfig.instance = this;
        /*nếu khoá không cho cá quay thì thêm trường skipRotate: true
        **nếu cá có hiệu ứng bị thương khi bị bắn trúng thì set haveWounded: true
        */
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        this.FISH_CONFIG  = {
            "0" :  {speed: 100,   FishMultiple: -1,     zIndex: 499, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 0, 55, 29), haveWounded: true},
            "1" :  {speed: 100,   FishMultiple: -1,     zIndex: 498, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 0, 64, 32), haveWounded: true},
            "2" :  {speed: 80,    FishMultiple: -1,     zIndex: 497, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 3, 69, 60), haveWounded: true},
            "3" :  {speed: 80,    FishMultiple: -1,     zIndex: 496, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 0, 80, 63), targetPoint: cc.v2(11, 0), haveWounded: true},
            "4" :  {speed: 80,    FishMultiple: -1,     zIndex: 495, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 4, 83, 60), haveWounded: true},
            "5" :  {speed: 80,    FishMultiple: -1,     zIndex: 494, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 0, 82, 108), targetPoint: cc.v2(14, 0), haveWounded: true},
            "6" :  {speed: 40,    FishMultiple: -1,     zIndex: 1  , AnimationName: ['animation'],    BoxCollider: new cc.Rect(5, 0, 100, 43), targetPoint: cc.v2(9, 0), haveWounded: true},
            "7" :  {speed: 60,    FishMultiple: -1,     zIndex: 493, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 0, 95, 58), haveWounded: true},
            "8" :  {speed: 60,    FishMultiple: -1,     zIndex: 100, AnimationName: ['animation'],    BoxCollider: new cc.Rect(2, 3, 90, 30), haveWounded: true},
            "9" :  {speed: 60,    FishMultiple: -1,     zIndex: 109, AnimationName: ['animation'],    BoxCollider: new cc.Rect(0, 0, 119, 75), haveWounded: true},
            "10" : {speed: 60,    FishMultiple: -1,     zIndex: 108, AnimationName: ['animation'],    BoxCollider: new cc.Rect(1, 0, 105, 57), haveWounded: true},
            "11" : {speed: 60,    FishMultiple: -1,     zIndex: 107, AnimationName: ['animation'],    BoxCollider: new cc.Rect(-10, 0, 95, 37), haveWounded: true},
            "12" : {speed: 60,    FishMultiple: -1,     zIndex: 106, AnimationName: ['animation'],    BoxCollider: new cc.Rect(8, 1, 70, 65), targetPoint: cc.v2(8, 0), haveWounded: true},
            "13" : {speed: 40,    FishMultiple: -1,     zIndex: 492, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(10, 0, 100, 50), new cc.Rect(30, 0.9, 27, 80)], targetPoint: cc.v2(9, 0), haveWounded: true},
            "14" : {speed: 40,    FishMultiple: -1,     zIndex: 200, AnimationName: ['animation'],    BoxCollider: new cc.Rect(-15, 0, 120, 65), haveWounded: true},
            "15" : {speed: 40,    FishMultiple: -1,     zIndex: 201, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(-2.5, 0, 83, 39), new cc.Rect(-10, 0, 50, 90)], haveWounded: true},
            "16" : {speed: 20,    FishMultiple: -1,     zIndex: 202, AnimationName: ['animation'],    BoxCollider: new cc.Rect(1, -0.5, 110, 35), targetPoint: cc.v2(20, 9), haveWounded: true},
            "17" : {speed: 40,    FishMultiple: -1,     zIndex: 203, AnimationName: ['animation'],    BoxCollider: new cc.Rect(2.5, 0, 100, 90), targetPoint: cc.v2(22, 0), haveWounded: true},
            "18" : {speed: 40,    FishMultiple: -1,     zIndex: 204, AnimationName: ['animation'],    BoxCollider: new cc.Rect(-7, 0, 52, 94), targetPoint: cc.v2(-5, 0), haveWounded: true},
            "19" : {speed: 40,    FishMultiple: -1,     zIndex: 205, AnimationName: ['animation'],    BoxCollider: new cc.Rect(7, 5, 100, 60), targetPoint: cc.v2(10, 0), haveWounded: true},
            "20" : {speed: 40,    FishMultiple: -1,     zIndex: 206, AnimationName: ['animation'],    BoxCollider: new cc.Rect(10, 0, 170, 70), haveWounded: true},
            "21" : {speed: 40,    FishMultiple: -1,     zIndex: 207, AnimationName: ['animation'],    BoxCollider: new cc.Rect(14, 0, 110, 66), targetPoint: cc.v2(10, 0), haveWounded: true},
            "22" : {speed: 20,    FishMultiple: -1,     zIndex: 208, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(15, 0, 210, 70), new cc.Rect(40, 0, 50, 130)], targetPoint: cc.v2(70, 0), haveWounded: true},
            "23" : {speed: 20,    FishMultiple: -1,     zIndex: 209, AnimationName: ['animation'],    BoxCollider: new cc.Rect(-10, 0, 260, 70), targetPoint: cc.v2(-30, 0), haveWounded: true},
            "24" : {speed: 20,    FishMultiple: -1,     zIndex: 210, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(40, 0, 140, 150), new cc.Rect(-90, 0, 120, 20)], targetPoint: cc.v2(40, 0), haveWounded: false},
            "25" : {speed: 20,    FishMultiple: -1,     zIndex: 211, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(-70, 0, 220, 53), new cc.Rect(50, 0, 30, 120)], targetPoint: cc.v2(-30, 0), haveWounded: true},
            "27" : {speed: 20,    FishMultiple: -1,     zIndex: 2  , AnimationName: ['animation'],    BoxCollider: [new cc.Rect(12.5, 0, 80, 77), new cc.Rect(-55, 0, 55, 34)], haveWounded: true},
            "30" : {speed: 20,    FishMultiple: -1,     zIndex: 491, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(20, 0, 345,  70), new cc.Rect(30, 0, 200, 200)], targetPoint: cc.v2(35, 0), haveWounded: true},
            "31" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(25, 5, 160, 100), new cc.Rect(76, 16, 42, 48)], targetPoint: cc.v2(35, 5), haveWounded: false},
            "34" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(25, 5, 160, 100), new cc.Rect(76, 16, 42, 48)], targetPoint: cc.v2(35, 5), haveWounded: false},
            "35" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['animation'],    BoxCollider: [new cc.Rect(-4, 10, 180, 60), new cc.Rect(27, -36, 42, 32)], targetPoint: cc.v2(25, 10), haveWounded: false},
            "36" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['animation'],    BoxCollider: new cc.Rect(1, 0, 120, 60), targetPoint: cc.v2(17, 0), haveWounded: false},
            "37" : {speed: 20,    FishMultiple: -1,     zIndex: 490, AnimationName: ['animation'],    BoxCollider: new cc.Rect(1, 0, 120, 60), targetPoint: cc.v2(17, 0), haveWounded: false},
            "43" : {speed: 20,    FishMultiple: -1,     zIndex: 105, AnimationName: ['idle'],    BoxCollider: new cc.Rect(2, 0, 86, 91), targetPoint: cc.v2(5, 0), haveWounded: true, customComponent: 'BoomFish1990',}
        };
        this.SPRITE_FISH_KIND = [0,1,2,3,4,5,6,7,9,10];
        this.BULLET_CONFIG = {
            "0" : {BoxCollider: new cc.Rect(5, 0, 20, 20)},
            "1" : {BoxCollider: new cc.Rect(5, 0, 20, 22)},
            "2" : {BoxCollider: new cc.Rect(5, 0, 20, 20)},
            "3" : {BoxCollider: new cc.Rect(5, 0, 22, 60)},
            "4" : {BoxCollider: new cc.Rect(5, 0, 20, 65)},
            "5" : {BoxCollider: new cc.Rect(0, 0, 20, 65)},
            "6" : {BoxCollider: new cc.Rect(30, 0, 20, 30)},
            "7" : {BoxCollider: new cc.Rect(0, 0, 20, 36)},
            "8" : {BoxCollider: new cc.Rect(0, 0, 20, 77)},
            "9" : {BoxCollider: new cc.Rect(0, 0, 20, 101)}
        };
    }
});
NodePoolConfig1990.instance = null;
module.exports = NodePoolConfig1990;
