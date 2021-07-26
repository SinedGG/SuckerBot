var fs = require("fs");
const moment = require("moment");
require('dotenv').config()

const Discord = require("discord.js");
const bot = new Discord.Client();


const mysql = require("mysql");
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

var cfgXP = JSON.parse(fs.readFileSync("./config/xp.json", "utf8"));
var cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

/* -------------------------------------------------------------------------- */
/*                                   Logger                                   */
/* -------------------------------------------------------------------------- */
function logger(log_text, type) {
  var logtofile = fs.createWriteStream("log/last.txt", {
    flags: "a",
  });
  var time_now =
    moment().hour() +
    ":" +
    moment().minute() +
    ":" +
    moment().second() +
    "   " +
    moment().date() +
    "." +
    moment().month() +
    "." +
    moment().weekYear();

  logtofile.write(time_now + " | " + type + " | " + log_text + "\n");
  bot.channels.cache
    .get(cfg.log_channel)
    .send(time_now + " | " + type + " | " + log_text);
  console.log(time_now + " | " + type + " | " + log_text);
}

/* -------------------------------------------------------------------------- */
/*                                  XP System                                 */
/* -------------------------------------------------------------------------- */
/* -------------------------------- Voice XP -------------------------------- */
function voiceXP() {
  const Guilds = bot.guilds.cache.get(cfg.guild);
  const voiceChannels = Guilds.channels.cache.filter((m) => m.type === "voice");

  for (const [id, voiceChannel] of voiceChannels) {
    if (voiceChannel.id != Guilds.afkChannelID) {
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
            if(Guilds.voiceStates.cache.get(Guildmember.id).selfMute){
              addXP(Guildmember.user.tag, Guildmember.id, 1, 0);
            }else{
            addXP(Guildmember.user.tag, Guildmember.id, cfgXP.voice, 0);
            }
          }
        }
      }
    }
  }
  setTimeout(() => {
    voiceXP();
  }, cfgXP.voiceTimeout);
}
/* --------------------------------- Text XP -------------------------------- */
function textXP(msg){
  if(!msg.member.user.bot){
    db.query(`SELECT text_timeout FROM xp WHERE user_id=${msg.author.id}`, function (err, rows) {
      if (err) {
        logger(err, "db err");
      }else{
        if (rows == null || rows.length == 0) {
          console.log("pizda")
          addXP(msg.author.tag, msg.author.id, 1, 1);
        }else{
          db.query(`SELECT text_timeout FROM xp WHERE user_id=${msg.author.id}`, function (err, rows) {
            if (err){
              logger(err, "db err");
            }else{
              //console.log("If "+Math.abs((rows[0].text_timeout - moment().minute())));
              if(Math.abs((rows[0].text_timeout - moment().minute())) >= cfgXP.textDelay){
                addXP(msg.author.tag, msg.author.id, cfgXP.text, 1);
                db.query(`UPDATE xp SET text_timeout = ${moment().minute()} WHERE user_id="${msg.author.id}"`,  function (err, rows) {
                  if (err){
                    logger(err, "db err");
                  }});
              }
            }
          });
        }
      }
    });
}
}

/* ------------------------------- XP function ------------------------------ */
function addXP(userNAME, userID, xp_count, arg) {
  db.query(`SELECT * FROM xp WHERE user_id=${userID}`, function (err, rows) {
    if (err) {
      logger(err, "db err");
    }else{
      if (rows == null || rows.length == 0) {
        db.query(
          `INSERT xp(name, user_id, xp_count) VALUES ("${userNAME}", ${userID}, 0)`, function (err) {
            if (err) {
              logger(err, "db err");
            } else {
              logger(`Користиувача ${userNAME} було додано до бази даних`, "database");
              db.query(
                `UPDATE xp SET xp_count = xp_count + ${xp_count} WHERE user_id="${userID}"`,
                function (err) {
                  if (err) {
                    logger(err, "db err");
                  } else {
                    logger(
                      `Додано ${xp_count} досвіду для користувача ${userNAME} за перебування у голосовому каналі`,
                      "XP"
                    );
                  }
                }
              );
            }
          }
        );
      } else {
        db.query(
          `UPDATE xp SET xp_count = xp_count + ${xp_count} WHERE user_id=${userID}`,
          function (err) {
            if (err) {
              console.log(err);
            } else {
              var content = "";
              if(arg == 0){
                content = "перебування у голосовому каналі";
              }
              if(arg == 1){
                content = "написання повідомлення";
              }
              if(arg == 2){
                content = "відправдення реакції";
              }

              logger(
                `Додано ${xp_count} досвіду для користувача ${userNAME} за ${content}`,
                "XP"
              );
            }
          }
        );
      }
    }
  });
}


