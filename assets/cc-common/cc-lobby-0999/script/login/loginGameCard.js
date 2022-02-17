const {NODE_PATH} = require('loginConfig');
const serviceRest = require('serviceRest');
const authenPusher = require('authenPusher');
const globalNetwork = require('globalNetwork');

const listUser =
[
    '495b78409e5594303a357428b86f68bf',
    'b13125c8858da1378100b0dcc69683b0',
    '06b2ba24d395c6ab42b0a8a5b43bd160',
    '3be0838ad234d305b27dbc5c287baabf',
    'c24a63d71cf63740dac7d3745964f9bc',
    'b9d64720c68092f90f0109f908567e64',
    'e817232d68e5d1a9b96be105c32af89d',
    'e416980a33d57a02dddf27319cd07275',
    '9103e866ff64c4dc0a38b8ceadb2514d',
    '204592e674f14deeb753e3f5b243d1e6',
    'ece373e89fc7b54226268b22d69dc399',
    '15526655635593de276064b96bb68978',
    'da2f888d8dc6514e365991ce19639b02',
    'a34e186d3dd9d7ade86948faf89f7078',
    'a3ed13389476aad164e69370d2ea858b',
    'b01c9667d6a18231e1297ea94f1c0e07',
    'b6fac5393e65c6252ae5f194f0d99f54',
    'abd5d31fa4e00de5ed9dc4c00bacd6fa',
    '4fa941394354cb81e899a14f87703c81',
    'f228b86a202c430bb96109692276d6ad',
    '2eb4583ecbb14e2c9caadd2c99662fa6',
    '150896fa1ebb91b52c82083e60e1b867',
    '048129831f54d829d91dbcbdc0b97390',
    'b66d3a1d70b66a89f44d7555383c5dc5',
    '0fc940816fbd75f88b0e11bf52c352c0',
    'b7777163df12d132e76265e6cffbbf51',
    //   'e147033871d3d25e1e16c443522d33cb',
    //   '865464bf03ab734f9441db1b782f7c6e',
    '1631062967cce18d2795803177a916bf',
    '1a15cf8299c638626651fbb02c7bcc99',
];

cc.Class({
    extends: cc.Component,
    onLoad() {
        globalNetwork.triggerUserLogout();
        this.loginSuccess = this.loginSuccess.bind(this);

        this.nodeView = {
            userInput: cc.find(NODE_PATH.USER_INPUT).getComponent(cc.EditBox),
            userPw: cc.find(NODE_PATH.PASSWORD_INPUT).getComponent(cc.EditBox),
            delayTime: cc.find(NODE_PATH.DELAY_TIME_INPUT).getComponent(cc.EditBox),

            inputErr: cc.find(NODE_PATH.USER_ERROR).getComponent(cc.Label),
            pwErr: cc.find(NODE_PATH.PASSWORD_ERROR).getComponent(cc.Label),
            loginBtn: cc.find(NODE_PATH.LOGIN_BUTTON),
            registerBtn: cc.find(NODE_PATH.REGISTER_BUTTON),

            loading: cc.find(NODE_PATH.LOADING_NODE),
            nodeLoading: cc.find(NODE_PATH.LOADING_LOGO),
        };
        this.bindButtonGUI();
        cc.audioEngine.stopAll();
    },

    loginSuccess(token) {
        const loadConfigAsync = require('loadConfigAsync');
        const {USER_TOKEN} = loadConfigAsync.getConfig();
        if (token) {
            const dataPost = {
                token,
            };
            this.nodeView.loading.active = true;
            this.animationLoading();
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
        }
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
        const { registerBtn} = this.nodeView;
        
        registerBtn.off("click");
        registerBtn.on("click", () => {
            cc.director.loadScene('register');
        });

        listUser.forEach((token, index) => {
            const currentIndex = index + 1;
            const userBtn = cc.find('Canvas/View/testNode/user' + currentIndex);
            userBtn.off("click");
            userBtn.on("click", () => {
                this.loginSuccess(token);
            });
        });
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
