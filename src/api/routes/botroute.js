const fs = require('fs');

const BotHelper = require('../utils/bot');
const format = require('./format');

global.skipCount = 0;

const filepath = 'count.txt';
if (!fs.existsSync(filepath)) {
  fs.writeFileSync(filepath, '0');
}

let skipCount;

let startCnt = parseInt(`${fs.readFileSync('count.txt')}`, 10);

let limit90Sec = 0;

const botRoute = bot => {
  const botHelper = new BotHelper(bot.telegram);

  bot.catch(e => {
    if (limit90Sec > 5) {
      botHelper.sendError(`${e} Unhandled 90000 Restarted`);
      setTimeout(() => {
        botHelper.restartApp();
      }, 4000);
      return;
    }
    if (`${e}`.match('out after 90000 milliseconds')) {
      limit90Sec += 1;
    } else {
      botHelper.sendError(`${e} Unhandled x`);
    }
  });

  bot.command('srv', ({message}) => {
    if (botHelper.isAdmin(message.from.id)) {
      botHelper.sendAdmin(`srv: ${JSON.stringify(message)}`);
    }
  });

  bot.command('restartApp', ({message}) => {
    if (botHelper.isAdmin(message.from.id)) {
      botHelper.restartApp();
    }
  });

  bot.command('gitPull', ({message}) => {
    if (botHelper.isAdmin(message.from.id)) {
      botHelper.gitPull();
    }
  });

  process.on('unhandledRejection', reason => {
    if (`${reason}`.match('bot was blocked by the user')) {
      return;
    }
    if (`${reason}`.match(BotHelper.BANNED_ERROR)) {
      return;
    }
    botHelper.sendAdmin(`unhandledRejection: ${reason}`);
  });

  format(bot, botHelper, skipCount);

  bot.launch();

  if (startCnt % 10 === 0 || process.env.DEV) {
    botHelper.sendAdmin(`started ${startCnt} times`);
  }

  startCnt += 1;
  if (startCnt >= 500) startCnt = 0;

  fs.writeFileSync(filepath, parseInt(startCnt, 10).toString());
  return {bot: botHelper};
};

module.exports = botRoute;
