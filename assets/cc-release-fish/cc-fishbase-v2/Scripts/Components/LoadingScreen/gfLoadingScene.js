const { handleFlowOutGame } = require("gameCommonUtils");
const MainController = require('gfMainController');
const GameConfig = require('gfBaseConfig');
const MainFSM = require('gfMainFSM');
const ReferenceManager = require('gfReferenceManager');

if(cc.sys.isNative)
{
    cc.macro.CLEANUP_IMAGE_CACHE = false;
    cc.dynamicAtlasManager.enabled = true;

    cc.Texture2D.prototype._getHash = function () {
        if (!this._hashDirty) {
            return this._hash;
        }
        let genMipmaps = this._genMipmaps ? 1 : 0;
        let premultiplyAlpha = this._premultiplyAlpha ? 1 : 0;
        let flipY = this._flipY ? 1 : 0;
        let minFilter = this._minFilter === cc.Texture2D.Filter.LINEAR ? 1 : 2;
        let magFilter = this._magFilter === cc.Texture2D.Filter.LINEAR ? 1 : 2;
        let wrapS = this._wrapS === cc.Texture2D.WrapMode.REPEAT ? 1 : (this._wrapS === cc.Texture2D.WrapMode.CLAMP_TO_EDGE ? 2 : 3);
        let wrapT = this._wrapT === cc.Texture2D.WrapMode.REPEAT ? 1 : (this._wrapT === cc.Texture2D.WrapMode.CLAMP_TO_EDGE ? 2 : 3);
        let pixelFormat = this._format;

        // let image = this._image;
        // const GL_RGBA = 6408;                   // gl.RGBA
        // if (CC_JSB && image) {
        //     if (image._glFormat !== GL_RGBA)
        //         pixelFormat = 0;
        //     premultiplyAlpha = image._premultiplyAlpha ? 1 : 0;
        // }

        this._hash = Number("" + minFilter + magFilter + pixelFormat + wrapS + wrapT + genMipmaps + premultiplyAlpha + flipY);
        this._hashDirty = false;
        return this._hash;
    };
}

