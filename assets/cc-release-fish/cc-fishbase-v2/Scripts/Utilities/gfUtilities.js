const lodash = require('lodash');
const GameConfig = require('gfBaseConfig');
const Emitter = require('gfEventEmitter');
cc.Tween.prototype.isDone = function () {
    return this._finalAction.isDone();
};
const SubString = function (str, len) {
    return str.substr(0, len);
};

const v2Distance = function (p1, p2) {
    if (p1 == null || p2 == null)
        return 0;

    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getRotation = function (p1, p2) {
    if (p1 == null || p2 == null)
        return 0;
    return Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180 / Math.PI;
};

const randomBetween = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const convertSecondToTime = function (a) {
    let sec_num = parseInt(a, 10);
    // let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor(sec_num / 60);
    let seconds = sec_num % 60;

    return [minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
};
const ReplaceDataNotify = function (string, data, substr = '') {
    let strOut = string;
    for (let index = 0; index < data.length; index++) {
        strOut = strOut.replace("data.data[" + index + "]", data[index]);
    }
    if (substr != '') {
        strOut = strOut.replace("substr", substr);
    }
    return strOut;
};
const convertMillisecondsToTime = function (duration) {
    if (typeof duration !== "number") duration = parseInt(duration);
    let milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
};

const convertMsToTimeV2 = function (duration, suffix = '') {
    const msPerDay = 86400000;
    if (typeof duration !== "number") duration = parseInt(duration);
    if (duration >= msPerDay) {
        const days = Math.floor(duration / msPerDay);
        return `${days} ${suffix}`;
    } else if (duration >= 0 && duration < msPerDay) {
        let seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }
};

const isWebMobileSafari = function () {
    if (cc.sys.platform === cc.sys.MOBILE_BROWSER && cc.sys.browserType === cc.sys.BROWSER_TYPE_SAFARI) {
        if (navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") <= -1 && navigator.userAgent.indexOf("CriOS") <= -1) {
            return true;
        } else {
            return false;
        }
    }
    return false;
};

const isChromeiOS = function () {
    if (cc.sys.os === cc.sys.OS_IOS && cc.sys.platform === cc.sys.MOBILE_BROWSER && cc.sys.browserType === cc.sys.BROWSER_TYPE_SAFARI) {
        if (navigator.userAgent.indexOf("CriOS") > -1) { //Check is Chrome
            return true;
        }
    }
    return false;
};

const isEmpty = function (data) {
    if (!lodash.isUndefined(data) && !lodash.isNull(data)) return false;
    return true;
};

const formatCoin = function (str, seperate) {
    if (str < 0) return 0;
    seperate = seperate == null ? "," : seperate;
    if (typeof str === "number") {
        str = Math.round(str);
        str = str.toString();
    } else {
        if (typeof str == 'string') {
            let coin = parseInt(str);
            str = coin.toString();
        }

    }
    let strResult = "";
    let count = -1;
    let stringLength = str.length;
    for (let i = 0; i < stringLength; i++) {
        count++;
        if (count == 3) {
            count = 0;
            if (parseInt(str.charAt(stringLength - (i + 1)), 10).toString() != "NaN" && str.charAt(stringLength - (i + 1)) != "-") {
                strResult += seperate + str.charAt(stringLength - (i + 1));
            } else {
                strResult += str.charAt(stringLength - (i + 1));
            }
        } else {
            strResult += str.charAt(stringLength - (i + 1));
        }
    }
    let s1 = "";
    let strResultLength = strResult.length;
    for (let j = 0; j < strResultLength; j++) {
        s1 += strResult.charAt(strResultLength - (j + 1));
    }
    if (s1 == "NaN") s1 = 0;
    return s1;
};

const getPointBetweenTwoPointByPercent = function (p0, p1, per) {
    let px = p0.x + (p1.x - p0.x) * per;
    let py = p0.y + (p1.y - p0.y) * per;
    return cc.v2(px, py);
};

const getListPointFromThreePoint = function (p1, p2, p3, tbegin) {
    let listPoints = [];
    for (let t = tbegin; t <= 1; t += 0.01) {
        let xt = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * p2.x + t * t * p3.x;
        let yt = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * p2.y + t * t * p3.y;
        listPoints.push(cc.v2(xt, yt));
    }

    return listPoints;
};
const rotateAngleByCoordinate = function (cx, cy, x, y, angle) {

    let radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {x: nx, y: ny};
};

const showFullScreenButton = function (isShow = true) {
    const visible = isShow ? "visible" : "hidden";
    if (cc.sys.os === cc.sys.OS_ANDROID && cc.sys.isMobile) {
        let divFullscreen = document.getElementById('div_full_screen');
        if (divFullscreen) {
            divFullscreen.style.visibility = visible;
        }
    }
};

const addHtmlCursor = function () {
    if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) {
        let css = document.createElement('style');
        css.type = 'text/css';
        css.id = 'cursorId';
        let styles = 'canvas { color: #555;cursor: url(data:image/cur;base64,' + GameConfig.instance.CursorBase64 + ') 16 16, default; background:#F4F4F4; display: block;  text-align: center;}';
        if (css.styleSheet)
            css.styleSheet.cssText = styles;
        else
            css.appendChild(document.createTextNode(styles));
        document.getElementsByTagName("head")[0].appendChild(css);
    }
};

const removeCursorInHtml = function () {
    if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) {
        let cursorElement = document.getElementById("cursorId");
        document.getElementsByTagName("head")[0].removeChild(cursorElement);
    }
};

