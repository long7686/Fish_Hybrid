

const globalNetwork = require('globalNetwork');
let { userText, pwText} = require('mock');
const serviceRest = require('serviceRest');
const uuid = require('custom-uuid');

cc.Class({
    getToken() {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME, URL_TOKEN, USER_TOKEN, TOKEN} = loadConfigAsync.getConfig();
        let token = '';
        if (TOKEN) {
            token = TOKEN;
        }
        else if (LOGIN_IFRAME) {
            const {getUrlParam, addUrlParam} = require('gameCommonUtils');
            const TRIAL_PARAM = 'trialMode';
            
            let trialMode = false;
            token = getUrlParam(URL_TOKEN);
            trialMode = (getUrlParam(TRIAL_PARAM) === 'true');
            if (!token && trialMode) {
                token = `tr-${uuid()}`;
                addUrlParam("token", token);
            }
            cc.sys.localStorage.setItem(USER_TOKEN, token);
        } else {
            token = cc.sys.localStorage.getItem(USER_TOKEN);
        }
        return token;
    },
    loginScene({callback, gameId, userIndex, callbackAuthFailed}) {
        cc.log("Login using V3");
        const loadConfigAsync = require('loadConfigAsync');
        const {IS_FINISHED_REMOTE, DEV_ENV, USER_TOKEN} = loadConfigAsync.getConfig();
        if (!IS_FINISHED_REMOTE) {
            setTimeout(() => {
                this.loginScene({callback, gameId, userIndex, callbackAuthFailed});
            }, 100);
            return;
        }
        this.gameId = gameId;
        let token = this.getToken();
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        const envId = LOGIN_IFRAME ? 'iframe' : 'portal';
        const gameIdSocket = LOGIN_IFRAME ? gameId : 'all';
        // token = '2f8b65390e1d19c38e86394bb6b928c2';
        if (token || !DEV_ENV) {
            if (token) {
                globalNetwork.init(token, envId, gameIdSocket);
                callback();
            }  else {
                callbackAuthFailed();
            }
        } else {
            let dataPost = {
                userName: userText,
                password: pwText,
                fingerPrint: 'test'
            };
            if (cc.USER_INDEX) {
                dataPost = {
                    userName: 'user' + cc.USER_INDEX,
                    password: 'pwduser' + cc.USER_INDEX,
                    fingerPrint: 'test'
                };
            }
            serviceRest.post({url: 'auth/login', data: dataPost, callback: ({data}) => {
                cc.sys.localStorage.setItem(USER_TOKEN, data.data.token);
                globalNetwork.init(data.data.token, envId, gameIdSocket);
                callback();
            }, callbackErr: ()=>{
                callbackAuthFailed && callbackAuthFailed();
            }});
        }
    },
});