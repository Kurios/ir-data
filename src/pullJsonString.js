import TailFile from '@logdna/tail-file'

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'


//'%LocalAppData%/lagrange_global_online_branch/log.txt'
const tail = new TailFile('C:\\Users\\jmorg\\AppData\\Local\\lagrange_global_online_branch\\log.txt', { encoding: 'utf8' })
  .on('data', (chunk) => {

    let d = chunk.split("\n");
    if (/cmd_id:\[502\]/g.test(d[1])) {
      console.log("match")
      //console.log(d[2])
      let payload = JSON.parse(d[2].substring(26));
      console.log("payload aquired!")
      // this is a top-level await 

      sqlite3.verbose()

      const db = (async () => {
        // open the database
        open({
          filename: 'database.db',
          driver: sqlite3.Database
        }).then(async (db) => {

          db.on("trace", (err) => { console.log(err) });

          //we have 2 tables. Union lookup and the actual timestamps.
          await db.exec('CREATE TABLE IF NOT EXISTS unions (id INTEGER NOT NULL PRIMARY KEY, name TEXT)')
          await db.exec('CREATE TABLE IF NOT EXISTS players (unionid NUMBER, playercount NUMBER, datetime TEXT)')
          await db.exec('CREATE TABLE IF NOT EXISTS prosperity (unionid NUMBER, prosperity NUMBER, datetime TEXT)')
          await db.exec('CREATE TABLE IF NOT EXISTS cities (unionid NUMBER, citycount NUMBER, datetime TEXT)')
          await db.exec('CREATE TABLE IF NOT EXISTS score (unionid NUMBER, score NUMBER, datetime TEXT)')

          //read the json blob...
          let json = payload;
          //go through array, adding elements to table
          let date = new Date();
          let time = `${date.toISOString().slice(0,10)} ${date.toISOString().slice(11,19)}`
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

        })
      })()


      ///interesting sql:
      /// SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) RowNum, prosperity.prosperity, players.playercount, unions.name, prosperity.datetime FROM prosperity INNER JOIN unions  ON unions.id = prosperity.unionid INNER JOIN players ON players.unionid = unions.id WHERE prosperity.datetime = datetime("2021-12-10 09:00") AND players.datetime = datetime("2021-12-10 09:00") ORDER BY unions.id DESC

    }
    //console.log("START SEGMENT: \n " + chunk)
    //console.log(`Recieved a utf8 character chunk: ${chunk}`)
  })
  .on('tail_error', (err) => {
    console.error('TailFile had an error!', err)
  })
  .on('error', (err) => {
    console.error('A TailFile stream error was likely encountered', err)
  })
  .start()
  .catch((err) => {
    console.error('Cannot start.  Does the file exist?', err)
  })