function GiveRoleByXP() {
  db.query(`SELECT * FROM xp`, function (err, rows) {
    if (!err) {
      for (var i = 0; i < rows.length; i++) {
        for (var j = 0; j < cfgXP.role.length; j++) {
          if (
            rows[i].xp_count >= cfgXP.level[j].min &&
            rows[i].xp_count <= cfgXP.level[j].max
          ) {
            const Guilds = bot.guilds.cache.get(cfg.guild);
            var user = Guilds.members.cache.find((user) => user.id === rows[i].user_id );
try {
  var arg = user.roles.cache.some((role) => role.id === cfgXP.role[j]);

  if (!arg) {
    //RemoveUserRole(cfgXP.role, rows[i].user_id);
    GiveUserRole(cfgXP.role[j], rows[i].user_id);
  }
} catch (error) {
  console.log(`Id: ${rows[i].user_id} TypeError: Cannot read property 'roles' of undefined`)
}
          }
        }
      }
    } else {
      console.log(err);
    }
  });
  setTimeout(() => {
    GiveRoleByXP();
  }, cfgXP.roleTimeout);
}

/*
function GiveRoleByXP() {
  db.query(`SELECT * FROM xp`, function (err, rows) {
    if (!err) {
      for (var i = 0; i < rows.length; i++) {
        var j = 0;
        loop();
        function loop(){
          if (
            rows[i].xp_count >= cfgXP.level[j].min &&
            rows[i].xp_count <= cfgXP.level[j].max
          ) {
            const Guilds = bot.guilds.cache.get(cfg.guild);
            var user = Guilds.members.cache.find((user) => user.id === rows[i].user_id );
            console.log(user)
            
            var arg = user.roles.cache.some(
              (role) => role.id === cfgXP.role[j]
            );
            if (!arg) {
              //RemoveUserRole(cfgXP.role, rows[i].user_id);
              GiveUserRole(cfgXP.role[j], rows[i].user_id);
            }
            
          }
          
          if(j < cfgXP.role.length){
            setTimeout(() => {
              loop();
            }, 1500);
          }
          j++;
        }
        for (var j = 0; j < cfgXP.role.length; j++) {
          
        }
      }
    } else {
      console.log(err);
    }
  });
  setTimeout(() => {
    GiveRoleByXP();
  }, cfgXP.roleTimeout);
}
*/
function GiveUserRole(roleID, userID) {
  const Guilds = bot.guilds.cache.get(cfg.guild);
  var role = Guilds.roles.cache.find((role) => role.id === roleID);
  var user = Guilds.members.cache.find((user) => user.id === userID);
  user.roles.add(role);
  logger(`Користувачу ${user.user.tag} видано роль ${role.name}`, "Role");
  const embed = new Discord.MessageEmbed()
        .setURL("https://sded.cf/img/main.jpg")
        .setAuthor("Система досвіду ", "https://sded.cf/img/main.jpg")
        .setColor("#ff6700")
        .setDescription(`**Вітаю 🎉 ${user.user.tag} , ви покращили свій рівень і здобули роль ${role.name} **`)
        .setFooter("SDED Community")
        .setThumbnail("https://media.forgecdn.net/avatars/67/361/636163095202189901.png");
  var chanell = bot.channels.cache.get(cfg.command_channel[0]);
  chanell.send(embed);
  chanell.send(`${user.user.toString()}`);
}

function RemoveUserRole(roleID, userID) {
  const Guilds = bot.guilds.cache.get(cfg.guild);
  // var role = Guilds.roles.cache.find(role => role.id === roleID);
  var user = Guilds.members.cache.find((user) => user.id === userID);
  user.roles.remove(roleID);
}

