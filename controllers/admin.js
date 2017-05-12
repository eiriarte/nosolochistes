const mongoose = require('mongoose');

exports.newItem = (req, res, next) => {
  res.render('admin/new.html');
};

exports.pushItem = (req, res, next) => {
  const Cola = mongoose.model('Cola'), item = req.body;

  if (item.texto && item.texto.length <= 200) item.corto = true;

  const nuevoChiste = new Cola(item);
  
  nuevoChiste.save(function(err, chiste) {
    if (err) return next(err);
    res.json(chiste);
  })
};
