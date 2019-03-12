const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const defaults = {
  production: false,
  root: rootPath,
  statics: '/static'
};

const config = {
  'production': {
    production: true,
    appURL: 'https://nosolochistes.com',
    dbURI: 'mongodb://localhost/fch',
    port: 9000,
    watchTemplates: false
  },
  'development': {
    appURL: 'http://localhost:3000',
    dbURI: 'mongodb://localhost/fch',
    port: 3000,
    watchTemplates: true
  }
};

module.exports = Object.assign({}, defaults, config[env]);
