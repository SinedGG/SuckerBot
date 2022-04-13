const fs = require("fs");
require("dotenv").config();
const { Client, Intents } = require("discord.js");
const bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  require("./commands/slash.js")(bot, db);
  require("./web/server.js")(bot, db);
  require("./commands/text.js")(bot, db);
  require("./modules/activity.js")(bot);
  require("./modules/voiceCreate.js")(bot);
  require("./modules/tracker/voice.js")(bot, db);
 // require("./modules/tracker/last-online.js")(bot, db);
  const xp_system = require("./modules/xp.js");
  const voiceDelete = require("./modules/VoiceDelete.js");
   xp_system(bot, db);
  voiceDelete(bot);
});

const mysql = require("mysql");
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  charset: "utf8mb4",
  multipleStatements: true,
});


bot.on("messageCreate", (msg) => {
  if (msg.content == "test") {
  }
});



bot.login(process.env.DS_TOKEN);