const clamp = function (x, min, max) {
    return lodash.clamp(x, min, max);
};

const isArrayEqual = function (x, y) {
    return lodash(x).xorWith(y, lodash.isEqual).isEmpty();
};

const getPointByDegrees = function (cx, cy, x, y, angle) {

    let radians = -(Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {x: nx, y: ny};
};

const registerEvent = function (eventCode, func, main) {
    if (!main.eventMap) {
        main.eventMap = [];
    }
    const funcKey = func.bind(main);
    main.eventMap.push({eventCode, funcKey});
    Emitter.instance.registerEvent(eventCode, funcKey);
};

const removeEvents = function (main) {
    if (!main.eventMap || !Emitter.instance) return;
    main.eventMap.forEach(e => {
        Emitter.instance.removeEvent(e.eventCode, e.funcKey);
    });
    main.eventMap.length = 0;
};

const autoEnum = function (arr) {
    const res = {};
    for (let i = 0; i < arr.length; i++) {
        res[arr[i]] = i;
    }
    return res;
};
//Receive 4 cc.v2
const findIntersection = function (point1, point2, point3, point4) {
    if ((point1.x === point2.x && point1.y === point2.y) || (point3.x === point4.x && point3.y === point4.y)) {
        cc.warn('Got line with length = 0');
        return false;
    }

    const denominator = ((point4.y - point3.y) * (point2.x - point1.x) - (point4.x - point3.x) * (point2.y - point1.y));

    if (denominator === 0) {
        cc.warn('Lines are parallel');
        return false;
    }

    const ua = ((point4.x - point3.x) * (point1.y - point3.y) - (point4.y - point3.y) * (point1.x - point3.x)) / denominator;
    const ub = ((point2.x - point1.x) * (point1.y - point3.y) - (point2.y - point1.y) * (point1.x - point3.x)) / denominator;

    if (ua > 0 && ua < 1) {
        //cc.warn('intersect point is on line 1');
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (ub > 0 && ub < 1) {
        //cc.warn('intersect point is on line 2');
    }
    // Return a object with the x and y coordinates of the intersection
    const x = point1.x + ua * (point2.x - point1.x);
    const y = point1.y + ua * (point2.y - point1.y);

    return cc.v2(x, y);
};
const findPointOnLineByRatio = function (point1, point2, ratio) {
    if (ratio < 0 || ratio > 1) {
        cc.error('Ratio should less than 1 and greater than 0');
        return null;
    }
    const x = (1 - ratio) * point1.x + ratio * point2.x;
    const y = (1 - ratio) * point1.y + ratio * point2.y;
    return cc.v2(x, y);
};

const isPointInScreen = function (point) {
    const {SceneBox, realSize} = GameConfig.instance;
    const screen = new cc.Rect(SceneBox.Left, SceneBox.Bottom, realSize.Width, realSize.Height);
    return screen.contains(point);
};

const mergeTwoObject = function (obj1, obj2) {
    return lodash.merge({}, obj1, obj2);
};

const formatString = function (theString, argumentArray) {
    var regex = /%s/;
    var _r = function (p, c) {
        return p.replace(regex, c);
    };
    return argumentArray.reduce(_r, theString);
};


const getBetValue = (gameId, roomKind) => {
    if (!gameId || !roomKind) return null;
    const KEY_STORE = 'betFish' + gameId;
    let betObject = cc.sys.localStorage.getItem(KEY_STORE);
    if (!lodash.isEmpty(betObject)) {
        betObject = JSON.parse(betObject);
        if (betObject[roomKind]) {
            return betObject[roomKind];
        }
    }
    return null;
};

const setBetValue = (gameId, roomKind, bulletMultiple) => {
    const KEY_STORE = 'betFish' + gameId;
    let betObject = cc.sys.localStorage.getItem(KEY_STORE);
    if (lodash.isEmpty(betObject)) {
        const newObj = {[roomKind]: bulletMultiple};
        cc.sys.localStorage.setItem(KEY_STORE, JSON.stringify(newObj));
    } else {
        betObject = JSON.parse(betObject);
        betObject[roomKind] = bulletMultiple;
        cc.sys.localStorage.setItem(KEY_STORE, JSON.stringify(betObject));
    }
};

const formatUserName = (userName = '', maxLength = 16, replaceText = "...") => {
    if (userName.length <= maxLength) return userName;
    return userName.slice(0, maxLength - replaceText.length + 1) + replaceText;
};


const removeZero = function (str) {
    if (str.length > 1 && str.charAt(0) == "0") {
        return str.charAt(1);
    }
    return str;
};

const convertSecondToTimeDay = function (a) {
    //let sec_num = parseInt(a, 10);
    let sec_num = parseInt(a, 10);
    let days = Math.floor(sec_num / 86400);
    sec_num -= days * 86400;
    let hours = Math.floor(sec_num / 3600) % 24;
    sec_num -= hours * 3600;
    let minutes = Math.floor(sec_num / 60) % 60;
    sec_num -= minutes * 60;
    let seconds = sec_num;

    return [days, hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "0" || i > 1)
        .join(":");
};

//str==> 22:23:00. arrPrefix = [D:,H:,M:]  ====>>>> format 22d:23h:04m
const addTimePrefix = function (str, arrPrefix) {
    let infos = str.split(':');

    if (infos[0] == "00" && infos[1] == "00" && infos[2] == "00") {
        str = removeZero(infos[3]) + arrPrefix[3];
    } else if (infos[0] == "00" && infos[1] == "00") {
        str = removeZero(infos[2]) + arrPrefix[2] + removeZero(infos[3]) + arrPrefix[3];
    } else if (infos[0] == "00") {
        if (infos[2] == "00") str = removeZero(infos[1]) + arrPrefix[1].replace(':', '');
        else str = removeZero(infos[1]) + arrPrefix[1] + removeZero(infos[2]) + arrPrefix[2].replace(':', '');
    } else {
        if (infos[2] == "00") str = removeZero(infos[0]) + arrPrefix[0] + removeZero(infos[1]) + arrPrefix[1].replace(':', '');
        else str = removeZero(infos[0]) + arrPrefix[0] + removeZero(infos[1]) + arrPrefix[1] + removeZero(infos[2]) + arrPrefix[2].replace(':', '');
    }
    return str;
};

const formatTimeStamp = function (ts) {
    function addZero(i) {
        if (i < 10) {
            i = '0' + i;
        }
        return i;
    }

    const d = new Date(ts);
    const h = addZero(d.getHours());
    const m = addZero(d.getMinutes());
    const s = addZero(d.getSeconds());
    const t = addZero(d.getDate()) + '/' + addZero(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + h + ':' + m + ':' + s;
    return t;
};

const getPositionWithTimeSpentFromThreePoint = function (p1, p2, p3, timeLost, speed) {
    const totalPoints = 200;
    const durationPerUnit = 1 / totalPoints;

    let listPoints = new Array(totalPoints + 1);
    listPoints[0] = 0;
    let lastPoint = cc.v2(x(0), y(0));
    let duration = 0;
    let position = cc.v2(x(0), y(0));
    for (let i = 1; i <= totalPoints; i += 1) {
        const currentPoint = cc.v2(x(i * durationPerUnit), y(i * durationPerUnit));
        const distance = v2Distance(lastPoint, currentPoint);
        duration += distance / speed;
        listPoints[i] = listPoints[i - 1] + distance;
        lastPoint = currentPoint;
    }
    let currentTime = 0;
    while (currentTime <= timeLost) {
        let dt = 1 / 60;
        dt = (dt * duration + timeLost) / (timeLost + duration);
        position = cc.v2(mx(dt), my(dt));
        currentTime += dt;
    }

    function map(u) {
        const targetLength = u * listPoints[totalPoints];
        let low = 0, high = totalPoints, index = 0;
        while (low < high) {
            index = low + (((high - low) / 2) | 0);
            if (listPoints[index] < targetLength) {
                low = index + 1;
            } else {
                high = index;
            }
        }
        if (listPoints[index] > targetLength) {
            index--;
        }

        const lengthBefore = listPoints[index];
        if (lengthBefore === targetLength) {
            return index / totalPoints;

        } else {
            return (index + (targetLength - lengthBefore) / (listPoints[index + 1] - lengthBefore)) / totalPoints;
        }
    }

    function x(t) {
        return (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * p2.x + t * t * p3.x;
    }

    function y(t) {
        return (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * p2.y + t * t * p3.y;
    }

    function mx(u) {
        return x(map(u));
    }

    function my(u) {
        return y(map(u));
    }

    return position;
};

const preloadDragonBoneCache = function (DragonCacheData, BoneCacheValue) {
    const animList = Object.keys(DragonCacheData);
    for (let i = 0; i < animList.length; ++i) {
        if (!BoneCacheValue[animList[i]]) {
            BoneCacheValue[animList[i]] = [];
        }
        for (let frame = 0; frame < DragonCacheData[animList[i]].length; ++frame) {
            BoneCacheValue[animList[i]][frame] = DragonCacheData[animList[i]][frame].split(',');
        }
    }
};

module.exports = {
    formatTimeStamp,
    convertSecondToTimeDay,
    addTimePrefix,
    formatUserName,
    findIntersection,
    findPointOnLineByRatio,
    mergeTwoObject,
    getPointByDegrees,
    removeCursorInHtml,
    addHtmlCursor,
    showFullScreenButton,
    rotateAngleByCoordinate,
    getPointBetweenTwoPointByPercent,
    getListPointFromThreePoint,
    SubString,
    v2Distance,
    getRotation,
    randomBetween,
    convertSecondToTime,
    ReplaceDataNotify,
    convertMillisecondsToTime,
    convertMsToTimeV2,
    isWebMobileSafari,
    isChromeiOS,
    formatCoin,
    isEmpty,
    clamp,
    isArrayEqual,
    registerEvent,
    removeEvents,
    isPointInScreen,
    autoEnum,
    formatString,
    getBetValue,
    setBetValue,
    getPositionWithTimeSpentFromThreePoint,
    preloadDragonBoneCache
};
