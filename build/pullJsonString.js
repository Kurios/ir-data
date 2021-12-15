"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var tail_file_1 = require("@logdna/tail-file");
var sqlite3_1 = require("sqlite3");
var sqlite_1 = require("sqlite");
//'%LocalAppData%/lagrange_global_online_branch/log.txt'
var tail = new tail_file_1["default"]('C:\\Users\\jmorg\\AppData\\Local\\lagrange_global_online_branch\\log.txt', { encoding: 'utf8' })
    .on('data', function (chunk) {
    var d = chunk.split("\n");
    if (/cmd_id:\[502\]/g.test(d[1])) {
        console.log("match");
        //console.log(d[2])
        var payload_1 = JSON.parse(d[2].substring(26));
        console.log("payload aquired!");
        // this is a top-level await 
        sqlite3_1["default"].verbose();
        var db = (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // open the database
                (0, sqlite_1.open)({
                    filename: 'database.db',
                    driver: sqlite3_1["default"].Database
                }).then(function (db) { return __awaiter(void 0, void 0, void 0, function () {
                    var json, date, time, i, _i, json_1, item, unionName, unionId, playercount, cities, prosperity;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                db.on("trace", function (err) { console.log(err); });
                                //we have 2 tables. Union lookup and the actual timestamps.
                                return [4 /*yield*/, db.exec('CREATE TABLE IF NOT EXISTS unions (id INTEGER NOT NULL PRIMARY KEY, name TEXT)')];
                            case 1:
                                //we have 2 tables. Union lookup and the actual timestamps.
                                _a.sent();
                                return [4 /*yield*/, db.exec('CREATE TABLE IF NOT EXISTS players (unionid NUMBER, playercount NUMBER, datetime TEXT)')];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, db.exec('CREATE TABLE IF NOT EXISTS prosperity (unionid NUMBER, prosperity NUMBER, datetime TEXT)')];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, db.exec('CREATE TABLE IF NOT EXISTS cities (unionid NUMBER, citycount NUMBER, datetime TEXT)')];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, db.exec('CREATE TABLE IF NOT EXISTS score (unionid NUMBER, score NUMBER, datetime TEXT)')
                                    //read the json blob...
                                ];
                            case 5:
                                _a.sent();
                                json = payload_1;
                                date = new Date();
                                time = "".concat(date.toISOString().slice(0, 10), " ").concat(date.toISOString().slice(11, 19));
                                i = 0;
                                _i = 0, json_1 = json;
                                _a.label = 6;
                            case 6:
                                if (!(_i < json_1.length)) return [3 /*break*/, 13];
                                item = json_1[_i];
                                unionName = item[1];
                                unionId = item[0];
                                playercount = item[3];
                                cities = item[8];
                                prosperity = item[11];
                                if (!!Number.isInteger(item)) return [3 /*break*/, 11];
                                console.log("".concat(i, " ").concat(unionName, " ").concat(unionId, " ").concat(playercount, "/100 ").concat(prosperity));
                                return [4 /*yield*/, db.run("INSERT INTO unions (id, name) VALUES( " + unionId + " , '" + unionName + "') ON CONFLICT(id) DO UPDATE SET name=excluded.name;")];
                            case 7:
                                _a.sent();
                                return [4 /*yield*/, db.run("INSERT INTO players (unionid, playercount, datetime) VALUES (".concat(unionId, ", ").concat(playercount, ", datetime('").concat(time, "'))"))];
                            case 8:
                                _a.sent();
                                return [4 /*yield*/, db.run("INSERT INTO prosperity (unionid, prosperity, datetime) VALUES (".concat(unionId, ", ").concat(prosperity, ", datetime('").concat(time, "'))"))];
                            case 9:
                                _a.sent();
                                return [4 /*yield*/, db.run("INSERT INTO cities (unionid, citycount, datetime) VALUES (".concat(unionId, ", ").concat(cities, ", datetime('").concat(time, "'))"))];
                            case 10:
                                _a.sent();
                                _a.label = 11;
                            case 11:
                                i++;
                                _a.label = 12;
                            case 12:
                                _i++;
                                return [3 /*break*/, 6];
                            case 13: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); })();
        ///interesting sql:
        /// SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) RowNum, prosperity.prosperity, players.playercount, unions.name, prosperity.datetime FROM prosperity INNER JOIN unions  ON unions.id = prosperity.unionid INNER JOIN players ON players.unionid = unions.id WHERE prosperity.datetime = datetime("2021-12-10 09:00") AND players.datetime = datetime("2021-12-10 09:00") ORDER BY unions.id DESC
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
