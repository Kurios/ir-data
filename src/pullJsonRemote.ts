import TailFile from '@logdna/tail-file'
import http from 'http'

import { BaseGuildTextChannel, Client, Guild, GuildMemberManager, Intents, MessageEmbed, Permissions, TextChannel } from 'discord.js'
import vm from 'vm'
import readline from 'readline'
import { Parser } from './logParser/parser'
import { BotSql } from './botSql'
import { RoleManagement } from './RoleManagement/roleManager'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { SlashCommandBuilder } from '@discordjs/builders'
import fs from 'fs';
import { resolveSoa } from 'dns'

let lastRead = 0;
const EvoPublic = '938866102837067827';
const VoidUnion = `938935253924479067`;
var token = "";
const EvoGuildID = "881866819659509792";
const EvoAuditChannel = "941412473142132797"
const potatoRole = "941076958408736808"
const evoRole = "882223347683975168"
const badPotato = "941077290283053098"
const voidRole = "910989304552099930"

token = fs.readFileSync("app_secret", { encoding: 'utf8', flag: 'r' });

//Slash Commands

const commands = [
  new SlashCommandBuilder().setName("verify").setDescription("Start or Restart the verification process for your in-game name and Union in Discord").toJSON(),
  new SlashCommandBuilder().setName("whois").setDescription("List identified users using following terms. Please select one.")
    .addSubcommand(subcommand => subcommand.setName("user").setDescription("An In Game User").addStringOption(option => option.setName("user").setDescription("The user's in game username")))
    .addSubcommand(subcommand => subcommand.setName("discord").setDescription("A Discord User").addUserOption(option => option.setName("user").setDescription("The discord user")))
    .addSubcommand(subcommand => subcommand.setName("union").setDescription("List the users of a union").addStringOption(option => option.setName("union").setDescription("The Union you want a userlist from"))).toJSON()
];

const potatoCommands = [
  new SlashCommandBuilder().setName("promote").setDescription("Give a non-family member your potato-verification").addUserOption(option => option.setName("user").setDescription("Target User").setRequired(true)).setDefaultPermission(false).toJSON(),
  new SlashCommandBuilder().setName("mute").setDescription("Silence a non-family member").addUserOption(option => option.setName("user").setDescription("Target User").setRequired(true)).setDefaultPermission(false).toJSON(),
  new SlashCommandBuilder().setName("revoke").setDescription("Revoke a non-family member potato-verification").addUserOption(option => option.setName("user").setDescription("Target User").setRequired(true)).setDefaultPermission(false).toJSON(),
  new SlashCommandBuilder().setName("retire").setDescription("Remove your Family Roles").setDefaultPermission(false).toJSON()

];

// Place your client and guild ids here
const clientId = '926639672636092436';

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    //await rest.put(
    //  Routes.applicationGuildCommands(clientId, EvoGuildID), { body: potatoCommands }
    //);

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

//Actual Bot

const sql = new BotSql();

