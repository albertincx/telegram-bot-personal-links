const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv-safe');

const root = path.join(__dirname, '/../../');

const envPath = path.join(root, '.env');

const envSample = path.join(root, '.env.example');
const dataDir = path.join(root, 'data');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

if (fs.existsSync(envPath)) {
  dotenv.config({
    allowEmptyValues: true,
    path: envPath,
    sample: envSample,
  });
}
module.exports = {
  root,
  dataDir,
  mongo: {
    uri: process.env.MONGO_URI,
    disabled: process.env.DB_DISABLED === '1',
  },
};
