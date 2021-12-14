import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import http from 'http'
import fs from 'fs'


const db = (async () => {
    // open the database
    open({
        filename: 'database.db',
        driver: sqlite3.Database
    }).then(async (db) => {

        db.on("trace", (err) => { console.log(err) });

        await db.exec('CREATE TABLE IF NOT EXISTS unions (id INTEGER NOT NULL PRIMARY KEY, name TEXT)')
        await db.exec('CREATE TABLE IF NOT EXISTS players (unionid NUMBER, playercount NUMBER, datetime TEXT)')
        await db.exec('CREATE TABLE IF NOT EXISTS prosperity (unionid NUMBER, prosperity NUMBER, datetime TEXT)')
        await db.exec('CREATE TABLE IF NOT EXISTS cities (unionid NUMBER, citycount NUMBER, datetime TEXT)')
        await db.exec('CREATE TABLE IF NOT EXISTS score (unionid NUMBER, score NUMBER, datetime TEXT)')

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
                    result = await db.all(
                        `SELECT unions.name, cities.citycount, players.playercount, prosperity.prosperity, prosperity.datetime FROM prosperity ` +
                        `INNER JOIN unions ON unions.id = prosperity.unionid ` +
                        `INNER JOIN players ON players.unionid = prosperity.unionid and players.datetime = prosperity.datetime ` +
                        `LEFT JOIN cities ON cities.unionid = prosperity.unionid and cities.datetime = prosperity.datetime ` +
                        `WHERE (prosperity.prosperity > ( players.playercount * 26))`)
                    for (let item of result) {
                        item.datetime = Math.round(new Date(item.datetime).getTime())
                    }
                    res.write(JSON.stringify(result))
                    break;
                case "/rank":
                    result = await db.all('SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) "rank", unions.id, prosperity.prosperity, unions.name, cities.citycount, prosperity.datetime FROM prosperity ' +
                        'INNER JOIN unions  ON unions.id = prosperity.unionid  ' +
                        'INNER JOIN cities  ON unions.id = cities.unionid  ' +
                        'WHERE prosperity.datetime IN (SELECT prosperity.datetime FROM prosperity ORDER BY prosperity.datetime DESC limit 1) ORDER BY prosperity.prosperity DESC')
                    for (let item of result) {
                        item.datetime = Math.round(new Date(item.datetime).getTime())
                    }
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
                                if (typeof json[1][1] != "string") {
                                    throw new Error("Not a real result string");
                                }

                                let date = new Date();
                                let time = `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 19)}`
                                let i = 0;
                                for (let item of json) {
                                    let unionName = item[1]
                                    let unionId = item[0]
                                    let playercount = item[3]
                                    let cities = item[8]
                                    let prosperity = item[11]
                                    if (!Number.isInteger(item)) {
                                        console.log(`${i} ${unionName} ${unionId} ${playercount}/100 ${prosperity}`)
                                        await db.run("INSERT INTO unions (id, name) VALUES( " + unionId + " , '" + unionName + "') ON CONFLICT(id) DO UPDATE SET name=excluded.name;")
                                        await db.run(`INSERT INTO players (unionid, playercount, datetime) VALUES (${unionId}, ${playercount}, datetime('${time}'))`)
                                        await db.run(`INSERT INTO prosperity (unionid, prosperity, datetime) VALUES (${unionId}, ${prosperity}, datetime('${time}'))`)
                                        await db.run(`INSERT INTO cities (unionid, citycount, datetime) VALUES (${unionId}, ${cities}, datetime('${time}'))`)
                                    }
                                    i++
                                }






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


    })
})();