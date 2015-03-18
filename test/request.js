var request = require('../libs/request.js');

request.get('http://www.baidu.com/', function (err, body) {
    console.log(err);
    console.log(body);
});
