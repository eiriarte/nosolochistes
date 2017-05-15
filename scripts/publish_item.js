var conn = new Mongo();
var db = conn.getDB('fch');

var item = db.cola.find().sort({ fecha: 1 }).limit(1).toArray()[0];

if (!item) quit();

item.fecha = new Date();
item.ups = 0;
item.downs = 0;
item.valoracion = 0;
if (item.texto.length <= 200) {
  item.corto = true;
}

db.chistes.insertOne(item);
db.cola.deleteOne({ _id: item._id });
