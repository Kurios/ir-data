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
var http_1 = require("http");
var fs_1 = require("fs");
var better_sqlite3_1 = require("better-sqlite3");
var topLvlFunction = (function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, prospSql, rankSql, scoreSql, unionInsertSql, playersInsertSql, prosperityInsertSql, citiesInsertSql, scoreInsertSql, server;
    return __generator(this, function (_a) {
        db = new better_sqlite3_1["default"]('database.db', { verbose: console.log });
        db.exec('CREATE TABLE IF NOT EXISTS unions (id INTEGER NOT NULL PRIMARY KEY, name TEXT)');
        db.exec('CREATE TABLE IF NOT EXISTS diplomacyScreen (unionid NUMBER, playercount NUMBER, datetime TEXT)');
        db.exec('CREATE TABLE IF NOT EXISTS prosperity (unionid NUMBER, prosperity NUMBER, datetime TEXT)');
        db.exec('CREATE TABLE IF NOT EXISTS cities (unionid NUMBER, citycount NUMBER, datetime TEXT)');
        db.exec('CREATE TABLE IF NOT EXISTS score (unionid NUMBER, score NUMBER, datetime TEXT)');
        prospSql = db.prepare("SELECT unions.name, cities.citycount, players.playercount, prosperity.prosperity, prosperity.datetime FROM prosperity " +
            "INNER JOIN unions ON unions.id = prosperity.unionid " +
            "INNER JOIN players ON players.unionid = prosperity.unionid and players.datetime = prosperity.datetime " +
            "LEFT JOIN cities ON cities.unionid = prosperity.unionid and cities.datetime = prosperity.datetime " +
            "WHERE (prosperity.prosperity > ( players.playercount * 26))");
        rankSql = db.prepare("'SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) \"rank\", unions.id, prosperity.prosperity, unions.name, cities.citycount, prosperity.datetime FROM prosperity ' +\n        'INNER JOIN unions  ON unions.id = prosperity.unionid  ' +\n        'INNER JOIN cities  ON unions.id = cities.unionid  ' +\n        'WHERE prosperity.datetime IN (SELECT prosperity.datetime FROM prosperity ORDER BY prosperity.datetime DESC limit 1) ORDER BY prosperity.prosperity DESC'");
        scoreSql = db.prepare("SELECT unions.name, score.score,score.datetime FROM score " +
            "INNER JOIN unions ON unions.id = score.unionid " +
            "WHERE (score.score > 0)");
        unionInsertSql = db.prepare("INSERT INTO unions (id, name) VALUES( " + unionId + " , '" + unionName + "') ON CONFLICT(id) DO UPDATE SET name=excluded.name;");
        playersInsertSql = db.prepare("INSERT INTO players (unionid, playercount, datetime) VALUES (".concat(unionId, ", ").concat(playercount, ", datetime('").concat(time, "'))"));
        prosperityInsertSql = db.prepare("INSERT INTO prosperity (unionid, prosperity, datetime) VALUES (".concat(unionId, ", ").concat(prosperity, ", datetime('").concat(time, "'))"));
        citiesInsertSql = db.prepare("INSERT INTO cities (unionid, citycount, datetime) VALUES (".concat(unionId, ", ").concat(cities, ", datetime('").concat(time, "'))"));
        scoreInsertSql = db.prepare("INSERT INTO score (unionid, score, datetime) VALUES (".concat(unionId, ", ").concat(score, ", datetime('").concat(time, "'))"));
        server = http_1["default"].createServer(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var result, _a, data, _i, result_1, item, _b, result_2, item, _c, result_3, item, body;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        res.writeHead(200, { 'Content-Type': "text/json", 'Access-Control-Allow-Origin': '*' });
                        _a = req.url;
                        switch (_a) {
                            case "/": return [3 /*break*/, 1];
                            case "/prosperity": return [3 /*break*/, 2];
                            case "/rank": return [3 /*break*/, 4];
                            case "/score": return [3 /*break*/, 6];
                            case "/write": return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 9];
                    case 1:
                        res.writeHead(200, { 'Content-Type': "text/html", 'Access-Control-Allow-Origin': '*' });
                        data = fs_1["default"].readFileSync("index.html", "utf8");
                        res.write(data);
                        return [3 /*break*/, 9];
                    case 2: return [4 /*yield*/, db.all("SELECT unions.name, cities.citycount, players.playercount, prosperity.prosperity, prosperity.datetime FROM prosperity " +
                            "INNER JOIN unions ON unions.id = prosperity.unionid " +
                            "INNER JOIN players ON players.unionid = prosperity.unionid and players.datetime = prosperity.datetime " +
                            "LEFT JOIN cities ON cities.unionid = prosperity.unionid and cities.datetime = prosperity.datetime " +
                            "WHERE (prosperity.prosperity > ( players.playercount * 26))")];
                    case 3:
                        result = _d.sent();
                        for (_i = 0, result_1 = result; _i < result_1.length; _i++) {
                            item = result_1[_i];
                            item.datetime = Math.round(new Date(item.datetime).getTime());
                        }
                        res.write(JSON.stringify(result));
                        return [3 /*break*/, 9];
                    case 4: return [4 /*yield*/, db.all('SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) "rank", unions.id, prosperity.prosperity, unions.name, cities.citycount, prosperity.datetime FROM prosperity ' +
                            'INNER JOIN unions  ON unions.id = prosperity.unionid  ' +
                            'INNER JOIN cities  ON unions.id = cities.unionid  ' +
                            'WHERE prosperity.datetime IN (SELECT prosperity.datetime FROM prosperity ORDER BY prosperity.datetime DESC limit 1) ORDER BY prosperity.prosperity DESC')];
                    case 5:
                        result = _d.sent();
                        for (_b = 0, result_2 = result; _b < result_2.length; _b++) {
                            item = result_2[_b];
                            item.datetime = Math.round(new Date(item.datetime).getTime());
                        }
                        res.write(JSON.stringify(result));
                        return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, db.all("SELECT unions.name, score.score,score.datetime FROM score " +
                            "INNER JOIN unions ON unions.id = score.unionid " +
                            "WHERE (score.score > 0)")];
                    case 7:
                        result = _d.sent();
                        for (_c = 0, result_3 = result; _c < result_3.length; _c++) {
                            item = result_3[_c];
                            item.datetime = Math.round(new Date(item.datetime).getTime());
                        }
                        res.write(JSON.stringify(result));
                        return [3 /*break*/, 9];
                    case 8:
                        if (req.method == "POST") {
                            body = "";
                            req.on('data', function (c) { body += c; });
                            req.on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
                                var json, date, time, i, _i, json_1, item, unionName, unionId, playercount, cities, prosperity, score, e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 10, , 11]);
                                            console.log("WRITE: " + body);
                                            json = JSON.parse(body);
                                            //sanity check it
                                            if (typeof json[1][1] != "string") {
                                                throw new Error("Not a real result string");
                                            }
                                            date = new Date();
                                            time = "".concat(date.toISOString().slice(0, 10), " ").concat(date.toISOString().slice(11, 19));
                                            i = 0;
                                            _i = 0, json_1 = json;
                                            _a.label = 1;
                                        case 1:
                                            if (!(_i < json_1.length)) return [3 /*break*/, 9];
                                            item = json_1[_i];
                                            unionName = item[1];
                                            unionId = item[0];
                                            playercount = item[3];
                                            cities = item[8];
                                            prosperity = item[11];
                                            score = item[18] //raiting points
                                            ;
                                            if (!!Number.isInteger(item)) return [3 /*break*/, 7];
                                            console.log("".concat(i, " ").concat(unionName, " ").concat(unionId, " ").concat(playercount, "/100 ").concat(prosperity));
                                            return [4 /*yield*/, db.run("INSERT INTO unions (id, name) VALUES( " + unionId + " , '" + unionName + "') ON CONFLICT(id) DO UPDATE SET name=excluded.name;")];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, db.run("INSERT INTO players (unionid, playercount, datetime) VALUES (".concat(unionId, ", ").concat(playercount, ", datetime('").concat(time, "'))"))];
                                        case 3:
                                            _a.sent();
                                            return [4 /*yield*/, db.run("INSERT INTO prosperity (unionid, prosperity, datetime) VALUES (".concat(unionId, ", ").concat(prosperity, ", datetime('").concat(time, "'))"))];
                                        case 4:
                                            _a.sent();
                                            return [4 /*yield*/, db.run("INSERT INTO cities (unionid, citycount, datetime) VALUES (".concat(unionId, ", ").concat(cities, ", datetime('").concat(time, "'))"))];
                                        case 5:
                                            _a.sent();
                                            return [4 /*yield*/, db.run("INSERT INTO score (unionid, score, datetime) VALUES (".concat(unionId, ", ").concat(score, ", datetime('").concat(time, "'))"))];
                                        case 6:
                                            _a.sent();
                                            _a.label = 7;
                                        case 7:
                                            i++;
                                            _a.label = 8;
                                        case 8:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 9:
                                            res.writeHead(200);
                                            return [3 /*break*/, 11];
                                        case 10:
                                            e_1 = _a.sent();
                                            console.log(e_1);
                                            res.writeHead(500);
                                            return [3 /*break*/, 11];
                                        case 11: return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        _d.label = 9;
                    case 9:
                        res.end();
                        return [2 /*return*/];
                }
            });
        }); });
        server.listen(9898);
        console.log("server up at localhost:9898");
        return [2 /*return*/];
    });
}); })();
