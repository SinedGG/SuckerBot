const { MessageEmbed } = require('discord.js');
const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));


function GiveUserRole(bot, roleID, roleIDold, userID) {
  const Guilds = bot.guilds.cache.get(cfg.guild);
  var user = Guilds.members.cache.find((user) => user.id === userID);
  user.roles.add(roleID);
  if(roleIDold){
    user.roles.remove(roleIDold)
  }

  console.log(`Користувачу ${user.user.tag} видано роль ${roleID}`, "Role");
  const embed = new MessageEmbed()
    .setURL("https://sded.cf/img/main.jpg")
    .setAuthor({ name: 'Cистема досвіду ', iconURL: 'https://sded.cf/img/main.jpg'})
    .setColor("#ff6700")
    .setDescription(
      `**Вітаю 🎉 <@${user.user.id}> , ви покращили свій рівень і здобули роль <@&${roleID}> **`
    )
    .setFooter({ text: 'SDED Community'})
    .setThumbnail(
      "https://media.forgecdn.net/avatars/67/361/636163095202189901.png"
    );
  var chanell = bot.channels.cache.get(cfg.command_channel[0]);
  chanell.send({ embeds: [embed] });
  chanell.send(`${user.user.toString()}`);
}



module.exports = GiveUserRole;