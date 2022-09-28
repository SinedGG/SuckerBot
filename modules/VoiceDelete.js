const fs = require("fs");
const cfgVoice = JSON.parse(fs.readFileSync("./config/voicecontrol.json", "utf8"));

function deleteChannel(bot){

    const Guilds = bot.guilds.cache.get('534488687426404372');
    const channels = Guilds.channels.cache.filter(c => c.parentId === cfgVoice.roomcat && c.type === 'GUILD_VOICE');
      for (const [id, voiceChannel] of channels) {
       if(voiceChannel.members.size == 0){
        voiceChannel.delete()
       }
      }
      setTimeout(() => {
        deleteChannel(bot)
      }, cfgVoice.deleteTimeout)
  }

  module.exports = deleteChannel;