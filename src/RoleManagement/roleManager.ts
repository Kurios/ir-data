

//Word Generator : GET @```https://random-word-api.herokuapp.com/word?number=3&swear=0```


import readline from 'readline'
import fs from 'fs'
import { isDisturbed } from 'node-fetch/node_modules/form-data';
import { Client, Guild, UserApplicationCommandData } from 'discord.js';
import { stringify } from 'querystring';
import { BotSql, PlayerData } from '../botSql';
export class RoleManagement {

    constructor(sql:BotSql){
        //load words list
        let file = fs.createReadStream("words_alpha.txt")
        this.masterWordList = JSON.parse(fs.readFileSync("words.json",{encoding:"utf8",flag:"r"}))
        let reader = readline.createInterface({"input":file})
        this.words = [];
        reader.on('line',(line)=>{this.words.push(line)})
        this.sql = sql;


    }

    triggers:Trigger[] = [];
    words:string[];
    sql:BotSql;
    masterWordList
    createNewTrigger(id:string,guildId:string):Trigger {
        let phrase = ""
        let res = phrase;
        let rand = Math.random();

        let getRandomWord = (array:any[])=>{
            return array[Math.floor(Math.random() * array.length)]
        }

        if(rand > .9){
            // Pokemon Verb(s) Noun
            let one = getRandomWord(this.masterWordList.pokemon)
            let two = getRandomWord(this.masterWordList.verbs)
            let three = getRandomWord(this.masterWordList.nouns)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two}s ${three}`;
        }else if(rand > .8){
            // Noun Verb(s) Pokemon
            let one = getRandomWord(this.masterWordList.nouns)
            let two = getRandomWord(this.masterWordList.verbs)
            let three = getRandomWord(this.masterWordList.pokemon)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two}s ${three}`;
        }else if(rand > .7){
            // Noun Verb(s) Noun
            let one = getRandomWord(this.masterWordList.nouns)
            let two = getRandomWord(this.masterWordList.verbs)
            let three = getRandomWord(this.masterWordList.nouns)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two}s ${three}`;
        }else if(rand > .6){
            // Pokemon Verb(s) Pokemon
            let one = getRandomWord(this.masterWordList.pokemon)
            let two = getRandomWord(this.masterWordList.verbs)
            let three = getRandomWord(this.masterWordList.pokemon)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two}s ${three}`;
        }else if(rand > .5){
            // Adjective Pokemon Verb(s)
            let one = getRandomWord(this.masterWordList.adjectives)
            let two = getRandomWord(this.masterWordList.pokemon)
            let three = getRandomWord(this.masterWordList.verbs)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two} ${three}s`;
        }else if(rand > .4){
            // Adjective Noun Verb(s)
            let one = getRandomWord(this.masterWordList.adjectives)
            let two = getRandomWord(this.masterWordList.nouns)
            let three = getRandomWord(this.masterWordList.verbs)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two} ${three}s`;
        }else if (rand > .3){
            // Adjective Pokemon Verb(s)
            let one = getRandomWord(this.masterWordList.adjectives)
            let two = getRandomWord(this.masterWordList.pokemon)
            let three = getRandomWord(this.masterWordList.verbs)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two}s ${three}`;
        }else if (rand > .2){
            // Adjective Adjective Pokemon
            let one = getRandomWord(this.masterWordList.adjectives)
            let two = getRandomWord(this.masterWordList.adjectives)
            let three = getRandomWord(this.masterWordList.pokemon)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two} ${three}`;  
        }else if (rand > .1){
            // Adjective Adjective Noun
            let one = getRandomWord(this.masterWordList.adjectives)
            let two = getRandomWord(this.masterWordList.adjectives)
            let three = getRandomWord(this.masterWordList.nouns)
            phrase = `${one} ${two} ${three}`
            res = `The ${one} ${two} ${three}`;  
        }else{
            phrase = `${this.words[Math.floor(Math.random()*this.words.length)]} ${this.words[Math.floor(Math.random()*this.words.length)]} ${this.words[Math.floor(Math.random()*this.words.length)]}`
            res = phrase +"? What garbally-gook is this?";
        }
        //grab 3 words;
        if(guildId == "881866819659509792" ){
            if(Math.random() > .5){
                phrase = phrase + " Mumba"
                res = res + " Mumba"
            }else{
                phrase = "Mumba " + phrase
                res = "Mumba " + res
            }
        }
        let trigger = {"phrase":phrase,"discordId":id,"date":new Date(),"guildId":guildId,"responsePhrase":res};
        this.triggers.push(trigger);
        return trigger;
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
        if(message.split(" ").length == 3 || message.split(" ").length == 4){
            //console.log("Is the right amount of words.")
            let trigger = this.checkTrigger(message);
            //console.log("Trigger is "+trigger)
            if(trigger){
                client.guilds.fetch(trigger.guildId).then((guild)=>{
                    //console.log(guild.systemChannelId)
                    guild.systemChannel?.send("Did you know? " + trigger?.responsePhrase + ".\n<@"+trigger?.discordId+"> Thank you " + user.userName + " of " + user.unionName + " you are now verified.")
                    this.findOrGenerateRole(user.unionName,guild).then((role)=>{
                        if(trigger?.discordId && role)
                            guild.members.fetch(trigger?.discordId).then((member)=>{member.roles.add(role.id)})
                    });
                })
                this.sql.updateDiscordByUserId(trigger.discordId,user.userId);
            }
        }
    }


    reportVerifiedUser(user:PlayerData, guild:Guild, client:Client){
        guild.systemChannel?.send("\n<@"+user.discordId+"> Thank you " + user.playerName + " of " + user.unionName + " you are now verified.")
        this.findOrGenerateRole(user.unionName,guild).then((role)=>{
            if(user.discordId && role)
                guild.members.fetch(user.discordId).then((member)=>{member.roles.add(role.id)})
        });
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
    responsePhrase:string,
    date:Date
}

type IGUser = {
    userId: number,
    userName: string,
    unionName:string
}