import { Client, MessageEmbed, Role } from 'discord.js'
import { BotSql } from '../botSql';
import { RoleManagement } from '../RoleManagement/roleManager';
import { TranslationServiceClient } from '@google-cloud/translate';
import * as http from 'http'
//@ts-ignore
import * as  CLD from 'cld'

export class Parser {

    EvoPublic = '938866102837067827';
    //AlliancePublic = `939399514727514112`;
    VoidUnion = `938935253924479067`;
    Sql: BotSql;
    Roles: RoleManagement
    Translate: TranslationServiceClient
    LastRead:Date;

    constructor(sql: BotSql, roles: RoleManagement) {
        this.Sql = sql;
        this.Roles = roles;
        this.Translate = new TranslationServiceClient({ projectId: "struocks", keyFilename: "gcpkey.json" });
        this.LastRead = new Date(0);
    }

    public parseLineToDiscord(line: string, client: Client) {
        //chat Up/Down
        if (line.match(/Call script game\.on_exit\(\)/)) {
            client.channels.fetch(this.EvoPublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*") })
            client.channels.fetch(this.VoidUnion).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*") })
            //client.channels.fetch(this.AlliancePublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*") })
            console.log("*Kuriosly's game has closed*")
        }

        if (line.match(/\[Scene Manager\] Destroy current scene SCENE_LOGIN\./)) {
            client.channels.fetch(this.EvoPublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has started*") })
            client.channels.fetch(this.VoidUnion).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has started*") })
            //client.channels.fetch(this.AlliancePublic).then((channel) => { if (channel && channel.isText()) channel.send("*Kuriosly's game has closed*") })
            console.log("*Kuriosly's game has started*")
        }

        //console.log("input:" + line)
        let payload = (line.substring(26));
        try {
            if (payload.charAt(0) == '[') {
                let j = JSON.parse(payload)
                if (j) {
                    if (j[1] && typeof (j[1]) == 'object' && j[1][2] < 14 && typeof (j[1][3]) == 'number') {
                        console.log(j)
                        let tchannel = []
                        if (j[1][1] == 1) {
                            tchannel = [ this.EvoPublic];
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
                        } else if (j[1] && j[1][2] == 6) {
                            this.parseReenforcementRequests(j, client, tchannel)
                        } else if (j[1] && j[1][2] == 7) {
                            this.parseReenforcementsRecieved(j, client, tchannel)
                        } else if (j[1] && j[1][2] == 9) {
                            this.parseCityMessage(j, client)
                        } else if (j[1] && j[1][2] == 13) {
                            //console.log(JSON.stringify(j))
                            this.parseCustomEmojiMessage(j, client, tchannel)
                        }
                    }
                    if(j[0] == 26){ //send to remote. I think its a union diplo screen.
                                //only once every 5 minutes....
                        try {
                            if ((new Date().getTime() - this.LastRead.getTime()) > 300000) {
                                console.log("transfering union prosp data");
                                this.LastRead = new Date();
                                const options = { hostname:"notthedomainyourlookingfor.com", port:80, path: "/write", method: "POST"}
                                //const options = { hostname: "192.168.1.69", port: 9898, path: "/write", method: "POST" };
                                const request = http.request(options, (response) => { console.log(response); });
                                request.write(JSON.stringify(j));
                                request.end();
                                console.log("finished");
                            }
                        }catch (e){
                            console.log(e)
                        }
                    }
                }
            }
        } catch (e) {
            //console.log(l);
        }
    }

    parseCustomEmojiMessage(j: any, client:Client, channels: string[]){
       //Example
       // [21:17:47.911] M [SCRIPT] [198405,[1653279467,3,13,100137,1602,"Kuriosly",100137,"Void Autocracy",2,1,"6280692370d9a90adcc16736rPQ0xYpD02,494,242,0",[],30022,[5,7,3,104],0]]
        if(typeof(j[1][10]) == 'string'){
            let image = j[1][10].split(',')
            const embed = new MessageEmbed()
            .setDescription(`[*${j[1][7]}*] **${j[1][5]}** `)
            .setImage(`https://lagrange.fp.ps.easebar.com/file/${image[0]}`)
            console.log(`[*${j[1][7]}*] **${j[1][5]}** ` + `https://lagrange.fp.ps.easebar.com/file/${image[0]}`)
            for (let tchannel of channels) {
                client.channels.fetch(tchannel).then((channel)=> {if (channel && channel.isText()) channel.send({embeds: [embed]})})
            }
        }
    }

    parseReenforcementRequests(j: any, client:Client, channels:string[]){ //type 6

        //[22:28:32.800] M [SCRIPT] [199662,[1653283712,3,6,100137,1539,"Buscat",100137,"Void Autocracy",0,0,["Meow",785307],null,30022,[23,3,14,101],0]]
        if (typeof (j[1][10][0] == 'string')) {
            let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
            send += `*requested reenforcements for* ${j[1][10][0]}`//: * ${j[1][10][3]}(${j[1][10][4]}FP) vs ${j[1][10][5]}(${j[1][10][6]}FP)`
            for (let tchannel of channels) {
                client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send) })
            }
            console.log(send);
        }
    }

    parseReenforcementsRecieved(j:any, client:Client, channels:string[]){ //type 7
        //[22:33:39.091] M [SCRIPT] [199734,[1653284019,3,7,100137,2699,"MAXimi11ian",100137,"Void Autocracy",0,0,["MAXimi11ian","Buscat",[5,5]],null,30022,[1,3,8,101],0]]
        //[22:40:39.036] M [SCRIPT] [199822,[1653284439,3,7,100137,1368,"Storm Dervish",100137,"Void Autocracy",0,0,["Storm Dervish","Kuriosly",[3,1,4,2]],null,30022,[3,7,17,105],0]]
            //3: frigate
            //4: destroyer
            //5: cruiser
            let send = ""
            send += `*${j[1][10][1]} recieved reenforcements from* ${j[1][10][0]}: `//: * ${j[1][10][3]}(${j[1][10][4]}FP) vs ${j[1][10][5]}(${j[1][10][6]}FP)`
            for(let i = 0; i<j[1][10][2].length; i+=2){
                switch(j[1][10][2][i]){
                    case 3:
                        send += `Frigate\\*${j[1][10][2][i+1]}`; break;
                    case 4:
                        send += `Destroyer\\*${j[1][10][2][i+1]}`; break;
                    case 5:
                        send += `Cruiser\\*${j[1][10][2][i+1]}`; break;
                    case 6:
                        send += `Battlecruiser\\*${j[1][10][2][i+1]}`; break;
                    case 7:
                        send += `Carrier\\*${j[1][10][2][i+1]}`; break;
                }
                if((i+1)<j[1][10][2].length) send +=", "
            }
            for (let tchannel of channels) {
                client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send) })
            }
            console.log(send);

    }

    parseBattleMessage(j: any, client: Client, channels: string[]) {
        if (j[1][7].length == 0) j[1][7] = " ";
        let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
        send += `*shared a battle*`//: * ${j[1][10][3]}(${j[1][10][4]}FP) vs ${j[1][10][5]}(${j[1][10][6]}FP)`
        for (let tchannel of channels) {
            client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send) })
        }
        console.log(send);
    }

    parseShipMessage(j: any, client: Client, channels: string[]) {
        if (typeof (j[1][10][1]) == 'string' && typeof (j[1][10][2] == 'string')) {
            let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
            send += `*shared a ship*`
            for (let tchannel of channels) {
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
            //client.channels.fetch(this.AlliancePublic).then((channel) => { if (channel && channel.isText()) channel.send({ "embeds": [embed] }) })
            console.log(embed);
        }
    }

    async parseChatMessage(j: any, client: Client, channels: string[]) {
        try {
            this.Sql.setPlayer({ "playerId": Number.parseInt(j[1][4]), "discordId": null, "playerName": j[1][5], "unionId": Number.parseInt(j[1][6]), "unionName": j[1][7] })
            //[messageId:number,[a:number,channel:number,message_type:number,guildChannelID:number,userId:number,userName:string,guildID:number,number,number,Message:string,array,number,UserIcon:array[number,number,number,number]]]
            //console.log(j[1][10])
            //console.log(j[1]);
            if (typeof (j[1][10]) == 'string') {
                //language
                let translation = ""
                let ttext = j[1][10] + "";
                ttext = ttext.replaceAll(/(\{\d+\})/g, "")
                //console.log(ttext)
                if (ttext.length > 0) {
                    try {
                        let x = await CLD.detect(ttext);
                        console.log(x)
                        if (x.languages && x.languages[0]) {
                            if (!(x.languages[0].code == "en")) {
                                let request = {
                                    //parent: "projects/struocks",
                                    contents: [ttext],
                                    targetLanguageCode: 'en-US',
                                    mimeType: 'text/plain',
                                    parent: "projects/struocks"
                                    //sourceLanguageCode
                                }
                                let [gtranslate] = await this.Translate.translateText(request)
                                //console.log(gtranslate)
                                if (gtranslate.translations && gtranslate.translations[0].detectedLanguageCode!= "en"){
                                    translation = gtranslate.translations[0].translatedText + " | " + gtranslate.translations[0].detectedLanguageCode?.toLocaleUpperCase();
                                }
                            }
                        }

                    }
                    catch (e) {
                        console.log(e)
                        try {
                            let request = {
                                contents: [ttext],
                                targetLanguageCode: 'en-US',
                                mimeType: 'text/plain',
                                parent: "projects/struocks"
                                //parent
                                //sourceLanguageCode
                            }
                            let [gtranslate] = await this.Translate.translateText(request)
                            //console.log(gtranslate)
                            if (gtranslate.translations && gtranslate.translations[0].detectedLanguageCode!= "en"){
                                translation = gtranslate.translations[0].translatedText + " | " + gtranslate.translations[0].detectedLanguageCode?.toLocaleUpperCase();
                            }
                            } catch (e) {
                            console.log(e)
                        }
                    }
                    console.log(translation);
                }
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
                j[1][10] = j[1][10].replaceAll("{26}", "<:nosebleed:941820117212352582>")
                j[1][10] = j[1][10].replaceAll("{28}", ":relaxed:")
                j[1][10] = j[1][10].replaceAll("{39}", ":grin:")
                j[1][10] = j[1][10].replaceAll("{42}", "<:confusedComputer:941834111209861151>")

                j[1][10] = j[1][10].replaceAll("{50}", ":love_you_gesture:")
                j[1][10] = j[1][10].replaceAll("{66}", ":thumbsup:")
                j[1][10] = j[1][10].replaceAll("{66}", ":handshake:")
                j[1][10] = j[1][10].replaceAll("{72}", ":bulb:")

                j[1][10] = j[1][10].replaceAll("{111}", ":kissing:")
                j[1][10] = j[1][10].replaceAll("{133}", ":watermelon:")
                
                j[1][10] = j[1][10].replaceAll("{123}", ":ok:")
                j[1][10] = j[1][10].replaceAll("{125}", ":cry:")
                j[1][10] = j[1][10].replaceAll("{129}", ":cry:")


                j[1][10] = j[1][10].replaceAll("{128}", ":boxing_glove:")
                j[1][10] = j[1][10].replaceAll("{140}", ":ghost:")
                j[1][10] = j[1][10].replaceAll("#r", "\n");

                //fix empty union
                if (j[1][7].length == 0) j[1][7] = " ";

                //if @ find members
                let x = /[@](\w+)/g.exec(j[1][10]);

                if (x && x[1] && x[0]) {
                    console.log("found " + x[1]);
                    for (let tchannel of channels) {
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
                    for (let tchannel of channels) {
                        client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(`[*${j[1][7]}*] **${j[1][5]}** ${j[1][10]} ${translation}`) })
                    }
                    console.log(`${j[1][5]}(${j[1][7]}): ${j[1][10]}`)
                    if(translation.length > 0)
                    translation = `| *${translation}*`
                    this.Roles.verifyUser(j[1][10], { unionName: j[1][7], userId: j[1][4], userName: j[1][5] }, client);
                }
            }
        } catch (e) {
            //do nothing
        }
    }
}