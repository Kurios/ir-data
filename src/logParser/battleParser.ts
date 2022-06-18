import { ColorResolvable, MessageEmbed } from "discord.js";

export class Battle {
    //[750257,"John Miller",1,"Hi",78,"{[B_SP_]}cfg_world_item#name#6{[E_SP_]}",300,0,6,0,1,19,3178,19,"",1,1602]
    // some sort of id, Enemy Name, ?, My Fleet Name, ? Enemy Fleet Name
    public static parse(a:any){
        let ret = {
            id: a[0]as number,
            enemyPlayerName: a[1] as string,
            victoryState: a[2] as number, // 1 = win, 2 = loss, 4 = retreat
            playerFleetName: a[3] as string,
            playerFleetCP: a[4] as number,
            enemyFleetName: Battle.translate(a[5]),
            enemyFleetCP: a[6] as number,
            enemyCount: a[15] as number
        }
        return ret;
    }

    public static makeEmbed(playerName:string,br:any):MessageEmbed
    {
        let color:ColorResolvable = "#FFFFFF";
        let victory = "??????";
        let battle = Battle.parse(br);
        switch(battle.victoryState){
            case 1:
                color = "#00FF00";
                victory = "Victory";
                break;
            case 2:
                color = "#FF0000"
                victory = "Defeat";
                break;
            case 4:
                color = "#0000FF";
                victory = "Retreat"
                break;
        }
        const ret = new MessageEmbed().setColor(color).setTitle("Shared a Battle")
        .setFields({name:playerName,value:`${battle.playerFleetName} : ${battle.playerFleetCP}CP`},
            {name:battle.enemyPlayerName,value:`${battle.enemyFleetName} : ${battle.enemyFleetCP}CP`},
            {name:victory,value:battle.enemyCount + " enemy fleets"})

        return ret;
    }

    public static translate(string: string):string{
        let output = "err";
        switch(string){
            case "{[B_SP_]}cfg_world_item#name#6{[E_SP_]}": output = "Outpost"; break;
            default: output=string;
        }
        return output;
    }
}