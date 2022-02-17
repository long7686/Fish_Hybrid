/* global CC_DEV */
const LOG = CC_DEV ? cc.warn : cc.log;

cc.Class({
    extends: cc.NodePool,

    init(prefab, initCount = 5) {
        if(!this.objPrefab) {
            this.objPrefab = cc.instantiate(prefab);
            this.usingNodes = [];
            this.usingId = 0;
            // this.put(this.objPrefab);
            // initCount -= 1;
        }
        for (let i = 0; i < initCount; i++) {
            let item = cc.instantiate(this.objPrefab);
            this.put(item);
        }
    },

    getSize() {
        return this.size();
    },

    getObj() {
        if (this.size() == 0) {
            this.put(cc.instantiate(this.objPrefab));
        }
        const obj = this.get(this);
        obj.usingId = this.usingId++;
        this.usingNodes.push(obj);
        return obj;
    },

    clearPool() {
        this.clear();
    },

    reinit() {
        this.clear();
        this.init(this.objPrefab);
    },

    putObj(node){
        for(let i = 0; i < this.usingNodes.length; ++i) {
            if(this.usingNodes[i].usingId == node.usingId) {
                this.usingNodes.splice(i, 1);
                break;
            }
        }
        this.put(node);
    },

    getUsingNodeList(){
        return this.usingNodes;
    },

    returnAllToPool(){
        while(this.usingNodes.length > 0) {
            const obj = this.usingNodes.pop();
            if(cc.isValid(obj)) {
                this.put(obj);
            } else {
                LOG("return invalid object to pool!");
            }
        }
        this.usingId = 0;
    },

    destroy(){
        this.returnAllToPool();
        this.clear();
        this.objPrefab = null;
    }
});
