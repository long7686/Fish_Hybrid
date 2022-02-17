const uuidv4 = require('uuid/v4');
const bytesToUuid = require('bytesToUuid');

module.exports = () => {
    let buf = new Array(16);
    uuidv4(null, buf, 0);
    return bytesToUuid(buf,0);
};
