var fs = require("fs");
var cfgLEAD = JSON.parse(fs.readFileSync("./config/leaderboard.json", "utf8"));
var cfgXP = JSON.parse(fs.readFileSync("./config/xp.json", "utf8"));

module.exports = (bot, db) => {
  const { SlashCommandBuilder } = require("@discordjs/builders");
  const { REST } = require("@discordjs/rest");
  const { Routes } = require("discord-api-types/v9");

  const commands = [
    new SlashCommandBuilder()
      .setName("leaderboard ")
      .setDescription("Таблиця лідерів"),
    new SlashCommandBuilder()
      .setName("xp")
      .setDescription("Система досвіду"),
    new SlashCommandBuilder()
      .setName("watch-together")
      .setDescription("Створити Youtube перегляд в поточному голосому каналі"),
  ].map((command) => command.toJSON());
  const rest = new REST({ version: "9" }).setToken(process.env.DS_TOKEN);

  rest
    .put(
      Routes.applicationGuildCommands(
        "585875099492548648",
        "534488687426404372"
      ),
      { body: commands }
    )
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);

  bot.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === "leaderboard") {
      db.query(
        `select * FROM xp ORDER BY xp_count DESC`,
        async function (err, rows) {
          if (err) {
            console.log(err, "db err");
          } else {
            var content = "";

            for (var i = 0; i < cfgLEAD.rows; i++) {
              content += `${i + 1}. <@${rows[i].user_id}> - ${
                rows[i].xp_count
              } \n`;
            }
            const Embed = {
              color: "#ff6700",
              author: {
                name: "Система досвіду",
                icon_url: "https://sded.cf/img/main.jpg",
              },
              description: content,
              thumbnail: {
                url: "https://media.forgecdn.net/avatars/67/361/636163095202189901.png",
              },
              footer: {
                text: "SDED Community",
              },
            };
            interaction.reply({ embeds: [Embed] });
          }
        }
      );
    } else if (commandName === "xp") {
      var embedDescription = "";
      for (var i = 0; i < cfgXP.role.length; i++) {
        embedDescription += `<@&${cfgXP.role[i]}> - ${cfgXP.level[i].min} \n`;
      }
      db.query(
        `SELECT xp_count FROM xp WHERE user_id=${interaction.member.user.id} LIMIT 1`,
        (err, rows) => {
          if (err) {
            console.log(err);
          } else {
            const Embed = {
              color: "#ff6700",
              author: {
                name: "Система досвіду",
                icon_url: "https://sded.cf/img/main.jpg",
              },
              description: `Проявляючи активність на сервері ви будете здобувати достід та підвищувати свій рівень !\n\n **Роль - досвід для отримання ** \n\n ${embedDescription} \n **Ваш досвід - ${rows[0].xp_count}**`,
              thumbnail: {
                url: "https://media.forgecdn.net/avatars/67/361/636163095202189901.png",
              },
              footer: {
                text: "SDED Community",
              },
            };
            interaction.reply({ embeds: [Embed] });
          }
        }
      );
    }else if (commandName === "watch-together") {
      const { DiscordTogether } = require('discord-together');

      bot.discordTogether = new DiscordTogether(bot);
      
      if(interaction.member.voice.channel) {
        bot.discordTogether.createTogetherCode(interaction.member.voice.channel.id, 'youtube').then(async invite => {
  
             interaction.reply(`${invite.code}`);
        });
    }else{
      interaction.reply(`Ви повинні перебувати у голосовому каналі`);
    };  
    }
  });
};





