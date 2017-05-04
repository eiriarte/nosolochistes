const mongoose = require('mongoose');

const chisteSchema = mongoose.Schema({
  _id: String, // slug
  titulo: { type: String, required: true },
  texto: { type: String, trim: true, required: true },
  autor: String,
  fecha: { type: Date, required: true, index: true, default: Date.now },
  tags: { type: [String], select: false },
  categoria: String,
  ups: Number,
  downs: Number,
  valoracion: { type: Number, index: true },
  portada: { type: Boolean, index: true },
  corto: { type: Boolean, index: true }
});

mongoose.model('Chiste', chisteSchema);
