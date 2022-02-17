cc.Class({
    extends: require("gfPopupTutorial"),
    properties: {
        popupTitle: {
            default: null,
            visible: false,
            override: true
        },
        popupBackground: {
            default: null,
            visible: false,
            override: true
        }
    },
    onLoad(){
        this._opacityShowOverlay = 200;
        this._super();
    },
    
    initLanguage(){
        //override base because not use
    },
});
