import { Client, MessageEmbed, Role } from 'discord.js'
import { join } from 'path/win32';
import { stringify } from 'querystring';
import { BotSql } from '../botSql';
import { RoleManagement } from '../RoleManagement/roleManager';


export class Parser {

    EvoPublic = '938866102837067827';
    AlliancePublic = `939399514727514112`;
    VoidUnion = `938935253924479067`;
    Sql : BotSql;
    Roles: RoleManagement


    constructor(sql:BotSql, roles:RoleManagement){
        this.Sql = sql;
        this.Roles = roles;
    }

    public parseLineToDiscord(line: string, client: Client) {
        //chat Up/Down
        if(line.match(/Call script game\.on_exit\(\)/)){
            client.channels.fetch(this.EvoPublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*")})
            client.channels.fetch(this.VoidUnion).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*")})
            client.channels.fetch(this.AlliancePublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*")})
            console.log("*Kuriosly's game has closed*")
        }

        if(line.match(/\[Scene Manager\] Destroy current scene SCENE_LOGIN\./)){
            client.channels.fetch(this.EvoPublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has started*")})
            client.channels.fetch(this.VoidUnion).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has started*")})
            client.channels.fetch(this.AlliancePublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*")})
            console.log("*Kuriosly's game has started*")
        }

        //console.log("input:" + line)
        let payload = (line.substring(26));
        try {
            if (payload.charAt(0) == '[') {
                let j = JSON.parse(payload)
                if (j) {
                        if(j[1] && typeof(j[1])=='object' && j[1][2] < 10 && typeof (j[1][3]) == 'number'){
                        //console.log(j)
                        let tchannel = []
                        if (j[1][1] == 1) {
                            tchannel = [this.AlliancePublic,this.EvoPublic];
                        } else if (j[1][1] == 3) {
                            tchannel = [this.VoidUnion];
                        } else {
                            return;
                        }
                        if (j[1] && j[1][2] == 0) {
                            this.parseChatMessage(j, client, tchannel)
                        } else if (j[1] && j[1][2] == 3) {
                            this.parseBattleMessage(j, client, tchannel)

                        } else if (j[1] && j[1][2] == 4) {
                            this.parseShipMessage(j, client, tchannel)
                        } else if (j[1] && j[1][2] == 9) {
                            this.parseCityMessage(j, client)
                        }
                    }
                }
            }
        } catch (e) {
            //console.log(l);
        }
    }

    parseBattleMessage(j: any, client: Client, channels: string[]) {
        if (j[1][7].length == 0) j[1][7] = " ";
        let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
        send += `*shared a battle*`//: * ${j[1][10][3]}(${j[1][10][4]}FP) vs ${j[1][10][5]}(${j[1][10][6]}FP)`
        for(let tchannel of channels){
            client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send) })
        }
        console.log(send);
    }

    parseShipMessage(j: any, client: Client, channels: string[]) {
        if (typeof (j[1][10][1]) == 'string' && typeof (j[1][10][2] == 'string')) {
            let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
            send += `*shared a ship*`
            for(let tchannel of channels){
                client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send) })
            }
            console.log(send);
        }
    }

    parseCityMessage(j: any, client: Client) {
            //is it a city?
            // [739503,[1643927237,1,9,1,0,"",0,"",0,0,["EVO","Alpha Omega","{[B_SP_]}cfg_npc_name#name#1009{[E_SP_]}",2,113546644],null,30012,[0,0,0,0]]]
            // [20:25:27.797] M [SCRIPT] [741550,[1643948727,1,9,1,0,"",0,"",0,0,["Void Autocracy","Alpha Omega","{[B_SP_]}cfg_npc_name#name#437{[E_SP_]}",2,112642774],null,30012,[0,0,0,0]]]
            if (typeof (j[1][10][1]) == 'string' && typeof (j[1][10][2] == 'string')) {
                let embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle(`**${j[1][10][0]}** has occupied **${j[1][10][1]}**'s lvl${j[1][10][3]} city ${j[1][10][2]}'`)
                client.channels.fetch(this.EvoPublic).then((channel) => { if (channel && channel.isText()) channel.send({ "embeds": [embed] }) })
                client.channels.fetch(this.VoidUnion).then((channel) => { if (channel && channel.isText()) channel.send({ "embeds": [embed] }) })
                client.channels.fetch(this.AlliancePublic).then((channel) => { if (channel && channel.isText()) channel.send({ "embeds": [embed] }) })
                console.log(embed);
            }
    }

    parseChatMessage(j: any, client: Client, channels: string[]) {
        try {
            this.Sql.setPlayer({"playerId":Number.parseInt(j[1][4]),"discordId":null,"playerName":j[1][5],"unionId":Number.parseInt(j[1][6]),"unionName":j[1][7]})
            //[messageId:number,[a:number,channel:number,message_type:number,guildChannelID:number,userId:number,userName:string,guildID:number,number,number,Message:string,array,number,UserIcon:array[number,number,number,number]]]
            //console.log(j[1][10])
            //console.log(j[1]);
            if (typeof (j[1][10]) == 'string') {
                //fix popular emoji
                j[1][10] = j[1][10].replaceAll("{1}", ":slight_smile:")
                j[1][10] = j[1][10].replaceAll("{2}", ":grinning:")
                j[1][10] = j[1][10].replaceAll("{4}", ":astonished:")
                j[1][10] = j[1][10].replaceAll("{6}", ":sunglasses:")
                j[1][10] = j[1][10].replaceAll("{7}", ":triumph:")
                j[1][10] = j[1][10].replaceAll("{8}", ":confounded:")
                j[1][10] = j[1][10].replaceAll("{9}", ":fearful:")
                j[1][10] = j[1][10].replaceAll("{10}", ":slight_frown:")
                j[1][10] = j[1][10].replaceAll("{12}", ":cold_sweat:")
                j[1][10] = j[1][10].replaceAll("{14}", ":grin:")
                j[1][10] = j[1][10].replaceAll("{16}", ":heart_eyes:")

                j[1][10] = j[1][10].replaceAll("{17}", ":sweat:")
                j[1][10] = j[1][10].replaceAll("{18}", ":grinning:")
                j[1][10] = j[1][10].replaceAll("{19}", ":sleepy:")
                j[1][10] = j[1][10].replaceAll("{20}", ":face_vomiting:")
                j[1][10] = j[1][10].replaceAll("{21}", ":face_with_raised_eyebrow:")
                j[1][10] = j[1][10].replaceAll("{22}", ":shushing_face:")
                j[1][10] = j[1][10].replaceAll("{23}", ":head_bandage:")
                j[1][10] = j[1][10].replaceAll("{24}", ":no_mouth:")
                j[1][10] = j[1][10].replaceAll("{26}", ":smiling_face_with_3_hearts:")
                j[1][10] = j[1][10].replaceAll("{28}", ":relaxed:")
                j[1][10] = j[1][10].replaceAll("{39}", ":grin:")

                j[1][10] = j[1][10].replaceAll("{111}", ":kissing:")
                j[1][10] = j[1][10].replaceAll("{133}", ":watermelon:")
                j[1][10] = j[1][10].replaceAll("{129}", ":cry:")

                j[1][10] = j[1][10].replaceAll("{123}", ":ok:")

                j[1][10] = j[1][10].replaceAll("{128}", ":boxing_glove:")
                j[1][10] = j[1][10].replaceAll("{140}", ":ghost:")


                //fix empty union
                if (j[1][7].length == 0) j[1][7] = " ";

                //if @ find members
                let x = /[@](\w+)/g.exec(j[1][10]);

                if (x && x[1] && x[0]) {
                    console.log("found " + x[1]);
                    for(let tchannel of channels){
                        client.channels.fetch(tchannel).then((channel) => {
                            if (channel && channel.isText() && (channel.type == "GUILD_TEXT")) {
                                if (x) {
                                    let target = channel.guild.members.search({ "query": x[1] }).then((user) => {
                                        console.log(user)
                                        if (user) {
                                            let key = user.firstKey();
                                            if (key && x)
                                                j[1][10] = j[1][10].replace(x[0], `<@${user.get(key)?.id}>`)
                                            channel.send(`[*${j[1][7]}*] **${j[1][5]}** ${j[1][10]}`)
                                        }
                                    })
                                }
                            }
                        })
                    }
                    console.log(`${j[1][5]}(${j[1][7]}): ${j[1][10]}`)
                }  
                else {
                    //discord it
                    for(let tchannel of channels){
                        client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(`[*${j[1][7]}*] **${j[1][5]}** ${j[1][10]}`) })
                    }
                    console.log(`${j[1][5]}(${j[1][7]}): ${j[1][10]}`)
                    this.Roles.verifyUser(j[1][10],{unionName:j[1][7],userId:j[1][4],userName:j[1][5]},client);
                }
            }
        }catch(e){
            //do nothing
        }
    }
}