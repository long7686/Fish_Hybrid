/* global CC_DEV */

const {NODE_PATH} = require('loginConfig');
const serviceRest = require('serviceRest');
const authenPusher = require('authenPusher');
const globalNetwork = require('globalNetwork');

cc.Class({
    extends: cc.Component,
    onLoad() {
        globalNetwork.triggerUserLogout();
        this.loginSuccess = this.loginSuccess.bind(this);

        this.nodeView = {
            loading: cc.find(NODE_PATH.LOADING_NODE),
            nodeLoading: cc.find(NODE_PATH.LOADING_LOGO),
        };
        this.bindButtonGUI();
        cc.audioEngine.stopAll();
    },

    loginSuccess({userText, pwText}) {
        const loadConfigAsync = require('loadConfigAsync');
        const {IS_FINISHED_REMOTE, LOBBY_SCENE_NAME} = loadConfigAsync.getConfig();
        if (!IS_FINISHED_REMOTE) {
            setTimeout(() => {
                this.loginSuccess({userText, pwText});
            }, 100);
            return;
        }
        const dataPost = {
            userName: userText,
            password: pwText,
            fingerPrint: 'test'
        };
        this.nodeView.loading.active = true;
        this.animationLoading();
        serviceRest.post({url: 'auth/login', data: dataPost, callback: (res) => {
            const {data: {data}} = res;
            if (data) {
                authenPusher.settingPusher(data, () => {
                    cc.director.loadScene(LOBBY_SCENE_NAME);
                });
            }
        }});

    },

    checkValidInput() {
        const {userInput, userPw, inputErr, pwErr} = this.nodeView;
        const userText = userInput.string.trim();
        const pwText = userPw.string.trim();
        let isValid = true;
        if (userText === '') {
            isValid = false;
            inputErr.string = 'Bạn cần nhập tên đăng nhập';
        } else {
            inputErr.string = '';
        }
        if (pwText === '') {
            isValid = false;
            pwErr.string = 'Bạn cần nhập mật khẩu';
        } else {
            pwErr.string = '';
        }
        return {isValid, userText, pwText};
    },

    bindButtonGUI() {
        // const {loginBtn, registerBtn} = this.nodeView;

        // registerBtn.off("click");
        // registerBtn.on("click", event => {
        //     cc.director.loadScene('register');
        // });

        // loginBtn.off("click");
        // loginBtn.on("click", event => {
        //     const {isValid, userText, pwText} = this.checkValidInput();
        //     let user = listUser.find(i => i.userName === userText)
        //     if (isValid) this.loginSuccess({userText, pwText});
        // });
        for (let i = 0 ; i < 70; i++) {
            const currentIndex = i + 1;
            const userBtn = cc.find('Canvas/View/testNode/user' + currentIndex);
            userBtn.off("click");
            userBtn.on("click", () => {
                let indexUser;
                if (CC_DEV) {
                    indexUser = (70 + currentIndex);
                } else {
                    indexUser = (0 + currentIndex);
                }
                let userName = 'user' + indexUser;
                let password = 'pwduser' + indexUser;
                cc.USER_INDEX = indexUser;
                this.loginSuccess({userText: userName, pwText: password});
            });
        }
    },
    stopAnimationLoading() {
        const {nodeLoading} = this.nodeView;
        nodeLoading.stopAllActions();
    },

    animationLoading() {
        const {nodeLoading} = this.nodeView;
        nodeLoading.scaleX = 1;
        nodeLoading.scaleY = 1;
        const actionBy = cc.scaleTo(0.4, 0, 1);
        const actionTo = cc.scaleTo(0.4, 1, 1);
        const delay = cc.delayTime(0.7);

        const repeater = cc.repeatForever(cc.sequence(
            actionBy,
            delay.clone(),
            actionTo
        ));
        nodeLoading.runAction(repeater);
    },
    onDestroy() {
        this.stopAnimationLoading();
    }
});
