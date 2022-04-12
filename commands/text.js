const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));


module.exports = (bot, db) => {

    /* -------------------------- Dellete Bulk Message -------------------------- */
bot.on("messageCreate", (msg) => {
    if (msg.content.startsWith("sdl")) {
      if (msg.author.id == cfg.admin_id) {
        const args = msg.content.trim().split(/ +/g);
        msg.channel
          .bulkDelete(args[1])
          .catch((error) =>
            msg.reply(`Couldn't delete messages because of: ${error}`)
          );
        console.log(`Використано команду /sdl`, "bot");
      }
    }
  
    /* --------------------------------- Restart -------------------------------- */
    if (msg.content == "~restart") {
      if (msg.author.id == cfg.admin_id) {
        console.log(`Використано команду /restart`, "bot");
        process.exit(1);
      }
    }
    /* ------------------------------- AntiCommand ------------------------------ */
    AntiCommand(msg);
    /* --------------------------------- TextXP --------------------------------- */
    if(!msg.member.user.bot){
        const addXP = require('../modules/addXP')
        addXP(msg.author.tag, msg.author.id, 1, db, bot);
       
    }
    
  });


}


function AntiCommand(msg) {
    if (!msg.member.user.bot) {
      var arg = false;
      if (msg.content.startsWith("-" || "." || "-")) {
        for (var i = 0; i < cfg.command_channel.length; i++) {
          if (msg.channel.id == cfg.command_channel[i]) {
            arg = true;
            break;
          }
        }
        if (!arg) {
          msg.delete();
          bot.channels.cache
            .get(cfg.command_channel[0])
            .send(
              `Агов! ${msg.author.toString()} для даних рухів є призначиний цей канал!`
            );
        }
      }
    }
  }