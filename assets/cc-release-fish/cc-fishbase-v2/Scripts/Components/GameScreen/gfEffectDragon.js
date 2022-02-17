

const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const PoolManager = require('gfPoolManager');
const DataStore = require('gfDataStore');
const { registerEvent, removeEvents } = require('gfUtilities');
const { getPostionInOtherNode } = require('utils');
const ReferenceManager = require('gfReferenceManager');
const GameConfig = require('gfBaseConfig');

cc.Class({
    extends: cc.Component,
    properties: {
        dragonDieSmallExplosionPrefab: cc.Prefab,
        jackpotStarPrefab: cc.Prefab,
        jackpotWinAmountPopup: cc.Prefab,
        _ballList: [],
        _ballDropping: 0,
        _bigWinPlaying: 0,
    },

    onLoad() {
        this.initEvents();
        this.effectLayer = this.node.getComponent('gfEffectLayer');
        for (let i = 0; i < 4; ++i) {
            this._ballList[i] = [];
        }
    },

    initEvents() {
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.onRefresh, this);
        registerEvent(EventCode.DRAGON.BIG_EXPLOSION, this.dragonDieBigExplosion, this);
        registerEvent(EventCode.DRAGON.SMALL_EXPLOSION, this.dragonDieSmallExplosion, this);
        registerEvent(EventCode.DRAGON.DROP_BALL, this.dragonDropBall, this);
        registerEvent(EventCode.DRAGON.PLAY_DRAGON_BALL_JACKPOT, this.playDragonBallJackpot, this);
        registerEvent(EventCode.DRAGON.DONE_BALL_DROP, this.onBallDropDone, this);
        registerEvent(EventCode.DRAGON.ON_END, this.onDragonEnd, this);
        registerEvent(EventCode.DRAGON.DONE_JACKPOT_STAR, this.playDragonBallBigWin, this);
        registerEvent(EventCode.DRAGON.ADD_BALL_TO_PLAYER, this.addBallToPlayer, this);
        registerEvent(EventCode.DRAGON.DONE_PLAYER_BIGWIN, this.onDonePlayerBigWin, this);
        registerEvent(EventCode.DRAGON.SHOW_JACKPOT_WINAMOUNT, this.onJackpotStarDone, this);
        registerEvent(EventCode.DRAGON.JACKPOT_WINAMOUNT_POPUP_CLOSE, this.updatePlayerWallet, this);
        registerEvent(EventCode.PLAYER_LAYER.REMOVE_BALL, this.removeAllBallsUser, this);
    },

    dragonDieBigExplosion(position) {
        const JPExplostion = PoolManager.instance.createBigExplosion({ position: this.node.convertToNodeSpaceAR(position) });
        JPExplostion.node.zIndex = GameConfig.instance.Z_INDEX.POPUP + 10;
    },

    dragonDieSmallExplosion(positions) {
        positions.forEach((pos, i) => {
            this.scheduleOnce(() => {
                const explosion = cc.instantiate(this.dragonDieSmallExplosionPrefab);
                explosion.parent = this.node;
                explosion.position = this.node.convertToNodeSpaceAR(pos);
            }, i * 0.15);
        });
    },

    dragonDropBall(data) {
        const dragonPosition = this.node.convertToNodeSpaceAR(data.position);
        data.forEach((d) => {
            const player = ReferenceManager.instance.getPlayerByDeskStation(d.DeskStation);
            const playerIndex = player.index;
            const playerBallCount = this._ballList[playerIndex].length;
            for (let i = playerBallCount; i < d.Balls; ++i) {
                const ball = PoolManager.instance.getDragonBall(i);
                ball.node.parent = this.node;
                ball.dropToPlayer(dragonPosition, player.getBallHolder(i), d.DeskStation);
                this._ballList[playerIndex].push(ball);
                ++this._ballDropping;
            }
        });
    },

    addBallToPlayer({ ballCount, playerIndex }) {
        const player = ReferenceManager.instance.getPlayerByIndex(playerIndex);
        for (let i = this._ballList[playerIndex].length; i < ballCount; ++i) {
            const ball = PoolManager.instance.getDragonBall(i);
            ball.addToPlayer(player.getBallHolder(i));
            this._ballList[playerIndex].push(ball);
        }
    },

    onDragonEnd(data) {
        this.endData = data;
        if (data.wonJackpot) {
            this.endData.jackpotAmount = this.getJackpotWinAmount();
        }
        data.Result.forEach((result) => {
            const player = ReferenceManager.instance.getPlayerByDeskStation(result.DeskStation);
            if (player.isMe) {
                player.addGoldReward(result.WinAmount);
                if (result.DeskStation === this.endData.DeskStation) {
                    this.needUpdateWallet = true;
                }
            }
        });
        if (data.Result && this._ballDropping === 0) {
            this.playDragonEndEffect();
        }
    },

    onBallDropDone() {
        --this._ballDropping;
        if (this._ballDropping === 0) {
            if (this.endData) {
                this.playDragonEndEffect();
            }
        }
    },

    playDragonEndEffect() {
        if (this.endData.wonJackpot) {
            const player = ReferenceManager.instance.getPlayerByDeskStation(this.endData.DeskStation);
            if(player && player.isMe){
                Emitter.instance.emit(EventCode.EFFECT_LAYER.ADD_ANIM_TO_QUEUE_ANIM, "JACKPOT", this.endData);
            } else {
                this.playDragonBallJackpot();
            }
          
        } else {
            this.playDragonBallBigWin();
        }
    },

    playDragonBallJackpot() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(this.endData.DeskStation);
        if(player.isActive()) {
            this.jackpotStarFX = cc.instantiate(this.jackpotStarPrefab);
            this.jackpotStarFX.parent = this.node;
            const ballList = this._ballList[player.index];
            this.jackpotStarFX.getComponent('gfJackpotStarFX').playAnimation(ballList);
            Emitter.instance.emit(EventCode.SOUND.COLLECT_BALL);
        } else {
            this.playDragonBallBigWin();
        }
    },

    playWheelDragonBallsJackpot(deskStation, winAmount) {
        const playerIndex = ReferenceManager.instance.getPlayerByDeskStation(deskStation).index;
        const wheel = this.effectLayer._getWheel(playerIndex);
        wheel.showDragonBallsJackpot({ winValue: winAmount });
    },

    playDragonBallBigWin() {
        this.endData.Result.forEach((result) => {
            const player = ReferenceManager.instance.getPlayerByDeskStation(result.DeskStation);
            if(player.isActive()) {
                if (result.DeskStation === this.endData.DeskStation) {
                    if (!player.isMe) {
                        this.playWheelDragonBallsJackpot(result.DeskStation, result.WinAmount);
                    }
                } else if (result.WinAmount) {
                    this.playWheelDragonBallsWin(result.DeskStation, result.WinAmount);
                }       
            }
        });
        this.onFinishState();
    },

    playWheelDragonBallsWin(deskStation, winValue) {
        const playerIndex = ReferenceManager.instance.getPlayerByDeskStation(deskStation).index;
        const ballList = this._ballList[playerIndex];
        if (!ballList || ballList.length <= 0) return;
        ++this._bigWinPlaying;
        let isValidBall = true;
        const wheel = this.effectLayer._getWheel(playerIndex);
        for(let i = 0 ; i < ballList.length; i++){
            let ball = ballList[i];
            if(!ball.node.parent) {
                isValidBall = false;
                break;
            }
            ball.node.position = getPostionInOtherNode(this.node, ball.node);
            const destination = getPostionInOtherNode(this.node, wheel.node);
            ball.node.parent = this.node;
            ball.moveToBigWinEffect({ ballIndex: i, position: destination, playerIndex });
        }
        if(isValidBall){
            wheel.showDragonBalls({ winValue, ballCount: ballList.length });
            Emitter.instance.emit(EventCode.SOUND.DRAGON_BALL_REWARD);
        }
       
      
    },

    onJackpotStarDone() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(this.endData.DeskStation);
        if (player.isMe) {
            this.showJackpotWinAmountPopup();
        }
    },

    getJackpotWinAmount() {
        for (let i = 0; i < this.endData.Result.length; ++i) {
            const result = this.endData.Result[i];
            if (result.DeskStation === this.endData.DeskStation) {
                return result.WinAmount;
            }
        }
        return 0;
    },

    showJackpotWinAmountPopup() {
        this.JPWinPopup = cc.instantiate(this.jackpotWinAmountPopup);
        this.JPWinPopup.getComponent('gfJackpotWinPopup').setWinValue(this.endData.jackpotAmount);
        this.JPWinPopup.parent = this.node;
        this.JPWinPopup.zIndex = GameConfig.instance.Z_INDEX.POPUP + 11;
    },

    updatePlayerWallet() {
        const player = ReferenceManager.instance.getPlayerByDeskStation(this.endData.DeskStation);
        if (player && player.isMe) {
            player.addToDisplayWallet(this.endData.jackpotAmount);
        }
        this.needUpdateWallet = false;
        this.onFinishState();
    },

    onDonePlayerBigWin() {
        --this._bigWinPlaying;
        this.onFinishState();
    },

    onFinishState() {
        if (this._bigWinPlaying > 0 || this.needUpdateWallet) return;
        this.onRefresh();
        Emitter.instance.emit(EventCode.DRAGON.DONE_ALL_BIGWIN);
    },

    removeAllBalls() {
        this._ballList.forEach((arr) => {
            arr.forEach((ball) => { ball.returnPool(); });
            arr.length = 0;
        });
        this._ballDropping = 0;
    },

    removeAllBallsUser(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        const ballList = this._ballList[player.index];
        this._ballList[player.index] = [];
        ballList.forEach((ball) => {
            if(ball.isDropping()) {
                this.onBallDropDone();
            }
            if(!ball.isInJackpotStar()) {
                ball.returnPool();
            }
        });
    },

    removeAllEffects() {
        if (this.jackpotStarFX) {
            if (cc.isValid(this.jackpotStarFX)) {
                this.jackpotStarFX.destroy();
            }
            this.jackpotStarFX = null;
        }
        if (this.JPWinPopup) {
            if (cc.isValid(this.JPWinPopup)) {
                this.JPWinPopup.destroy();
            }
            this.JPWinPopup = null;
        }
    },

    onRefresh() {
        this.removeAllBalls();
        this.removeAllEffects();
        this.endData = null;
        this.unscheduleAllCallbacks();
    },

    getMyTotalBall() {
        return this.getTotalBallOfUser(DataStore.instance.getSelfDeskStation());
    },

    getTotalBallOfUser(deskStation) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(deskStation);
        if (player) {
            return this._ballList[player.index].length;
        }
        return 0;
    },

    onDestroy() {
        this.unscheduleAllCallbacks();
        removeEvents(this);
    },

});
