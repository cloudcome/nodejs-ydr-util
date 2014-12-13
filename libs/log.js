/*!
 * 日志
 * @author ydr.me
 * @create 2014-11-26 19:51
 */

'use strict';

var dato = require('./dato.js');
var date = require('./date.js');
var typeis = require('./typeis.js');
var fs = require('fs-extra');
var path = require('path');
var options = {
    // 运行环境，默认为开发
    env: 'pro',
    // 存放路径
    path: null,
    // YYYY年MM月DD日 HH:mm:ss.SSS 星期e a
    name: './YYYY/MM/YYYY-MM-DD',
    // 邮件发送服务器
    smtp: null,
    email: {
        smtp: null,
        from: '服务器错误',
        to: 'cloudcome@qq.com',
        subject: '服务器错误'
    }
};
var log = function () {
    var fn1 = function (req, res, next) {
        _log(null, req, res, next);
    };
    var fn2 = function (err, req, res, next) {
        _log(err, req, res, next);
    };

    process.on('uncaughtException', _log);

    return [fn1, fn2];
};


/**
 * 设置配置
 * @param key {String} 配置键
 * @param val {*} 配置值
 */
log.setOptions = function (key, val) {
    options[key] = val;
};


/**
 * 接收错误
 * @param err {Object} 错误对象
 */
log.holdError = _log;


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
    var request = req ? req.method + ' ' + (err ? '500' : '404') + ' ' + req.url : '';
    var ip = req ? req.ip || req.headers['x-forwarded-for'] || '0.0.0.0' : '';
    var query = req ? JSON.stringify(req.query || {}, null, 4) : '';
    var body = req ? JSON.stringify(req.body || {}, null, 4) : '';
    var name = date.format(options.name);
    var suffix = err ? '-500.log' : '-404.log';
    var file = name + suffix;
    var txt =
        '##################################################################\n' +
        'time: ' + time + '\n' +
        (request ? 'request: ' + request + '\n' : '') +
        (req ? 'ua: ' + req.headers['user-agent'] + '\n' : '') +
        (req ? 'ip: ' + ip + '\n' : '') +
        (req ? 'query: \n' + query + '\n' : '') +
        (req ? 'body: \n' + body + '\n' : '');

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
    }
    // 开发环境
    else {
        console.log(txt);
    }

    if (options.smtp && options.smtp.send && typeis(options.smtp.send) === 'function') {
        options.smtp.send({
            from: options.email.from,
            to: options.email.to,
            subject: options.email.subject + ' ' + time,
            attachment: [{
                data: '<pre>' + txt + '</pre>',
                alternative: true
            }]
        }, function () {
            // ignore
        });
    }

    if (typeis(next) === 'function') {
        next(err);
    }
}