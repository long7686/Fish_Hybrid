
cc.Class({
    extends: require('gfNotifyComponent'),

    properties: {
        lblNode: {
            default: null,
            visible: false,
            override: true
        },
        imgNode: {
            default: null,
            visible: false,
            override: true
        },

        contentNode: {
            default: null,
            visible: false,
            override: true
        },

        AtlasFishNotify: {
            default: null,
            visible: false,
            override: true
        },
        itemPrefab: cc.Prefab,
        _listItem: [],

    },
    onLoad() {
        this._super();
        this.NOTIFY_CONFIG = {
            STACK_SIZE: 25,
            IDLE_TIME: 1.5,
            TIME_MOVE: 0.25,
            MAX_ITEM: 3,
        };
        this.NOTIFY_TYPE = {
            BIG_FISH: 2,
            SPECIAL_SKILL: 3,
            DRAGON_BALL: 4,
            KILL_MINI_BOSS: 5,
            DROP_ITEM_MINI_BOSS: 6,
        };
        this.NOTIFY_FORMAT = {
            [this.NOTIFY_TYPE.BIG_FISH]: { userName: 0, itemKind: 1, goldReward: 2 },
            [this.NOTIFY_TYPE.SPECIAL_SKILL]: { userName: 0, itemKind: 1, goldReward: 2 },
            [this.NOTIFY_TYPE.DRAGON_BALL]: { userName: 0, itemKind: 1, goldReward: 2 },
            [this.NOTIFY_TYPE.KILL_MINI_BOSS]: { userName: 0, itemKind: 1, goldReward: 3 },
            [this.NOTIFY_TYPE.DROP_ITEM_MINI_BOSS]: { userName: 0, itemKind: 1, childItem: 2, goldReward: 3 },
        };
        this.CONFIG_HIDE = {
            IDLE_TIME: 1.5,
            TIME_MOVE: 0.25,
        };

        for (let i = 0; i <= this.NOTIFY_CONFIG.MAX_ITEM; i++) {
            let item = cc.instantiate(this.itemPrefab);
            item.setParent(this.node);
            item = item.getComponent("gfNotifyItemStack");
            item.initObj(i);
            this._listItem.push(item);
        }
        this.extendInit();
    },

    extendInit() {
        // Override here
    },


    show(data) {
        if (!this.formatData(data)) return;
        this.updateListMessage(data);
        if (this._isShow) return;
        this.node.stopAllActions();
        this._isShow = true;
        this.node.active = true;
        this.onStackMessage();
    },

    play(data) {
        const { IDLE_TIME } = this.NOTIFY_CONFIG;
        this.node.stopAllActions();
        cc.tween(this.node)
            .call(() => {
                let mainItem = null;
                let listChildItem = [];
                this._listItem.forEach((item) => {
                    if (item.getIndex() == (this._listItem.length - 1)) {
                        mainItem = item;
                    } else {
                        listChildItem.push(item);
                    }
                });
                mainItem.showItem(data);
                this.moveDownChildItem(listChildItem);
            })
            .delay(IDLE_TIME)
            .call(() => {
                this.onStackMessage();
            })
            .start();
    },

    moveDownChildItem(listItem = []) {
        listItem.forEach((item) => {
            let currentIndex = item.getIndex();
            let lastItem = false;
            if (currentIndex == this._listItem.length - 2) {
                lastItem = true;
            }
            item.moveToIndex(currentIndex + 1, lastItem);
        });
    },

    hide() {
        this._isShow = false;
        this.node.stopAllActions();
        const {IDLE_TIME, TIME_MOVE} = this.CONFIG_HIDE;
        let countShow = 0;
        this._listItem.forEach((item) => {
            if (item.checkShow()) countShow = countShow + 1;
        });
        let timeHide = 0;
        for(let i = 0 ; i < countShow; i++){
            let item = this._listItem.find(obj => obj.getIndex() === i);
            const data = {
                idleTime : i === (countShow - 1) ? 0 : (countShow - (i+1))*(IDLE_TIME + TIME_MOVE),
                timeMove : TIME_MOVE
            };
            timeHide = timeHide + data.idleTime + data.timeMove;
            item.hideAfterDeltaTime(data);
        }
        cc.tween(this.node)
            .delay(timeHide)
            .call(() => {
                this.node.active = false;
            })
            .start();
    },

    updateListMessage(data) {
        if (this._lstMessage.length >= this.NOTIFY_CONFIG.STACK_SIZE) {
            this._lstMessage.shift();
        }
        this._lstMessage.push(data);
        this.sortDataMessage(this._lstMessage);

    },

    formatData(dataInput) {
        if(dataInput.formatted) return true;
        let { data, type } = dataInput;
        let format = this.NOTIFY_FORMAT[type];
        if(format){
            const keys = Object.keys(format);
            let newData = {};
            keys.forEach(key =>{
                newData[key] = data[format[key]];
            });
            dataInput.data = newData;
            dataInput.formatted = true;
            return true;
        }
        cc.warn('Invalid message:', dataInput);
        return false;
    },
    sortDataMessage(lstMessage) {
        lstMessage.sort((a, b) => ((a.type === 0 && b.type !== 0) ? -1 : (a.type !== 0 && b.type === 0) ? 1 : 0));
        lstMessage.sort((a, b) => {
            const _a = {};
            _a.type = a.type;
            if (_a.type > 0) {
                _a.amount = this.replaceAmountData(a);
            }
            const _b = {};
            _b.type = b.type;
            if (_b.type > 0) {
                _b.amount = this.replaceAmountData(b);
            }
            if (_a.type !== 0 && _b.type !== 0) {
                if (_a.amount > _b.amount) return -1;
                if (_a.amount < _b.amount) return 1;
            }
            return 0;
        });
        return lstMessage;
    },

    replaceAmountData(data) {
        return Number(data.data.goldReward.replace(/[^0-9.-]+/g, ""));
    },

    onBeforeSceneChange() {
        this.node.stopAllActions();
        this._listItem.forEach((item) => { item.reset();});
    },
});
