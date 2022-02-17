

const DataStore = require("gfDataStore");
const DataStore1990 = cc.Class({
    extends: DataStore,

    ctor() {
        DataStore.instance = this;
    },

  
});
DataStore1990.instance = null;
module.exports = DataStore1990;
