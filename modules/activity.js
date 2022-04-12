module.exports = (bot) =>{
    bot.user.setPresence({
        status: 'online',
        afk: false,
        activities: [{
            name: 'd.sded.cf',
            type: 'WATCHING',
        }],
      });
}