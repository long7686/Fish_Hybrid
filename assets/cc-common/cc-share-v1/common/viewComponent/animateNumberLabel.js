

const {formatMoney, formatWalletMoney} = require('utils');

cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.onUpdateValue = this.onUpdateValue.bind(this);
        this.node.onUpdateWallet = this.onUpdateWallet.bind(this);
        this.node.onUpdateWinValue = this.onUpdateWinValue.bind(this);
        this.node.resetValue = this.resetValue.bind(this);
    },

    resetValue() {
        if (!this.node) return;
        clearInterval(this.timer);
        const label = this.node.getComponent(cc.Label);
        label.string = '';
        this.currentValue = 0;
    },
    onUpdateValue(end, animationDuration = 3000, acceptRunDown = true, prefix = "", suffixes = "") {
        clearInterval(this.timer);
        if (!this.node) return;
        const label = this.node.getComponent(cc.Label);
        const start = this.currentValue ? this.currentValue : 0;

        if (!acceptRunDown && end < start)
        {
            this.currentValue = end;
            label.string = prefix + formatMoney(this.currentValue) + suffixes;
            return;
        }

        // assumes integer values for start and end
        const range = end - start;
        // no timer shorter than 50ms (not really visible any way)
        const minTimer = 50;
        // calc step time to show all interediate values
        let stepTime = Math.abs(Math.floor(animationDuration / range));
        // never go below minTimer
        stepTime = Math.max(stepTime, minTimer);
        // get current time and calculate desired end time
        const startTime = new Date().getTime();
        const endTime = startTime + animationDuration;
        this.timer;

        const run = () => {
            const now = new Date().getTime();
            const remaining = Math.max((endTime - now) / animationDuration, 0);
            const value = Math.round(end - (remaining * range));
            this.currentValue = value;
            label.string = prefix + formatMoney(value) + suffixes;
            if (value == end) {
                clearInterval(this.timer);
            }
        };
        this.timer = setInterval(run, stepTime);
        run();
    },

    onUpdateWinValue(end, animationDuration = 3000, callbackWin = {}, isSkip, millisecond = 1000, timeUpdate = 50, superWinRate = 50, megaWinRate = 30) {
        clearInterval(this.timer);
        if (!this.node) return;
        const label = this.node.getComponent(cc.Label);
        const timeRate = millisecond / timeUpdate;
        this.currentValue = this.currentValue || 0;
        let valuePerTimes = Math.round(end / (animationDuration / millisecond * timeRate));
        // a = ((s - v0 * t) * 2) / t^2
        const valueAccelerator = ((end - (valuePerTimes * timeUpdate)) * 2) / Math.pow(timeUpdate, 2); 
        const run = () => {
            this.currentValue =  Math.round(this.currentValue <= end / 2 ? this.currentValue + valuePerTimes + valueAccelerator : this.currentValue + valuePerTimes - valueAccelerator);
            let value = this.currentValue;
            label.string = formatMoney(value >= end ? end : value);
            
            const isSuper = end >= callbackWin.currentBetData * superWinRate;
            const isMega = end >= callbackWin.currentBetData * megaWinRate;
            let finalWin = isSuper ? 'super' : isMega ? 'mega' : 'big';
            
            let per = value / end;
            per = per > 1 ? 1 : per;
            callbackWin.enterFrame(per, finalWin);

            if (value >= callbackWin.currentBetData * superWinRate && !isSkip) {
                callbackWin.runSuperWin();
            } else if (value >= callbackWin.currentBetData * megaWinRate && !isSkip) {
                callbackWin.runMegaWin();
            } else if(value + callbackWin.currentBetData * 2 == end && !isSkip) {
                callbackWin.runFinishBigWin();
            }
            if (value >= end) {
                callbackWin.runFinishWin();
                clearInterval(this.timer);
            }
        };
        this.timer = setInterval(run, timeUpdate);
        run();
    },

    onUpdateWallet(end, animationDuration = 3000) {
        clearInterval(this.timer);
        if (!this.node) return;

        const label = this.node.getComponent(cc.Label);
        const start = this.currentValue ? this.currentValue : 0;
        // assumes integer values for start and end
        const range = end - start;
        // no timer shorter than 50ms (not really visible any way)
        const minTimer = 50;
        // calc step time to show all interediate values
        let stepTime = Math.abs(Math.floor(animationDuration / range));
        // never go below minTimer
        stepTime = Math.max(stepTime, minTimer);
        // get current time and calculate desired end time
        const startTime = new Date().getTime();
        const endTime = startTime + animationDuration;
        this.timer;

        const run = () => {
            const now = new Date().getTime();
            const remaining = Math.max((endTime - now) / animationDuration, 0);
            const value = Math.round(end - (remaining * range));
            this.currentValue = value;
            label.string = formatWalletMoney(value);
            if (value == end) {
                clearInterval(this.timer);
            }
        };
        this.timer = setInterval(run, stepTime);
        run();
    },

    onDestroy() {
        clearInterval(this.timer);
    }
});
