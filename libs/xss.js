/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var marked = require('marked');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var url = require('url');
var REG_DOUBLE = /^\/\//;
var REG_POINT = /\./g;
var REG_LT = /</g;
var REG_GT = />/g;
var REG_LONG_BREAK_LINE = /[\n\r]{3,}/g;
// 自动关闭标签是安全的，如 br、hr、img 等
var REG_CLOSE_TAGNAME = /(?!```)<([a-z\d]+)\b[\s\S]*?>([\s\S]*?)<\/\1>(?!```)/ig;
var REG_PRE = /```[\s\S]*?```/g;
var REG_JAVASCRIPT = /^\s*?javascript/i;
// 影响页面的危险标签
var dangerTagNameList = 'script iframe frameset body head html'.split(' ');
var defaults = {
    hosts: [],
    filter: function (href, title, text) {
        return _buildLink(href, title, text, true);
    }
};


/**
 * markdown 语法过滤，虽然 markdown 支持兼容 HTML 标签，但为了安全考虑，这里必须去掉
 * 相当一部分的标签，最后进行 markdown 解析，输出 HTML 文档
 * @param source {String} 原始内容
 * @param [moreDangerTagNameList] {Array} 更多危险标签，危险标签是会被直接删除的
 * @param [linkFilterOptions] {Object} 链接 target 过滤配置
 * @returns {string} 过滤后的内容
 */
exports.markdown = function (source, moreDangerTagNameList, linkFilterOptions) {
    var list = source.split(REG_PRE);
    var pres = source.match(REG_PRE) || [''];
    var ret = '';
    var i = 0;
    var args = arguments;
    var arg1 = args[1];
    var arg2 = args[2];
    var markedRender = new marked.Renderer();

    if (typeis(arg1) === 'object') {
        linkFilterOptions = arg1;
        moreDangerTagNameList = [];
    } else if (typeis(arg1) === 'array') {
        moreDangerTagNameList = arg1;
        linkFilterOptions = typeis(arg2) === 'object' ? arg2 : null;
    } else {
        moreDangerTagNameList = [];
        linkFilterOptions = null;
    }

    // 过滤不安全 HTML 标签
    list = list.map(function (item) {
        return item.replace(REG_CLOSE_TAGNAME, function ($0, $1) {
            $1 = $1.toLowerCase();

            if (dangerTagNameList.indexOf($1) > -1 || moreDangerTagNameList.indexOf($1) > -1) {
                return '';
            } else {
                return $0.replace(REG_LT, '&lt;').replace(REG_GT, '&gt;');
            }
        }).replace(REG_LONG_BREAK_LINE, '\n\n');
    });

    list.forEach(function (item, j) {
        if (j > 0) {
            ret += pres[i++];
        }

        ret += item;
    });

    linkFilterOptions = dato.extend(true, {}, defaults, linkFilterOptions);

    // 定义 A 链接的 target
    markedRender.link = function (href, title, text) {
        var fixHref = REG_DOUBLE.test(href) ? 'http:' + href : href;
        var parse = url.parse(fixHref);
        var host = parse.host;
        var inHost = false;

        if (REG_JAVASCRIPT.test(href)) {
            return '';
        }

        if (!host) {
            return _buildLink(href, title, text, false);
        }

        dato.each(linkFilterOptions.hosts, function (index, item) {
            if (_regExp(item).test(host)) {
                inHost = true;
                return false;
            }
        });

        // 指定域内的 NO _blank
        if (inHost) {
            return _buildLink(href, title, text, false);
        }

        // 其他的使用传入对象处理
        return linkFilterOptions.filter(href, title, text);
    };

    marked.setOptions({renderer: markedRender});

    return marked(ret);
};


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


/**
 * 生成链接
 * @param href
 * @param title
 * @param text
 * @param isBlank
 * @returns {string}
 * @private
 */
function _buildLink(href, title, text, isBlank) {
    return '<a href="' + href + '"' +
        (isBlank ? ' target="_blank"' : '') +
        (title ? ' ' + title : '') +
        '>' + text + '</a>';
}


/**
 * 生成正则
 * @param regstr
 * @returns {RegExp}
 * @private
 */
function _regExp(regstr) {
    var arr = regstr.split('*.');
    var ret = '';

    arr = arr.map(function (item) {
        return item.replace(REG_POINT, '\\.');
    });

    arr.forEach(function (item, index) {
        if (index > 0) {
            ret += '([^.]+\\.)*';
        }

        ret += item;
    });

    return new RegExp('^' + ret + '$', 'i');
}


var fs = require('fs');
var path = require('path');
var file = path.join(__dirname, '../test/test.md');
var file2 = path.join(__dirname, '../test/test2.html');
var markd = fs.readFileSync(file, 'utf8');
var html2 = exports.markdown(markd, {
    hosts: ['*.ydr.me']
});
fs.writeFileSync(file2, html2, 'utf8')

