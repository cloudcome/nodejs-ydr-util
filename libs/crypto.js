/*!
 * 加密
 * @author ydr.me
 * @create 2014-11-17 11:18
 */

'use strict';

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');


/**
 * 字符串的 MD5 计算
 * @param data {String} 待计算的数据
 * @returns {string}
 *
 * @example
 * crypto.md5('123');
 * // => "202cb962ac59075b964b07152d234b70"
 */
exports.md5 = function (data) {
    try {
        return crypto.createHash('md5').update(String(data)).digest('hex');
    } catch (err) {
        return '';
    }
};


/**
 * 文件修改时间的 etag 计算
 * @param file {String} 文件绝对路径
 * @param [callback] {Function} 回调，有回调表示读取文件流进行MD5计算
 * @returns {string}
 */
exports.etag = function (file, callback) {
    var md5;
    var stats;
    var stream;
    var ret;

    if (callback) {
        md5 = crypto.createHash('md5');
        stream = fs.ReadStream(file);
        stream.on('data', function (d) {
            md5.update(d);
        });
        stream.on('end', function () {
            var d = md5.digest('hex');

            callback(null, d);
        });
        stream.on('error', callback);
    } else {
        try {
            stats = fs.statSync(file);
        } catch (err) {
            stats = null;
        }

        ret = stats ? String(new Date(stats.mtime).getTime()) : '0';
        return this.md5(ret);
    }
};


/**
 * 编码
 * @param data {String} 原始数据
 * @param secret {String} 密钥
 * @returns {String}
 */
exports.encode = function (data, secret) {
    var cipher = crypto.createCipher('aes192', String(secret));

    return cipher.update(String(data), 'utf8', 'hex') + cipher.final('hex');
};


/**
 * 解码
 * @param data {String} 编码后的数据
 * @param secret {String} 密钥
 * @returns {String}
 */
exports.decode = function (data, secret) {
    var decipher = crypto.createDecipher('aes192', String(secret));

    return decipher.update(String(data), 'hex', 'utf8') + decipher.final('utf8');
};


///////////////////////////////////////////////////////////////////////////
//var str = '123';
//console.log(exports.md5(str));

//var file = path.join(__dirname, '../index.js');
//var d = exports.etag(file);
//console.log(d);
//
//exports.etag(file, function (err, md5) {
//    console.log(err);
//    console.log(md5);
//});

//var a = '123';
//var k = '456';
//var e = exports.encode(a, k);
//console.log(e);
//var d = exports.decode(e, k);
//console.log(d);