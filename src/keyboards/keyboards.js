const {Markup} = require('telegraf');

function hide() {
  return Markup.removeKeyboard();
}

function contact() {
  return {
    parse_mode: 'Markdown',
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: 'Поделиться номером',
            request_contact: true,
          },
        ],
        [
          {
            text: 'Отмена',
          },
        ],
      ],
      force_reply: true,
    },
    disable_web_page_preview: true,
  };
}

module.exports.hide = hide;
module.exports.contact = contact;
