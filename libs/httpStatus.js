/*!
 * HTTP status
 * @author ydr.me
 * @create 2014-11-21 09:58
 */

'use strict';


var httpStatusMap = require('./httpStatus.json');


/**
 * 根据 HTTP code 获取对应的 HTTP status
 * @param statusCode {String|Number} HTTP code
 * @param [defaultStatus] 默认 HTTP status
 * @returns {string} HTTP status
 *
 * @example
 * httpStatus.get('200');
 * // => "OK"
 *
 * httpStatus.get('0000', 'what');
 * // => "what"
 */
exports.get = function (statusCode, defaultStatus) {
    statusCode = String(statusCode).toLowerCase();
    defaultStatus = defaultStatus || 'unknow';

    return httpStatusMap[statusCode] || defaultStatus;
};


/**
 * 根据 HTTP code 设置对应的 HTTP status
 * @param statusCode {String|Number} HTTP code
 * @param Status HTTP status
 * @returns {Object} HTTP status MAP
 */
exports.set = function (statusCode, status) {
    statusCode = String(statusCode).toLowerCase();
    status = String(status);
    httpStatusMap[statusCode] = status;

    return httpStatusMap;
};


////////////////////////////////////////////////////////////////////
//console.log(exports.get(200));
//console.log(exports.set(200, 'hehe'));
//console.log(exports.get(200));
