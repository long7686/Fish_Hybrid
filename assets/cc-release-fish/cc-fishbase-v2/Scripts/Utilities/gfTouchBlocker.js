const { registerEvent, removeEvents } = require("gfUtilities");
const EventCode = require("gfBaseEvents");
cc.Class({
    extends: cc.Component,
    editor: {
        executionOrder: 100
    },
    properties: {
        touchDelay: 0.5,
        block: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.block.active = false;
        let canvas = cc.find('Canvas');
        let buttons = canvas.getComponentsInChildren(cc.Button);
        this.currentTarget = null;
        buttons.forEach(bt => {
            bt.node.on('touchstart', ()=>{
                this.currentTarget = bt.node;
                this.onTouchStart();
            });
            bt.node.on('touchend', ()=>{
                this.onTouchEnd();
            });
            bt.node.on('touchmove', ()=>{
                this.onTouchEnd();
            });
            bt.node.on('touchcancel', ()=>{
                this.onTouchEnd();
            });
        });
        registerEvent(EventCode.GAME_LAYER.BLOCK_ALL_BUTTON_WHEN_REFRESH, this.blockAllButton, this);
    },

    blockAllButton()
    {
        if(!cc.isValid(this.block)) return;
        this.block.active = false;
        let canvas = cc.find('Canvas');
        if(canvas) {
            let buttons = canvas.getComponentsInChildren(cc.Button);
            this.currentTarget = null;
            buttons.forEach(bt => {
                bt.interactable = false;
            });
        }
    },

    onTouchStart()
    {
        if(!cc.isValid(this.block)) return;
        this.block.active = true;
        this.checkActive = true;
        this.countdownCheck = this.touchDelay;
    },

    onTouchEnd()
    {
        this.checkActive = false;
        this.countDown = this.touchDelay;
    },

    update(dt)
    {
        if(!cc.isValid(this.block)) return;
        if (this.countDown > 0)
        {
            this.countDown -= dt;
            if (this.countDown <= 0)
            {
                this.block.active = false;
            }
        }
        if (this.checkActive)
        {
            if (this.countdownCheck > 0)
            {
                this.countdownCheck -= dt;
                if (this.countdownCheck < 0)
                {
                    this.countdownCheck = this.touchDelay;
                    if (!this.currentTarget.active || !this.currentTarget.activeInHierarchy)
                    {
                        this.onTouchEnd();
                    }
                }
            }
        }
    },

    onDestroy() {
        this.unscheduleAllCallbacks();
        removeEvents(this);
    },
});
