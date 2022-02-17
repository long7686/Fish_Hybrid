/* global Sentry */

const messageManager = require('message-manager');
const serviceRest = require('serviceRest');

function globalNetworkV3() {
    this.gamesData = {};
    this.token = null;
    this.init = (token, envId = 'portal', gameIdSocket = 'all') => {
        cc.log("Network using V3");
        this.token = token;
        const loadConfigAsync = require('loadConfigAsync');
        const {SOCKET_URL} = loadConfigAsync.getConfig();
        const deviceInfo = {
            os: cc.sys.os,
            osVersion: cc.sys.osVersion,
            platform: cc.sys.platform,
            browser: cc.sys.browserType,
            browserVersion: cc.sys.browserVersion,
            language: cc.sys.language
        };
        messageManager.initSocket(SOCKET_URL, token, {serviceRest, urlVerifyToken : 'auth/token/login'}, envId, gameIdSocket, deviceInfo);
        loadConfigAsync.setUpSentry();
    };

    this.getToken = ()=>{
        return this.token;
    };

    this.registerGame = (gameData) => {
        const {
            gameId, isSlotGame,
        } = gameData;
        let gameState;
        if (typeof Sentry !== 'undefined') {
            Sentry.configureScope(function(scope) {
                scope.setExtra("gameId", gameId);
            });
        }
        if (isSlotGame) {
            gameState = require('gameStateSlot');
        } else {
            gameState = require('gameState' + gameId);
        }
        if (!gameState) return;

        return new gameState({gameData});
    };

    this.triggerUserLogout = () => {
        messageManager.closeAndCleanUp();
    };

    this.outGame = () => {};
}

module.exports = globalNetworkV3;
