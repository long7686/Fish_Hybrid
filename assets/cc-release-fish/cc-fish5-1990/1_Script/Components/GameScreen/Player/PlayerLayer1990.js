
const { registerEvent} = require("gfUtilities");
const EventsCode = require("EventsCode1990");

cc.Class({
    extends: require('gfPlayerLayer'),

    properties: {
    },
    initEvents() {
        this._super();
        registerEvent(EventsCode.LIGHTING_CHAIN.END_EFFECT, this._endEffectLighting, this);
        registerEvent(EventsCode.GAME_LAYER.UPDATE_WALLET_OTHER_USER, this._updateWalletPlayer, this);
    },
    stopFreezeGun(){
        
    },

    _updateWalletPlayer(data){
        const player = this.getPlayerByDeskStation(data.DeskStation);
        if (player && !player.isMe) {
            if(data.Wallet || data.Wallet === 0) {
                player.updateWallet(data.Wallet);
            }
        }
    },

    _endEffectLighting(infoReward){
        const {DeskStation} = infoReward;
        const player = this.getPlayerByDeskStation(DeskStation);
        if(player){
            player.endEffectLighting(infoReward);
        }
    },
});
