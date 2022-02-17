const { clamp } = require('gfUtilities');
const GameConfig = require('gfBaseConfig');
const DataStore = require('gfDataStore');
const Emitter = require('gfEventEmitter');
const EventCode = require("gfBaseEvents");

const ACTION_TAG_RESIZE = 1;

cc.Class({
    extends: cc.Component,

    properties: {
        canvas: cc.Canvas,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._updateSceneSize = this.updateSceneSize.bind(this);
    },

    start() {
        this.updateSceneSize();
        cc.view.setResizeCallback(this._updateSceneSize);
    },

    _updateButtonFullScreen() {
        if (this.node && cc.sys.isBrowser && cc.sys.isMobile) {
            const div_full_screen = document.getElementById('div_full_screen');
            if (DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Game) {
                div_full_screen.style.visibility = "hidden";
            }
            this.node.stopActionByTag(ACTION_TAG_RESIZE);
            const action = this.node.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(() => {
                    this._resizeFullScreenButton();
                }),
            ));

            action.setTag(ACTION_TAG_RESIZE);
        }
    },

    updateSceneSize() {
        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
        if (!GameConfig.instance || !GameConfig.instance.realSize) return;

        const { realSize, AppSize, SceneBox } = GameConfig.instance;

        const designRatio = this.canvas.designResolution.width / this.canvas.designResolution.height;
        const frameSize = cc.view.getFrameSize();
        const screenRatio = frameSize.width / frameSize.height;
        if (screenRatio < designRatio) {
            this.canvas.fitHeight = false;
            this.canvas.fitWidth = true;
        } else {
            this.canvas.fitHeight = true;
            this.canvas.fitWidth = false;
        }
        const canvasSize = cc.view.getCanvasSize();
        const heightScale = AppSize.Height / canvasSize.height;
        realSize.Width = clamp(canvasSize.width * heightScale, AppSize.Width, AppSize.MaxWidth);
        
        SceneBox.Left = -(realSize.Width - AppSize.Width) / 2;
        SceneBox.Right = SceneBox.Left + realSize.Width;
        this.node.width = realSize.Width;
        Emitter.instance.emit(EventCode.COMMON.ON_SCREEN_RESIZE);
        this._updateButtonFullScreen();
    },

    _resizeFullScreenButton() {
        // console.log("resizeFullScreenButton");
        // resize fullscreen button on iframe for android.
        const div_full_screen = document.getElementById('div_full_screen');
        const enterFullscreen = document.getElementById('enterFullscreen');
        const exitFullscreen = document.getElementById('exitFullscreen');


        if (div_full_screen) {
            if (DataStore.instance.getCurrentSceneName() === GameConfig.instance.SceneName.Game) {
                div_full_screen.style.visibility = "hidden";
                return;
            }
            if (enterFullscreen) {
                enterFullscreen.style.top = "0";
                enterFullscreen.style.left = "0";
                enterFullscreen.style.width = "100%";
                enterFullscreen.style.height = "100%";
                enterFullscreen.style.backgroundSize = "contain";
            }

            if (exitFullscreen) {
                exitFullscreen.style.top = "0";
                exitFullscreen.style.left = "0";
                exitFullscreen.style.width = "100%";
                exitFullscreen.style.height = "100%";
                exitFullscreen.style.backgroundSize = "contain";
            }

            div_full_screen.style.position = "absolute";
            div_full_screen.style.width = "30px";
            div_full_screen.style.height = "30px";

            if (window.innerWidth > window.innerHeight) {
                div_full_screen.style.top = "70%";
                div_full_screen.style.left = "10px";
            } else {
                div_full_screen.style.top = "10px";
                div_full_screen.style.left = "23%";
            }
        }
    },

    onDestroy() {
        cc.view.setResizeCallback(null);
    },
});
