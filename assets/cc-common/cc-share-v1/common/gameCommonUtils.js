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
            NO_MONEY: 'Số dư trong ví không đủ, vui lòng nạp thêm để chơi tiếp.',
            LOST_CONNECT: 'Bạn đã bị mất kết nối. \n Vui lòng chờ ...',
            SPIN_4_EVER: 'Bạn đã mất kết nối. \n Vui lòng thử lại.',
            ANOTHER_ACCOUNT: 'Tài khoản của bạn đã\nđăng nhập từ thiết bị khác.',
            AUTHEN_FAILED: 'Xác thực tài khoản thất bại.',
            DEPOSIT_MONEY: 'Số dư không đủ, bạn có muốn nạp thêm ?',
            MISMATCH_DATA: 'Dữ liệu không đồng bộ với máy chủ, vui lòng thử lại.',
            SYSTEM_ERROR: 'Có lỗi xảy ra, vui lòng thử lại.',
            DISCONNECT: 'Bị mất kết nối tới máy chủ\n Đang kết nối lại.',
            NO_PLAYSESSION: 'Hệ thống không tìm thấy phiên chơi.',
            GROUP_MAINTAIN: 'Hệ thống đang bảo trì.\nVui lòng quay lại sau.',
            NETWORK_WARNING: 'Đường truyền mạng yếu!',
            NETWORK_DISCONNECT: 'Bị mất kết nối tới máy chủ \nĐang kết nối lại.',
            NO_FREESPIN_OPTION: 'Dữ liệu không đồng bộ với máy chủ, vui lòng thử lại.',
            IN_PROGRESSING: 'Mạng chậm vui lòng đợi trong giây lát để hoàn thành\nlượt quay hoặc bấm xác nhận để tải lại game.',
            SPIN_UNSUCCESS: 'Thao tác không thành công, vui lòng thử lại.',
            ACCOUNT_BLOCKED: 'Tài khoản của bạn đã bị khoá, vui lòng liên hệ admin.',
            FINISH_DEMO: 'ĐÂY LÀ BẢN DEMO,\nBẠN CÓ MUỐN CHƠI THẬT KHÔNG?',
            SUGGEST_TURBO: 'WOW, NHANH QUÁ!!!\nBẠN CÓ MUỐN MỞ CHẾ ĐỘ QUAY NHANH?',
            EVENT_ENDED: 'Sự kiện đã kết thúc.',
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
            NETWORK_WARNING: 'Đường truyền mạng yếu!',
            NETWORK_DISCONNECT: 'Bị mất kết nối tới máy chủ \nĐang kết nối lại.',
            NO_FREESPIN_OPTION: 'Dữ liệu không đồng bộ với máy chủ, vui lòng thử lại.',
            SPIN_UNSUCCESS: 'Thao tác không thành công, vui lòng thử lại.',
            ACCOUNT_BLOCKED: 'Tài khoản của bạn đã bị khoá, vui lòng liên hệ admin.',
            FINISH_DEMO: 'ĐÂY LÀ BẢN DEMO,\nBẠN CÓ MUỐN CHƠI THẬT KHÔNG?',
            SUGGEST_TURBO: 'WOW, NHANH QUÁ!!!\nBẠN CÓ MUỐN MỞ CHẾ ĐỘ QUAY NHANH?'
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
