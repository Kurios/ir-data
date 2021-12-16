"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { sqlite3 } from 'sqlite3'
//import { open } from 'sqlite'
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const sql_1 = require("./sql");
const topLvlFunction = (async () => {
    let sql = new sql_1.Sql();
    let server = http.createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': "text/json", 'Access-Control-Allow-Origin': '*' });
        //res.write("name prosperity timestamp")
        let result;
        switch (req.url) {
            case "/":
                res.writeHead(200, { 'Content-Type': "text/html", 'Access-Control-Allow-Origin': '*' });
                var data = fs.readFileSync("index.html", "utf8");
                res.write(data);
                break;
            case "/prosperity":
                result = sql.diploData();
                if (result)
                    for (let item of result) {
                        item.datetime = Math.round(new Date(item.datetime).getTime());
                    }
                res.write(JSON.stringify(result));
                break;
            case "/rank":
                result = sql.rank();
                if (result)
                    for (let item of result) {
                        item.datetime = Math.round(new Date(item.datetime).getTime());
                    }
                res.write(JSON.stringify(result));
                break;
            case "/unions":
                result = sql.unionList();
                res.write(JSON.stringify(result));
                break;
            case "/write":
                if (req.method == "POST") {
                    var body = "";
                    req.on('data', (c) => { body += c; });
                    req.on('end', async () => {
                        try {
                            console.log("WRITE: " + body);
                            let json = JSON.parse(body);
                            //sanity check it
                            sql.writeDiploDataJson(json);
                            res.writeHead(200);
                        }
                        catch (e) {
                            console.log(e);
                            res.writeHead(500);
                        }
                    });
                }
        }
        res.end();
    });
    server.listen(9898);
    console.log("server up at localhost:9898");
})();
//# sourceMappingURL=generateData.js.map