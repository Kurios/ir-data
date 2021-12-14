import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import http from 'http'


const db = (async () => {
    // open the database
    open({
        filename: 'database.db',
        driver: sqlite3.Database
    }).then( async (db)=> {

    db.on("trace", (err)=>{console.log(err)});
    
    let server = http.createServer(async (req,res)=>{
        res.writeHead(200, {'Content-Type':"text/json", 'Access-Control-Allow-Origin':'*'})
        //res.write("name prosperity timestamp")
        let result;
        switch (req.url) {
            case "/prosperity":
                result = await db.all(
                `SELECT unions.name, cities.citycount, players.playercount, prosperity.prosperity, prosperity.datetime FROM prosperity `+
                `INNER JOIN unions ON unions.id = prosperity.unionid `+
               `INNER JOIN players ON players.unionid = prosperity.unionid and players.datetime = prosperity.datetime `+
               `LEFT JOIN cities ON cities.unionid = prosperity.unionid and cities.datetime = prosperity.datetime ` +
                `WHERE (prosperity.prosperity > ( players.playercount * 26))`)
                for (let item of result) {
                    item.datetime = Math.round(new Date(item.datetime).getTime())
                }
                res.write(JSON.stringify(result))
                break;
            case "/rank":
                result = await db.all('SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) "rank", unions.id, prosperity.prosperity, unions.name, cities.citycount, prosperity.datetime FROM prosperity '+
                'INNER JOIN unions  ON unions.id = prosperity.unionid  ' +
                'INNER JOIN cities  ON unions.id = cities.unionid  ' +
                'WHERE prosperity.datetime IN (SELECT prosperity.datetime FROM prosperity ORDER BY prosperity.datetime DESC limit 1) ORDER BY prosperity.prosperity DESC')
                for (let item of result) {
                    item.datetime = Math.round(new Date(item.datetime).getTime())
                }
                res.write(JSON.stringify(result))
                break;
        }
        res.end()
    })
    
    server.listen(9898);
    console.log("server up at localhost:9898")


    })})();