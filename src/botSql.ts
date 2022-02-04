import Sqlite3 = require('better-sqlite3')
import { Database, Statement } from 'better-sqlite3'
import { readlink } from 'fs';
import { Console } from 'console';

export class BotSql {
    db: Database
    insertPlayerSql: Statement
    getPlayerByDiscordSql: Statement
    getPlayerByNameSql: Statement
    getPlayersByUnionSql: Statement
    updateDiscordIdSql: Statement
    insertUnionSql: Statement

    constructor() {
        // open the database
        this.db = new Sqlite3('bot-database.db', { verbose: console.log });



        //verify table structure exists
        this.db.exec('CREATE TABLE IF NOT EXISTS unionList (id INTEGER NOT NULL PRIMARY KEY, name TEXT)')
        this.db.exec('CREATE TABLE IF NOT EXISTS players (id INTEGER NOT NULL PRIMARY KEY, name TEXT, unionId NUMBER, discordId TEXT)')
        //this.db.exec(`INSERT OR REPLACE INTO unionList (id,name) VALUES (1,"")`)

        //prepare prepared statements
        this.insertPlayerSql = this.db.prepare(`INSERT OR IGNORE INTO players (id, name, unionId) VALUES (@playerId, @playerName, @unionId)`)
        this.insertUnionSql = this.db.prepare(`INSERT OR REPLACE INTO unionList (id,name) VALUES (@unionId, @unionName)`)
        this.updateDiscordIdSql = this.db.prepare(`UPDATE players SET discordId=@discordId WHERE id=@playerId`)
        this.getPlayerByDiscordSql = this.db.prepare(`SELECT players.id as playerId, unionList.id as unionId, players.name as playerName, unionList.name as unionName, discordId FROM players INNER JOIN unionList ON players.unionId = unionList.id  WHERE @discordId = players.discordId `)
        this.getPlayerByNameSql = this.db.prepare(`SELECT players.id as playerId,unionList.id as unionId, players.name as playerName, unionList.name as unionName, discordId FROM players INNER JOIN unionList ON players.unionId = unionList.id WHERE players.name LIKE @name`)
        this.getPlayersByUnionSql = this.db.prepare(`SELECT players.id as playerId,unionList.id as unionId, players.name as playerName, unionList.name as unionName, discordId FROM players INNER JOIN unionList ON players.unionId = unionList.id WHERE unionList.name LIKE @name`)

    }

    public getPlayerByDiscord(discordId: string): PlayerData[] | null {
        try {
            let result = this.getPlayerByDiscordSql.all({ "discordId": discordId });
            return result as PlayerData[];
        } catch (e) {
            console.log(e)
        }
        return null
    }

    public getPlayerByName(name: string): PlayerData[] | null {
        try {
            let result = this.getPlayerByNameSql.all({ "name": (name + "%") });
            return result as PlayerData[];
        } catch (e) {
            console.log(e)
        }
        return null
    }

    public getPlayersByUnion(name: string): PlayerData[] | null {
        try {
            let result = this.getPlayersByUnionSql.all({ "name": (name + "%") });
            return result as PlayerData[];
        } catch (e) {
            console.log(e)
        }
        return null
    }

    public updateDiscordByUserId(discord: string, playerId: number) {
        try {
            this.updateDiscordIdSql.run({ "playerId": playerId, "discordId": discord })
        } catch (e) {
            console.log(e)
        }
    }

    public setPlayer(data: PlayerData) {
        try {
            console.log(data)

            this.insertPlayerSql.run(data);
            this.insertUnionSql.run(data);
            if (data.discordId)
                this.updateDiscordIdSql.run(data);
        } catch (e) {
            console.log(e)
        }
    }
}

type PlayerData = {
    playerId: number;
    unionId: number;
    playerName: string;
    unionName: string;
    discordId?: string | null;
}

