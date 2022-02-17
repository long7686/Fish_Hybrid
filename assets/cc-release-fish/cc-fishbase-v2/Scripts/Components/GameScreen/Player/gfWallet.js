const DEBUG_WALLET = false;
const logError = DEBUG_WALLET ? cc.error : cc.warn;
const { formatCoin } = require('gfUtilities');
const INCREASING_TIME = 0.3;

cc.Class({
    extends: cc.Component,
    properties: {
        displayLabel: cc.Label,
        _displayAmount: 0,
        _rewardAmount: 0,
        _targetAmount: 0,
        _totalAmount: 0,
        _isMe: false
    },

    initEvents() {

    },

    forceUpdateWallet(amount) {
        this._displayAmount = amount;
        this._targetAmount = amount;
        this._rewardAmount = 0;
        this.incSpeed = 0;
        this._totalAmount = amount;
        this.updateDisplay();
    },

    updateWallet(amount) {
        this._targetAmount = amount - this._rewardAmount;
        if (this._displayAmount > this._targetAmount) {
            this._displayAmount = this._targetAmount;
        } else {
            this.incSpeed = (this._targetAmount - this._displayAmount) / INCREASING_TIME;
        }
        this._totalAmount = amount;
        this.updateDisplay();
    },

    addToDisplay(amount) {
        if(amount > this._rewardAmount) {
            logError("Reward Wallet Amount is negative!");
        }
        this._rewardAmount -= amount;
        this._targetAmount += amount;
        if(this._targetAmount > this._totalAmount) {
            this._targetAmount = this._totalAmount;
        }
        this.incSpeed = (this._targetAmount - this._displayAmount) / INCREASING_TIME;
        DEBUG_WALLET && cc.warn('- addToDisplay   -' + formatCoin(amount) + " \t= " + formatCoin(this._rewardAmount));
    },

    addGoldReward(reward) {
        this._rewardAmount += reward;
        DEBUG_WALLET && cc.warn('+ addGoldReward  +' + formatCoin(reward) + " \t= " + formatCoin(this._rewardAmount));
    },

    update(dt) {
        if (this._displayAmount == this._targetAmount) return;
        this._displayAmount += this.incSpeed * dt;
        if (this._displayAmount > this._targetAmount) {
            this._displayAmount = this._targetAmount;
        }
        this.updateDisplay();
    },

    updateDisplay() {
        this.displayLabel.string = formatCoin(this._displayAmount);
    },

    getDisplayWallet(){
        return this._displayAmount;
    },

    getRealWallet(){
        return this._totalAmount;
    },

    resetOnExit() {
        this.displayLabel.string = '';
    }
});