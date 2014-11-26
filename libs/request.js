/*!
 * 远程请求
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var fs = require('fs');
var url = require('url');
var http = require('http');
var https = require('https');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var defaults = {
    method: 'GET',
    encoding: 'utf8'
};
var methods = 'head get post put delete'.split(' ');
var Stream = require('stream');

/**
 * HEAD/GET/POST/PUT/DELETE 请求
 */
methods.forEach(function (method) {
    exports[method] = function (url, options, callback) {
        if (typeis(options) === 'function') {
            callback = options;
            options = {};
        }

        options.url = url;
        options.method = method;
        _request(options, callback);
    };
});


/**
 * 远程请求
 * @param options
 * @param options.url {String} 请求地址
 * @param [options.method="GET"] {String} 请求方法
 * @param [options.headers=null] {Object} 请求头
 * @param [options.agent=null] {String} 请求代理信息
 * @param [options.encoding="utf8"] {String} 响应处理编码，可选 utf8/binary
 * @param [options.body=""] {String|Stream} POST/PUT 写入数据
 * @param [options.file=""] {String} POST/PUT 写入的文件地址
 * @param callback
 * @private
 */
function _request(options, callback) {
    var requestOptions = url.parse(options.url);
    var _http = requestOptions.protocol === 'https:' ? https : http;
    var body = options.body || '';
    var bodyLength = 0;
    var file = options.file || '';
    var req;
    var canSend;
    var stat;

    options = dato.extend(true, {}, defaults, options);
    requestOptions.headers = options.headers;
    requestOptions.agent = options.agent;
    requestOptions.method = options.method.toUpperCase();
    canSend = requestOptions.method !== 'GET' && requestOptions.method !== 'HEAD';

    if (canSend) {
        if (file) {
            try {
                stat = fs.statSync(file);
            } catch (err) {
                return callback(err);
            }

            bodyLength = stat.size;
            body = fs.createReadStream(file);
        }

        if (!bodyLength) {
            bodyLength = body.length;
        }
    }

    options.headers['Content-Length'] = bodyLength;
    req = _http.request(requestOptions, function (res) {
        var bufferList = [];
        var binarys = '';
        var isUtf8 = options.encoding === 'utf8';

        if (requestOptions.method === 'HEAD') {
            req.abort();
            return callback(null, res.headers, res);
        }

        res.setEncoding(options.encoding);

        res.on('data', function (chunk) {
            if (isUtf8) {
                bufferList.push(new Buffer(chunk, 'utf8'));
            } else {
                binarys += chunk;
            }
        }).on('end', function () {
            var data;

            if (isUtf8) {
                data = Buffer.concat(bufferList).toString();
            } else {
                data = binarys;
            }

            callback(null, data, res);
        }).on('error', callback);
    });

    req.on('error', callback);

    if (canSend) {
        //steam
        if (body instanceof Stream) {
            body.pipe(req);
        } else {
            req.end(body);
        }
    } else {
        req.end();
    }
}


//////////////////////////////////////////////////////////////////////////////////////////

//exports.head('http://ydr.me/favicon.ico', function (err, headers, res) {
//    console.log(headers);
//});

//exports.get('http://ydr.me', function (err, body, res) {
//    console.log(body);
//});

//var fs = require('fs');
//var path = require('path');
//exports.get('http://ydr.me/favicon.ico', {
//    encoding: 'binary'
//}, function (e, binary, res) {
//    var file = path.join(__dirname, '../test/ydr.me.ico');
//    fs.writeFileSync(file, binary, 'binary');
//});