//'%LocalAppData%/lagrange_global_online_branch/log.txt'
const client = new Client({ intents: [Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const roleManagement = new RoleManagement(sql);
const parser = new Parser(sql, roleManagement);
client.on('ready', async () => {
  //update command permissions:
  if (client.application?.owner) await client.application?.fetch();

  /*
  const commands = await client.guilds.cache.get(EvoGuildID)?.commands.fetch();
  if (commands)
    for (let command of commands) {
      if (command[1].name == "promote" || command[1].name == "mute" || command[1].name == "revoke" || command[1].name == "retire") {
        console.log("adding perms to " + command[1].name)
        command[1].permissions.add({
          permissions: [
            { id: voidRole, type: 'ROLE', permission: true }, // Void
            { id: evoRole, type: 'ROLE', permission: true } //Evo
          ]
        })
      }
    }
*/

  console.log("listening to " + process.env.localappdata + '\\lagrange_global_online_branch\\log.txt');
  const tail = new TailFile(process.env.localappdata + '/lagrange_global_online_branch/log.txt', { encoding: 'utf8' })
  tail.on('tail_error', (err) => {
    console.error('TailFile had an error!', err)
  })
    .on('error', (err) => {
      console.error('A TailFile stream error was likely encountered', err)
    })
    .start()
    .catch((err) => {
      console.error('Cannot start.  Does the file exist?', err)
    })
  const linesplit = readline.createInterface({ input: tail })
  linesplit.on('line', (line) => {
    parser.parseLineToDiscord(line, client);
  })
})
client.on("messageCreate", (message) => {
  //console.log(message)
  if (message.guild?.me?.permissionsIn(message.channel.id).has(Permissions.FLAGS.SEND_MESSAGES))
    try {
      switch (message.content.split(" ")[0]) {

        case "!math":
          let context = { "ret": 0 };
          let script = "ret = " + message.content.substring(6).replaceAll("{", "") + ";"
          let s = new vm.Script(script);
          vm.createContext(context)
          s.runInContext(context, { timeout: 250 })
          message.reply(context.ret + "");
          console.log(context)
          break;
        case "!whois":
          let ret = sql.getPlayerByName(message.content.substring(7));
          if (ret) {
            let embed = new MessageEmbed();
            embed.setTitle(message.content.substring(7))
            for (let r of ret) {
              let body = r.unionName
              if (r.discordId)
                body += " | " + "<@" + r.discordId + ">"
              embed.addField(r.playerName, body);
            }
            message.reply({ "embeds": [embed] });
          }
          break;
        case "!verify":
          if (message.guild) {
            let trigger = roleManagement.createNewTrigger(message.author.id, message.guild.id);
            console.log(trigger)
            message.reply("Please say `" + trigger.phrase + "` in local chat in game to verify.");
          }
          break;
        case "!time":
          message.reply("it is " + new Date().toUTCString());
          break;
      }
    } catch (e) {
      console.log(e)
    }
    //Translation Bot Services:
    //if(message.channelId == "883186801320288286"){
     // client.channels.fetch("944073699915624539").then((c)=>{
      //  if(c?.isText){
       //   //c.
       // }
      //})
    //}
})
client.on("error", (e) => {
  console.log(e)
});
client.on("guildMemberAdd", (member) => {
  if ((member.guild.systemChannel && member.guild?.me?.permissionsIn(member.guild.systemChannel.id).has(Permissions.FLAGS.SEND_MESSAGES)))
    try {
      //look for existing member
      let id = sql.getPlayerByDiscord(member.id)
      if(id){
        let i = id.pop();
        if(i) {
          roleManagement.reportVerifiedUser(i,member.guild,client)
          return;
        }
      }
      
      //Cant find an existing member, attempt to auth.
      //if(member.guild && !(member.guild.id == "943260995072163880")){
        let trigger = roleManagement.createNewTrigger(member.id, member.guild.id);
        member.guild.systemChannel?.send(`Welcome <@${member.id}>, may the Potato be with you! \nPlease say \`${trigger.phrase}\` in In-Game Star System Chat to verify.`)
      //}
    } catch (e) {
      console.log(e)
    }
})
client.on("guildMemberRemove", (member) => {
  if ((member.guild.systemChannel && member.guild?.me?.permissionsIn(member.guild.systemChannel.id).has(Permissions.FLAGS.SEND_MESSAGES)))
    try {
      let res = sql.getPlayerByDiscord(member.id)
      let e = new MessageEmbed();
      e.setTitle(member.nickname + " aka " + member.displayName);
      e.addField("Highest Role", member.roles.highest.name)
      if (res)
        for (let r of res) {
          e.addField(r.playerName, r.unionName)
        }
      member.guild.systemChannel?.send({ embeds: [e] })
    } catch (e) {
      console.log(e)
    }
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.channel && interaction.guild?.me?.permissionsIn(interaction.channel.id).has(Permissions.FLAGS.SEND_MESSAGES))
    try {
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
              } else {
                interaction.reply("Please use 3 or more characters to search")
                return;
              }
            }
            if (interaction.options.getSubcommand() === 'discord') {
              user = interaction.options.get("user")?.value as string;
              if (user) {
                ret = sql.getPlayerByDiscord(user);
              } else {
                return;
              }
            }
            if (interaction.options.getSubcommand() === 'union') {
              user = interaction.options.getString("union");
              if (user && user.length > 2) {
                ret = sql.getPlayersByUnion(user);
              } else {
                interaction.reply("Please use 3 or more characters to search")
                return;
              }
            }
            if (ret) {
              let embed = new MessageEmbed();
              embed.setTitle(user + " search")
              for (let r of ret) {
                let body = r.unionName
                if (r.discordId)
                  body += " | " + "<@" + r.discordId + ">"
                embed.addField(r.playerName, body);
              }
              interaction.reply({ "embeds": [embed], ephemeral: true });
            }
            break;
          case "verify":
            console.log("-------------------------------------")
            if (interaction.guildId) {
              let trigger = roleManagement.createNewTrigger(interaction.user.id, interaction.guildId);
              console.log(trigger)
              interaction.reply("Please say `" + trigger.phrase + "` in local chat in game to verify.");
            } else {
              interaction.reply("Please use this from inside a discord server")
            }
            break;
          case "revoke":
            try {
              let person = await interaction.guild?.members.fetch(interaction.options.getUser("user", true))
              interaction.reply(`Revoking <@${person?.id}>'s Potato Permissions`);
              if (person != undefined && person.roles.cache.has(potatoRole)) {
                person.roles.remove(potatoRole)
                interaction.guild?.channels.fetch(EvoAuditChannel).then((channel) => { if (channel?.isText()) channel.send(`<@${interaction.user.id}> has revoked potato perms from <@${person?.id}>`) })
              }
            } catch (e) {
              console.log(e)
            }
            break;
          case "promote":
            try {
              let person = await interaction.guild?.members.fetch(interaction.options.getUser("user", true))
              if (person?.roles.cache.has(badPotato)) {

                interaction.reply(`Removing <@${person?.id}>'s bad potato role`);
                if (person != undefined) {
                  person.roles.remove(badPotato);
                  interaction.guild?.channels.fetch(EvoAuditChannel).then((channel) => { if (channel?.isText()) channel.send(`<@${interaction.user.id}> has removed bad potato from <@${person?.id}>`) })
                }
              } else {
                interaction.reply(`Granting <@${person?.id}>'s verified potato role`);

                if (person != undefined) {
                  person.roles.add(potatoRole);
                  interaction.guild?.channels.fetch(EvoAuditChannel).then((channel) => { if (channel?.isText()) channel.send(`<@${interaction.user.id}> has issued verified potato to <@${person?.id}>`) })
                }
              }
            } catch (e) {
              console.log(e)
            }
            break;
          case "mute":
            try {
              let person = await interaction.guild?.members.fetch(interaction.options.getUser("user", true))
              interaction.reply(`Granting <@${person?.id}>'s bad potato role`);

              if (person != undefined) {
                person.roles.add(badPotato);
                interaction.guild?.channels.fetch(EvoAuditChannel).then((channel) => { if (channel?.isText()) channel.send(`<@${interaction.user.id}> has issued bad potato to <@${person?.id}>`) })
              }
            } catch (e) {
              console.log(e)
            }
            break;
          case "retire":
            try {
              interaction.reply(`Retiring <@${interaction.user.id}>`);
              let person = await interaction.guild?.members.fetch(interaction.user)
              if (person != undefined) {
                person.roles.remove(voidRole)
                person.roles.remove(evoRole)
                interaction.guild?.channels.fetch(EvoAuditChannel).then((channel) => { if (channel?.isText()) channel.send(`<@${interaction.user.id}> has retired`) })
              }
            } catch (e) {
              console.log(e)
            }
            break;
        }
      }
    } catch (e) {
      console.log(e)
    }
});

client.login(token)

