const mongoose = require('mongoose');

exports.newItem = (req, res) => {
  res.render('admin/new.html');
};

exports.pushItem = (req, res, next) => {
  const Cola = mongoose.model('Cola'), item = req.body;

  if (item.texto && item.texto.length <= 200) item.corto = true;

  const nuevoChiste = new Cola(item);

  nuevoChiste.save(function(err, chiste) {
    if (err) return next(err);
    res.json(chiste);
  });
};

exports.updateItem = (req, res, next) => {
  const Chiste = mongoose.model('Chiste'), item = req.body;
  const itemId = item._id;
  delete item._id;

  item.corto = (item.texto && item.texto.length <= 200);

  Chiste.findByIdAndUpdate(itemId, item, { lean: true, new: true }, function(err, chiste) {
    if (err) return next(err);
    res.json(chiste);
  });
};