/* -------------------------------------------------------------------------- */
/*                                 AntiCommand                                */
/* -------------------------------------------------------------------------- */
function AntiCommand(msg) {
  if(!msg.member.user.bot){
   var arg = false;
   if(msg.content.startsWith("-" || "." || "-")){
    for (var i = 0; i < cfg.command_channel.length; i++) {
      if(msg.channel.id == cfg.command_channel[i]){
      arg = true; break;
      }
    }
    if(!arg){
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

/* -------------------------------------------------------------------------- */
/*                                  Commands                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------- Dellete Bulk Message -------------------------- */
bot.on("message", (msg) => {
  if (msg.content.startsWith("sdl")) {
    if (msg.author.id == cfg.admin_id) {
      const args = msg.content.trim().split(/ +/g);
      msg.channel
        .bulkDelete(args[1])
        .catch((error) =>
          msg.reply(`Couldn't delete messages because of: ${error}`)
        );
      logger(`Використано команду /sdl`, "bot");
    }
  }

  /* --------------------------------- Restart -------------------------------- */
  if (msg.content == "~restart") {
    if (msg.author.id == cfg.admin_id) {
      logger(`Використано команду /restart`, "bot");
      process.exit(1);
    }
  }

  /* --------------------------------- Get log -------------------------------- */
  if (msg.content == "~getlog") {
    if (msg.author.id == cfg.admin_id) {
      msg.channel.send("Testing message.", {
        files: [
          "./log/last.txt"
        ]
      });
      msg.delete;
    }
  }
  /* ------------------------------- AntiCommand ------------------------------ */
  AntiCommand(msg);
  /* --------------------------------- TextXP --------------------------------- */
  textXP(msg);

  /* ----------------------------------- --- ---------------------------------- */
  if (msg.content == "!myxp") {
    db.query(`SELECT xp_count FROM xp WHERE user_id=${msg.author.id}`, function (err, rows) {
      if(!err){
        bot.channels.cache
      .get(cfg.command_channel[0])
      .send(
        `${msg.author.toString()} Кількість вашого досвіду - ${rows[0].xp_count}`
      );
      }
    });
   
  }
});
/* ------------------------------ Admin command ----------------------------- */
bot.on("message", (msg) => {
  if (msg.content == "rolexp") {
    if (msg.author.id == cfg.admin_id) {
      GiveRoleByXP();
    }
  }
  });

  bot.on("message", (msg) => {
    if (msg.content == "test123") {
      if (msg.author.id == cfg.admin_id) {
        const Guilds = bot.guilds.cache.get(cfg.guild);
        const User = bot.fetchUser("475388811195580437");
        console.log(User);
      }
    }
    });

/* -------------------------------------------------------------------------- */
/*                               Slash Commands                               */
/* -------------------------------------------------------------------------- */
/* ----------------------------- Slash function ----------------------------- */
const createAPIMessage = async (interaction, content) => {
  const { data, files } = await Discord.APIMessage.create(
    bot.channels.resolve(interaction.channel_id),
    content
  )
    .resolveData()
    .resolveFiles()

  return { ...data, files }
}

function AddCommands(){
  bot.api.applications(bot.user.id).guilds(cfg.guild).commands.post({
    data: {
        name: "xp",
        description: "Система досвіду"
    },
    data: {
      name: "leaderboard",
      description: "Таблиця лідерів"
  }
});
}

bot.ws.on("INTERACTION_CREATE", async (interaction) => {
  const command = interaction.data.name.toLowerCase();
  const args = interaction.data.options;

  /* ----------------------------------- XP ----------------------------------- */
  if (command === "xp") {
    db.query(`SELECT xp_count FROM xp WHERE user_id=${interaction.member.user.id}`, async function (err, rows) {
        const Guilds = bot.guilds.cache.get(cfg.guild);
        var embedDescription = "";
        for (var i = 0; i < cfgXP.role.length; i++) {
          embedDescription +=  `${Guilds.roles.cache.find((role) => role.id === cfgXP.role[i]).name} - ${cfgXP.level[i].min} \n`;
        }
        const embed = new Discord.MessageEmbed()
        .setURL("https://sded.cf/img/main.jpg")
        .setAuthor("Система досвіду ", "https://sded.cf/img/main.jpg")
        .setColor("#ff6700")
        .setDescription(`Проявляючи активність на сервері ви будете здобувати достід та підвищувати свій рівень !\n\n **Роль - досвід для отримання ** \n\n ${embedDescription} \n **Ваш досвід - ${rows[0].xp_count}**`)
        .setFooter("SDED Community")
        .setThumbnail("https://media.forgecdn.net/avatars/67/361/636163095202189901.png");
     
    let data = {
      content: embed,
    };

    if (typeof embed === "object") {
      data = await createAPIMessage(interaction, embed);
    }

    bot.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data,
      },
    });
    });
  }
  /* ------------------------------- Leaderboard ------------------------------ */
  if (command === "leaderboard") {
    db.query(
      `select * FROM xp ORDER BY xp_count DESC`,
      async function (err, rows) {
        if (err) {
          logger(err, "db err");
        } else {
          var content = "";
  
          for (var i = 0; i < 10; i++) {
            var name = rows[i].name.split("#");
            content += `${i + 1}. ${name[0]} - ${rows[i].xp_count} \n`;
          }
          const embed = new Discord.MessageEmbed()
            .setURL("https://sded.cf/img/main.jpg")
            .setAuthor("Система досвіду ", "https://sded.cf/img/main.jpg")
            .setColor("#ff6700")
            .setDescription(content)
            .setFooter("SDED Community")
            .setThumbnail("https://media.forgecdn.net/avatars/67/361/636163095202189901.png"
            );
  
          let data = {
            content: embed,
          };
  
          if (typeof embed === "object") {
            data = await createAPIMessage(interaction, embed);
          }
  
          bot.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
              type: 4,
              data,
            },
          });
        }
      }
    );
  }
  
});

/* -------------------------------------------------------------------------- */
/*                                  Activity                                  */
/* -------------------------------------------------------------------------- */

function setActivity(){

  bot.user.setPresence({
    activity: {
      name: " /xp",
      type: 0,
    },
  })
  setTimeout(() => {
    bot.user.setPresence({
      activity: {
        name: " sded.cf",
        type: "WATCHING",
      },
    })
  }, 5000);

  setTimeout(() => {
    setActivity();
  }, 10000);
}

/* -------------------------------------------------------------------------- */
/*                                    Ready                                   */
/* -------------------------------------------------------------------------- */
bot.on("ready", () => {
  logger(`Logged in as ${bot.user.tag} Version - ${cfg.version}`, "bot");

  voiceXP();
  GiveRoleByXP();
  AddCommands();
  setActivity()
});



bot.login(process.env.DS_TOKEN);
