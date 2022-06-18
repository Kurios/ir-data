import { Client, MessageEmbed, Role } from 'discord.js'
import { BotSql } from '../botSql';
import { RoleManagement } from '../RoleManagement/roleManager';
import { TranslationServiceClient } from '@google-cloud/translate';
import { Ships } from './ships';
import { Battle } from './battleParser';
import * as http from 'http'
//@ts-ignore
import * as  CLD from 'cld'

export class Parser {

    EvoPublic = '938866102837067827';
    //AlliancePublic = `939399514727514112`;
    VoidUnion = `987471073090080850`;
    Sql: BotSql;
    Roles: RoleManagement
    Translate: TranslationServiceClient
    LastRead: Date;
    messageClass = 0;


    //AND OF COURSE THE GAME IMPLEMENTED A REPLY SYSTEM... WE NOW NEED TO KEEP A LOG.
    /*  number: IL message id
        string: Discord message snowflake.
    */
    MessageIdLog = new Map<number, string>();

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
        //set message class (if its that line)
        const messageClassRegex = /Msg Receive: cmd_id:\[(\d+)\]/;
        const match = messageClassRegex.exec(line)
        if (match) {
            this.messageClass = Number.parseInt(match[1])
            return
        }
        //console.log("input:" + line)
        let payload = (line.substring(26));
        try {
            if (payload.charAt(0) == '[') {
                let j = JSON.parse(payload)
                switch (this.messageClass) {
                    case 120: // unknown ie: [785138,55760,756462,10400,785170,10400,785166,55760,785155,55760]
                        break;
                    case 205: // Unknown ie: [[785170,147416905,100008000],0]
                        break;
                    case 212: // Window Position? [6126,700000,700000,57917,250000,250000]
                        break;
                    case 352: // Union mail?
                    case 502: // Diplo Screen
                        if (j) {
                            if (this.messageClass == 502 && j[0] > 26) { //send to remote. I think its a union diplo screen.
                                //only once every 5 minutes....
                                try {
                                    if ((new Date().getTime() - this.LastRead.getTime()) > 300000) {
                                        console.log("transfering union prosp data");
                                        this.LastRead = new Date();
                                        const options = { hostname: "notthedomainyourlookingfor.com", port: 80, path: "/write", method: "POST" }
                                        //const options = { hostname: "192.168.1.69", port: 9898, path: "/write", method: "POST" };
                                        const request = http.request(options, (response) => { console.log(response); });
                                        request.write(JSON.stringify(j));
                                        request.end();
                                        console.log("finished");
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            }
                        }
                        break;
                    case 505: //My Union Info
                        break;
                    case 515:
                        //[09:52:49.360] M [SCRIPT] [[[1020,"老人家",240,0,171455995,0,75,502,0,132],[1033,"Nianey",570,0,168534755,0,0,1509,0,0],[1039,"Falshea",384,0,152056505,0,218,1818,0,0],[1108,"Kirkes Run",563,0,154356435,0,967,1385,0,0],[1112,"time lover",564,0,147476790,0,446,1415,0,0],[1208,"SyndicateX",614,0,166524946,0,1412,2206,0,134],[1210,"Waffles",898,0,167355415,0,4730,2603,0,135],[1245,"zaiha",310,0,169044205,0,455,555,0,0],[1250,"Not Smart Inc",89,0,167235565,0,0,121,0,0],[1274,"Hunter98",217,0,168234825,0,253,722,0,0],[1280,"笨蛋國王吉",212,0,160646395,0,0,767,0,131],[1309,"Dunois",9,0,0,0,0,26,1,133],[1342,"生野菜",9,0,167764495,0,0,26,0,132],[1361,"Kuzuryu",529,0,153456385,0,1850,1191,0,0],[1368,"Storm Dervish",819,0,146556915,0,2240,2307,0,0],[1369,"CorpZerosss",806,0,167046506,0,2603,2311,0,0],[1410,"resurrection",560,0,154356445,0,1120,1356,0,0],[1424,"Brucie0",634,0,158356522,0,2172,1696,0,0],[1439,"Impartial",848,0,166156515,0,7936,2033,0,134],[1452,"MEXOZ",340,0,163046565,0,94,1174,0,0],[1473,"ゆうと142",297,0,172643955,0,146,578,0,132],[1478,"Reminiscence",28,0,172044113,0,0,116,0,0],[1492,"EighthOrchid",756,0,167544464,0,4939,2300,0,0],[1505,"MetaCritical",645,0,171235335,0,7898,1966,0,0],[1539,"Buscat",652,0,146656885,1,4763,2163,0,135],[1555,"Abroley131",110,0,169733825,0,0,158,0,0],[1557,"razor shipping",110,0,168134523,0,0,255,0,0],[1573,"西行寺",457,0,151056275,0,2473,1350,0,132],[1602,"Kuriosly",695,0,147206903,2,2085,1716,0,135],[1605,"Hopevillle00",150,0,169044435,0,66,289,0,0],[1739,"CELL",120,0,168324626,0,105,263,0,0],[2449,"Blackknights13",70,0,169753733,0,0,151,0,0],[2557,"Frenchtoast",801,0,168355525,0,3225,2659,0,0],[2560,"지크하르트",585,0,171944004,0,5592,1283,0,0],[2578,"Lightning",148,0,168035818,0,25,356,0,0],[2595,"FlamingDingo",573,0,164155875,0,771,1249,0,0],[2601,"Alaska",299,0,147556905,0,347,1309,0,0],[2610,"Jerboa",832,0,171864842,0,4840,2260,0,0],[2643,"Sol Venture",625,0,162036114,0,320,1247,0,0],[2667,"Alaskasdemons",488,0,147456915,0,5601,2079,0,0],[2669,"O1260",688,0,167255815,0,1517,2115,0,0],[2672,"Отряд13",723,0,174655235,0,6721,2105,0,0],[2680,"Remnant",567,0,167536272,0,843,1460,0,0],[2683,"요플레짱",835,0,166455695,0,4635,2193,0,0],[2694,"Curlyw0n",259,0,164845335,0,277,740,0,0],[2699,"MAXimi11ian",689,0,147756845,3,1947,1490,0,0],[2710,"Jormungandr",612,0,169745837,0,2651,1768,0,0],[2714,"FiendOfFamily",679,0,170235585,0,4392,1557,0,0],[2715,"Sovereign Sword",554,0,164945936,0,242,1153,0,0],[2717,"BearMinimum",584,0,172634204,0,4586,1320,0,0],[2720,"Voyager22",636,0,167355785,0,1872,1759,0,0],[2760,"AoiFlight",520,0,172355525,0,0,1557,0,0],[2777,"Astra Militarum",268,0,147256705,0,741,923,0,0],[2778,"Starblazers",653,0,147656855,0,1944,1882,0,0],[2787,"vallecana",471,0,159525973,0,1550,1831,0,0],[2792,"Thantos Axis",630,0,172305788,0,6138,1940,0,0],[2793,"Sovereign Wall",553,0,168394951,0,2372,1500,0,0],[2806,"고래밥",679,0,145656695,0,3854,2247,0,0],[2822,"fstevenm",315,0,160436455,0,158,1142,0,0],[2842,"Hexa",566,0,167625502,0,303,2363,0,0],[2847,"PacianoOo",357,0,167635656,0,392,1746,0,0],[2906,"Xanu",620,0,170935893,0,146,1336,0,0],[3002,"Spaqwara",234,0,145856885,0,303,959,0,0],[3301,"kingsdog",842,0,149277554,0,14400,2585,0,0],[3402,"Trans Girell",720,0,163345974,0,1109,2438,0,0],[3432,"Gelnix",718,0,171345795,0,861,2539,0,0],[3435,"SCEBAI",690,0,176656195,0,2792,2407,0,0],[3647,"Freelance117",432,0,167026412,0,343,1399,0,0],[3767,"Lion share",404,0,172654515,0,460,1306,0,0],[4365,"{[B_SP_]}Locale#mpn#0{[B_SP_]}629418{[E_SP_]}{[E_SP_]}",267,0,167255044,0,10,784,0,0],[4531,"Enceladus",330,0,146656895,0,371,696,0,0],[4556,"Taiga Tail",718,0,172834514,0,3850,2194,0,135],[4666,"Shepherd Gang",338,0,161446015,0,381,664,0,0],[4741,"Rath",499,0,170945315,0,77,1417,0,0],[4761,"L3agu3 Zer0",672,0,166256234,0,1332,1630,0,134],[4909,"Catbus",678,0,171475594,3,3956,2233,0,135],[5095,"Manespace",726,0,168045626,3,2564,1910,0,0],[5188,"Linked",732,0,157756415,0,523,2081,0,132],[5191,"AMORPHYSua",684,0,167884063,0,1215,1978,0,0],[5232,"Veldt",492,0,146056905,0,293,1049,0,0],[5352,"Hanu",656,0,165335033,0,1752,1746,0,0],[5411,"Slopity Topity",70,0,174744267,0,20,86,0,135],[5412,"Axin",346,0,146056895,0,491,940,0,0],[5493,"Tater Tots",677,0,147556775,0,3576,2271,0,135],[5504,"valquiria",635,0,164055585,0,1527,2491,0,0],[5510,"HopeSY",658,0,161956155,0,5977,2266,0,0],[5515,"Fox McCloud狐",725,0,153256395,0,2349,2130,0,0],[5522,"マジペン5",79,0,170645444,0,35,232,0,132],[5537,"Senbonzakura",582,0,147276710,3,9004,1818,0,0],[5562,"hopeville",540,0,173234285,0,6229,1115,0,0],[5577,"MADInsaneInc",9,0,167854544,0,0,26,0,0],[5691,"time guardian",529,0,147466802,0,726,1438,0,0],[5700,"Blaqxis",660,0,146026916,3,6169,2021,0,0]],[{"create_time":1645587878,"group_id":131,"group_index":5,"manager_id":0,"manager_role_id":"","name":"中文区","union_id":100137},{"create_time":1645691019,"group_id":132,"group_index":6,"manager_id":0,"manager_role_id":"","name":"スライム","union_id":100137},{"create_time":1645819597,"group_id":133,"group_index":7,"manager_id":0,"manager_role_id":"","name":"mail","union_id":100137},{"create_time":1646349781,"group_id":134,"group_index":9,"manager_id":0,"manager_role_id":"","name":"AO","union_id":100137},{"create_time":1647120778,"group_id":135,"group_index":10,"manager_id":0,"manager_role_id":"","name":"SpecWaffle","union_id":100137}]]
                        // Union member list.
                        //format:
                        /*
                        [
                            [0]: [ //player list
                                [0] : id
                                [1] : name
                                [2] : ??
                                [3] : ??
                                [4] : ?? (Position I think)
                                [5] : Officer (0: member, 1: leader, 2: 2ic, 3: officer)
                                [6] : activeness
                                [7] : prosperity
                                [8] : ??
                                [9] : assigned group
                            ] ... []
                            [1] : {create_time, group_id, group_index, manager_id, manager_role_id, name, union_id} // group chat channel definitions
                        ]
                        */
                        break;
                    case 822: // OLD CHAT [0]: ? [1]: Old chat local [2]: ? [3]: Old Chat Union [3]
                        break;
                    case 801: // No idea
                        break;
                    case 802: // who am i? Does this only show up on login?
                        //[1602,0,[1,100137,"Void Autocracy",2,1602,"20976000081","Kuriosly#6429440",5,7,3,104]]
                        break;

                    case 2001: //Chat Message
                        if (j) {
                            if (j[1] && typeof (j[1]) == 'object' && j[1][2] < 14 && typeof (j[1][3]) == 'number') {
                                console.log(j)
                                let tchannel = []
                                if (j[1][1] == 1) {
                                    tchannel = [this.EvoPublic];
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
                                } else if (j[1] && j[1][2] == 5) {
                                    this.parseScoringMessage(j, client, tchannel)
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
                        }
                        break;
                    case 2007: //unknown, zero log data
                        break;
                    case 20003: // prelogin. Its long.
                    case 20010: // news. 
                    case 90005: // [23:27:46.033] M [SCRIPT] [[2,"Tb_team",{"arrive_target_time":0,"pos":147156903,"passed_count":0,"path_id":-1,"end_time":1653288639,"begin_time":1653287265,"team_id":393132,"state":8,"pos_coordinate":180000000,"move_path":""}],[2,"Tb_ship",{"ship_id_u":1786948,"last_refresh_enhance_time":1653287265}]]
                        // some sort of pathfinding data...
                        break;
                    default:
                        console.log(`${this.messageClass} : ${JSON.stringify(j)}`)
                }
            }
        } catch (e) {
            //console.log(l);
        }
    }

    parseCustomEmojiMessage(j: any, client: Client, channels: string[]) {
        //Example
        // [21:17:47.911] M [SCRIPT] [198405,[1653279467,3,13,100137,1602,"Kuriosly",100137,"Void Autocracy",2,1,"6280692370d9a90adcc16736rPQ0xYpD02,494,242,0",[],30022,[5,7,3,104],0]]
        if (typeof (j[1][10]) == 'string') {
            let image = j[1][10].split(',')
            const embed = new MessageEmbed()
                .setDescription(`[*${j[1][7]}*] **${j[1][5]}** `)
                .setImage(`https://lagrange.fp.ps.easebar.com/file/${image[0]}`)
            console.log(`[*${j[1][7]}*] **${j[1][5]}** ` + `https://lagrange.fp.ps.easebar.com/file/${image[0]}`)
            for (let tchannel of channels) {
                client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send({ embeds: [embed] }).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
            }
        }
    }

    parseReenforcementRequests(j: any, client: Client, channels: string[]) { //type 6

        //[22:28:32.800] M [SCRIPT] [199662,[1653283712,3,6,100137,1539,"Buscat",100137,"Void Autocracy",0,0,["Meow",785307],null,30022,[23,3,14,101],0]]
        if (typeof (j[1][10][0] == 'string')) {
            let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
            send += `*requested reenforcements for* ${j[1][10][0]}`//: * ${j[1][10][3]}(${j[1][10][4]}FP) vs ${j[1][10][5]}(${j[1][10][6]}FP)`
            for (let tchannel of channels) {
                client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
            }
            console.log(send);
        }
    }

    parseScoringMessage(j:any, client:Client, channels: string[]) {
        //[658429,[1655510037,3,5,100137,0,"",100137,"Void Autocracy",0,0,[100137,100137,1655510037,13,"{@#}[\"Starblazers\",5]"],null,30022,[0,0,0,0],0,""],[],0]
        let scoreline = /(\[.+\])/.exec(j[1][10][4])
        if(scoreline && scoreline[1]){
            let parsed = JSON.parse(scoreline[1])
            let send = `[*${j[1][7]}*] **${parsed[0]}**\n *scored ${parsed[1]} points`
            for (let tchannel of channels) {
                client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
            }
            console.log(send);
        }
    }
    
    parseReenforcementsRecieved(j: any, client: Client, channels: string[]) { //type 7
        //[22:33:39.091] M [SCRIPT] [199734,[1653284019,3,7,100137,2699,"MAXimi11ian",100137,"Void Autocracy",0,0,["MAXimi11ian","Buscat",[5,5]],null,30022,[1,3,8,101],0]]
        //[22:40:39.036] M [SCRIPT] [199822,[1653284439,3,7,100137,1368,"Storm Dervish",100137,"Void Autocracy",0,0,["Storm Dervish","Kuriosly",[3,1,4,2]],null,30022,[3,7,17,105],0]]
        //3: frigate
        //4: destroyer
        //5: cruiser
        let send = ""
        send += `*${j[1][10][1]} recieved reenforcements from* ${j[1][10][0]}: `//: * ${j[1][10][3]}(${j[1][10][4]}FP) vs ${j[1][10][5]}(${j[1][10][6]}FP)`
        for (let i = 0; i < j[1][10][2].length; i += 2) {
            switch (j[1][10][2][i]) {
                case 3:
                    send += `Frigate\\*${j[1][10][2][i + 1]}`; break;
                case 4:
                    send += `Destroyer\\*${j[1][10][2][i + 1]}`; break;
                case 5:
                    send += `Cruiser\\*${j[1][10][2][i + 1]}`; break;
                case 6:
                    send += `Battlecruiser\\*${j[1][10][2][i + 1]}`; break;
                case 7:
                    send += `Unknowns\\*${j[1][10][2][i + 1]}`; break;
                case 8:
                    send += `Carrier\\*${j[1][10][2][i + 1]}`; break;
            }
            if ((i + 1) < j[1][10][2].length) send += ", "
        }
        for (let tchannel of channels) {
            client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
        }
        console.log(send);

    }

    parseBattleMessage(j: any, client: Client, channels: string[]) {
        if (j[1][7].length == 0) j[1][7] = " ";
        //let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
        //send += `*shared a battle*`//: * ${j[1][10][3]}(${j[1][10][4]}FP) vs ${j[1][10][5]}(${j[1][10][6]}FP)`
        //[658560,[1655511335,3,3,100137,1602,"Kuriosly",100137,"Void Autocracy",1,1,[750257,"John Miller",1,"Hi",78,"{[B_SP_]}cfg_world_item#name#6{[E_SP_]}",300,0,6,0,1,19,3178,19,"",1,1602],[],30022,[5,7,3,104],0,""],[],0]
        //let attacker = 
        let send = {embeds: [Battle.makeEmbed(`[*${j[1][7]}*] **${j[1][5]}**`,j[1][10])]}
        for (let tchannel of channels) {
            client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
        }
        console.log(send);
    }

    //[658355,
    //[1655509337,3,4,100137,1602,"Kuriosly",100137,"Void Autocracy",1,1,
    //[37,"5030104,1,2201,4,2,2202,4;5030105,4,1203,5,6,1301,5,3,1209,5,5,1205,5;5030103,1,103,1,5,204,1,4,203,1,3,305,1;5030102,5,201,1,3,301,1,4,302,1,2,102,1;5030101,8,404,5,1,107,5,4,304,5,3,303,2;",
    //"101,15031;202,15032;303,15033;404,55031;505,39993;506,39005;607,59982;608,59985;709,65031;810,79993;",50301,"5030108,5030104,5030105,5030106,5030107,5030101,5030102,5030103",0,"101,15;303,8;",105002,"184,2,",0,0,0,""],
    //[],30022,[5,7,3,104],0,"Oh GOD NEW FEATURES"],[],0]

    parseShipMessage(j: any, client: Client, channels: string[]) {
        if (typeof (j[1][10][1]) == 'string' && typeof (j[1][10][2] == 'string')) {
            let send = `[*${j[1][7]}*] **${j[1][5]}**\n `
            send += `*shared a ${Ships.localizeShip(j[1][10][0])}*`
            if(j[1][15].length > 0){
                send += " : " + j[1][15]
            }
            for (let tchannel of channels) {
                client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(send).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
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
            client.channels.fetch(this.EvoPublic).then((channel) => { if (channel && channel.isText()) channel.send({ "embeds": [embed] }).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
            client.channels.fetch(this.VoidUnion).then((channel) => { if (channel && channel.isText()) channel.send({ "embeds": [embed] }).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
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
                                if (gtranslate.translations && gtranslate.translations[0].detectedLanguageCode != "en") {
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
                            if (gtranslate.translations && gtranslate.translations[0].detectedLanguageCode != "en") {
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
                j[1][10] = j[1][10].replaceAll("##", "#");

                //fix empty union
                if (j[1][7].length == 0) j[1][7] = " ";

                //if @ find members
                let x = /[@](\w+)/g.exec(j[1][10]);

                //check for known message reply
                let reply: (undefined | string) = undefined;
                if (j[2]) {
                    //this is a reply
                    reply = this.MessageIdLog.get(j[2][1])
                }

                console.log(x)
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
                                            if (reply) { // if this is a reply
                                                channel.messages.fetch(reply).then((msg) => { msg.reply(`[*${j[1][7]}*] **${j[1][5]}** ${j[1][10]}`).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
                                            } else {
                                                channel.send(`[*${j[1][7]}*] **${j[1][5]}** ${j[1][10]}`).then((msg) => { this.MessageIdLog.set(j[0], msg.id) })
                                            }
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
                        if (reply && typeof (reply) == 'string') { // if this is a reply
                            client.channels.fetch(tchannel).then((channel) => {
                                if (channel && channel.isText() && typeof (reply) == 'string')
                                    channel.messages.fetch(reply).then((msg) => { msg.reply(`[*${j[1][7]}*] **${j[1][5]}** ${j[1][10]}`).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
                            })
                        } else {
                            client.channels.fetch(tchannel).then((channel) => { if (channel && channel.isText()) channel.send(`[*${j[1][7]}*] **${j[1][5]}** ${j[1][10]} ${translation}`).then((msg) => { this.MessageIdLog.set(j[0], msg.id) }) })
                        }
                        console.log(`${j[1][5]}(${j[1][7]}): ${j[1][10]}`)
                        if (translation.length > 0)
                            translation = `| *${translation}*`
                        this.Roles.verifyUser(j[1][10], { unionName: j[1][7], userId: j[1][4], userName: j[1][5] }, client);
                    }
                }
            }
        } catch (e) {
            //do nothing
        }
    }
}