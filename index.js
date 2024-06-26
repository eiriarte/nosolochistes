const express = require('express');
const http = require('http');
const path = require('path');
const favicon = require('serve-favicon');
const compression = require('compression');
const helmet = require('helmet');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const _ = require('lodash');
const moment = require('moment');
const config = require('./config');
const isBadRobot = require('./config/robots');
const routes = require('./config/routes');
const logger = require('./config/logger');
const log = logger.log;

mongoose.Promise = global.Promise;
mongoose.connect(config.dbURI, { useMongoClient: true });
const db = mongoose.connection;

moment.locale('es');

db.on('error', () => {
  log.error({ msg: 'No se pudo conectar a la base de datos.' });
});

db.once('open', () => {
  const app = express();
  require('./models/items.js');
  require('./models/cola.js');

  nunjucks.configure('views', {
    autoescape: true,
    trimBlocks: true,
    watch: config.watchTemplates,
    express: app
  });

  app.use((req, res, next) => {
    const ua = req.get('User-Agent');
    if (isBadRobot(ua)) {
      if (_.isObject(req.connection) && _.isFunction(req.connection.end)) {
        setTimeout(() => req.connection.end(), 5000);
      }
      return;
    }
    next();
  });
  app.use(compression());
  app.use(helmet({
    expectCt: {
      enforce: true,
      maxAge: 86400,
      reportUri: 'https://fch0.report-uri.com/r/d/ct/enforce'
    }
  }));
  app.use(express.static(config.root + config.statics));
  app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));
  app.use(logger.logRequest);
  app.set('trust proxy', true);

  routes(app);

  const httpServer = http.createServer(app).listen(config.port, () => {
    let msg = `Servidor activo en puertos ${config.port}, ${config.sslPort}.`;
    msg += ' Entorno: ' + (config.production ? 'PRODUCCIÓN' : 'DESARROLLO');
    log.info({ msg: msg });
    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);
  });

  function exit() {
    setTimeout(() => process.exit(0), 15000);
    log.info({ msg: 'Desconectando la base de datos…' });
    db.close(() => {
      log.info({ msg: 'Cerrando los servidores…' });
      httpServer.close(() => {
        if (config.production) {
          log.info({ msg: 'Cerrando conexión con LogEntries…' });
          log.once('buffer drain', () => {
            log.closeConnection();
            log.on('disconnected', () => {
              process.exit(0);
            });
          });
        } else {
          process.exit(0);
        }
      });
    });
  }

});
