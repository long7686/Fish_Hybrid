

const DataStore = require('gfDataStore');
const ReferenceManager = require('gfReferenceManager');
cc.Class({
    extends: require('gfTouchListener'),
    properties: {
    },
    //Override to handle gun Tesla
    _onUserFire(status = 'touch_start') {
        const selfInfo = DataStore.instance.getSelfInfo();
        if(selfInfo.skillLock){
            if(status === 'touch_end'){
                const myPlayer = ReferenceManager.instance.getPlayerByDeskStation(selfInfo.DeskStation);
                if(myPlayer){
                    myPlayer.rotateGun(DataStore.instance.getMousePos());
                    this.scheduleOnce(()=>{myPlayer.onPlayerSendFireLaser(DataStore.instance.getMousePos());}, 0);
                }
            }
        } else if (status === 'touch_end') {
            this.unschedule(this._userFireFunc);
        } else {
            this._userFire();
            this.schedule(this._userFireFunc, DataStore.instance.FireSpeed.NORMAL);
        }
    },
});
