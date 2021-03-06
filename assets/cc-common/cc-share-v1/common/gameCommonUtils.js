/* global closeCreatorGame */

const lodash = require('lodash');
const {setDeviceOrientation} = require('utils');

function gameCommonUtils() {

    const getUrlParam = (name) => {
        if (cc.sys.isNative) return null;
        const url = new URL(window.location);
        return url.searchParams.get(name);
    };

    const addUrlParam= (key, value) => {
        if (cc.sys.isNative) return null;
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    };

    const checkConditionCloseGameIframe  = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
        if  (!LOGIN_IFRAME) {
            return true;
        }
        const returnUrl = getUrlParam('ru');
        return (returnUrl && LOGIN_IFRAME);
    };

    const handleCloseGameIframe = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOBBY_SCENE_NAME, LOGIN_IFRAME, IS_PRODUCTION} = loadConfigAsync.getConfig();

        if (cc.sys.isNative && typeof(closeCreatorGame) === 'function') {
            closeCreatorGame();
            return;
        }
        if  (!LOGIN_IFRAME) {
            if (!IS_PRODUCTION) {
                setDeviceOrientation(false);
            }
            cc.director.preloadScene(LOBBY_SCENE_NAME, () => {
                cc.director.loadScene(LOBBY_SCENE_NAME);
            });
            return;
        }

        const returnUrl = getUrlParam('ru');
        if (returnUrl && LOGIN_IFRAME) {
            if (returnUrl.trim() === 'close') {
                window.close();
            } else {
                window.location.href = returnUrl;
            }
        } else {
            location.reload();
            // window.close();
        }
    };

    const handleFlowOutGame = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOBBY_SCENE_NAME, LOGIN_IFRAME, IS_PRODUCTION} = loadConfigAsync.getConfig();
        if (LOGIN_IFRAME) {
            if (window && window.location) {
                window.location.reload();
            }
        } else {
            if (cc.sys.isNative && typeof(closeCreatorGame) === 'function') {
                closeCreatorGame();
            }
            else
            {
                if (!IS_PRODUCTION) {
                    setDeviceOrientation(false);
                }
                cc.director.preloadScene(LOBBY_SCENE_NAME, () => {
                    cc.director.loadScene(LOBBY_SCENE_NAME);
                });
            }
        }
    };
    const handleBackLogin = () => {
        const loadConfigAsync = require('loadConfigAsync');
        const {LOGIN_IFRAME, LOBBY_SCENE_NAME, IS_PRODUCTION, LOGIN_SCENE_NAME} = loadConfigAsync.getConfig();
        if (LOGIN_IFRAME) {
            if (window && window.location) {
                window.location.reload();
            }
        } else {
            if (cc.sys.isNative && typeof(closeCreatorGame) === 'function') {
                closeCreatorGame();
            }
            else
            {
                if (IS_PRODUCTION) {
                    cc.director.preloadScene(LOBBY_SCENE_NAME, () => {
                        cc.director.loadScene(LOBBY_SCENE_NAME);
                    });
                } else {
                    const nodePersist = cc.director.getScene().getChildByName('OverlayPersistent');
                    if (nodePersist) {
                        cc.game.removePersistRootNode(nodePersist);
                    }
                    setDeviceOrientation(false);
                    cc.director.preloadScene(LOGIN_SCENE_NAME, () => {
                        cc.director.loadScene(LOGIN_SCENE_NAME);
                    });
                }
            }
        }
    };
    const getMessageSlot = (mess = {}) => {
        return Object.assign({
            NAME: 'DialogMessage',
            NO_MONEY: 'S??? d?? trong v?? kh??ng ?????, vui l??ng n???p th??m ????? ch??i ti???p.',
            LOST_CONNECT: 'B???n ???? b??? m???t k???t n???i. \n Vui l??ng ch??? ...',
            SPIN_4_EVER: 'B???n ???? m???t k???t n???i. \n Vui l??ng th??? l???i.',
            ANOTHER_ACCOUNT: 'T??i kho???n c???a b???n ????\n????ng nh???p t??? thi???t b??? kh??c.',
            AUTHEN_FAILED: 'X??c th???c t??i kho???n th???t b???i.',
            DEPOSIT_MONEY: 'S??? d?? kh??ng ?????, b???n c?? mu???n n???p th??m ?',
            MISMATCH_DATA: 'D??? li???u kh??ng ?????ng b??? v???i m??y ch???, vui l??ng th??? l???i.',
            SYSTEM_ERROR: 'C?? l???i x???y ra, vui l??ng th??? l???i.',
            DISCONNECT: 'B??? m???t k???t n???i t???i m??y ch???\n ??ang k???t n???i l???i.',
            NO_PLAYSESSION: 'H??? th???ng kh??ng t??m th???y phi??n ch??i.',
            GROUP_MAINTAIN: 'H??? th???ng ??ang b???o tr??.\nVui l??ng quay l???i sau.',
            NETWORK_WARNING: '???????ng truy???n m???ng y???u!',
            NETWORK_DISCONNECT: 'B??? m???t k???t n???i t???i m??y ch??? \n??ang k???t n???i l???i.',
            NO_FREESPIN_OPTION: 'D??? li???u kh??ng ?????ng b??? v???i m??y ch???, vui l??ng th??? l???i.',
            IN_PROGRESSING: 'M???ng ch???m vui l??ng ?????i trong gi??y l??t ????? ho??n th??nh\nl?????t quay ho???c b???m x??c nh???n ????? t???i l???i game.',
            SPIN_UNSUCCESS: 'Thao t??c kh??ng th??nh c??ng, vui l??ng th??? l???i.',
            ACCOUNT_BLOCKED: 'T??i kho???n c???a b???n ???? b??? kho??, vui l??ng li??n h??? admin.',
            FINISH_DEMO: '????Y L?? B???N DEMO,\nB???N C?? MU???N CH??I TH???T KH??NG?',
            SUGGEST_TURBO: 'WOW, NHANH QU??!!!\nB???N C?? MU???N M??? CH??? ????? QUAY NHANH?',
            EVENT_ENDED: 'S??? ki???n ???? k???t th??c.',
        }, mess);
    };
    const getMessageSlotEng = (mess = {}) => {
        return Object.assign({
            NAME: 'DialogMessage',
            NO_MONEY: 'You have run out of your balance, please top up.',
            LOST_CONNECT: 'Your device is not connected to the Internet.\nPlease try again.',
            SPIN_4_EVER: 'Your device is not connected to the Internet.\nPlease try again.',
            ANOTHER_ACCOUNT: 'You are logging in another device.',
            AUTHEN_FAILED: 'Authentication failed',
            DEPOSIT_MONEY: 'Your balance is not enough, do you want to top up?',
            MISMATCH_DATA: 'Data is not synchronized between client and server',
            SYSTEM_ERROR: 'System error, please try again later',
            DISCONNECT: 'Message Disconnect',
            NO_PLAYSESSION: 'Playsession is not correct',
            GROUP_MAINTAIN: 'Server is under maintenance, please try again later',
            NETWORK_WARNING: '???????ng truy???n m???ng y???u!',
            NETWORK_DISCONNECT: 'B??? m???t k???t n???i t???i m??y ch??? \n??ang k???t n???i l???i.',
            NO_FREESPIN_OPTION: 'D??? li???u kh??ng ?????ng b??? v???i m??y ch???, vui l??ng th??? l???i.',
            SPIN_UNSUCCESS: 'Thao t??c kh??ng th??nh c??ng, vui l??ng th??? l???i.',
            ACCOUNT_BLOCKED: 'T??i kho???n c???a b???n ???? b??? kho??, vui l??ng li??n h??? admin.',
            FINISH_DEMO: '????Y L?? B???N DEMO,\nB???N C?? MU???N CH??I TH???T KH??NG?',
            SUGGEST_TURBO: 'WOW, NHANH QU??!!!\nB???N C?? MU???N M??? CH??? ????? QUAY NHANH?'
        }, mess);
    };
    const getBetValueWithGame = (gameId, listBet = []) => {
        if (!gameId) return '';

        let betValue = cc.sys.localStorage.getItem('betValueWithGame');
        if (lodash.isEmpty(betValue)) {
            const newObj = {};
            newObj[gameId] = '';
            cc.sys.localStorage.setItem('betValueWithGame', JSON.stringify(newObj));
        } else {
            betValue = JSON.parse(betValue);
            if (lodash.isEmpty(listBet)) {
                return betValue[gameId];
            } else {
                if (lodash.isArray(listBet) && listBet.includes(betValue[gameId])) {
                    return betValue[gameId];
                } else {
                    let isExist = false;
                    Object.keys(listBet).map((betId) => {
                        if (listBet[betId] === betValue[gameId]) {
                            isExist = true;
                        }
                    });
                    if (isExist) {
                        return betValue[gameId];
                    }
                }
            }
        }
        return '';
    };

    const setBetValueWithGame = (gameId, betId)  => {
        let betValue = cc.sys.localStorage.getItem('betValueWithGame');
        if (lodash.isEmpty(betValue)) {
            const newObj = {};
            newObj[gameId] = betId;
            cc.sys.localStorage.setItem('betValueWithGame', JSON.stringify(newObj));
        } else {
            betValue = JSON.parse(betValue);
            betValue[gameId] = betId;
            cc.sys.localStorage.setItem('betValueWithGame', JSON.stringify(betValue));
        }
    };

    const getKeyWithGame = (gameId, key, value = '') => {
        if (!gameId || !key) return '';

        let betLinesValue = cc.sys.localStorage.getItem(key);
        if (lodash.isEmpty(betLinesValue)) {
            const newObj = {};
            newObj[gameId] = value;
            cc.sys.localStorage.setItem(key, JSON.stringify(newObj));
        } else {
            betLinesValue = JSON.parse(betLinesValue);
            return betLinesValue[gameId] ? betLinesValue[gameId] : value;
        }
        return value;
    };

    const setKeyWithGame = (gameId, key, value = '')  => {
        if (!gameId || !key) return '';

        let betLinesValue = cc.sys.localStorage.getItem(key);
        if (lodash.isEmpty(betLinesValue)) {
            const newObj = {};
            newObj[gameId] = value;
            cc.sys.localStorage.setItem(key, JSON.stringify(newObj));
        } else {
            betLinesValue = JSON.parse(betLinesValue);
            betLinesValue[gameId] = value;
            cc.sys.localStorage.setItem(key, JSON.stringify(betLinesValue));
        }
    };

    const optimizeScrollView = (listView) => {
        let view = listView.parent;
        let viewRect = cc.rect(- view.width / 2, - listView.y - view.height, view.width, view.height);
        for (let i = 0; i < listView.children.length; i++) {
            const node = listView.children[i];
            if (viewRect.intersects(node.getBoundingBox())) {
                node.opacity = 255;
            }
            else {
                node.opacity = 0;
            }
        }
    };

    return {
        checkConditionCloseGameIframe,
        handleCloseGameIframe,
        setBetValueWithGame,
        getBetValueWithGame,
        handleBackLogin,
        handleFlowOutGame,
        getMessageSlot,
        getMessageSlotEng,
        getUrlParam,
        optimizeScrollView,
        getKeyWithGame,
        setKeyWithGame,
        addUrlParam
    };
}

module.exports = new gameCommonUtils();
