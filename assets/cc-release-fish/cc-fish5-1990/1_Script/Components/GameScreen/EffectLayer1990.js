

const BaseConfig = require('gfBaseConfig');
const ReferenceManager = require('gfReferenceManager');
const EventCode = require("EventsCode1990");
const Emitter = require('gfEventEmitter');
const PoolManager = require('gfPoolManager');
const GameConfig = require('Config1990');
const { getPostionInOtherNode, getRandomInt} = require('utils');
const { registerEvent } = require("gfUtilities");

const GHOST_SHIP_MIN_VALUE_BIG_WIN = 100000;
cc.Class({

    extends: require('gfEffectLayer'),

    properties: {
        explosionDie: cc.Prefab,
        listIconFish:{
            default: [],
            type: cc.SpriteFrame
        },
        listIconText:{
            default: [],
            type: cc.SpriteFrame
        }
    },

    onLoad(){
        this._super();
        for (let i = 0; i < this.bigWinWheels.length; i++) {
            const itemComp = this.bigWinWheels[i];
            itemComp.setUpListAvatarIcon(this.listIconFish);
            itemComp.setUpListTextFrame(this.listIconText);
        }
    },

    initEvents() {
        this._super();
        registerEvent(EventCode.EFFECT_LAYER.PLAY_REWARD_GHOST_SHIP, this.playRewardGhostShip, this);
        registerEvent(EventCode.GODZILLA.GODZILLA_PLASMA_EFFECT, this.playPlasmaEffect, this);
        registerEvent(EventCode.LIGHTING_CHAIN.EFFECT_DIE, this._playLightingChainBigWinEffect, this);
    },

    playLuckyEffect(data) {
        this.playCoinReward(data);
    },

    playCoinReward(rewardData) {
        let { data, fishPos, fishKind } = rewardData;
        if (fishPos) {
            fishPos = this.node.convertToNodeSpaceAR(fishPos);
        } else {
            fishPos = this.getRandomPositionOutScreen();
        }

        if (data.GoldReward >= data.BulletMultiple * BaseConfig.instance.BIG_WIN_RATIO.BIG_WIN_VALUE && !data.isSkill) {
            this._playBigWinEffect({
                deskStation: data.DeskStation,
                beganPos: fishPos,
                gold: data.GoldReward,
                bet: data.BulletMultiple,
                fishKind: fishKind,
            });

        } else {
            let skipUpdateWallet = data.skipUpdateWallet;
            if (!skipUpdateWallet && data.isSkill) {
                skipUpdateWallet = true;
            }
            this._playCoinEffect({
                deskStation: data.DeskStation,
                fishKind: fishKind,
                beganPos: fishPos,
                goldReward: data.GoldReward,
                isSkill: data.isSkill,
                bulletMultiple: data.BulletMultiple,
                skipUpdateWallet,
                skillID: data.skillID
            });
        }
    },
    _playCoinEffect(data) {
        const {
            deskStation, fishKind, beganPos, goldReward, isSkill, bulletMultiple, skipUpdateWallet, skillID
        } = data;
        if (goldReward === 0) {
            return;
        }
        const player = ReferenceManager.instance.getPlayerByDeskStation(deskStation);
        const endPos = getPostionInOtherNode(this.node, player.avatar.node);

        // let angle = parseInt(Math.random() * 30);
        // angle = Math.random() > 0.5 ? angle : -angle;
        if (fishKind === BaseConfig.instance.FISH_KIND.MINIBOSS) {
            beganPos.y -= 65;
        }
        const playEffectCoin = function () {
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
        }.bind(this);

        if (skillID === GameConfig.instance.SkillConfig.LASER ) {
            PoolManager.instance.createSmallExplosion({ position: beganPos });
            this.scheduleOnce(() => {
                playEffectCoin();
            }, 0.8);
        } else if( skillID === GameConfig.instance.SkillConfig.PLASMA){
            PoolManager.instance.createSmallExplosion({ position: beganPos });
            this.scheduleOnce(() => {
                playEffectCoin();
            }, 0.1);
        }
        else {
            playEffectCoin();
        }
    },

    playEffectFishSpecial(rewardData) {
        let fishKind = 0;
        switch (rewardData.SkillID) {
        case GameConfig.instance.SkillConfig.LASER:
            fishKind = GameConfig.instance.FISH_KIND.LASER_CRAB;
            break;
        case GameConfig.instance.SkillConfig.FISH_BOMB:
            fishKind = GameConfig.instance.FISH_KIND.BOMB;
            // eslint-disable-next-line no-case-declarations
            const player = ReferenceManager.instance.getPlayerByDeskStation(rewardData.DeskStation);
            this.onPlayEffectWinInCatchFish({
                player: player,
                gold: rewardData.TotalReward,
                bet: rewardData.BulletMultiple,
                fishKind: fishKind,
            });
            break;
        }
    },

    _playLightingChainBigWinEffect(rewardData) {

        const player = ReferenceManager.instance.getPlayerByDeskStation(rewardData.DeskStation);
        this.onPlayEffectWinInCatchFish({
            player: player,
            gold: rewardData.TotalReward,
            bet: rewardData.BulletMultiple,
            fishKind: GameConfig.instance.FISH_KIND.LASER_CRAB,
        });

    },


    _playBigWinEffect(data) {
        const { deskStation, beganPos, gold, bet, fishKind } = data;
        if (gold === 0) {
            return;
        }
        const player = ReferenceManager.instance.getPlayerByDeskStation(deskStation);
        // const endPos = getPostionInOtherNode(this.node, player.avatar.node);
        if(fishKind !== GameConfig.instance.FISH_KIND.DRAGON) {
            Emitter.instance.emit(EventCode.SOUND.BIG_FISH_EXPLORE);
            let particle = cc.instantiate(this.particle3D);
            particle.parent = this.node;
            particle.position = beganPos;
            particle.setIsMe(player.isMe);
            particle.setLifetime(0.2);
            particle.setSpawnRate(30);
            particle.setItemSpeed(500, 750);
            particle.setGravity(-400);
            particle.setSpawnInterval(0.2);
            particle.setDuration(0.3);
            particle.startAnimation();


            cc.tween(particle)
                .delay(0.65)
                .to(0.4, {opacity: 0})
                .call(() => {
                    particle.stopAnimation();
                    particle.removeFromParent(true);
                    particle.destroy();
                })
                .start();


            PoolManager.instance.createBigExplosion({position: beganPos});
        }

        this.onPlayEffectWinInCatchFish({
            player: player,
            gold: gold,
            bet: bet,
            fishKind: fishKind,
        });
    },

    playRewardGhostShip(rewardData) {
        // 100k - 300k - 1M
        let { listUserWin, fishPos, fishKind, userKill } = rewardData; // eslint-disable-line
        //@TODO: add effect win for ghostShip
        if (fishPos) {
            fishPos = this.node.convertToNodeSpaceAR(fishPos);
        } else {
            fishPos = this.getRandomPositionOutScreen();
        }
        // Show explosion
        const explosion = cc.instantiate(this.explosionDie);
        explosion.parent = this.node;
        explosion.setPosition(fishPos);
        explosion.playAnimation(0.5, () => {
            for (let i = 0; i < listUserWin.length; i++) {
                const userWinInfo = listUserWin[i];
                const player = ReferenceManager.instance.getPlayerByDeskStation(userWinInfo.DeskStation);
                const endPos = getPostionInOtherNode(this.node, player.avatar.node);
                let startPos = Object.assign({}, fishPos);
                startPos = cc.v2(startPos.x + getRandomInt(-5,5)*10, startPos.y + getRandomInt(-5,5)*10);
                let skipUpdate = true;
                // Show bigwin
                if (userWinInfo.GoldReward >= GHOST_SHIP_MIN_VALUE_BIG_WIN) {
                    this._onPlayEffectWinGhostShip({
                        player: player,
                        gold: userWinInfo.GoldReward,
                        bet: 100,
                        fishKind: fishKind,
                        isKill: userKill === userWinInfo.DeskStation
                    });
                }else{
                    if(player.isMe)
                        skipUpdate = false;
                }

                // Show coin
                this._playCoinLabelEffect({
                    goldReward: userWinInfo.GoldReward,
                    bulletMultiple: parseInt(100000 / 80),
                    labelPosition: Object.assign({}, startPos),
                    beganPos: Object.assign({}, startPos),
                    endPos: endPos,
                    isSkill: false,
                    isMe: player.isMe,
                    deskStation: userWinInfo.DeskStation,
                    playBigWin: true,
                    skipUpdateWallet: skipUpdate,
                });


            }
        });
        const playerKill = ReferenceManager.instance.getPlayerByDeskStation(userKill);
        this._playParticle3D(playerKill.isMe, fishPos);
        this._listSkillItem.push(explosion);
    },

    playPlasmaEffect(data) {
        const player = ReferenceManager.instance.getPlayerByDeskStation(data.DeskStation);
        this.onPlayEffectWinInCatchFish({
            player: player,
            gold: data.WinAmount,
            bet: data.BulletMultiple,
            fishKind: GameConfig.instance.FISH_KIND.DRAGON + '_0',
        });
    },

    _onPlayEffectWinGhostShip(data) {
        const { player, gold, bet, fishKind, isKill } = data;
        const wheel = this._getWheel(player.index);
        if (wheel) {
            wheel.showAnimation({ gold: gold, bet: bet, isMe: player.isMe, fishKind: fishKind, isTextImage: true, isKill: isKill });
        }
    },

    _playParticle3D(isMe, beganPos){
        let particle = cc.instantiate(this.particle3D);
        particle.parent = this.node;
        particle.position = beganPos;
        particle.setIsMe(isMe);
        particle.setLifetime(0.2);
        particle.setSpawnRate(30);
        particle.setItemSpeed(500, 750);
        particle.setGravity(-400);
        particle.setSpawnInterval(0.2);
        particle.setDuration(0.3);
        particle.startAnimation();
        this._lisParticle.push(particle);

        cc.tween(particle)
            .delay(0.65)
            .to(0.4, {opacity: 0})
            .call(() => {
                particle.stopAnimation();
                particle.removeFromParent(true);
                particle.destroy();
            })
            .start();
    },

});
