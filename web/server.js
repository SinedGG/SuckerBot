const text = require("../commands/text");

module.exports = (bot, db) => {
  const express = require("express");
  const app = express();
  const port = process.env.PORT || 80;
  var path = require("path");
  app.set("view engine", "ejs");
  app.use(express.static(__dirname + "/public/"));

  const favicon = require('serve-favicon');
  app.use(favicon(__dirname + '/public/icon/ico.png'));

  const moment = require("moment-timezone");



  app.get("/audit", (req, res) => {
    var param = parseInt(req.query.page);
    if(param < 0 || param == undefined || isNaN(param)) param = 0;
    audit_page(res, param);
  });

  app.get("/last_online", (req, res) => {
    online_page(res);
  });


  function audit_page(res, offset){
    db.query(
      `SELECT * from tracker ORDER BY date DESC LIMIT 25 OFFSET ${offset * 25}`,
      (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          var data = {
            users: [],
            text: {
              join_voice: "зайшов у голосовий канал",
              leave_voice: "вийшов з голосового каналу",
              swith: "змінив голосовий канал",
            },
          };
          var content = {
            avatar: [],
            user: [],
            action: [],
            place: [],
            time: [],
            date: [],
          };
          for (let i = 0; i < rows.length; i++) {
            content.avatar.push(rows[i].user_id);
            content.user.push(rows[i].user_id);
            content.action.push(data.text[rows[i].sub_type]);
            content.place.push(rows[i].place);
            content.time.push(moment(rows[i].date).format("HH:mm:ss"));
            content.date.push(moment(rows[i].date).format("YYYY-MM-DD"));
          }
          get_users_info(content,(test) => {
            setTimeout(() => {
              res.render(__dirname + "/voice.ejs", { data: test , page: offset});
            }, 1500);
           


             
          });
        }
      }
    );
  }
  function online_page(res){
    db.query(
      `SELECT * from last_online`,
      (err, rows) => {
        if (err) {
          console.log(err);
        } else {

          var content = {
            avatar: [],
            user: [],
            desktop: [],
            mobile: [],
            web: [],
          };
          for (let i = 0; i < rows.length; i++) {
            content.avatar.push(rows[i].user_id);
            content.user.push(rows[i].user_id);
            if(rows[i].desktop == 'online'){
              content.desktop.push('Зараз онлайн')
            }else if(rows[i].desktop_time == null){
              content.desktop.push('Невідомо')
            }else{
              content.desktop.push(moment(rows[i].desktop_time).format("HH:mm:ss DD-MM-YYYY"))
            }
            if(rows[i].mobile == 'online'){
              content.mobile.push('Зараз онлайн')
            }else if(rows[i].mobile_time == null){
              content.mobile.push('Невідомо')
            }else{
              content.mobile.push(moment(rows[i].mobile_time).format("HH:mm:ss DD-MM-YYYY"))
            }if(rows[i].web == 'online'){
              content.web.push('Зараз онлайн')
            }else if(rows[i].web_time == null){
              content.web.push('Невідомо')
            }else{
              content.web.push(moment(rows[i].web_time).format("HH:mm:ss DD-MM-YYYY"))
            }
          }
          get_users_info(content,(test) => {
            setTimeout(() => {
              res.render(__dirname + "/last_online.ejs", { data: test });
            }, 1500);
           


             
          });
        }
      }
    );
  }

  function get_users_info(content, callback) {
    var id = [];
    for (let i = 0; i < content.user.length; i++) {
      var value = content.user[i];
      if (id.indexOf(value) === -1) {
        id.push(value);
      }
    }

    for (let i = 0; i < id.length; i++) {
      bot.users
        .fetch(id[i])
        .then((user) => {

          for (let j = 0; j < content.user.length; j++) {
            if (id[i] == content.user[j]) {
              content.user[j] = user.tag;
              content.avatar[j] = user.displayAvatarURL();
            }
      
        }
        })
        .catch(console.error);
    }
    callback(content);
  }

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
