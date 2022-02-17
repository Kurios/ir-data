import { Client, MessageEmbed, Role } from 'discord.js'
import { BotSql } from '../botSql';
import { RoleManagement } from '../RoleManagement/roleManager';
import { TranslationServiceClient } from '@google-cloud/translate';
//@ts-ignore
import * as  CLD from 'cld'

let Translate = new TranslationServiceClient({ projectId: "struocks", keyFilename: "gcpkey.json" });
(async ()=>{
let translation = ""
let ttext = "Solo Hablo Espanol";
ttext = ttext.replaceAll(/(\{\d+\})/g, "")
//console.log(ttext)
if (ttext.length > 0) {
    try {
        let x = await CLD.detect(ttext);
        //console.log(x)
        if (x.languages && x.languages[0]) {
            if (!(x.langagues[0].code == "en")) {
                let request = {
                    //parent: "projects/struocks",
                    contents: [ttext],
                    targetLanguageCode: 'en-US',
                    mimeType: 'text/plain'
                    //sourceLanguageCode
                }
                let [gtranslate] = await Translate.translateText(request)
                //console.log(gtranslate)
                if (gtranslate.translations){
                    //console.log(gtranslate.translations.length)
                    translation = gtranslate.translations[0].translatedText + " " + gtranslate.translations[0].detectedLanguageCode;
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
            let [gtranslate] = await Translate.translateText(request)
            //console.log(gtranslate)
            //console.log(gtranslate)
            if (gtranslate.translations){
                console.log(gtranslate.translations.length)
                translation = gtranslate.translations[0].translatedText + " " + gtranslate.translations[0].detectedLanguageCode;
            }
        } catch (e) {
            //console.log(e)
        }
    }
} 
console.log(translation)
})();