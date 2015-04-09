/*!
 * 数据遍历
 * @author ydr.me
 * 2014-09-14 17:26
 */


'use strict';

var qs = require('querystring');
var path = require('path');
var typeis = require('./typeis.js');
var crypto = require('./crypto.js');
//var request = require('./request.js');
var udf;
var canListTypeArr = 'array object nodelist htmlcollection'.split(' ');
var REG_STRING_FIX = /[.*+?^=!:${}()|[\]/\\]/g;
var REG_PATH = path.sep === '/' ? /\\/ : /\//g;
var REG_URL = /\\/g;
var REG_NOT_UTF16_SINGLE = /[^\x00-\xff]{2}/g;
var REG_BEGIN_0 = /^0+/;


/**
 * 格式化数字，如果是非数字则返回默认值
 * @param {*} obj 待格式化对象
 * @param {*} [dft] 非数字时的默认值
 * @returns {*}
 */
exports.parseInt = function (obj, dft) {
    obj = parseInt(obj, 10);

    return isNaN(obj) ? dft : obj;
};


/**
 * 格式化数字，如果是非数字则返回默认值
 * @param {*} obj 待格式化对象
 * @param {*} [dft] 非数字时的默认值
 * @returns {*}
 */
exports.parseFloat = function (obj, dft) {
    obj = parseFloat(obj);

    return isNaN(obj) ? dft : obj;
};


/**
 * 遍历元素
 * @param {Array/Object} list  数组、可枚举对象
 * @param {Function} callback  回调，返回false时停止遍历
 * @param {*} [context] 上下文
 *
 * @example
 * // 与 jQuery.each 一样
 * // 返回 false 时将退出当前遍历
 * data.each(list, function(key, val){});
 */
exports.each = function (list, callback, context) {
    var i;
    var j;

    // 数组 或 类似数组
    if (list && list.length !== udf) {
        for (i = 0, j = exports.parseInt(list.length, 0); i < j; i++) {
            context = context || global;
            if (callback.call(context, i, list[i]) === false) {
                break;
            }
        }
    }
    // 纯对象
    else if (list !== null && list !== udf) {
        for (i in list) {
            if (list.hasOwnProperty(i)) {
                context = context || global;
                if (callback.call(context, i, list[i]) === false) {
                    break;
                }
            }
        }
    }
};


/**
 * 扩展静态对象
 * @param {Boolean|Object} [isExtendDeep] 是否深度扩展，可省略，默认false
 * @param {Object}  [source] 源对象
 * @param {...Object}  [target] 目标对象，可以是多个
 * @returns {*}
 *
 * @example
 * // 使用方法与 jQuery.extend 一样
 * var o1 = {a: 1};
 * var o2 = {b: 2};
 * var o3 = data.extend(true, o1, o2);
 * // => {a: 1, b: 2}
 * o1 === o3
 * // => true
 *
 * // 如果不想污染原始对象，可以传递一个空对象作为容器
 * var o1 = {a: 1};
 * var o2 = {b: 2};
 * var o3 = data.extend(true, {}, o1, o2);
 * // => {a: 1, b: 2}
 * o1 === o3
 * // => fale
 */
exports.extend = function (isExtendDeep, source, target) {
    var args = arguments;
    var firstArgIsBoolean = typeof(args[0]) === 'boolean';
    var current = firstArgIsBoolean ? 1 : 0;
    var length = args.length;
    var i;
    var obj;
    var sourceType;
    var objType;

    isExtendDeep = firstArgIsBoolean && args[0] === true;
    source = args[current++];

    for (; current < length; current++) {
        obj = args[current];
        for (i in obj) {
            if (obj.hasOwnProperty(i) && obj[i] !== undefined) {
                sourceType = typeis(source[i]);
                objType = typeis(obj[i]);

                if (objType === 'object' && isExtendDeep) {
                    source[i] = sourceType !== objType ? {} : source[i];
                    exports.extend.call(this, isExtendDeep, source[i], obj[i]);
                } else if (objType === 'array' && isExtendDeep) {
                    source[i] = sourceType !== objType ? [] : source[i];
                    exports.extend.call(this, isExtendDeep, source[i], obj[i]);
                } else {
                    source[i] = obj[i];
                }
            }
        }
    }

    return source;
};


/**
 * 转换对象为一个纯数组，只要对象有length属性即可
 * @param {Object} [obj] 对象
 * @param {Boolean} [isConvertWhole] 是否转换整个对象为数组中的第0个元素，当该对象无length属性时，默认false
 * @returns {Array}
 *
 * @example
 * var o = {0:"foo", 1:"bar", length: 2}
 * data.toArray(o);
 * // => ["foo", "bar"]
 *
 * var a1 = [1, 2, 3];
 * // 转换后的数组是之前的副本
 * var a2 = data.toArray(a1);
 * // => [1, 2, 3]
 * a2 === a1;
 * // => false
 */
