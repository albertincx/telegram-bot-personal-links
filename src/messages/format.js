const SITE_NAME = () => process.env.SITE_NAME || '';

module.exports = {
  start: () => `Привет Я бот для создания страницы с ссылками на донаты. 
Пока ты можешь добавить 2 ссылки и тебя смогут найти на сайте ${SITE_NAME()} и скинуть доп донат!
  
Чтобы люди увидели твои ссылки
1. Пришли номер телефона
2. Пришли первую ссылку например от сбера https://pay.mysbertips.ru/13800000
3. Пришли вторую ссылку например от тинкофф https://cloudtips.ru/donations.
4. Нажать готово!

Теперь твои ссылки смогут найти на сайте ${SITE_NAME()} по номеру телефона
`,
  start2: () => 'Пришли номер телефона, нажми внизу на кнопку',
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
  addLink1: () => 'Пришли первую ссылку',
  addLink2: () => 'Пришли вторую ссылку',
  completed: p =>
    `Готово, теперь любой желающий сможет найти ссылки на сайте ${SITE_NAME()}
Ваша ссылка тут \n${SITE_NAME()}/${p}

Просмотреть нажмите \n/show${p}

Перезаписать ссылки нажмите \n/start`,
  cancel: () => 'Отменено, нажмите /start чтобы начать.',
};
