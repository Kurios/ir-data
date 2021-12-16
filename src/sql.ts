import Sqlite3 = require('better-sqlite3')
import {Database, Statement} from 'better-sqlite3'
import { readlink } from 'fs';

export class Sql {
    db: Database
    diploSql: Statement
    rankSql: Statement
    scoreSql:Statement
    unionListSql:Statement
    unionInsertSql:Statement
    unionDiplomacyInsertSql:Statement
    constructor(){
        // open the database
        this.db = new Sqlite3('database.db', { verbose: console.log });



        //verify table structure exists
        this.db.exec('CREATE TABLE IF NOT EXISTS unionList (id INTEGER NOT NULL PRIMARY KEY, name TEXT, leader TEXT, leaderId NUMBER, announcement STRING )')
        this.db.exec('CREATE TABLE IF NOT EXISTS unionRank ( '+
            'unionid NUMBER, element2 NUMBER, players NUMBER, maxplayers NUMBER, element5 NUMBER, element6 NUMBER, element7 NUMBER, cityCount NUMBER, prosperity NUMBER, startingRegion NUMBER, element13 NUMBER, '+
            'element16 TEXT, element17 NUMBER, score NUMBER, element19 NUMBER, datetime TEXT, CONSTRAINT unionRank_pk PRIMARY KEY (unionid, datetime))')

            
        //prepare prepared statements
        this.diploSql = this.db.prepare(`SELECT unions.name, cities.citycount, players.playercount, prosperity.prosperity, prosperity.datetime FROM prosperity ` +
            `INNER JOIN unions ON unions.id = prosperity.unionid ` +
            `INNER JOIN players ON players.unionid = prosperity.unionid and players.datetime = prosperity.datetime ` +
            `LEFT JOIN cities ON cities.unionid = prosperity.unionid and cities.datetime = prosperity.datetime ` +
            `WHERE (prosperity.prosperity > ( players.playercount * 26))`)
        this.rankSql = this.db.prepare('SELECT  ROW_NUMBER () OVER ( ORDER BY prosperity.prosperity DESC) "rank", unions.id, prosperity.prosperity, unions.name, cities.citycount, prosperity.datetime FROM prosperity ' +
            'INNER JOIN unions  ON unions.id = prosperity.unionid  ' +
            'INNER JOIN cities  ON unions.id = cities.unionid  ' +
            'WHERE prosperity.datetime IN (SELECT prosperity.datetime FROM prosperity ORDER BY prosperity.datetime DESC limit 1) ORDER BY prosperity.prosperity DESC')
        this.scoreSql = this.db.prepare(`SELECT unions.name, score.score,score.datetime FROM score ` +
            `INNER JOIN unions ON unions.id = score.unionid ` +
            `WHERE (score.score > 0)`)

        this.unionListSql = this.db.prepare(`SELECT id, name, leader, leaderId, announcement FROM unionList `)
            
        this.unionInsertSql = this.db.prepare("INSERT INTO unionList (id, name, leader, leaderId, announcement) VALUES( @id, @name, @leader, @leaderId, @announcement) ON CONFLICT(id) DO UPDATE SET name=excluded.name, leader=excluded.leader, leaderid=excluded.leaderId, announcement=excluded.announcement;")

        this.unionDiplomacyInsertSql = this.db.prepare(`INSERT INTO unionRank (unionid, element2, players, maxplayers, element5, element6, element7, cityCount, prosperity, startingRegion, element13, element16, element17, score, element19, datetime) ` +
        `VALUES (@unionid, @element2, @players, @maxplayers, @element5, @element6, @element7, @cityCount, @prosperity, @startingRegion, @element13, @element16, @element17, @score, @element19, datetime(@datetime))`)
    }

    public diploData():DiploData[]|null{
        try{
            let result = this.diploSql.all();
            for (let item of result) {
                item.datetime = Math.round(new Date(item.datetime).getTime())
            }
            return result as RankData[];
        }catch(e){
            console.log(e)
        }
        return null
    }
    
