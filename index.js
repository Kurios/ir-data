import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// this is a top-level await 

sqlite3.verbose()

const db = (async () => {
    // open the database
    open({
        filename: 'database.db',
        driver: sqlite3.Database
    }).then( async (db)=> {

    db.on("trace", (err)=>{console.log(err)});

    //we have 2 tables. Union lookup and the actual timestamps.
    await db.exec('CREATE TABLE IF NOT EXISTS unions (id INTEGER NOT NULL PRIMARY KEY, name TEXT)')
    await db.exec('CREATE TABLE IF NOT EXISTS players (unionid NUMBER, playercount NUMBER, datetime TEXT)')
    await db.exec('CREATE TABLE IF NOT EXISTS prosperity (unionid NUMBER, prosperity NUMBER, datetime TEXT)')
    await db.exec('CREATE TABLE IF NOT EXISTS cities (unionid NUMBER, citycount NUMBER, datetime TEXT)')
    await db.exec('CREATE TABLE IF NOT EXISTS score (unionid NUMBER, score NUMBER, datetime TEXT)')

    //read the json blob...
    let json // <INSERT SHIT HERE>



    console.log("json created");
    //go through array, adding elements to table
    let time // SOME TIME LIKE "2021-12-10 21:00" HERE
    let i = 0;
    for (let item of json) {
        let unionName = item[1]
        let unionId = item[0]
        let playercount = item[3]
        let prosperity = item[11]
        if (!Number.isInteger(item)) {
            console.log(`${i} ${unionName} ${unionId} ${playercount}/100 ${prosperity}`)
            await db.run("INSERT INTO unions (id, name) VALUES( " + unionId + " , '" + unionName + "') ON CONFLICT(id) DO UPDATE SET name=excluded.name;")
            await db.run(`INSERT INTO players (unionid, playercount, datetime) VALUES (${unionId}, ${playercount}, datetime('${time}'))`)
            await db.run(`INSERT INTO prosperity (unionid, prosperity, datetime) VALUES (${unionId}, ${prosperity}, datetime('${time}'))`)
        }
        i++
    }

})})()


///interesting sql:
/// SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) RowNum, prosperity.prosperity, players.playercount, unions.name, prosperity.datetime FROM prosperity INNER JOIN unions  ON unions.id = prosperity.unionid INNER JOIN players ON players.unionid = unions.id WHERE prosperity.datetime = datetime("2021-12-10 09:00") AND players.datetime = datetime("2021-12-10 09:00") ORDER BY unions.id DESC