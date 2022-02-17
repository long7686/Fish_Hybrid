const EventCode = require("gfBaseEvents");
const Emitter = require('gfEventEmitter');
const PoolManager = require('gfPoolManager');
const BaseConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const {
    formatCoin, registerEvent, removeEvents, randomBetween,
} = require("gfUtilities");
const { getRandomInt, getPostionInOtherNode } = require('utils');
const ReferenceManager = require('gfReferenceManager');

cc.Class({
    extends: cc.Component,
    properties: {
        particle3D: {
            default: null,
            type: cc.Prefab,
        },
        bigWinWheels: {
            default: [],
            type: require('gfBigWinWheel'),
        },
        itemLaser: cc.Prefab,
        itemBomb: cc.Prefab,
        _listSkillItem: [],
        _lisParticle: [],
        _queueAnim: [],
        _playingQueueAnim: false,
    },

    onLoad() {
        ReferenceManager.instance.setData({ EffectLayer: this.node });
        this.initEvents();
        for (let i = 0; i < this.bigWinWheels.length; i++) {
            const itemComp = this.bigWinWheels[i];
            itemComp.node.active = false;
            itemComp.node.parent.zIndex = BaseConfig.instance.Z_INDEX.BIGWIN;
            itemComp.index = i;
        }
        this._lisParticle.length = 0;
        this._listSkillItem.length = 0;
    },

    initEvents() {
        registerEvent(EventCode.PLAYER_LAYER.PLAYER_LEAVE_BOARD, this.userExitBoard, this);
        registerEvent(EventCode.GAME_LAYER.BULLET_COLLIDE_FISH, this.playNetFX, this);
        registerEvent(EventCode.EFFECT_LAYER.ON_PLAY_NETFX, this.playNetFX, this);
        registerEvent(EventCode.GAME_LAYER.FREEZE_EFFECT_ITEM, this.effectItemFreeze, this);
        registerEvent(EventCode.EFFECT_LAYER.LUCKY_EFFECT_FISH, this.playLuckyEffect, this);
        registerEvent(EventCode.EFFECT_LAYER.PLAY_REWARD_EFFECT, this.playCoinReward, this);
        registerEvent(EventCode.EFFECT_LAYER.PLAY_LUCKY_EFFECT_DONE, this.onPlayLuckyEffectDone, this);
        registerEvent(EventCode.EFFECT_LAYER.DROP_GUN_LASER, this.playDropGunLaser, this);
        registerEvent(EventCode.EFFECT_LAYER.CLEAR_DROP_GUN_LASER, this.clearDropGunLaserByDeskStation, this);
        registerEvent(EventCode.EFFECT_LAYER.PLAY_BIG_WIN_EFFECT, this.onPlayEffectWinInCatchFish, this);
        registerEvent(EventCode.EFFECT_LAYER.TRIGGER_BOMB, this.triggerBombFX, this);
        registerEvent(EventCode.COMMON.EXIT_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.ON_ENTER_GAME_ROOM, this.resetOnExit, this);
        registerEvent(EventCode.GAME_LAYER.CATCH_FISH_BY_SKILL, this.playEffectFishSpecial, this);
        registerEvent(EventCode.DRAGON.BALL_ENTER_BIGWIN_WHEEL, this.onBallEnter, this);


        registerEvent(EventCode.EFFECT_LAYER.ADD_ANIM_TO_QUEUE_ANIM, this.addAnimToQueueAnim, this);
        registerEvent(EventCode.EFFECT_LAYER.CHECK_QUEUE_ANIM, this.checkQueueAnim, this);

    },



    playNetFX(data) {
        const netFX = PoolManager.instance.getNetFX(data);
        if (netFX) {
            netFX.node.setParent(this.node);
            netFX.node.position = getPostionInOtherNode(this.node, data.bullet.node);
        }
    },

    onPlayLuckyEffectDone(data) {
        this.playCoinReward(data);
    },

    playLuckyEffect(data) {
        const luckyPosition = this.node.convertToNodeSpaceAR(data.fishPos);
        const luckyEffect = PoolManager.instance.getLuckyEffectWithData(data);
        if (luckyEffect) {
            luckyEffect.node.setParent(this.node);
            luckyEffect.node.position = luckyPosition;
        }
    },

    effectItemFreeze(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        const endNode = (player.isMe) ? ReferenceManager.instance.getBtnFreezeHUD() : player.node;
        let fromPosition;
        if (data.Fish) {
            fromPosition = this.node.convertToNodeSpaceAR(data.Fish.node.position);
        } else {
            fromPosition = this.getRandomPositionOutScreen();
        }
        Emitter.instance.emit(EventCode.SOUND.EFFECT_GET_ITEM_FREEZE);
        const destination = getPostionInOtherNode(this.node, endNode);

        const freezeItem = PoolManager.instance.getFreezeFX();
        freezeItem.node.setParent(this.node);
        freezeItem.node.scale = 0;
        freezeItem.node.active = true;
        freezeItem.node.setPosition(fromPosition);

        const jumpHigh = 60;
        cc.tween(freezeItem.node)
            .to(0.175, { position: cc.v2(freezeItem.node.x, freezeItem.node.y + jumpHigh) })
            .to(0.5, { position: cc.v2(freezeItem.node.x, freezeItem.node.y - jumpHigh) }, { easing: 'bounceOut' })
            .delay(0.75 - 0.05)
            .to(0.4, { position: destination })
            .delay(0.235)
            .call(() => {
                if (DataStore.instance.getSelfDeskStation() === data.DeskStation) {
                    Emitter.instance.emit(EventCode.GAME_LAYER.FREEZE_ADD_ITEM);
                }
                freezeItem.returnPool();
            })
            .start();
    },

    _playBigWinEffect(data) {
        const {
            deskStation, beganPos, gold, bet, isSkill, fishKind
        } = data;
        if (gold === 0) {
            return;
        }
        const player = ReferenceManager.instance.getPlayerByDeskStation(deskStation);
        const endPos = getPostionInOtherNode(this.node, player.avatar.node);
        Emitter.instance.emit(EventCode.SOUND.EFFECT_BOMB);
        const particle = cc.instantiate(this.particle3D);
        particle.parent = this.node;
        particle.zIndex = BaseConfig.instance.Z_INDEX.COIN;
        this._lisParticle.push(particle);
        particle.position = beganPos;
        particle.setIsMe(player.isMe);
        particle.setLifetime(0.22);
        particle.setSpawnRate(8);
        particle.setItemSpeed(450, 650);
        particle.setGravity(-200);
        particle.setSpawnInterval(0.2);
        particle.setDuration(0.25);
        particle.startAnimation();

        cc.tween(particle)
            .delay(0.65)
            .to(0.4, { opacity: 0 })
            .call(() => {
                particle.stopAnimation();
                particle.removeFromParent(true);
                particle.destroy();
                const index = this._lisParticle.indexOf(particle);
                if (index >= 0) {
                    this._lisParticle.splice(index, 1);
                }
            })
            .start();

        PoolManager.instance.createBigExplosion({ position: beganPos });
        // eslint-disable-next-line prefer-object-spread
        const labelPosition = Object.assign({}, beganPos);
        const playBigWin = !this._getWheel(player.index).isShowingDragonBall();
        this._playCoinLabelEffect({
            goldReward: gold,
            bulletMultiple: bet,
            labelPosition,
            beganPos,
            endPos,
            isSkill,
            isMe: player.isMe,
            deskStation,
            playBigWin,
            skipUpdateWallet: playBigWin,
        });
        if (playBigWin) {
            this.onPlayEffectWinInCatchFish({
                player,
                gold,
                bet,
                fishKind
            });
        }
    },
    onBallEnter(playerIndex) {
        const wheel = this._getWheel(playerIndex);
        const player = ReferenceManager.instance.getPlayerByIndex(playerIndex);
        if (wheel && player.isActive()) {
            wheel.onBallEnter();
        }
    },

    onPlayEffectWinInCatchFish(data) {
        const { player, gold, bet, fishKind } = data;
        const wheel = this._getWheel(player.index);
        if (wheel && !wheel.isShowingDragonBall()) {
            wheel.showAnimation({ gold, bet, isMe: player.isMe, fishKind });
        }
    },

    _getWheel(idx) {
        if (this.bigWinWheels[idx]) {
            return this.bigWinWheels[idx];
        }
        return null;
    },

    getRandomPositionOutScreen() {
        const { SceneBox } = BaseConfig.instance;
        const x = [SceneBox.Left, SceneBox.Right][randomBetween(0, 1)];
        const y = randomBetween(SceneBox.Bottom + 100, SceneBox.Top - 100);
        return this.node.convertToNodeSpaceAR(ReferenceManager.instance.getNodeFishLayer().convertToWorldSpaceAR(cc.v2(x, y)));
    },

    getRandomPositionOutScreenByLaser(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        const rad = cc.misc.degreesToRadians(player.getGunAngle());
        const x = Math.cos(rad) * 2060 + player.node.x;
        const y = Math.sin(rad) * 2060 + player.node.y;
        return this.node.convertToNodeSpaceAR(ReferenceManager.instance.getNodeFishLayer().convertToWorldSpaceAR(cc.v2(x, y)));
    },

    playCoinReward(rewardData) {
        let { data, fishPos, fishKind } = rewardData;
        if (fishPos) {
            fishPos = this.node.convertToNodeSpaceAR(fishPos);
        } else if (data.skillID === BaseConfig.instance.SkillConfig.LASER) {
            fishPos = this.getRandomPositionOutScreenByLaser(data);
        } else {
            fishPos = this.getRandomPositionOutScreen();
        }
        const isBigwin = data.GoldReward >= data.BulletMultiple * BaseConfig.instance.BIG_WIN_RATIO.BIG_WIN_VALUE;
        if (isBigwin && !data.isSkill && !data.skipUpdateWallet) {
            Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.05, amplitude: 10 });
            this._playBigWinEffect({
                deskStation: data.DeskStation,
                beganPos: fishPos,
                gold: data.GoldReward,
                bet: data.BulletMultiple,
                isSkill: data.isSkill,
                fishKind
            });
        } else {
            let { skipUpdateWallet } = data;
            if (!skipUpdateWallet && data.isSkill) {
                const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
                skipUpdateWallet = !this._getWheel(player.index).isShowingDragonBall();
            }
            this._playCoinEffect({
                deskStation: data.DeskStation,
                fishKind,
                beganPos: fishPos,
                goldReward: data.GoldReward,
                isSkill: data.isSkill,
                bulletMultiple: data.BulletMultiple,
                skipUpdateWallet,
            });
        }
    },

    _playCoinLabelEffect(data) {
        const { goldReward, labelPosition, isMe } = data;

        const label = PoolManager.instance.getLabelCoin(isMe);
        label.node.zIndex = BaseConfig.instance.Z_INDEX.COIN_LABEL;
        this.node.addChild(label.node);
        label.setString(`+${formatCoin(goldReward)}`);
        label.node.setPosition(labelPosition);
        label.node.scale = 1.5;
        cc.tween(label.node)
            .to(0.2, { scale: 1 })
            .to(0.1, { scale: 1.5 })
            .to(0.1, { scale: 1 })
            .delay(0.5)
            .parallel(
                cc.tween().to(0.25, { scale: 0 }),
                cc.tween().call(this._playCoinAnim(data)),
            )
            .call(() => {
                label.returnPool();
            })
            .start();
    },

    _playCoinEffect(data) {
        const {
            deskStation, fishKind, beganPos, goldReward, isSkill, bulletMultiple, skipUpdateWallet,
        } = data;
        if (goldReward === 0) {
            return;
        }
        const player = ReferenceManager.instance.getPlayerByDeskStation(deskStation);
        const endPos = getPostionInOtherNode(this.node, player.avatar.node);
        if (fishKind === BaseConfig.instance.FISH_KIND.MINIBOSS) {
            beganPos.y -= 65;
        }

        if (isSkill) {
            PoolManager.instance.createSmallExplosion({ position: beganPos });
            this.scheduleOnce(() => {
                this.playEffectCoin({ beganPos, goldReward, bulletMultiple, endPos, isSkill, player, deskStation, skipUpdateWallet });
            }, 0.8);
        } else {
            this.playEffectCoin({ beganPos, goldReward, bulletMultiple, endPos, isSkill, player, deskStation, skipUpdateWallet });
        }
    },

    playEffectCoin(data) {
        const { beganPos, goldReward, bulletMultiple, endPos, isSkill, player, deskStation, skipUpdateWallet } = data;
        const LABEL_WIDTH = 150;
        const LABEL_HEIGHT = 25;
        const { Width, Height } = BaseConfig.instance.realSize;
        const x = Math.min(Math.max(beganPos.x, -Width / 2 - LABEL_WIDTH / 2), Width / 2 - LABEL_WIDTH / 2);
        const y = Math.min(Math.max(beganPos.y, -Height / 2 - LABEL_HEIGHT / 2), Height / 2 - LABEL_HEIGHT / 2);
        const labelPosition = cc.v2(x, y);

        this._playCoinLabelEffect({
            goldReward,
            bulletMultiple,
            labelPosition,
            beganPos,
            endPos,
            isSkill,
            isMe: player.isMe,
            deskStation,
            skipUpdateWallet,
        });
    },

    _playCoinAnim(data) {
        const {
            goldReward, bulletMultiple, beganPos, endPos, isSkill, deskStation, playBigWin, skipUpdateWallet,
        } = data;
        const coinCount = this.calculateCoin(goldReward, bulletMultiple);
        if (!isSkill && !playBigWin) {
            Emitter.instance.emit(EventCode.SOUND.EFFECT_CATCH);
        }
        const player = ReferenceManager.instance.getPlayerByDeskStation(deskStation);
        for (let i = 0; i < coinCount; ++i) {
            const coinFx = player.isMe ? PoolManager.instance.getCoin(BaseConfig.instance.COIN_TYPE.MY_COIN) : PoolManager.instance.getCoin(BaseConfig.instance.COIN_TYPE.OTHER_COIN);
            coinFx.setPosition(beganPos);
            coinFx.index = i;
            coinFx.zIndex = BaseConfig.instance.Z_INDEX.COIN;
            this.node.addChild(coinFx);
            coinFx.startAnimation(0);
            coinFx.setScale(0.4);
            coinFx.opacity = 0;
            let xRandom = i % 2 === 0 ? (15 + Math.random() * 5) : -(5 + Math.random() * 15);
            xRandom *= i;
            const yRandom = getRandomInt(-5, 5) * 7.5 - 50;
            const configPoint1 = cc.v2(beganPos.x + (beganPos.x - endPos.x) * 0.3, beganPos.y);
            const configPoint2 = cc.v2(endPos.x, beganPos.y + (beganPos.y - endPos.y) * 0.3);
            if (player.index < 2 && beganPos.y < endPos.y) {
                configPoint2.y = endPos.y + endPos.y - beganPos.y;
            }
            const bezierConfig = [
                configPoint1,
                configPoint2,
                endPos,
            ];
            coinFx.runAction(cc.sequence(
                cc.fadeIn(0.01),
                cc.moveTo(0.175, cc.v2(beganPos.x + xRandom / 2, beganPos.y + 100)),
                cc.spawn(
                    cc.moveTo(0.5, cc.v2(beganPos.x + xRandom, beganPos.y + yRandom)).easing(cc.easeBounceOut()),
                    cc.callFunc(() => {
                        if (data.isMe && coinFx.index === 0 && !isSkill) {
                            Emitter.instance.emit(EventCode.SOUND.EFFECT_GOLD);
                        }
                    }),
                ),
                cc.delayTime(0.15 + 0.025 * i),
                cc.delayTime(0.025 * i),
                cc.bezierTo(1, bezierConfig).easing(cc.easeSineIn()),
                cc.callFunc(() => {
                    if (!skipUpdateWallet && i === 0 && data.isMe) {
                        player.addToDisplayWallet(goldReward);
                    }
                    coinFx.stopAnimation();
                }),
            ));
        }
    },

    calculateCoin(goldReward, bullet) {
        const totalMultiply = goldReward / bullet;
        let coinCount = 0;
        if (totalMultiply < 10) {
            coinCount = 1;
        } else if (totalMultiply < 80) {
            coinCount = 3;
        } else if (totalMultiply < 150) {
            coinCount = 5;
        } else if (totalMultiply < 300) {
            coinCount = 6;
        } else {
            coinCount = 7;
        }
        return coinCount;
    },

    userExitBoard(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        const wheel = this._getWheel(player.index);
        if (wheel) {
            wheel.hideAnimation(false);
        }
    },

    playDropGunLaser({ fishPos, deskStation }) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(deskStation);
        if (player) {
            const endPos = getPostionInOtherNode(this.node, player.gun);
            const startPos = this.node.convertToNodeSpaceAR(fishPos);
            const itemLaser = cc.instantiate(this.itemLaser);
            this.node.addChild(itemLaser);
            this._listSkillItem.push(itemLaser);
            itemLaser.angle = player.gun.angle - 90;
            itemLaser.deskStation = deskStation;
            itemLaser.setPosition(startPos);
            itemLaser.getComponent(cc.Animation).play('DropItemLaserEffect');

            Emitter.instance.emit(EventCode.SOUND.EFFECT_GET_ITEM_LASER);

            itemLaser.runAction(
                cc.sequence(
                    cc.delayTime(0.85),
                    cc.moveTo(1, endPos).easing(cc.easeSineIn()),
                    cc.delayTime(0.58),
                    cc.callFunc(() => {
                        Emitter.instance.emit(EventCode.PLAYER_LAYER.CHANGE_GUN_LASER, deskStation);
                        const index = this._listSkillItem.indexOf(itemLaser);
                        if (index > -1) {
                            this._listSkillItem.splice(index, 1);
                        }
                    }),
                    cc.removeSelf(true),
                ),
            );
        }
    },

    clearDropGunLaserByDeskStation(deskStation) {
        if (this._listSkillItem) {
            for (let i = 0; i < this._listSkillItem.length; i++) {
                const item = this._listSkillItem[i];
                if (item.deskStation === deskStation) {
                    item.stopAllActions();
                    item.destroy();
                    this._listSkillItem.splice(i, 1);
                    break;
                }
            }
        }
    },

    triggerBombFX(posNode) {
        const itemBomb = cc.instantiate(this.itemBomb);
        const startPos = this.node.convertToNodeSpaceAR(posNode);
        this.node.addChild(itemBomb);
        this._listSkillItem.push(itemBomb);
        Emitter.instance.emit(EventCode.COMMON.SHAKE_SCREEN, { timeOneStep: 0.03, amplitude: 5 });
        itemBomb.setPosition(startPos);
        Emitter.instance.emit(EventCode.SOUND.EFFECT_BOMB);
    },

    playEffectFishSpecial(rewardData) {
        //rewardData : { Angle, BulletMultiple, DeskStation, ListFish, SkillID, TotalReward, Wallet }
        const player = ReferenceManager.instance.getPlayerByDeskStation(rewardData.DeskStation);
        this.onPlayEffectWinInCatchFish({
            player,
            gold: rewardData.TotalReward,
            bet: rewardData.BulletMultiple,
            fishKind: rewardData.fishKind,
        });
        if (player.isMe) {
            const numberPlaySound = Math.round(rewardData.TotalReward / (rewardData.BulletMultiple * 120));
            cc.tween(this.node)
                .delay(0.15)
                .repeat(numberPlaySound,
                    cc.tween().
                        call(() => {
                            Emitter.instance.emit(EventCode.SOUND.EFFECT_GOLD);
                        })
                        .delay(0.15)
                )
                .start();
        }
    },

    resetOnExit() {
        this.unscheduleAllCallbacks();
        this._listSkillItem.forEach((item) => {
            item.stopAllActions();
            if (cc.isValid(item)) {
                item.destroy();
            }
        });
        this._listSkillItem.length = 0;
        this._lisParticle.forEach((item) => {
            item.stopAllActions();
            if (cc.isValid(item)) {
                item.destroy();
            }
        });
        this._lisParticle.length = 0;
        this.bigWinWheels.forEach((wheel) => {
            if (wheel.hideAnimation) {
                wheel.hideAnimation(false);
            }
        });
        Emitter.instance.emit(EventCode.SOUND.STOP_BIG_WIN);
        this._queueAnim.length = 0;
        this._playingQueueAnim = false;

    },

    addAnimToQueueAnim(name, data) {
        const animData = {
            name: name,
            dataInfo: data,
        };
        if (this._queueAnim.length == 0 && !this._playingQueueAnim) {
            this.playQueueAnim(animData);
        } else {
            this._queueAnim.push(animData);
        }
    },

    checkQueueAnim() {
        if (this._queueAnim.length > 0) {
            const data = this._queueAnim.shift();
            this.playQueueAnim(data);
        } else {
            this._playingQueueAnim = false;
        }
    },

    playQueueAnim(data) {
        this._playingQueueAnim = true;
        switch (data.name) {
            case "EVENT":
                Emitter.instance.emit(EventCode.EFFECT_LAYER.PLAY_EFFECT_EVENT_WIN, data.dataInfo);
                break;
            case "JACKPOT":
                Emitter.instance.emit(EventCode.DRAGON.PLAY_DRAGON_BALL_JACKPOT);
                break;
        }
    },

    onDestroy() {
        this.unscheduleAllCallbacks();
        removeEvents(this);
    },

});