    public rank():RankData[]|null{
        try{
            let result = this.rankSql.all();
            for (let item of result) {
                item.datetime = Math.round(new Date(item.datetime).getTime())
            }
            return result as RankData[];
        }catch(e){
            console.log(e)
        }
        return null

    }

    public unionList():UnionData[]|null {
        try{
            return this.unionListSql.all()
        }catch(e)
        {
            console.log(e)
        }
        return null;
    }

    public writeDiploDataJson(data:any){
        let ret = []
        if(Array.isArray(data)){
            for(let item of data){
                let i = this.validate(item);
                if(i){
                    ret.push(i)
                }
            }
        }
        this.writeDiploData(ret);
    }

    public validate(data:unknown[]):UnionDataElement|null{
        if(Number.isInteger(data[0]) && typeof data[1] == "string" && Number.isInteger(data[2]) && Number.isInteger(data[3]) && Number.isInteger(data[4]))
        if(Number.isInteger(data[5]) && Number.isInteger(data[6]) && Number.isInteger(data[7]) && Number.isInteger(data[8]) && typeof data[9] == "string" )
        if(Number.isInteger(data[10]) && Number.isInteger(data[11]) && Number.isInteger(data[12]) && Number.isInteger(data[13]) && typeof data[14] == "string" )
        if(typeof data[15] == "string"  && Array.isArray(data[16]) && Number.isInteger(data[17]) && Number.isInteger(data[18]) && Number.isInteger(data[19]))
        {
            let ret:UnionDataElement = {
                unionId: data[0] as number,
                unionName: data[1] as string,
                element2: data[2] as number,
                players: data[3] as number,
                maxplayers: data[4] as number,
                element5: data[5] as number,
                element6: data[6] as number,
                element7: data[7] as number,
                cityCount: data[8] as number,
                unionLeader: data[9] as string,
                unionLeaderId: data[10] as number,
                prosperity: data[11] as number,
                startingRegion: data[12] as number,
                element13: data[13] as number,
                language: data[14] as string,
                unionAnnouncement: data[15] as string,
                element16: JSON.stringify(data[16]),
                element17: data[17] as number,
                score: data[18] as number,
                element19: data[19] as number
            }
        return ret;
        }
        return null;
    }

    public writeDiploData(data:RawDiploData){
        let date = new Date();
        let time = `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 19)}`
        this.db.transaction((data:RawDiploData)=>{
            for(let item of data){
                this.unionInsertSql.run({id:item.unionId, name:item.unionName, leader:item.unionLeader, leaderId: item.unionLeaderId, announcement: item.unionAnnouncement })
                this.unionDiplomacyInsertSql.run({unionId:item.unionId, element2:item.element2, players:item.players, maxplayers:item.maxplayers, element5:item.element5, element6:item.element6,element7:item.element7,cityCount:item.cityCount,prosperity:item.prosperity,
                    startingRegion:item.startingRegion,element13:item.element13,element16:item.element16,element17:item.element17,score:item.score,element19:item.element19,time})
            }
        })
    }
    
}

type DiploData  = {
    unionId:number
    players:number
    cityCount:Number
    prosperity:number
    startingRegion:number
    score:number
    datetime:number
}

type RankData  = {
    unionId:number
    element2:number
    players:number
    maxplayers:number
    element5:number
    element6:number
    element7:number
    cityCount:Number
    prosperity:number
    startingRegion:number
    element13:number
    element16: [number]
    element17:number
    score:number
    element19:number
    datetime:number
}

type UnionData = {
    id: number
    name: number
    leader: string
    leaderId: number
    announcement: string
}

type UnionDataElement = {
    unionId:number
    unionName:string
    element2:number
    players:number
    maxplayers:number
    element5:number
    element6:number
    element7:number
    cityCount:Number
    unionLeader:string
    unionLeaderId:number
    prosperity:number
    startingRegion:number
    element13:number
    language:string
    unionAnnouncement: string
    element16: string
    element17:number
    score:number
    element19:number
}


type RawDiploData  = UnionDataElement[]