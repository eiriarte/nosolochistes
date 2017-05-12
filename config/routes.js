const jsonParser = require('body-parser').json();
const items = require('../controllers/items');
const sitemap = require('../controllers/sitemap');
const redirs = require('../models/redirect.json');
const categories = require('../models/categories.json');
const config = require('./');
const log = require('./logger').log;
const isGone = require('./gone');

module.exports = (app) => {
  /*************************************************************************
   *  R E D I R E C C I O N E S
   */
  app.get('*', (req, res, next) => {
    let site;
    if (!req.secure && config.ssl) {
      site = config.production ? ('https://' + req.hostname) : config.appURL;
      return res.redirect(301, site + req.originalUrl);
    }
    next();
  });
  app.get('/tag/:tag', (req, res) => {
    const redir = redirs[req.params.tag];
    if (redir) {
      return res.redirect(301, redir);
    }
    res.redirect(301, '/chistes/' + req.params.tag);
  });
  app.get('/chistes-recientes', (req, res) => res.redirect(301, '/'));
  app.get('/index.php', (req, res) => res.redirect(301, '/'));
  app.get('/mejores-chistes', (req, res) => res.redirect(301, '/chistes-buenos'));


  /*************************************************************************
   *  P Á G I N A S
   */
  app.get('/', items.getPortada);
  app.get('/chistes-buenos', items.getBuenos);
  app.get('/chistes-cortos', items.getCortos);
  app.get('/chistes/:categoria', items.getCategory);
  app.get('/chiste/:item', items.getItem);
  app.get('/tipos-de-chistes', (req, res) => {
    res.render('categorias.html', { categories: categories });
  });

  app.post('/chiste/:item/action', jsonParser, items.itemAction);


  /*************************************************************************
   *  S I T E M A P
   */
  app.get('/sitemap.xml', sitemap.getSitemap);

  /*************************************************************************
   *  E R R O R   4 0 4
   */
  app.use((req, res) => {
    const statusCode = isGone(req.originalUrl) ? 410 : 404;
    res.status(statusCode).render('404.html', { categories: categories });
  });

  /*************************************************************************
   *  E R R O R   5 0 0
   */
  app.use(function (err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    log.error(err);
    if (req.xhr) {
      return res.status(500).json({ error: 'Algo ha fallado.'});
    }
    res.status(500).render('500.html');
  });
}
