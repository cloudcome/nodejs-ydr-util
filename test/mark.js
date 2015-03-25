/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-03-19 16:59
 */

'use strict';

var howdo = require('howdo');
var glob = require('glob');
var marked = require('marked');
var fs = require('fs-extra');
var REG_MD = /\.md$/i;

glob('./**/*.md', function (err, files) {
    if (err) {
        console.error(err);
        return process.exit();
    }

    howdo
        .each(files, function (index, file, done) {
            var data = fs.readFileSync(file, 'utf8');
            var html = marked(data);
            var newFile = file.replace(REG_MD, '.html');

            fs.outputFileSync(newFile, html);
            done();
        })
        .together(function (err) {
            if (err) {
                console.error(err);
                return process.exit();
            }

            console.log('转换完毕');
            process.exit();
        });
});