exports.toArray = function (obj, isConvertWhole) {
    var ret = [];
    var i = 0;
    var j;
    var objType = typeis(obj);

    if (canListTypeArr.indexOf(objType) > -1 && typeis(obj.length) === 'number' && obj.length >= 0) {
        for (j = obj.length; i < j; i++) {
            ret.push(obj[i]);
        }
    } else if (obj && isConvertWhole) {
        ret.push(obj);
    }

    return ret;
};

///**
// * 判断一个对象是否有属于自身的方法、属性，而不是原型链方法、属性以及其他继承来的方法、属性
// * @param obj {Object} 判断对象
// * @param prop {String} 方法、属性名称
// * @returns {Boolean}
// *
// * @example
// * var o = {a: 1};
// * data.hasOwnProperty(o, 'a');
// * // => true
// */
//exports.hasOwnProperty = function (obj, prop) {
//    return Object.prototype.hasOwnProperty.call(obj, prop);
//};


/**
 * 对象1级比较，找出相同和不同的键
 * @param obj1 {Object|Array}
 * @param obj2 {Object|Array}
 * @returns {Object}
 *
 * @example
 * data.compare({a:1,b:2,c:3}, {a:1,d:4});
 * // =>
 * // {
     * //    same: ["a"],
     * //    only: [
     * //       ["b", "c"],
     * //       ["d"]
     * //    ],
     * //    different: ["b", "c", "d"]
     * // }
 */
exports.compare = function (obj1, obj2) {
    var obj1Type = typeis(obj1);
    var obj2Type = typeis(obj2);
    var obj1Only = [];
    var obj2Only = [];
    var same = [];

    // 类型不同
    if (obj1Type !== obj2Type) {
        return null;
    }

    // 对象
    if (obj1Type === 'object' || obj1Type === 'array') {
        exports.each(obj1, function (key, val) {
            if (obj2[key] !== val) {
                obj1Only.push(key);
            } else {
                same.push(key);
            }
        });

        exports.each(obj2, function (key, val) {
            if (obj1[key] !== val) {
                obj2Only.push(key);
            }
        });

        return {
            same: same,
            only: [
                obj1Only,
                obj2Only
            ],
            different: obj1Only.concat(obj2Only)
        };
    } else {
        return null;
    }
};


/**
 * 修正正则字符串
 * @param regExpString
 * @returns {String}
 *
 * @example
 * data.fixRegExp('/');
 * // => '\/'
 */
exports.fixRegExp = function (regExpString) {
    return regExpString.replace(REG_STRING_FIX, '\\$&');
};


/**
 * 计算字节长度
 * @param string {String} 原始字符串
 * @param [doubleLength=2] {Number} 双字节长度，默认为2
 * @returns {number}
 *
 * @example
 * data.bytes('我123');
 * // => 5
 */
exports.bytes = function (string, doubleLength) {
    string += '';
    doubleLength = exports.parseInt(doubleLength, 2);

    var i = 0,
        j = string.length,
        k = 0,
        c;

    for (; i < j; i++) {
        c = string.charCodeAt(i);
        k += (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f) ? 1 : doubleLength;
    }

    return k;
};


/**
 * 计算字符串长度
 * 双字节的字符使用 length 属性计算不准确
 * @ref http://es6.ruanyifeng.com/#docs/string
 * @param string {String} 原始字符串
 *
 * @example
 * var s = "𠮷";
 * s.length = 2;
 * dato.length(s);
 * // => 3
 */
exports.length = function (string) {
    string += '';

    return string.replace(REG_NOT_UTF16_SINGLE, '*').length;
};


/**
 * 按长度补0填充数字
 * @param  {Number|String} number 数字
 * @param  {Number} length 长度
 * @return {String} 修复后的数字
 *
 * @example
 * fixedNumber(2, 4);
 * // => "0002"
 */
exports.fillNumber = function (number, length) {
    var len = length;
    var start = '';

    while (len--) {
        start += '0';
    }

    return (start + number).slice(-length);
};


/**
 * 修正 path 路径为系统分隔符
 * @param p
 * @returns {String}
 */
exports.fixPath = function (p) {
    return p.replace(REG_PATH, path.sep);
};


/**
 * 转换路径为 URL 格式
 * @param p
 * @returns {string}
 */
exports.toURLPath = function (p) {
    return String(p).replace(REG_URL, '/');
};


/**
 * 删除注释
 * @param str 原始字符串
 * @returns {String}
 */
