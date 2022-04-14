const moment = require("moment-timezone");
const fs = require("fs");
const cfgXP = JSON.parse(fs.readFileSync("./config/xp.json", "utf8"));

module.exports = (bot, db) => {
  bot.on("presenceUpdate", (oldState, newState) => {
    if (newState.guild.id != "534488687426404372") return;

    var pass = false;
    for (let i = 1; i < cfgXP.role.length; i++) {
      if (newState.member.roles.cache.has(cfgXP.role[i])) {
        pass = true;
        break;
      }
    }

    if (pass) {
      console.log(oldState)
      console.log(newState)

      var sql = null;
      var date = moment().tz("Europe/Kiev").format("YYYY-MM-DD HH:mm:ss");

      if (
        newState.clientStatus.hasOwnProperty("desktop") &&
        !oldState.clientStatus.hasOwnProperty("desktop")
      ) {
        sql = `
        INSERT INTO last_online (user_id, desktop, desktop_time) VALUES
        ('${newState.userId}', 'online', '${date}')
        ON DUPLICATE KEY UPDATE desktop = 'online', desktop_time = '${date}'
        `;
      }
      if (
        newState.clientStatus.hasOwnProperty("mobile") &&
        !oldState.clientStatus.hasOwnProperty("mobile")
      ) {
        sql = `
        INSERT INTO last_online (user_id, mobile, mobile_time) VALUES
        ('${newState.userId}', 'online', '${date}')
        ON DUPLICATE KEY UPDATE mobile = 'online', mobile_time = '${date}'
        `;
      }
      if (
        newState.clientStatus.hasOwnProperty("web") &&
        !oldState.clientStatus.hasOwnProperty("web")
      ) {
        sql = `
        INSERT INTO last_online (user_id, web, web_time) VALUES
        ('${newState.userId}', 'online', '${date}')
        ON DUPLICATE KEY UPDATE web = 'online', web_time = '${date}'
        `;
      }

      
      if (
        oldState.clientStatus.hasOwnProperty("desktop") &&
        !newState.clientStatus.hasOwnProperty("desktop")
      ) {
        sql = `
        INSERT INTO last_online (user_id, desktop, desktop_time) VALUES
        ('${newState.userId}', 'offline', '${date}')
        ON DUPLICATE KEY UPDATE desktop = 'offline', desktop_time = '${date}'
        `;
      }
      if (
        oldState.clientStatus.hasOwnProperty("mobile") &&
        !newState.clientStatus.hasOwnProperty("mobile")
      ) {
        sql = `
        INSERT INTO last_online (user_id, mobile, mobile_time) VALUES
        ('${newState.userId}', 'offline', '${date}')
        ON DUPLICATE KEY UPDATE mobile = 'offline', mobile_time = '${date}'
        `;
      }
      if (
        oldState.clientStatus.hasOwnProperty("web") &&
        !newState.clientStatus.hasOwnProperty("web")
      ) {
        sql = `
        INSERT INTO last_online (user_id, web, web_time) VALUES
        ('${newState.userId}', 'offline', '${date}')
        ON DUPLICATE KEY UPDATE web = 'offline', web_time = '${date}'
        `;
      }

      if (sql != null) {
        db.query(sql, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  });
};
