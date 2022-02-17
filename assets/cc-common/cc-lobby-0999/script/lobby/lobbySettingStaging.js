

cc.Class({
    extends: cc.Component,
    properties: {
        bgAudio: {
            type: cc.AudioClip,
            default: []
        }
    },
    onLoad() {
        this.load();
    },
    load() {
        const loadConfigAsync = require('loadConfigAsync');
        const {IS_FINISHED_REMOTE} = loadConfigAsync.getConfig();
        if (!IS_FINISHED_REMOTE) {
            setTimeout(() => {
                this.load();
            }, 100);
            return;
        } else {
            // const {getUrlParam} = require('gameCommonUtils');
            // const sssToken = getUrlParam(URL_TOKEN);
            // if (sssToken) {
            //     cc.sys.localStorage.setItem(USER_TOKEN,sssToken);
            // }
        }
    },
    start() {
        const rand = Math.floor(Math.random() * 3);

        let enableBG = cc.sys.localStorage.getItem('enableBackgroundMusic') || '';
        enableBG = enableBG === 'true' || enableBG === '';

        if (enableBG && this.bgAudio && this.bgAudio.length) {
            if (!cc.audioEngine.isMusicPlaying()) {
                cc.audioEngine.playMusic(this.bgAudio[rand], true, 1);
            }
        }
    },
});
