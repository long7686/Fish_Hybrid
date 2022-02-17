

const gfLocalize = cc.Class({
    ctor(){
        cc.log('::Init Localization::');
    },
    initLocalizeConfig(jsonLocalize){
        const localize = jsonLocalize;
        if(!localize) {
            cc.warn('Localize file failed');
            return;
        }
        // this._localize = {};
        for(let key in localize){
            gfLocalize.instance[key] = localize[key];
        }
    },
    // getString(key){
    //     if(!this._localize) {
    //         cc.warn('Localize file failed');
    //         return;
    //     }
    //     this.arrKey = key.split(".");
    //     let obj = this._localize[this.arrKey.shift()];
    //     while(typeof  obj == "object" && this.arrKey.length > 0){
    //         obj = obj[this.arrKey.shift()];
    //     }
    //     if(typeof  obj != "string") obj = key;
    //     return obj;
    // },
    destroy(){
        gfLocalize.instance = null;
    },
});
gfLocalize.instance = null;
module.exports = gfLocalize;