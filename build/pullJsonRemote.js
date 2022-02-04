"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tail_file_1 = __importDefault(require("@logdna/tail-file"));
const discord_js_1 = require("discord.js");
const vm_1 = __importDefault(require("vm"));
const readline_1 = __importDefault(require("readline"));
const parser_1 = require("./logParser/parser");
const botSql_1 = require("./botSql");
const roleManager_1 = require("./RoleManagement/roleManager");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const builders_1 = require("@discordjs/builders");
const fs_1 = __importDefault(require("fs"));
let lastRead = 0;
const EvoPublic = '938866102837067827';
const VoidUnion = `938935253924479067`;
var token = "";
const EvoGuildID = "881866819659509792";
token = fs_1.default.readFileSync("app_secret", { encoding: 'utf8', flag: 'r' });
//Slash Commands
const commands = [
    new builders_1.SlashCommandBuilder().setName("verify").setDescription("Start or Restart the verification process for your in-game name and Union in Discord").toJSON(),
    new builders_1.SlashCommandBuilder().setName("whois").setDescription("List identified users using following terms. Please select one.")
        .addSubcommand(subcommand => subcommand.setName("user").setDescription("An In Game User").addStringOption(option => option.setName("user").setDescription("The user's in game username")))
        .addSubcommand(subcommand => subcommand.setName("discord").setDescription("A Discord User").addUserOption(option => option.setName("user").setDescription("The discord user")))
        .addSubcommand(subcommand => subcommand.setName("union").setDescription("List the users of a union").addStringOption(option => option.setName("union").setDescription("The Union you want a userlist from"))).toJSON()
];
// Place your client and guild ids here
const clientId = '926639672636092436';
const rest = new rest_1.REST({ version: '9' }).setToken(token);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(v9_1.Routes.applicationCommands(clientId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
})();
//Actual Bot
const sql = new botSql_1.BotSql();
//'%LocalAppData%/lagrange_global_online_branch/log.txt'
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILD_INTEGRATIONS, discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.DIRECT_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MEMBERS] });
const roleManagement = new roleManager_1.RoleManagement(sql);
const parser = new parser_1.Parser(sql, roleManagement);
client.on('ready', () => {
    console.log("listening to " + process.env.localappdata + '\\lagrange_global_online_branch\\log.txt');
    const tail = new tail_file_1.default(process.env.localappdata + '/lagrange_global_online_branch/log.txt', { encoding: 'utf8' });
    tail.on('tail_error', (err) => {
        console.error('TailFile had an error!', err);
    })
        .on('error', (err) => {
        console.error('A TailFile stream error was likely encountered', err);
    })
        .start()
        .catch((err) => {
        console.error('Cannot start.  Does the file exist?', err);
    });
    const linesplit = readline_1.default.createInterface({ input: tail });
    linesplit.on('line', (line) => {
        parser.parseLineToDiscord(line, client);
    });
});
client.on("messageCreate", (message) => {
    //console.log(message)
    switch (message.content.split(" ")[0]) {
        case "!math":
            let context = { "ret": 0 };
            let script = "ret = " + message.content.substring(6).replaceAll("{", "") + ";";
            let s = new vm_1.default.Script(script);
            vm_1.default.createContext(context);
            s.runInContext(context, { timeout: 250 });
            message.reply(context.ret + "");
            console.log(context);
            break;
        case "!whois":
            let ret = sql.getPlayerByName(message.content.substring(7));
            if (ret) {
                let embed = new discord_js_1.MessageEmbed();
                embed.setTitle(message.content.substring(7));
                for (let r of ret) {
                    let body = r.unionName;
                    if (r.discordId)
                        body += " | " + "<@" + r.discordId + ">";
                    embed.addField(r.playerName, body);
                }
                message.reply({ "embeds": [embed] });
            }
            break;
        case "!verify":
            if (message.guild) {
                let response = roleManagement.createNewTrigger(message.author.id, message.guild.id);
                message.reply("Please say `" + response + "` in local chat in game to verify.");
            }
    }
});
client.on("error", (e) => {
    console.log(e);
});
client.on("guildMemberAdd", (member) => {
    let response = roleManagement.createNewTrigger(member.id, member.guild.id);
    member.guild.systemChannel?.send(`Welcome <@${member.id}>, please say \`${response}\` in local chat in game to verify who you are.`);
});
client.on("guildMemberRemove", (member) => {
    let res = sql.getPlayerByDiscord(member.id);
    let e = new discord_js_1.MessageEmbed();
    e.setTitle(member.nickname + " aka " + member.displayName);
    e.addField("Highest Role", member.roles.highest.name);
    if (res)
        for (let r of res) {
            e.addField(r.playerName, r.unionName);
        }
    member.guild.systemChannel?.send({ embeds: [e] });
});
client.on('interactionCreate', (interaction) => {
    if (interaction.isCommand()) {
        console.log(interaction);
        switch (interaction.commandName) {
            case "whois":
                let ret = undefined;
                let user = undefined;
                if (interaction.options.getSubcommand() === 'user') {
                    user = interaction.options.getString("user");
                    if (user && user.length > 2) {
                        ret = sql.getPlayerByName(user);
                    }
                    else {
                        interaction.reply("Please use 3 or more characters to search");
                        return;
                    }
                }
                if (interaction.options.getSubcommand() === 'discord') {
                    user = interaction.options.get("user")?.value;
                    if (user) {
                        ret = sql.getPlayerByDiscord(user);
                    }
                    else {
                        return;
                    }
                }
                if (interaction.options.getSubcommand() === 'union') {
                    user = interaction.options.getString("union");
                    if (user && user.length > 2) {
                        ret = sql.getPlayersByUnion(user);
                    }
                    else {
                        interaction.reply("Please use 3 or more characters to search");
                        return;
                    }
                }
                if (ret) {
                    let embed = new discord_js_1.MessageEmbed();
                    embed.setTitle(user + " search");
                    for (let r of ret) {
                        let body = r.unionName;
                        if (r.discordId)
                            body += " | " + "<@" + r.discordId + ">";
                        embed.addField(r.playerName, body);
                    }
                    interaction.reply({ "embeds": [embed], ephemeral: true });
                }
                break;
            case "verify":
                if (interaction.guildId) {
                    let response = roleManagement.createNewTrigger(interaction.user.id, interaction.guildId);
                    interaction.reply("Please say `" + response + "` in local chat in game to verify.");
                }
                else {
                    interaction.reply("Please use this from inside a discord server");
                }
        }
    }
});
client.login(token);
//# sourceMappingURL=pullJsonRemote.js.map