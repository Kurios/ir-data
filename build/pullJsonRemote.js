"use strict";
exports.__esModule = true;
var tail_file_1 = require("@logdna/tail-file");
var http_1 = require("http");
var lastRead = 0;
//'%LocalAppData%/lagrange_global_online_branch/log.txt'
console.log("listening to " + process.env.localappdata + '\\lagrange_global_online_branch\\log.txt');
var tail = new tail_file_1["default"](process.env.localappdata + '/lagrange_global_online_branch/log.txt', { encoding: 'utf8' })
    .on('data', function (chunk) {
    var d = chunk.split("\n");
    if (/cmd_id:\[502\]/g.test(d[1])) {
        console.log("match");
        //console.log(d[2])
        var payload = JSON.parse(d[2].substring(26));
        console.log("payload aquired!");
        console.log(JSON.stringify(payload));
        //only once every 5 minutes....
        if ((new Date().getTime() - lastRead) > 300000) {
            console.log("transfering");
            lastRead = new Date().getTime();
            var options = { hostname: "notthedomainyourlookingfor.com", port: 80, path: "/write", method: "POST" };
            var request = http_1["default"].request(options, function (response) { });
            request.write(JSON.stringify(payload));
            request.end();
            console.log("finished");
        }
    }
    //console.log("START SEGMENT: \n " + chunk)
    //console.log(`Recieved a utf8 character chunk: ${chunk}`)
})
    .on('tail_error', function (err) {
    console.error('TailFile had an error!', err);
})
    .on('error', function (err) {
    console.error('A TailFile stream error was likely encountered', err);
})
    .start()["catch"](function (err) {
    console.error('Cannot start.  Does the file exist?', err);
});
