

const DataStore = require('gfDataStore');
const GameConfig = require('Config1990');
const {formatMoney} = require('utils');
const { formatUserName } = require("gfUtilities");
cc.Class({
    extends: require("gfLobbyLayer"),
    onUpdateInfo() {
        const selfInfo = DataStore.instance.getSelfInfo();
        this.txtUserName.string = formatUserName(selfInfo.Username);
        this.txtWallet.string = "$ " + formatMoney(selfInfo.Wallet);
        let frameAvatar = this.avatarAtlas.getSpriteFrame(selfInfo.Avatar);
        if(!frameAvatar){
            frameAvatar = this.avatarAtlas.getSpriteFrame(GameConfig.instance.DEFAULT_AVATAR);
        }
        this.avatarSprite.spriteFrame = frameAvatar;
    },

    onUpdateLobbyWallet(data) {
        this.txtWallet.string = "$ " + formatMoney(data);
    },
    
    onUpdateLobbyJackpot(amount) {
        const newJP = parseInt(amount);
        this.txtJackpot.onUpdateValue(newJP, 3000, true, "$");
    },
});
