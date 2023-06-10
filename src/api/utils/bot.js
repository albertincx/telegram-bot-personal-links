const fs = require('fs');

const TG_ADMIN = () => parseInt(process.env.TGADMIN, 10);

const PARSE_MODE_MARK = 'Markdown';

const BANNED_ERROR = 'USER_BANNED_IN_CHANNEL';
const RIGHTS_ERROR = 'need administrator rights in the channel chat';

class BotHelper {
  constructor(bot) {
    this.bot = bot;
    let c = {no_puppet: false};
    try {
      c = JSON.parse(`${fs.readFileSync('.conf/config.json')}`);
    } catch (e) {
      //
    }
    this.config = c;
    this.tgAdmin = TG_ADMIN();
  }

  isAdmin(chatId) {
    return chatId === this.tgAdmin;
  }

  botMes(chatId, text, mark = true) {
    let opts = {};
    if (mark) {
      opts = {parse_mode: PARSE_MODE_MARK};
    }
    return this.bot
      .sendMessage(chatId, text, opts)
      .catch(e => this.sendError(e, `${chatId}${text}`));
  }

  sendAdmin(textParam, chatIdParam = '', mark = false) {
    let chatId = chatIdParam;
    let text = textParam;
    let opts = {};
    if (mark === true) {
      opts = {
        parse_mode: PARSE_MODE_MARK,
        disable_web_page_preview: true,
      };
    }
    if (!chatId) {
      chatId = TG_ADMIN();
    }
    if (`${chatId}` === `${this.tgAdmin}`) {
      text = `service: adm ${text}`;
    }
    return this.bot.sendMessage(chatId, text, opts).catch(() => {});
  }

  sendError(error, text = '') {
    let e = error;
    if (typeof e === 'object' && !global.isDevEnabled) {
      if (e.response && typeof e.response === 'object') {
        e = e.response.description || 'unknown error';
        if (e.match(BANNED_ERROR) || e.match(RIGHTS_ERROR)) {
          return;
        }
      }
    } else {
      e = `has error: ${JSON.stringify(e)} ${e.toString()} ${text}`;
    }

    this.sendAdmin(e);
  }

  forward(mid, from, to) {
    return this.bot.forwardMessage(to, from, mid).catch(() => {
      //
    });
  }

  // eslint-disable-next-line class-methods-use-this
  markdown() {
    return PARSE_MODE_MARK;
  }

  // eslint-disable-next-line class-methods-use-this
  restartApp() {
    // eslint-disable-next-line global-require
    const {spawn} = require('child_process');
    spawn('pm2', ['restart', process.env.APP_NAME], {
      stdio: 'ignore',
      detached: true,
    }).unref();
    this.sendAdmin('restarted');
  }

  gitPull() {
    // eslint-disable-next-line global-require
    const {spawn} = require('child_process');
    const gpull = spawn('git', ['pull']);
    const rest = spawn('pm2', ['restart', process.env.APP_NAME]);
    gpull.stdout.pipe(rest.stdin);
    rest.stdout.on('data', data => {
      this.sendAdmin(data);
    });
  }
}

module.exports = BotHelper;
module.exports.BANNED_ERROR = BANNED_ERROR;
