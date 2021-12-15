import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import http from 'http'
import fs from 'fs'
import Database from 'better-sqlite3'

const topLvlFunction = (async () => {
    // open the database
    const db = new Database('database.db', { verbose: console.log });


    db.exec('CREATE TABLE IF NOT EXISTS unions (id INTEGER NOT NULL PRIMARY KEY, name TEXT)')
    db.exec('CREATE TABLE IF NOT EXISTS diplomacyScreen (unionid NUMBER, playercount NUMBER, datetime TEXT)')
    db.exec('CREATE TABLE IF NOT EXISTS prosperity (unionid NUMBER, prosperity NUMBER, datetime TEXT)')
    db.exec('CREATE TABLE IF NOT EXISTS cities (unionid NUMBER, citycount NUMBER, datetime TEXT)')
    db.exec('CREATE TABLE IF NOT EXISTS score (unionid NUMBER, score NUMBER, datetime TEXT)')
    let prospSql = db.prepare(`SELECT unions.name, cities.citycount, players.playercount, prosperity.prosperity, prosperity.datetime FROM prosperity ` +
        `INNER JOIN unions ON unions.id = prosperity.unionid ` +
        `INNER JOIN players ON players.unionid = prosperity.unionid and players.datetime = prosperity.datetime ` +
        `LEFT JOIN cities ON cities.unionid = prosperity.unionid and cities.datetime = prosperity.datetime ` +
        `WHERE (prosperity.prosperity > ( players.playercount * 26))`)
    let rankSql = db.prepare(`'SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) "rank", unions.id, prosperity.prosperity, unions.name, cities.citycount, prosperity.datetime FROM prosperity ' +
        'INNER JOIN unions  ON unions.id = prosperity.unionid  ' +
        'INNER JOIN cities  ON unions.id = cities.unionid  ' +
        'WHERE prosperity.datetime IN (SELECT prosperity.datetime FROM prosperity ORDER BY prosperity.datetime DESC limit 1) ORDER BY prosperity.prosperity DESC'`)
    let scoreSql = db.prepare(`SELECT unions.name, score.score,score.datetime FROM score ` +
        `INNER JOIN unions ON unions.id = score.unionid ` +
        `WHERE (score.score > 0)`)
    //Ok, this is stupid... I'm rewriting this... the real problem is going to be back-propagating this....
    let unionInsertSql = db.prepare("INSERT INTO unions (id, name) VALUES( " + unionId + " , '" + unionName + "') ON CONFLICT(id) DO UPDATE SET name=excluded.name;")
    let playersInsertSql = db.prepare(`INSERT INTO players (unionid, playercount, datetime) VALUES (${unionId}, ${playercount}, datetime('${time}'))`)
    let prosperityInsertSql = db.prepare(`INSERT INTO prosperity (unionid, prosperity, datetime) VALUES (${unionId}, ${prosperity}, datetime('${time}'))`)
    let citiesInsertSql = db.prepare(`INSERT INTO cities (unionid, citycount, datetime) VALUES (${unionId}, ${cities}, datetime('${time}'))`)
    let scoreInsertSql = db.prepare(`INSERT INTO score (unionid, score, datetime) VALUES (${unionId}, ${score}, datetime('${time}'))`)
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
            case "/score":
                result = await db.all(`SELECT unions.name, score.score,score.datetime FROM score ` +
                    `INNER JOIN unions ON unions.id = score.unionid ` +
                    `WHERE (score.score > 0)`)
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
                                let score = item[18] //raiting points
                                if (!Number.isInteger(item)) {
                                    console.log(`${i} ${unionName} ${unionId} ${playercount}/100 ${prosperity}`)
                                    await db.run("INSERT INTO unions (id, name) VALUES( " + unionId + " , '" + unionName + "') ON CONFLICT(id) DO UPDATE SET name=excluded.name;")
                                    await db.run(`INSERT INTO players (unionid, playercount, datetime) VALUES (${unionId}, ${playercount}, datetime('${time}'))`)
                                    await db.run(`INSERT INTO prosperity (unionid, prosperity, datetime) VALUES (${unionId}, ${prosperity}, datetime('${time}'))`)
                                    await db.run(`INSERT INTO cities (unionid, citycount, datetime) VALUES (${unionId}, ${cities}, datetime('${time}'))`)
                                    await db.run(`INSERT INTO score (unionid, score, datetime) VALUES (${unionId}, ${score}, datetime('${time}'))`)
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

})();