exports.removeComments = function (str) {
    var currentChar;
    var nextChar;
    var insideString = false;
    var insideComment = false;
    var ret = '';

    for (var i = 0; i < str.length; i++) {
        currentChar = str[i];
        nextChar = str[i + 1];

        if (!insideComment && str[i - 1] !== '\\' && currentChar === '"') {
            insideString = !insideString;
        }

        if (insideString) {
            ret += currentChar;
            continue;
        }

        if (!insideComment && currentChar + nextChar === '//') {
            insideComment = 'single';
            i++;
        } else if (insideComment === 'single' && currentChar + nextChar === '\r\n') {
            insideComment = false;
            i++;
            ret += currentChar;
            ret += nextChar;
            continue;
        } else if (insideComment === 'single' && currentChar === '\n') {
            insideComment = false;
        } else if (!insideComment && currentChar + nextChar === '/*') {
            insideComment = 'multi';
            i++;
            continue;
        } else if (insideComment === 'multi' && currentChar + nextChar === '*/') {
            insideComment = false;
            i++;
            continue;
        }

        if (insideComment) {
            continue;
        }

        ret += currentChar;
    }

    return ret;
};


/**
 * base64 to ascii
 * @param ascii
 */
exports.atob = function (ascii) {
    try {
        return new Buffer(encodeURIComponent(ascii), 'utf8').toString('base64');
    } catch (err) {
        return '';
    }
};

/**
 * base64 to ascii
 * @param base64
 */
exports.btoa = function (base64) {
    try {
        return decodeURIComponent(new Buffer(base64, 'base64').toString());
    } catch (err) {
        return '';
    }
};


/**
 * 人类数字，千位分割
 * @param number {String|Number} 数字（字符串）
 * @param [separator=","] {String} 分隔符
 * @param [length=3] {Number} 分隔长度
 * @returns {string} 分割后的字符串
 */
exports.humanize = function (number, separator, length) {
    separator = separator || ',';
    length = length || 3;

    var reg = new RegExp('(\\d)(?=(\\d{' + length + '})+$)', 'g');
    var arr = String(number).split('.');
    var p1 = arr[0].replace(reg, '$1' + separator);

    return p1 + (arr[1] ? '.' + arr[1] : '');
};


/**
 * 比较两个长整型数值
 * @param long1 {String} 长整型数值字符串1
 * @param long2 {String} 长整型数值字符串2
 * @param [operator=">"] {String} 比较操作符，默认比较 long1 > long2
 * @returns {*}
 */
exports.than = function (long1, long2, operator) {
    operator = operator || '>';
    long1 = String(long1).replace(REG_BEGIN_0, '');
    long2 = String(long2).replace(REG_BEGIN_0, '');

    // 1. 比较长度
    if (long1.length > long2.length) {
        return operator === '>';
    } else if (long1.length < long2.length) {
        return operator === '<';
    }

    var long1List = exports.humanNumber(long1, ',', 15).split(',');
    var long2List = exports.humanNumber(long2, ',', 15).split(',');

    //[
    // '123456',
    // '789012345678901',
    // '234567890123456',
    // '789012345678901',
    // '234567890123457'
    // ]

    // 2. 比较数组长度
    if (long1List.length > long2List.length) {
        return operator === '>';
    } else if (long1List.length < long2List.length) {
        return operator === '<';
    }

    // 3. 遍历比较
    var ret = false;

    exports.each(long1List, function (index, number1) {
        var number2 = long2List[index];

        if (number1 > number2) {
            ret = operator === '>';
            return false;
        } else if (number1 < number2) {
            ret = operator === '<';
            return false;
        }
    });

    return ret;
};


/**
 * 获取 gravatar
 * @param email {String} 邮箱
 * @param [options] {Object} 配置
 * @param [options.host="http://gravatar.duoshuo.com/avatar/"] {String} 服务器
 * @param [options.size=100] {Number} 尺寸
 * @param [options.default="retro"] {Number} 默认头像
 * @param [options.forcedefault=false] {*} 是否忽略默认头像
 * @param [options.rating] {*} 评级
 * @returns {string}
 */
exports.gravatar = function (email, options) {
    options = options || {};
    email = email.toLowerCase();

    if (!options.host) {
        options.host = 'http://gravatar.duoshuo.com/avatar/';
    }

    options.host += crypto.md5(email) + '?';

    if (!options.size) {
        options.size = 100;
    }

    if (!options.default) {
        //options.default = 'http://s.ydr.me/p/i/avatar.png';
        options.default = 'retro';
    }

    if (options.forcedefault) {
        options.forcedefault = 'y';
    } else {
        options.forcedefault = false;
    }

    var query = {
        s: options.size
    };

    if(options.default){
        query.d = options.default;
    }

    if(options.forcedefault){
        query.f = options.forcedefault;
    }

    if(options.rating){
        query.r = options.rating;
    }

    return options.host + qs.stringify(query);
};

//var ascii = '云淡然2014';
//var base64;
//console.log(base64 = exports.atob(ascii));
//console.log(exports.btoa(base64));
//console.log(exports.humanize('31231231231210.003112'));

//var long1 = '12345678901234567890';
//var long2 = '5';
//
//var ret = exports.than(long1, long2);
//console.log(ret);

//console.log(exports.gravatar('1@1.com'));