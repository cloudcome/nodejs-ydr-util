/*!
 * 日志
 * @author ydr.me
 * @create 2014-11-26 19:51
 */

'use strict';

var dato = require('./dato.js');
var date = require('./date.js');
var fs = require('fs-extra');
var path = require('path');
var options = {
    // 运行环境，默认为开发
    env: 'pro',
    // 存放路径
    path: null,
    // YYYY年MM月DD日 HH:mm:ss.SSS 星期e a
    name: './YYYY/MM/YYYY-MM-DD'
};
var log = function () {
    var fn1 = function (req, res, next) {
        _log(null, req, res, next);
    };
    var fn2 = function (err, req, res, next) {
        _log(err, req, res, next);
    };

    return [fn1, fn2];
};


/**
 * 设置配置
 * @param key
 * @param val
 */
log.setOptions = function (key, val) {
    var map = {};

    if (arguments.length === 2) {
        map[key] = val;
    } else {
        map = key;
    }

    dato.extend(true, options, map);
};

/**
 * 日志记录
 * @type {Function}
 *
 * @example
 * var app = require('express')();
 * app.use('has log middleware');
 * app.use(log);
 * app.use('no log middleware');
 */
module.exports = log;


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////


/**
 * 日志记录
 * @param err
 * @param req
 * @param res
 * @param next
 * @private
 */
function _log(err, req, res, next) {
    var time = date.format('YYYY年MM月DD日 HH:mm:ss.SSS 星期e a');
    var request = req.method + ' ' + (err ? '500' : '404') + ' ' + req.url;
    var ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    var query = JSON.stringify(req.query || {}, null, 4);
    var body = JSON.stringify(req.body || {}, null, 4);
    var name = date.format(options.name);
    var suffix = err ? '-500.log' : '-404.log';
    var file = name + suffix;
    var txt =
        '##################################################################\n' +
        'time: ' + time + '\n' +
        'request: ' + request + '\n' +
        'ua: ' + req.headers['user-agent'] + '\n' +
        'ip: ' + ip + '\n' +
        'query: \n' + query + '\n' +
        'body: \n' + body + '\n';

    if (err) {
        txt +=
            'error: ' + err.message + '\n' +
            'stack: \n' + (err.stack || 'no stack') + '\n';
    }

    txt += '##################################################################\n';

    // 生产环境
    if (options.env.indexOf('pro') > -1) {
        if (!options.path) {
            console.error('please set ydr-util.log options about path');
            process.exit(-1);
        }

        file = path.join(options.path, file);
        fs.createFile(file, function (e) {
            if (!e) {
                fs.appendFile(file, txt + '\n', function () {
                    // ignore
                });
            }
        });
    } else {
        console.log(txt);
    }

    next(err);
}