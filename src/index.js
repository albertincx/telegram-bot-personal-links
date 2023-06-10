// const express = require('express');
require('trace-unhandled/register');

const botRoute = require('./api/routes/botroute');
require('./config/vars');

const botInstance = require('./config/bot');

if (process.env.TBTKN && botInstance) {
  botRoute(botInstance);
}
console.info('started');