cc.Class({
    extends: cc.Component,
    editor: {
        executionOrder: 1
    },
    properties: {
        sceneName: '',
        processBar: cc.Node,
        loadingBG: cc.Node,
        barWidth: 0,
        loadingGlow: cc.Node,
        homeBtn: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._customEngineIOS();

        if (this.sceneName === '') return;
        const loadConfigAsync = require('loadConfigAsync');
        const { LOGIN_IFRAME, LOBBY_SCENE_NAME } = loadConfigAsync.getConfig();
        let sceneName = this.sceneName;

        if (LOGIN_IFRAME && this.sceneNameIframe) {
            sceneName = this.sceneNameIframe;
        }

        if (cc.sys.isMobile && this.sdSceneName) {
            sceneName = this.sdSceneName;
        }

        if (this.homeBtn) {
            this.homeBtn.active = false;

            if (!LOGIN_IFRAME) {
                this.node.runAction(cc.sequence(
                    cc.delayTime(10),
                    cc.callFunc(() => {
                        this.homeBtn.active = true;
                        this.homeBtn.off('click');
                        this.homeBtn.on('click', () => {
                            let eventHandler = this.node.getComponent("KtekEventHandler");
                            if (eventHandler) {
                                eventHandler.getInstance().sendToUs("clear_cache", {
                                    scene: sceneName
                                });
                            }
                            MainFSM.instance._fsm.goExitGame();
                            this.loadingBG.getComponent('gfLoadingTransition') && this.loadingBG.transition();
                            cc.director.loadScene(LOBBY_SCENE_NAME);
                        });
                    })
                ));
            }
        }
        this.node.active = true;
        this.node.opacity = 255;
        this.initGameConfig();
        this.startTime = Date.now();
        this.preloadScene();
    },

    initGameConfig(){
        GameConfig.instance = new GameConfig();
    },

    preloadScene(indexScene = 0) {
        const listSceneName = Object.keys(GameConfig.instance.SceneName);
        const sceneName = GameConfig.instance.SceneName[listSceneName[indexScene]];
        const totalScene = listSceneName.length;

        const maxPercentOfScene = 1 / totalScene;
        let realPercent = indexScene * maxPercentOfScene * 100;
        cc.director.preloadScene(sceneName, (completedCount, totalCount,item) => {
            MainController.instance.storeAssets(item.rawUrl);
            let currentScenePercent = 0;
            if (totalCount > 0) {
                currentScenePercent = (100 * completedCount / totalCount) * maxPercentOfScene;
            }
            realPercent = indexScene * maxPercentOfScene * 100 + currentScenePercent;
            if (realPercent < 100 && this.processBar && this.processBar.getComponent) {
                const progressBar = this.processBar.getComponent(cc.ProgressBar);
                progressBar.progress = Math.max(progressBar.progress, realPercent/100);
                if (this.loadingGlow) {
                    this.loadingGlow.x = Math.max(this.loadingGlow.x, this.barWidth * realPercent / 100);
                }
            }
        }, (error) => {
            if (error) {
                MainFSM.instance._fsm.goExitGame();
                handleFlowOutGame();
            } else {
                indexScene++;
                if (indexScene != totalScene) {
                    this.preloadScene(indexScene);
                } else {
                    const loadConfigAsync = require('loadConfigAsync');
                    const {LOGIN_IFRAME} = loadConfigAsync.getConfig();
                    if (LOGIN_IFRAME) {
                        ReferenceManager.instance.setData({CurrentScene: this.node});
                        MainController.instance.initToken();
                    } else {
                        let realPercent = indexScene * maxPercentOfScene * 100;
                        const progressBar = this.processBar.getComponent(cc.ProgressBar);
                        const nextProgress = Math.max(progressBar.progress, realPercent / 100);
                        cc.tween(progressBar)
                            .to(0.25, {progress: nextProgress})
                            .call(() => {
                                ReferenceManager.instance.setData({CurrentScene: this.node});
                                MainController.instance.initToken();
                            })
                            .start();
                        cc.tween(this.loadingGlow)
                            .to(0.25, {x: Math.max(this.loadingGlow.x, this.barWidth * realPercent / 100)})
                            .start();
                    }
                }
            }
        });
    },
    _customEngineIOS(){
        const isIOS14Device = cc.sys.os === cc.sys.OS_IOS && cc.sys.isBrowser && cc.sys.isMobile && /(OS 1[4-9])|(Version\/1[4-9])/.test(window.navigator.userAgent);
        if (isIOS14Device) {
            cc.MeshBuffer.prototype.checkAndSwitchBuffer = function (vertexCount) {
                //method 2
                this._batcher._flush = function(){
                    let material = this.material,
                        buffer = this._buffer,
                        indiceStart = buffer.indiceStart,
                        indiceOffset = buffer.indiceOffset,
                        indiceCount = indiceOffset - indiceStart;
                    if (!this.walking || !material || indiceCount <= 0) {
                        return;
                    }

                    let effect = material.effect;
                    if (!effect) return;

                    // Generate ia
                    let ia = this._iaPool.add();
                    ia._vertexBuffer = buffer._vb;
                    ia._indexBuffer = buffer._ib;
                    ia._start = indiceStart;
                    ia._count = indiceCount;

                    // Generate model
                    let model = this._modelPool.add();
                    this._batchedModels.push(model);
                    model.sortKey = this._sortKey++;
                    model._cullingMask = this.cullingMask;
                    model.setNode(this.node);
                    model.setEffect(effect, this.customProperties);
                    model.setInputAssembler(ia);

                    this._renderScene.addModel(model);

                    buffer.uploadData();
                    buffer.switchBuffer();
                };

                if (this.vertexOffset + vertexCount > 65535) {
                    this.uploadData();
                    this._batcher._flush();
                }
            };
            cc.gfx.IndexBuffer.prototype.update = function update(offset, data){
                if (this._glID === -1) {
                    console.error('The buffer is destroyed');
                    return;
                }

                if (data && data.byteLength + offset > this._bytes) {
                    if(offset) {
                        console.error('Failed to update data, bytes exceed.');
                        return;
                    } else {
                        this._bytes = offset + data.byteLength;
                        this._numIndices = this._bytes / this._bytesPerIndex;
                    }
                }

                /** @type{WebGLRenderingContext} */
                let gl = this._device._gl;
                let glUsage = this._usage;

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glID);
                if (!data) {
                    if (this._bytes) {
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._bytes, glUsage);
                    } else {
                        console.warn('bufferData should not submit 0 bytes data');
                    }
                } else {
                    if (offset) {
                        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset, data);
                    } else {
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, glUsage);
                    }
                }
                this._device._restoreIndexBuffer();
            };
            cc.gfx.VertexBuffer.prototype.update = function update(offset, data) {
                if (this._glID === -1) {
                    console.error('The buffer is destroyed');
                    return;
                }

                if (data && data.byteLength + offset > this._bytes) {
                    if(offset) {
                        console.error('Failed to update data, bytes exceed.');
                        return;
                    } else {
                        this._bytes = offset + data.byteLength;
                        this._numVertices = this._bytes / this._format._bytes;
                    }
                }

                let gl = this._device._gl;
                let glUsage = this._usage;

                gl.bindBuffer(gl.ARRAY_BUFFER, this._glID);
                if (!data) {
                    if (this._bytes) {
                        gl.bufferData(gl.ARRAY_BUFFER, this._bytes, glUsage);
                    } else {
                        console.warn('bufferData should not submit 0 bytes data');
                    }
                } else {
                    if (offset) {
                        gl.bufferSubData(gl.ARRAY_BUFFER, offset, data);
                    } else {
                        gl.bufferData(gl.ARRAY_BUFFER, data, glUsage);
                    }
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            };
        }
    }
});
