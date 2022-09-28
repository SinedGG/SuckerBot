const fs = require("fs");
var cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));
const cfgXP = JSON.parse(fs.readFileSync("./config/xp.json", "utf8"));
const GiveUserRole = require("./GiveUserRole.js");


function GiveRoleByXP(bot, currrent_xp, user_id){
  const Guilds = bot.guilds.cache.get(cfg.guild);
  for (var j = 0; j < cfgXP.role.length; j++) {
    if (
      currrent_xp >= cfgXP.level[j].min &&
      currrent_xp <= cfgXP.level[j].max
    ){
      var user = Guilds.members.cache.find(
        (user) => user.id === user_id
      );
      var arg = user.roles.cache.some(
        (role) => role.id === cfgXP.role[j]
      );

      if (arg == false) {
        GiveUserRole(bot, cfgXP.role[j],cfgXP.role[j-1], user_id);
      }
    }
  }

}

/*
function GiveRoleByXP(bot, db) {
  const Guilds = bot.guilds.cache.get(cfg.guild);
  db.query(`SELECT * FROM xp`, function (err, rows) {
    if (!err) {
      for (var i = 0; i < rows.length; i++) {
        for (var j = 0; j < cfgXP.role.length; j++) {
          if (
            rows[i].xp_count >= cfgXP.level[j].min &&
            rows[i].xp_count <= cfgXP.level[j].max
          ) {
            try {
              var user = Guilds.members.cache.find(
                (user) => user.id === rows[i].user_id
              );
              var arg = user.roles.cache.some(
                (role) => role.id === cfgXP.role[j]
              );

              if (arg == false) {
                GiveUserRole(bot, cfgXP.role[j], rows[i].user_id);
              }
            } catch (error) {}
          }
        }
      }
    } else {
      console.log(err);
    }
  });
  setTimeout(() => {
    GiveRoleByXP(bot, db);
  }, cfgXP.roleTimeout);
}
*/
module.exports = GiveRoleByXP;
