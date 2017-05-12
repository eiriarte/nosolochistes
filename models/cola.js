const mongoose = require('mongoose');

const colaSchema = mongoose.Schema({
  _id: String, // slug
  texto: { type: String, trim: true, required: true },
  titulo: { type: String, required: true },
  categoria: String,
  tags: { type: [String] },
  autor: String,
  portada: { type: Boolean, index: true },
  fecha: { type: Date, required: true, index: true, default: Date.now },
  corto: Boolean
});

mongoose.model('Cola', colaSchema, 'cola');
