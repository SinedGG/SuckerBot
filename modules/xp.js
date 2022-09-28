const fs = require("fs");
const cfgXP = JSON.parse(fs.readFileSync("./config/xp.json", "utf8"));
const addXP = require('./addXP.js')


function voiceXP(bot, db) {
  const Guilds = bot.guilds.cache.get("534488687426404372");
  const voiceChannels = Guilds.channels.cache.filter((m) => m.type === "GUILD_VOICE");
  
    
    for (const [id, voiceChannel] of voiceChannels) {
      if (voiceChannel.id != Guilds.afkChannelId) {
        var active_user_count = 0;
        for (const [id, Guildmember] of voiceChannel.members) {
          if (
            !Guildmember.user.bot &&
            !Guilds.voiceStates.cache.get(Guildmember.id).selfDeaf
          ) {
            active_user_count++;
          }
        }
        if (active_user_count > 1) {
          for (const [id, Guildmember] of voiceChannel.members) {
            
            if (
              !Guildmember.user.bot &&
              !Guilds.voiceStates.cache.get(Guildmember.id).selfDeaf
            ) {
              if (Guilds.voiceStates.cache.get(Guildmember.id).selfMute) {
                addXP(Guildmember.user.tag, Guildmember.id, 1, db, bot);
              } else {
                addXP(Guildmember.user.tag, Guildmember.id, cfgXP.voice, db, bot);
              }
              
            }
            
          }
        }
      }
    }
    setTimeout(() => {
      voiceXP(bot, db);
    }, cfgXP.voiceTimeout);
  }


  module.exports = voiceXP;