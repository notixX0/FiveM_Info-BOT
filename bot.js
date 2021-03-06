'use strict';

const Discord = require('discord.js');
const fetchTimeout = require('fetch-timeout');
const { paddedFullWidth, errorWrap } = require('./utils.js');

const LOG_LEVELS = {
  'ERROR': 3,
  'INFO': 2,
  'DEBUG': 1,
  'SPAM': 0
}

const BOT_CONFIG = {
  'apiRequestMethod': 'sequential',
  'messageCacheMaxSize': 50,
  'messageCacheLifetime': 0,
  'messageSweepInterval': 0,
  'fetchAllMembers': false,
  'disableEveryone': true,
  'sync': false,
  'restWsBridgeTimeout': 5000,
  'restTimeOffset': 300,
  'disabledEvents': [
    'CHANNEL_PINS_UPDATE',
    'TYPING_START'
  ],
  'ws': {
    'large_threshold': 100,
    'compress': false
  }
}
// ---------------------------------------------------------------------
const USER_AGENT = `FSS bot ${require('./package.json').version} , Node ${process.version} (${process.platform}${process.arch})`;

exports.start = function(SETUP) {
  const URL_SERVER = SETUP.URL_SERVER;
  const SERVER_NAME = SETUP.SERVER_NAME;
  const SERVER_LOGO = SETUP.SERVER_LOGO;
  const EMBED_COLOR = SETUP.EMBED_COLOR;
  const RESTART_TIMES = SETUP.RESTART_TIMES;
  const SERVER_IP = SETUP.SERVER_IP;
  const PERMISSION = SETUP.PERMISSION;
  const URL_PLAYERS = new URL('/players.json', SETUP.URL_SERVER).toString();
  const URL_INFO = new URL('/info.json', SETUP.URL_SERVER).toString();
  const MAX_PLAYERS = 64;
  const TICK_MAX = 1 << 9; // max bits for TICK_N
  const FETCH_TIMEOUT = 2000;
  const FETCH_OPS = {
    'cache': 'no-cache',
    'method': 'GET',
    'headers': { 'User-Agent': USER_AGENT }
  };
  const LOG_LEVEL = SETUP.LOG_LEVEL !== undefined ? parseInt(SETUP.LOG_LEVEL) : LOG_LEVELS.INFO;
  const BOT_TOKEN = SETUP.BOT_TOKEN;
  const CHANNEL_ID = SETUP.CHANNEL_ID;
  const MESSAGE_ID = SETUP.MESSAGE_ID;
  const SUGGESTION_CHANNEL = SETUP.SUGGESTION_CHANNEL;
  const BUG_CHANNEL = SETUP.BUG_CHANNEL;
  const BUG_LOG_CHANNEL = SETUP.BUG_LOG_CHANNEL;
  const LOG_CHANNEL = SETUP.LOG_CHANNEL;
  const UPDATE_TIME = 10000; // in ms

  var TICK_N = 0;
  var MESSAGE;
  var LAST_COUNT;
  var STATUS;

  var loop_callbacks = [];

  const log = function(level,message) {
    if (level >= LOG_LEVEL) console.log(`????${level}???? ${message}`);
  };

  const getPlayers = function() {
    return new Promise((resolve,reject) => {
      fetchTimeout(URL_PLAYERS, FETCH_TIMEOUT).then((res) => {
        res.json().then((players) => {
          resolve(players);
        }).catch(reject);
      }).catch(reject);
    })
  };

  const getVars = function() {
    return new Promise((resolve,reject) => {
      fetchTimeout(URL_INFO, FETCH_OPS, FETCH_TIMEOUT).then((res) => {
        res.json().then((info) => {
          resolve(info.vars);
        }).catch(reject);
      }).catch(reject);
    });
  };

  const bot = new Discord.Client(BOT_CONFIG);

  const sendOrUpdate = function(embed) {
    if (MESSAGE !== undefined) {
      MESSAGE.edit(embed).then(() => {
        log(LOG_LEVELS.DEBUG, '??? Friss??t??s sikeres');
      }).catch((e) => {
        log(LOG_LEVELS.ERROR, `??? Sikertelen friss??t??s\nHiba: ${e}`);
      })
    } else {
      let channel = bot.channels.cache.get(CHANNEL_ID);
      if (channel !== undefined) {
        channel.messages.fetch(MESSAGE_ID).then((message) => {
          MESSAGE = message;
          message.edit(embed).then(() => {
            log(LOG_LEVELS.SPAM, '??? Friss??t??s sikeres');
          }).catch((e) => {
            log(LOG_LEVELS.ERROR, `??? Sikertelen friss??t??s\nHiba: ${e}`);
          });
        }).catch(() => {
          channel.send(embed).then((message) => {
            MESSAGE = message;
            log(LOG_LEVELS.INFO,`??? ??llapot??zenet elk??ldve.\nK??rj??k, friss??tse a konfigur??ci??s f??jlt ezzel az ??zenetazonos??t??val ????${message.id}????`);
          }).catch(console.error);
        })
      } else {
        log(LOG_LEVELS.ERROR, '??? Friss??t??si csatorna nincs be??ll??tva');
      }
    }
  };
bot.on('ready', () => {
var checkMe = ['ADMINISTRATOR','CREATE_INSTANT_INVITE','KICK_MEMBERS','BAN_MEMBERS','MANAGE_GUILD','ADD_REACTIONS','VIEW_AUDIT_LOG','PRIORITY_SPEAKER' ,'VIEW_CHANNEL','SEND_MESSAGES','SEND_TTS_MESSAGES','MANAGE_MESSAGES','READ_MESSAGE_HISTORY','MENTION_EVERYONE','USE_EXTERNAL_EMOJIS' ,'VIEW_GUILD_INSIGHTS','CONNECT','SPEAK','MUTE_MEMBERS','DEAFEN_MEMBERS','MOVE_MEMBERS','USE_VAD','CHANGE_NICKNAME','MANAGE_NICKNAMES','MANAGE_ROLES','MANAGE_WEBHOOKS','MANAGE_EMOJIS','STREAM','EMBED_LINKS','ATTACH_FILES','MANAGE_CHANNELS']  
  if(!checkMe.includes(PERMISSION)) {

  console.log(`??? FIGYELMEZTET??S: A 'PERMISSION' v??ltoz?? (${PERMISSION}) hib??s, k??rj??k, ellen??rizze, hogy megtal??lja az enged??lyek list??j??t... kil??p??s....`);
  process.exit(0);             
  }

})
  const UpdateEmbed = function() {
    let dot = TICK_N % 2 === 0 ? 'RP' : 'Roleplay';
    let embed = new Discord.MessageEmbed()
    .setAuthor(`${SERVER_NAME} | Szerver ??llapota`, SERVER_LOGO)
    .setColor(EMBED_COLOR)
    .setThumbnail(SERVER_LOGO)
    .setFooter(TICK_N % 2 === 0 ? `|| ${SERVER_NAME} ||` : `|| Edited by: .notixX???#9755 ||`)
    .setTimestamp(new Date())
    .addField('\n\u200b\nSzerver N??v', `\`\`\`${SERVER_NAME}\`\`\``,false)
    if (STATUS !== undefined)
    {
      embed.addField('???? Szerver ??rtes??t??s:',`\`\`\`${STATUS}\`\`\`\n\u200b\n`);
      embed.setColor('#00f931')
    }
    return embed;
  };

  const offline = function() {
    log(LOG_LEVELS.SPAM, Array.from(arguments));
    if (LAST_COUNT !== null) log(LOG_LEVELS.INFO,`Szerver offline ${URL_SERVER} (${URL_PLAYERS} ${URL_INFO})`);
    let embed = UpdateEmbed()
    .setColor(0xff0000)
    .setThumbnail(SERVER_LOGO)
    .addFields(
      { name: "Szerver ??llapota:",          value: "```??? Offline```",    inline: true },
      { name: "V??r??lista:",                value: "```--```",            inline: true },
      { name: "Online J??t??kos:",         value: "```--```\n\u200b\n",  inline: true },
      { name: "Szerver IP:",   value: "```N/A```",           inline: true },
      { name: "Szerver ??jraind??t??si id??k:",   value: "```N/A```",           inline: true }
    )
    sendOrUpdate(embed);
    LAST_COUNT = null;
  };

  const updateMessage = function() {
    getVars().then((vars) => {
      getPlayers().then((players) => {
        if (players.length !== LAST_COUNT) log(LOG_LEVELS.INFO,`${players.length} players`);
        let queue = vars['Queue'];
        let embed = UpdateEmbed()
        .addFields(
          { name: "Szerver ??llapota:",            value: "```??? Online```",                                                                                    inline: true },
          { name: "V??r??lista:",                  value: `\`\`\`${queue === 'Enabled' || queue === undefined ? '0' : queue.split(':')[1].trim()}\`\`\``,        inline: true },
          { name: "Online J??t??kos:",           value: `\`\`\`${players.length}/${MAX_PLAYERS}\`\`\`\n\u200b\n`,                                              inline: true },
          { name: "Szerver IP:",    value: `\`\`\`${SERVER_IP}\`\`\`\n\n`,                                                                        inline: true },
          { name: "Szerver ??jraind??t??si id??k:",    value: `\`\`\`${RESTART_TIMES}\`\`\``,                                                                        inline: true }
          )
        .setThumbnail(SERVER_LOGO)
        if (players.length > 0) {
          
          const fieldCount = 3;
          const fields = new Array(fieldCount);
          fields.fill('');
         
          fields[0] = `**__J??t??kosok:__**\n\n`;
          for (var i=0; i < players.length; i++) {
            fields[(i+1)%fieldCount] += `[${players[i].id}] **${players[i].name.substr(0,12)}**  *Ping: ${players[i].ping}ms*\n`; // first 12 characters of players name
          }
          for (var i=0; i < fields.length; i++) {
            let field = fields[i];
            if (field.length > 0) embed.addField('\u200b', field);
          }
        }
        sendOrUpdate(embed);
        LAST_COUNT = players.length;
      }).catch(offline);
    }).catch(offline);
    TICK_N++;
    if (TICK_N >= TICK_MAX) {
      TICK_N = 0;
    }
    for (var i=0;i<loop_callbacks.length;i++) {
      let callback = loop_callbacks.pop(0);
      callback();
    }
  };

  bot.on('ready',() => {
    log(LOG_LEVELS.INFO,`
   /////////////////////////////////////////////////////
   /////////////////////////////////////////////////////
    `)
    bot.user.setPresence({
      activity: {
          name: `${SERVER_NAME}`,
          type: "WATCHING"
      }, status: "online"
    })
  
    bot.setInterval(updateMessage, UPDATE_TIME);
  });

  function checkLoop() {
    return new Promise((resolve,reject) => {
      var resolved = false;
      let id = loop_callbacks.push(() => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        } else {
          log(LOG_LEVELS.ERROR, 'A loop visszah??v??sa id??t??ll??p??s ut??n');
          reject(null);
        }
      })
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      },3000);
    })
  }

  bot.on('debug',(info) => {
    log(LOG_LEVELS.SPAM,info);
  })

  bot.on('error',(error,shard) => {
    log(LOG_LEVELS.ERROR,error);
  })

  bot.on('warn',(info) => {
    log(LOG_LEVELS.DEBUG,info);
  })

  bot.on('disconnect',(devent,shard) => {
    log(LOG_LEVELS.INFO,'Disconnected');
    checkLoop().then((running) => {
      log(LOG_LEVELS.INFO, `Loop m??g fut : ${running}`);
    }).catch(console.error);
  })

  bot.on('reconnecting',(shard) => {
    log(LOG_LEVELS.INFO,'Reconnecting');
    checkLoop().then((running) => {
      log(LOG_LEVELS.INFO, `Loop m??g fut : ${running}`);
    }).catch(console.error);
  })

  bot.on('resume',(replayed,shard) => {
    log(LOG_LEVELS.INFO, `Resuming (${replayed} events replayed)`);
    checkLoop().then((running) => {
      log(LOG_LEVELS.INFO, `Loop m??g fut : ${running}`);
    }).catch(console.error);
  })

  bot.on('rateLimit',(info) => {
    log(LOG_LEVELS.INFO,`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout : 'Unknown timeout '}ms (${info.path} / ${info.requestLimit ? info.requestLimit : info.limit ? info.limit : 'Unkown limit'})`);
    if (info.path.startsWith(`/channels/${CHANNEL_ID}/messages/${MESSAGE_ID ? MESSAGE_ID : MESSAGE ? MESSAGE.id : ''}`)) bot.emit('restart');
    checkLoop().then((running) => {
      log(LOG_LEVELS.DEBUG,`Loop still running: ${running}`);
    }).catch(console.error);
  })
  bot.on('message', async function (msg) {
    
    if (msg.content === '+help') {
      if (msg.member.hasPermission(PERMISSION)) {
      let embed =  new Discord.MessageEmbed()
      .setAuthor(msg.member.nickname ? msg.member.nickname : msg.author.tag, msg.author.displayAvatarURL())
      .setColor(0x2894C2)
      .setTitle(`${SERVER_NAME} | Help`)
      .setDescription('+status <??zenet> - Figyelmeztet?? ??zenetet ad a szerver ??llapot be??gyaz??s??hoz\n+??llapot t??rl??se - T??rli a figyelmeztet?? ??zenetet\n+help - Megjelen??ti a bot parancsokat')
      .setTimestamp(new Date());
      msg.channel.send(embed)
    } else {
      let noPerms =  new Discord.MessageEmbed()
        .setAuthor(msg.member.nickname ? msg.member.nickname : msg.author.tag, msg.author.displayAvatarURL())
        .setColor(0x2894C2)
        .setTitle(`${SERVER_NAME} | Hiba`)
        .setDescription(`??? Nem rendelkezik a ${PERMISSION} jogosults??ggal, ez??rt nem tudja futtatni ezt a parancsot!`)
        .setTimestamp(new Date());
        msg.channel.send(noPerms)
    }
  } 
});
  bot.on('message', async function (msg) {
    if (msg.channel.id === '631992057417695272') {
        await msg.react(bot.emojis.cache.get('587057796936368128'));
        await msg.react(bot.emojis.cache.get('595353996626231326'));
    }
});

  bot.on('message',(message) => {
    if (!message.author.bot) {
      if (message.member) {
        
          if (message.content.startsWith('+status ')) {
            if (message.member.hasPermission(PERMISSION)) {
            let status = message.content.substr(7).trim();
            let embed =  new Discord.MessageEmbed()
            .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL())
            .setColor(EMBED_COLOR)
            .setTitle('?????? Friss??tett ??llapot??zenet')
            .setTimestamp(new Date());
            if (status === 'clear') {
              STATUS = undefined;
              embed.setDescription('Cleared status message');
            } else {
              STATUS = status;
              embed.setDescription(`??j ??zenet:\n\`\`\`${STATUS}\`\`\``);
            }
            bot.channels.cache.get(LOG_CHANNEL).send(embed);
            return log(LOG_LEVELS.INFO, `???? ${message.author.username} friss??tett ??llapot`);
          } else {
            let noPerms =  new Discord.MessageEmbed()
              .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL())
              .setColor(0x2894C2)
              .setTitle(`${SERVER_NAME} | Hiba`)
              .setDescription(`??? Nem rendelkezik a ${PERMISSION} jogosults??ggal, ez??rt nem tudja futtatni ezt a parancsot!`)
              .setTimestamp(new Date());
              message.channel.send(noPerms)
          }
        } 
        if (message.channel.id === SUGGESTION_CHANNEL) {
          let embed = new Discord.MessageEmbed()
          .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL())
          .setColor(0x2894C2)
          .setTitle('Suggestion')
          .setDescription(message.content)
          .setTimestamp(new Date());
          message.channel.send(embed).then((message) => {
            const sent = message;
            sent.react('????').then(() => {
              sent.react('????').then(() => {
                log(LOG_LEVELS.SPAM, 'K??sz javaslat ??zenet');
              }).catch(console.error);
            }).catch(console.error);
          }).catch(console.error);
          return message.delete();
        }
        if (message.channel.id === BUG_CHANNEL) {
          let embedUser = new Discord.MessageEmbed()
          .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL())
          .setColor(0x2894C2)
          .setTitle('Bug Report')
          .setDescription('Jelent??s??t sikeresen elk??ldt??k a szem??lyzetnek!')
          .setTimestamp(new Date());
          let embedStaff = new Discord.MessageEmbed()
          .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL())
          .setColor(0x2894C2)
          .setTitle('Bug Report')
          .setDescription(message.content)
          .setTimestamp(new Date());
          message.channel.send(embedUser).then(null).catch(console.error);
          bot.channels.cache.get(BUG_LOG_CHANNEL).send(embedStaff).then(null).catch(console.error);
          return message.delete();
        }
      }
    }
  });

  bot.login(BOT_TOKEN).then(null).catch(() => {
    log(LOG_LEVELS.ERROR, 'A megadott token ??rv??nytelen. K??rj??k, gy??z??dj??n meg arr??l, hogy a megfelel??t haszn??lja!');
    console.error(e);
    process.exit(1);
  });

  return bot;
}
