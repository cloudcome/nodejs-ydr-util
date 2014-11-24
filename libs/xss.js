/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var REG_LT = /</g;
var REG_GT = />/g;
var REG_LONG_BREAK_LINE = /[\n\r]{3,}/g;
// 自动关闭标签是安全的，如 br、hr、img 等
var REG_CLOSE_TAGNAME = /(?!```)<([a-z\d]+)\b[\s\S]*?>([\s\S]*?)<\/\1>(?!```)/ig;
var REG_PRE = /```[\s\S]*?```/g;
// 影响页面的危险标签
var dangerTagNameList = 'script iframe body head html'.split(' ');


/**
 * markdown 语法过滤，虽然 markdown 支持兼容 HTML 标签，但为了安全考虑，这里必须去掉
 * 相当一部分的标签
 * @param source {String} 原始内容
 * @returns {string} 过滤后的内容
 */
exports.markdown = function (source, moreDangerTagNameList) {
    var list = source.split(REG_PRE);
    var pres = source.match(REG_PRE) || [''];
    var ret = '';
    var i = 0;

    moreDangerTagNameList = moreDangerTagNameList || [];

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

    return ret;
};


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//var fs = require('fs');
//var path = require('path');
//var file = path.join(__dirname, '../test/test.md');
//var file2 = path.join(__dirname, '../test/test2.md');
//var html = fs.readFileSync(file, 'utf8');
//var html2 = exports.markdown(html);
//fs.writeFileSync(file2, html2, 'utf8')