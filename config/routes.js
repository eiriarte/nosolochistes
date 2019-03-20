const slashes = require('connect-slashes');
const jsonParser = require('body-parser').json();
const items = require('../controllers/items');
const blog = require('../controllers/blog');
const admin = require('../controllers/admin');
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
  app.use(slashes(false));

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
    res.status(410).render('404.html', { categories: categories });
  });
  app.get('/chistes-recientes', (req, res) => res.redirect(301, '/'));
  app.get('/index.php', (req, res) => res.redirect(301, '/'));
  app.get('/avisos.php', (req, res) => res.redirect(301, '/aviso'));
  app.get('/mejores-chistes', (req, res) => res.redirect(301, '/chistes-buenos'));


  /*************************************************************************
   *  P Á G I N A S
   */
  app.get('/', items.getPortada);
  app.get('/pag/:page', items.getPortada);
  // TODO: */pag/1 => 301: sin /pag/1
  app.get('/chistes-buenos', items.getBuenos);
  app.get('/chistes-buenos/pag/:page', items.getBuenos);
  app.get('/chistes-cortos', items.getCortos);
  app.get('/chistes-cortos/pag/:page', items.getCortos);
  app.get('/chistes/:categoria', items.getCategory);
  app.get('/chistes/:categoria/pag/:page', items.getCategory);
  app.get('/chiste/:item', items.getItem);
  app.get('/tipos-de-chistes', (req, res) => {
    res.render('categorias.html', { categories: categories });
  });
  app.get('/aviso', (req, res) => { res.render('avisos.html'); });
  app.get('/contacto', (req, res) => { res.render('contacto.html'); });
  app.get('/acerca-de', (req, res) => { res.render('acerca.html'); });
  app.get('/blog', blog.index);
  app.get('/:categoria', blog.category);
  app.get('/:categoria/:entrada', blog.post);

  app.post('/chiste/:item/action', jsonParser, items.itemAction);

  /*************************************************************************
   *  A D M I N I S T R A C I Ó N
   */
  app.get('/xnVYPqfZno4HDlTw6BbbjA5xwoYvqlfaYKtXZ1Jxj3z8/new', admin.newItem);
  app.post('/xnVYPqfZno4HDlTw6BbbjA5xwoYvqlfaYKtXZ1Jxj3z8/push', jsonParser, admin.pushItem);
  app.post('/xnVYPqfZno4HDlTw6BbbjA5xwoYvqlfaYKtXZ1Jxj3z8/update', jsonParser, admin.updateItem);
  app.get('/xnVYPqfZno4HDlTw6BbbjA5xwoYvqlfaYKtXZ1Jxj3z8/reset', blog.reset);

  /*************************************************************************
   *  S I T E M A P
   */
  app.get('/joke_sitemap.xml', sitemap.getSitemap);

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
};
