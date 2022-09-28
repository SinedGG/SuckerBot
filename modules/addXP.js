const GiveRoleByXP = require('./GiveRoleByXP.js');

function addXP(userNAME, userID, xp_count, db, bot) {
  db.query(
    `INSERT INTO xp (name, user_id, xp_count)
    VALUES
        ('${userNAME}', '${userID}', ${xp_count})
    ON DUPLICATE KEY UPDATE
    xp_count = xp_count + ${xp_count}; SELECT * FROM xp WHERE user_id='${userID}' LIMIT 1`,
    (err, rows, test) => {
      if (err) {
        console.log(err);
      } else {
        console.log(
          `[XP] Додано ${xp_count} досвіду для користувача ${userNAME}`
        );
        GiveRoleByXP(bot, rows[1][0].xp_count, rows[1][0].user_id)
      }
    }
  );
}

module.exports = addXP;
