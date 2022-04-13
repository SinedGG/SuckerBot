const moment = require("moment-timezone");

var ignored_channel = [791370603101028462, 721461205969141772, 728293595257241691];

module.exports = (bot, db) => {
  bot.on("voiceStateUpdate", (oldState, newState) => {
    if (!oldState.channelId) {
      if (ignore(newState.channelId)) return;
      addLog(newState.id, "voice", "join_voice", newState.channel.name);
    } else if (!newState.channelId) {
      if (ignore(oldState.channelId)) return;
      addLog(oldState.id, "voice", "leave_voice", oldState.channel.name);
    } else if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId != newState.channelId
    ) {
       if( ignore_swith(oldState, newState)) return;
      var place = `${oldState.channel.name} → ${newState.channel.name}`;
      addLog(oldState.id, "voice", "swith", place);
    }
  });

  function addLog(user_id, action_type, sub_type, place) {
    var date = moment().tz("Europe/Kiev").format("YYYY-MM-DD HH:mm:ss");

    db.query(
      `INSERT tracker VALUES('${user_id}', '${action_type}', '${sub_type}', '${place}', '${date}')`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }

  function ignore(channel) {
    for (let i = 0; i < ignored_channel.length; i++) {
      if (channel == ignored_channel[i]) return true;
    }
  }
  function ignore_swith(oldState, newState) {
    for (let i = 0; i < ignored_channel.length; i++) {
      if (oldState.channelId == ignored_channel[i]) {
        addLog(newState.id, "voice", "join_voice", newState.channel.name);
        return true;
        break;
      }else if(newState.channelId == ignored_channel[i]){
        addLog(oldState.id, "voice", "leave_voice", oldState.channel.name);
        return true;
        break;
      }
    }
  }
};
