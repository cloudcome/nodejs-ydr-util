/*!
 * 远程请求
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var url = require('url');
var http = require('http');
var https = require('https');
var typeis = require('./typeis.js');


/**
 * GET 请求
 * @param url
 * @param [options]
 * @param callback
 */
exports.get = function (url, options, callback) {
    if (typeis(options) === 'function') {
        callback = options;
        options = {};
    }

    options.url = url;
    options.method = 'GET';
    _request(options, callback);
};


/**
 * POST 请求
 * @param url
 * @param [options]
 * @param callback
 */
exports.post = function (url, options, callback) {
    if (typeis(options) === 'function') {
        callback = options;
        options = {};
    }

    options.url = url;
    options.method = 'POST';
    _request(options, callback);
};


/**
 * 远程请求
 * @param options
 * @param callback
 * @private
 */
function _request(options, callback) {
    var parser = url.parse(options.url);
    var _http = parser.protocol === 'https:' ? https : http;
    var body = options.body || '';

    parser.headers = options.headers;
    parser.agent = options.agent;
    parser.method = options.method.toUpperCase() || 'GET';

    var req = _http.request(parser, function (res) {
        var bufferList = [];

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            bufferList.push(new Buffer(chunk, 'utf8'));
        }).on('end', function () {
            var data = Buffer.concat(bufferList).toString();
            callback(null, data);
        }).on('error', callback);
    });

    req.on('error', callback);

    if (parser.mdthod === 'POST') {
        req.write(body);
    }

    req.end();
}