const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const defaults = {
  production: false,
  root: rootPath,
  statics: '/static'
}

const config = {
  "production": {
    production: true,
    ssl: true,
    sslCert: '../_ssl/cert.pem',
    sslKey: '../_ssl/key.pem',
    appURL: 'https://feti-chistes.es',
    dbURI: 'mongodb://localhost/fch',
    port: 80,
    sslPort: 443,
    watchTemplates: false
  },
  "development": {
    // ssl: true,
    sslCert: '../_ssl/test/cert.pem',
    sslKey: '../_ssl/test/key.pem',
    appURL: 'https://localhost:3443',
    dbURI: 'mongodb://localhost/fch',
    port: 3000,
    sslPort: 3443,
    watchTemplates: true
  }
}

module.exports = Object.assign({}, defaults, config[env]);
