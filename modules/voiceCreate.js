const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));
const cfgVoice = JSON.parse(fs.readFileSync("./config/voicecontrol.json", "utf8"));

module.exports = (bot) =>{
    bot.on('voiceStateUpdate', (oldState, newState) => {
       
        const Guilds = bot.guilds.cache.get(cfg.guild);
        var name = "Кімната " + newState.member.user.username 
      
        if(newState.channelId == cfgVoice.private){
          Guilds.channels.create(name,{
            type: "GUILD_VOICE",
          }).then((channel) => {
            channel.setParent(cfgVoice.roomcat)
      
            newState.member.voice.setChannel(channel.id)
      
             let id = Guilds.roles.everyone.id;
            channel.permissionOverwrites.set([
              {
                 id: id,
                 deny: ['CONNECT'],
              },
              {
                id: newState.id,
                allow: ['MANAGE_CHANNELS','MOVE_MEMBERS', 'CONNECT'],
             },
            ],);
          })
        }
      
        if(newState.channelId == cfgVoice.create){
          Guilds.channels.create(name,{
            type: "GUILD_VOICE",
          }).then((channel) => {
            channel.setParent(cfgVoice.roomcat)
            newState.member.voice.setChannel(channel.id)
          })
        }
      });
}
