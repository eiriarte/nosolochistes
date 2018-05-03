const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('../config');

exports.getSitemap = (req, res, next) => {
  const Chiste = mongoose.model('Chiste');
  const select = 'fecha categoria portada corto valoracion';
  const query = Chiste.find({ }).select(select).sort('-fecha').lean();
  query.exec((err, items) => {
    if (err) return next(err);
    res.
      type('application/xml').
      render('joke_sitemap.xml', { urlset: getSitemapItems(items) });
  });
};

function getSitemapItems(items) {
  const result = [];
  const urls = new Map();
  let bestVal = 0, bestDate;
  if (_.isArray(items)) {
    items.forEach((item) => {
      if (!urls.has(item.categoria)) {
        result.push({
          loc: config.appURL + '/chistes/' + item.categoria,
          lastmod: lastMod(item.fecha)
        });
        urls.set(item.categoria, true);
      }
      if (item.portada && !urls.has('portada')) {
        result.unshift({
          loc: config.appURL + '/',
          lastmod: lastMod(item.fecha)
        });
        urls.set('portada', true);
      }
      if (item.corto && !urls.has('cortos')) {
        result.unshift({
          loc: config.appURL + '/chistes-cortos',
          lastmod: lastMod(item.fecha)
        });
        urls.set('cortos', true);
      }
      if (item.valoracion > bestVal) {
        bestVal = item.valoracion;
        bestDate = item.fecha;
      }
    });
    result.unshift({
      loc: config.appURL + '/chistes-buenos',
      lastmod: lastMod(bestDate)
    });
    result.unshift({
      loc: config.appURL + '/tipos-de-chistes',
      lastmod: lastMod()
    });
  }
  return result;
}

function lastMod(fecha) {
  const launch = new Date(2017, 4, 30);
  let date = launch;
  if (_.isDate(fecha) && fecha > launch)  {
    date = fecha;
  }
  return date.toISOString();
}
