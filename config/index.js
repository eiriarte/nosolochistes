const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const defaults = {
  production: false,
  root: rootPath,
  statics: '/static',
};

const config = {
  production: {
    production: true,
    appURL: 'https://nosolochistes.com',
    dbURI: process.env.MONGO_URL,
    port: 9000,
    watchTemplates: false,
  },
  development: {
    appURL: 'http://localhost:9000',
    dbURI: process.env.MONGO_URL,
    port: 9000,
    watchTemplates: true,
  },
};

module.exports = Object.assign({}, defaults, config[env]);
