const moment = require("moment-timezone");
const fs = require("fs");
const cfgXP = JSON.parse(fs.readFileSync("./config/xp.json", "utf8"));

module.exports = (bot, db) => {
  bot.on("presenceUpdate", (oldMember, newMember) => {
    if (newMember.guild.id != "534488687426404372") return;
    if(newMember.userId != '274449343124078593') return;

    var pass = false;
    for (let i = 1; i < cfgXP.role.length; i++) {
      if (newMember.member.roles.cache.has(cfgXP.role[i])) {
        pass = true;
        break;
      }
    }
    if(pass){
        console.log(newMember)
      if( newMember.clientStatus.hasOwnProperty('desktop')){
        dd.d = newMember.clientStatus.desktop ;
      }
      if( newMember.clientStatus.hasOwnProperty('mobile')){
        dd.m = newMember.clientStatus.desktop ;
      }
      if( newMember.clientStatus.hasOwnProperty('web')){
        dd.w = newMember.clientStatus.desktop ;
      }
      

        if( !newMember.clientStatus.hasOwnProperty('desktop')){
            dd.d = 'off';
          }
          if( !newMember.clientStatus.hasOwnProperty('mobile')){
            dd.m = 'off';
          }
          if( !newMember.clientStatus.hasOwnProperty('web')){
            dd.w = 'off';
          }
      
      
      console.log(dd)
    }
  });
};


var dd = {
    d: null,
    m: null,
    w: null
}