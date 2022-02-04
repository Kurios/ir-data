

//Word Generator : GET @```https://random-word-api.herokuapp.com/word?number=3&swear=0```


import readline from 'readline'
import fs from 'fs'
import { isDisturbed } from 'node-fetch/node_modules/form-data';
import { Client, Guild, UserApplicationCommandData } from 'discord.js';
import { stringify } from 'querystring';
import { BotSql } from '../botSql';
export class RoleManagement {

    constructor(sql:BotSql){
        //load words list
        let file = fs.createReadStream("words_alpha.txt")
        let reader = readline.createInterface({"input":file})
        this.words = [];
        reader.on('line',(line)=>{this.words.push(line)})
        this.sql = sql;


    }

    triggers:Trigger[] = [];
    words:string[];
    sql:BotSql;

    createNewTrigger(id:string,guildId:string):string {
        //grab 3 words;
        let phrase = `${this.words[Math.floor(Math.random()*this.words.length)]} ${this.words[Math.floor(Math.random()*this.words.length)]} ${this.words[Math.floor(Math.random()*this.words.length)]}`

        this.triggers.push({"phrase":phrase,"discordId":id,"date":new Date(),"guildId":guildId});
        return phrase;
    }

    checkTrigger(phrase:string){
        //console.log(this.triggers);
        let index = this.triggers.findIndex((x)=>{return phrase == x.phrase});
        if (index == -1) return undefined;
        let ret = this.triggers[index];
        this.triggers = this.triggers.filter((x)=>{return phrase != x.phrase})
        return ret;
    }

    verifyUser(message:string, user:IGUser, client:Client){
        //console.log("Verifying " + message)
        if(message.split(" ").length == 3){
            //console.log("Is the right amount of words.")
            let trigger = this.checkTrigger(message);
            //console.log("Trigger is "+trigger)
            if(trigger){
                client.guilds.fetch(trigger.guildId).then((guild)=>{
                    //console.log(guild.systemChannelId)
                    guild.systemChannel?.send("<@"+trigger?.discordId+"> Thank you " + user.userName + " of " + user.unionName + " you are now verified.")
                    this.findOrGenerateRole(user.unionName,guild).then((role)=>{
                        if(trigger?.discordId && role)
                            guild.members.fetch(trigger?.discordId).then((member)=>{member.roles.add(role.id)})
                    });
                })
                this.sql.updateDiscordByUserId(trigger.discordId,user.userId);
            }
        }
    }

    async findOrGenerateRole(unionName:string, guild:Guild){
        let roles = await guild.roles.fetch()
        if(roles){
            let role = roles.find((x)=>{
                return x.name == unionName
            })
            if(role) return role;
            role = await guild.roles.create({name: unionName, mentionable:true, hoist:true})
            return role
        }
    }



}

type Trigger = {
    phrase:string,
    discordId:string,
    guildId:string,
    date:Date
}

type IGUser = {
    userId: number,
    userName: string,
    unionName:string
}