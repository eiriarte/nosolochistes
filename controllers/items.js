const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash');
const categories = require('../models/categories.json');
const isGone = require('../config/gone');

exports.getItem = (req, res, next) => {
  const Chiste = mongoose.model('Chiste');
  Chiste.findOne({ _id: req.params.item }).lean().exec((err, chiste) => {
    if (err) return next(err);
    if (!chiste) {
      return res.status(404).render('404.html', { categories: categories });
    }
    addInfo([chiste]);
    res.render('chiste.html', { chiste: chiste, categories: categories });
  });
};

exports.getCategory = (req, res, next) => {
  const skip = Math.abs(+req.query.skip || 0);
  const query = getQuery({ categoria: req.params.categoria }, skip, '-fecha');
  query.exec((err, items) => {
    if (err) return next(err);
    if (!items || !items.length) {
      const statusCode = isGone(req.originalUrl) ? 410 : 404;
      return res.status(statusCode).render('404.html', { categories: categories });
    }
    addInfo(items);
    if (skip) {
      res.json(items);
    } else {
      res.render('categoria.html', {
        id: req.params.categoria,
        category: _.find(categories, { _id: req.params.categoria }),
        categories: categories,
        items: items,
      });
    }
  });
};

exports.getPortada = (req, res, next) => {
  const skip = Math.abs(+req.query.skip || 0);
  const query = getQuery({ portada: true }, skip, '-fecha');
  query.exec((err, items) => {
    if (err) return next(err);
    addInfo(items);
    if (skip) {
      res.json(items);
    } else {
      res.render('portada.html', {
        id: 'portada',
        categories: categories,
        items: items,
      });
    }
  });
};

exports.getBuenos = (req, res, next) => {
  const skip = Math.abs(+req.query.skip || 0);
  const query = getQuery({ valoracion: { $gt: 1 }}, skip, '-valoracion -fecha');
  query.exec((err, items) => {
    if (err) return next(err);
    addInfo(items);
    if (skip) {
      res.json(items);
    } else {
      res.render('buenos.html', {
        id: 'Chistes buenos',
        categories: categories,
        items: items,
      });
    }
  });
};

exports.getCortos = (req, res, next) => {
  const skip = Math.abs(+req.query.skip || 0);
  const query = getQuery({ corto: true }, skip, '-fecha');
  query.exec((err, items) => {
    if (err) return next(err);
    addInfo(items);
    if (skip) {
      res.json(items);
    } else {
      res.render('cortos.html', {
        id: 'Chistes cortos',
        categories: categories,
        items: items,
      });
    }
  });
};

exports.itemAction = (req, res, next) => {
  const Chiste = mongoose.model('Chiste');
  const update = { $inc: { }};
  const isDownVote = req.body.action === 'vdown';
  if (isDownVote) {
    update.$inc.downs = 1;
    update.$inc.valoracion = -1;
    if (req.body.reverse) update.$inc.ups = -1;
  } else {
    update.$inc.ups = 1;
    update.$inc.valoracion = 1;
    if (req.body.reverse) update.$inc.downs = -1;
  }
  Chiste.findByIdAndUpdate(req.params.item, update, { new: true }, (err, item) => {
    if (err) return next(err);
    if (!item) return res.status(500).json({ msg: 'No se ha encontrado el item. '});
    res.json({
      votes: isDownVote ? item.downs : item.ups,
      otherVotes: isDownVote ? item.ups : item.downs
    });
  })
};

function getQuery(conditions, skip, sort) {
  const Chiste = mongoose.model('Chiste');
  const select = '_id titulo texto autor fecha categoria ups downs';
  const query = Chiste.find(conditions).select(select).lean();
  if (skip) query.skip(skip);
  if (sort) query.sort(sort);
  return query.limit(20);
}

function addInfo(items) {
  if (!_.isArray(items)) return;
  items.forEach((item) => {
    const date = moment(item.fecha);
    let catInfo = _.find(categories, { _id: item.categoria });
    catInfo = _.omit(catInfo, ['volume', 'title']);
    item.categoria = catInfo;
    item.datetime = item.fecha && item.fecha.toISOString();
    item.fecha = date.format('D MMM YYYY');
  });
}
