import { SlashCommandBuilder } from '@discordjs/builders'
const  {DateTime} = require(`luxon`)

import { CommandInteraction, ModalSubmitInteraction} from 'discord.js';
const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

export class Commands {

    static generateSlashCommand(){
        return new SlashCommandBuilder().setName("timer").setDescription("Set a Timer").toJSON();
            //.addStringOption(option => option.setName("time").setDescription("The time the alarm goes off").setRequired(true))
           // .add
    }

    static generateTimerModel(){
        const modal = new Modal()
            .setCustomId("timerConfig")
            .setTitle("Timer Config");

        const timeInput = new TextInputComponent()
        .setCustomId("time")
        .setLabel("Time (HH:MM)")
        .setStyle('SHORT')
        .setRequired(true)
        const textInput = new TextInputComponent()
        .setCustomId("notice")
        .setLabel("Notice Text")
        .setStyle('SHORT')
        .setRequired(true)
        const timezoneOffset = new TextInputComponent()
        .setCustomId("timezone")
        .setLabel("Timezone")
        .setStyle("SHORT")
        .setValue("UTC")
        .setRequired(true)

        const firstRow = new MessageActionRow().addComponents(timeInput)
        const secondRow = new MessageActionRow().addComponents(timezoneOffset)
        const thirdRow = new MessageActionRow().addComponents(textInput)
        modal.addComponents(firstRow,secondRow,thirdRow);
        return modal
    }

    static async timerInteraction1(interaction:CommandInteraction){
        interaction.showModal(Commands.generateTimerModel());
    }

    static async timerInteraction2(interaction:ModalSubmitInteraction){
        const time = interaction.fields.getTextInputValue('time');
        const tz = interaction.fields.getTextInputValue('timezone');
        const notice = interaction.fields.getTextInputValue('notice');

        console.log(time + " " + tz)

        let t = DateTime.fromFormat(time + " " + tz,'H:mm z')
        if(t.isValid){
            if(t < DateTime.now()){
                t = t.plus({days:1})
            }
            
            let unixTime = t.toMillis()
            let timerTime = t.toMillis() - DateTime.now().toMillis();
            let args = {channel:interaction.channel,notice:notice,author:interaction.user.id};
            setTimeout((a)=>{
                a.channel?.send(`<@${a.author}> ${a.notice}`)
            },timerTime,args)
            interaction.reply(`setting a timer for ${t.toHTTP()} in <t:${unixTime}:D> |  ${notice}`);
        }else{
            interaction.reply({content:t.invalidReason,ephemeral:true})
        }

    }


}