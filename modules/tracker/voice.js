const moment = require("moment-timezone");

var ignored_channel = [
    791370603101028462
]

module.exports = (bot, db) =>{

    bot.on('voiceStateUpdate', (oldState, newState) => {

        if(ifIgnore(newState.channelId, oldState.channelId)) return;
        if(!oldState.channelId){
          addLog(newState.id, 'voice', 'join_voice' ,newState.channel.name)
        }
        if(!newState.channelId){
          addLog(oldState.id, 'voice', 'leave_voice',oldState.channel.name)
        }
        if(oldState.channelId && newState.channelId &&(oldState.channelId != newState.channelId)){
            var place = `${oldState.channel.name} → ${newState.channel.name}`
            addLog(oldState.id, 'voice', 'swith', place)
        }
       });

    function addLog(user_id, action_type, sub_type, place){
        var date = moment().tz("Europe/Kiev").format("YYYY-MM-DD HH:mm:ss");

        db.query(`INSERT tracker VALUES('${user_id}','', '${action_type}', '${sub_type}', '${place}', '${date}')`, err =>{
            if(err){
                console.log(err)
            }
        })
    }

    function ifIgnore(oldState, newState){
        for (let i = 0; i < ignored_channel.length; i++) {
            if(oldState == ignored_channel[i]) return true;
            if(newState == ignored_channel[i]) return true;
            
        }
    }
}