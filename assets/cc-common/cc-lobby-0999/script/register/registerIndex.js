const {NODE_PATH} = require('registerConfig');
const serviceRest = require('serviceRest');

cc.Class({
    extends: cc.Component,

    onLoad () {
        this.nodeView = {
            registerBtn: cc.find(NODE_PATH.REGISTER_BUTTON),
            loginBtn: cc.find(NODE_PATH.LOGIN_BUTTON),

            userInput: cc.find(NODE_PATH.USER_INPUT).getComponent(cc.EditBox),
            displayNameInput: cc.find(NODE_PATH.DISPLAY_NAME_INPUT).getComponent(cc.EditBox),
            pwInput: cc.find(NODE_PATH.PASSWORD_INPUT).getComponent(cc.EditBox),
            rePwInput: cc.find(NODE_PATH.RE_PASSWORD_INPUT).getComponent(cc.EditBox),

            userErr: cc.find(NODE_PATH.USER_ERROR).getComponent(cc.Label),
            displayNameErr: cc.find(NODE_PATH.DISPLAY_NAME_ERROR).getComponent(cc.Label),
            pwErr: cc.find(NODE_PATH.PASSWORD_ERROR).getComponent(cc.Label),
            rePwErr: cc.find(NODE_PATH.RE_PASSWORD_ERROR).getComponent(cc.Label),

            successMsg: cc.find(NODE_PATH.SUCCESS_MSG),
            
        };

        this.bindButtonGUI();
    },

    checkValidInput() {
        const {
            userInput, displayNameInput, pwInput, rePwInput,
            userErr, displayNameErr, pwErr, rePwErr
        } = this.nodeView;
        const userText = userInput.string.trim();
        const dnText = displayNameInput.string.trim();
        const pwText = pwInput.string.trim();
        const rePwText = rePwInput.string.trim();

        let isValid = true;
        if (userText === '') {
            isValid = false;
            userErr.string = 'Bạn cần nhập tên đăng nhập';
        } else {
            userErr.string = '';
        }

        if (dnText === '') {
            isValid = false;
            displayNameErr.string = 'Bạn cần nhập tên hiển thị';
        } else {
            displayNameErr.string = '';
        }
        if (pwText === '') {
            isValid = false;
            pwErr.string = 'Bạn cần nhập mật khẩu';
        } else {
            pwErr.string = '';
            if (pwText !== rePwText) {
                isValid = false;
                pwErr.string = 'Bạn cần nhập cùng một mật khẩu';
                rePwErr.string = 'Bạn cần nhập cùng một mật khẩu';
            }
        }
        return {isValid, userText, pwText, dnText};
    },

    registerSuccess({userText, pwText, dnText}) {
        const dataPost = {
            userName: userText,
            password: pwText,
            displayName: dnText,
            fingerPrint: 'postman',
            captcha: 'captcha'
        };
        const {successMsg} = this.nodeView;
        serviceRest.post({url: 'auth/register', data: dataPost, callback: (res) => {
            const {data: {data}} = res;
            if (data.success) {
                successMsg.active = true;
                setTimeout(() => {
                    cc.director.loadScene('login');
                }, 3000);
            }
        }});
    },

    bindButtonGUI() {
        const {registerBtn, loginBtn} = this.nodeView;
        

        loginBtn.off("click");
        loginBtn.on("click", () => {
            cc.director.loadScene('login');
        });
        registerBtn.off("click");
        registerBtn.on("click", () => {
            const {isValid, userText, pwText, dnText} = this.checkValidInput();
            if (isValid) this.registerSuccess({userText, pwText, dnText});
        });
    }
});
