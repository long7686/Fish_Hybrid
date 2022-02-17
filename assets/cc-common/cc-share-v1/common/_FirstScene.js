/* global onFirstSceneLaunched */

cc.Class({
    extends: cc.Component,

    update()
    {
        const globalState = require('globalState');
        const firstSceneLoad = globalState.getStatusFirstSceneLoad();
        if (firstSceneLoad && typeof (onFirstSceneLaunched) === 'function') {
            onFirstSceneLaunched();
            globalState.setStatusFirstSceneLoad(false);
        }
    },
});
