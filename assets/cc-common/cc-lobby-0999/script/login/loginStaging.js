const serviceRest = require('serviceRest');
const authenPusher = require('authenPusher');

cc.Class({
    extends: cc.Component,

    onLoad() {
        const loadConfigAsync = require('loadConfigAsync');
        const {USER_TOKEN} = loadConfigAsync.getConfig();
        const userToken = cc.sys.localStorage.getItem(USER_TOKEN);
        if (userToken) {
            cc.find("Canvas/View/LoginToken/TokenInput/Input").getComponent(cc.EditBox).string = userToken;
        }
        cc.audioEngine.stopAll();
    },
    loginToken() {
        const loadConfigAsync = require('loadConfigAsync');
        const {IS_FINISHED_REMOTE, USER_TOKEN} = loadConfigAsync.getConfig();
        if (!IS_FINISHED_REMOTE) {
            setTimeout(() => {
                this.loginToken();
            }, 100);
            return;
        }
        const userToken = cc.find("Canvas/View/LoginToken/TokenInput/Input").getComponent(cc.EditBox).string;
        if (!userToken) return;
        const dataPost = {
            token: userToken,
        };
        serviceRest.post({url: 'auth/token/login', data: dataPost, callback: (res) => {
            cc.log(res);
            const {data: {data}} = res;
            if (data) {
                const {token} = data;
                if (token) {
                    cc.sys.localStorage.setItem(USER_TOKEN, token);
                    authenPusher.settingPusher(data, () => {
                        cc.director.loadScene('lobby-staging-test');
                    });
                }
            }
        }});
    },

});

