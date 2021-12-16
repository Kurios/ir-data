//import { sqlite3 } from 'sqlite3'
//import { open } from 'sqlite'
import * as http from 'http'
import * as fs from 'fs'
import {Sql} from './sql'


const topLvlFunction = (async () => {
    let sql = new Sql();
    let server = http.createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': "text/json", 'Access-Control-Allow-Origin': '*' })
        //res.write("name prosperity timestamp")
        let result;
        switch (req.url) {
            case "/":
                res.writeHead(200, { 'Content-Type': "text/html", 'Access-Control-Allow-Origin': '*' })
                var data = fs.readFileSync("index.html", "utf8");
                res.write(data)
                break;
            case "/prosperity":
                result = sql.diploData();
                if(result)
                    for (let item of result) {
                        item.datetime = Math.round(new Date(item.datetime).getTime())
                    }
                res.write(JSON.stringify(result))
                break;
            case "/rank":
                result = sql.rank();
                if(result)
                    for (let item of result) {
                        item.datetime = Math.round(new Date(item.datetime).getTime())
                    }
                res.write(JSON.stringify(result))
                break;
            case "/unions":
                result = sql.unionList();
                res.write(JSON.stringify(result))
                break;
            case "/write":
                if (req.method == "POST") {
                    var body = "";
                    req.on('data', (c) => { body += c })
                    req.on('end', async () => {
                        try {
                            console.log("WRITE: " + body)

                            let json = JSON.parse(body);
                            //sanity check it
                            sql.writeDiploDataJson(json)
                            res.writeHead(200);
                        } catch (e) {
                            console.log(e)
                            res.writeHead(500);
                        }
                    })
                }
        }
        res.end()
    })

    server.listen(9898);
    console.log("server up at localhost:9898")

})();