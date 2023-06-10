const fs = require('fs');
const keyboards = require('../../../keyboards/keyboards');
const messages = require('../../../messages/format');

const {getAllLinks, getLinkFromEntity} = require('../../utils/links');

const wwwDirWithPhone = p => `${process.env.WWW_DIR || 'data/links'}/${p}`;
const wwwDirWithUser = id => `${process.env.WWW_DIR || 'data/users'}/${id}`;
// const group = process.env.TGGROUP;
// const groupBugs = process.env.TGGROUPBUGS;

const IV_CHAN_ID = +process.env.IV_CHAN_ID;
const IV_CHAN_MID = +process.env.IV_CHAN_MID;
const USER_IDS = (process.env.USERIDS || '').split(',');

global.lastIvTime = +new Date();

const supportLinks = [process.env.SUP_LINK];

for (let i = 1; i < 10; i += 1) {
  if (process.env[`SUP_LINK${i}`]) {
    supportLinks.push(process.env[`SUP_LINK${i}`]);
  }
}

const support = async (ctx, botHelper) => {
  let system = JSON.stringify(ctx.message.from);
  const {
    chat: {id: chatId},
  } = ctx.message;

  if (USER_IDS.length && USER_IDS.includes(`${chatId}`)) {
    return;
  }
  try {
    const hide = Object.create(keyboards.hide());
    await ctx.reply(messages.support(supportLinks), {
      hide,
      disable_web_page_preview: true,
      parse_mode: botHelper.markdown(),
    });

    if (IV_CHAN_MID) {
      botHelper.forward(IV_CHAN_MID, IV_CHAN_ID * -1, chatId);
    }
  } catch (e) {
    system = `${e}${system}`;
  }
  botHelper.sendAdmin(`support ${system}`);
};

const startOrHelp = (ctx, botHelper) => {
  if (!ctx.message) {
    const {
      chat: {id: chatId},
    } = ctx.message;
    if (USER_IDS.length && USER_IDS.includes(`${chatId}`)) {
      return;
    }
  } else {
    const {
      chat: {id: chatId},
    } = ctx.message;
    if (USER_IDS.length && USER_IDS.includes(`${chatId}`)) {
      return;
    }
  }
  if (ctx && ctx.message.text && ctx.message.text.match(/\/start\s(.*?)/)) {
    const cmd = ctx.message.text.match(/\/start\s(.*?)$/)[1];
    if (cmd === 'support') {
      support(ctx, botHelper);
      return;
    }
  }
  let system = JSON.stringify(ctx.message.from);
  try {
    ctx.reply(messages.start(), keyboards.contact());
  } catch (e) {
    system = `${e}${system}`;
  }

  // eslint-disable-next-line consistent-return
  return botHelper.sendAdmin(system);
};

const mem = {};
const memPhones = {};
const memLinks = {};

const ADD_1 = 'ADD_1';
const ADD_2 = 'ADD_2';
const ADD_EXIT = 'ADD_EXIT';

const putLinks = id => `${memLinks[id].join('\n')}END`;

const format = (bot, botHelper) => {
  bot.command('start', ctx => startOrHelp(ctx, botHelper));
  const addToQueue = (ctx, matchPhone) => {
    try {
      const {update} = ctx;
      const {message} = update;
      const {text, from, contact, entities} = message;
      // console.log(ctx, matchPhone, entities);
      const {id} = from;
      let l = getAllLinks(text);

      if (entities) {
        const l2 = getLinkFromEntity(entities, text);
        if (l2 && l2.length) {
          l = l2;
        }
      }

      if (matchPhone) {
        let rep = messages.start2();
        let keyb = keyboards.contact();

        if (
          ctx.match &&
          ctx.match.input &&
          ctx.match.input.startsWith('/show')
        ) {
          const uDir = wwwDirWithUser(id);
          try {
            // show links
            let u = `${fs.readFileSync(uDir)}/from.json`;
            if (u) {
              u = JSON.parse(`${u}`);
              if (u.phone) {
                const linksDir = `${wwwDirWithPhone(u.phone)}/index.html`;
                const links = fs.readFileSync(linksDir);
                rep = `${links}`.replace('END', '');
              } else {
                rep = 'Ссылки не найдены';
              }
            }
            keyb = keyboards.nolinks();
          } catch (e) {
            console.log(e);
            rep = 'Ссылки не найдены';
          }
        }

        ctx.reply(rep, keyb);
        return;
      }

      if (contact) {
        if (id === contact.user_id) {
          memPhones[id] = contact.phone_number.replace('+', '');
        }
      }
      const phone = memPhones[id];
      // console.log(ctx, contact, phone, l, mem[id]);
      if (phone) {
        const [link] = l;
        memPhones[id] = phone;
        if (mem[id]) {
          if (mem[id] === ADD_1) {
            memLinks[id] = (memLinks[id] || []).concat(link);
            mem[id] = ADD_2;
            ctx.reply(messages.addLink2());
            return;
          }
          if (mem[id] === ADD_2) {
            mem[id] = ADD_EXIT;
            memLinks[id] = (memLinks[id] || []).concat(link);
            const linksDir = wwwDirWithPhone(phone);
            const userDir = wwwDirWithUser(id);
            // save file
            if (!fs.existsSync(linksDir)) {
              fs.mkdirSync(linksDir, {recursive: true});
            }
            // save user
            if (!fs.existsSync(userDir)) {
              fs.mkdirSync(userDir, {recursive: true});
            }
            fs.writeFileSync(`${linksDir}/index.html`, putLinks(id), 'utf8');
            fs.writeFileSync(
              `${userDir}/from.json`,
              JSON.stringify({...from, phone}),
            );
            ctx.reply(messages.completed(memPhones[id]));
          }
        } else {
          mem[id] = ADD_1;
          ctx.reply(messages.addLink1());
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  bot.hears(/7[0-9]{10}/, ctx => addToQueue(ctx, ctx.match && ctx.match[0]));
  bot.on('message', ctx => addToQueue(ctx));
};

module.exports = format;
