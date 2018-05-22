(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var btnSubmit = document.getElementById('submit');
    var cCount = document.querySelector('.ccount');
    btnSubmit.onclick = submit;
    document.getElementById('titulo').focus();

    document.getElementById('texto').onkeyup = function() {
      cCount.textContent = this.textLength;
    };
  });

  function submit() {
    var url = '/xnVYPqfZno4HDlTw6BbbjA5xwoYvqlfaYKtXZ1Jxj3z8/push';
    var form = document.getElementById('formChiste');
    var chiste = getForm();
    if (!chiste.titulo || !chiste._id || !chiste.texto ||
        chiste.categoria === 'null' || !chiste.autor) {
      alert('Todos los campos son obligatorios (menos tags)');
    } else {
      console.log(chiste);
      ajax(url, chiste, function (err, data) {
        if (err) {
          console.error(err);
          return alert('Se ha producido un error. Detalles en la consola.');
        }
        console.log('Respuesta del servidor', data);
        form.reset();
      });
    }
  }

  function getForm() {
    var chiste = {};
    var titulo = document.getElementById('titulo');
    var id = document.getElementById('_id');
    var texto = document.getElementById('texto');
    var categoria = document.getElementById('categoria');
    var autor = document.getElementById('autor');
    var tags = document.getElementById('tags');
    var portada = document.getElementById('portada');
    chiste.titulo = titulo.value.trim();
    chiste._id = id.value.trim();
    chiste.texto = texto.value.trim();
    chiste.categoria = categoria.value;
    if (tags.value.trim()) {
      chiste.tags = tags.value.trim().split(/\s*,\s*/g);
    }
    chiste.autor = autor.value.trim();
    chiste.portada = portada.checked;
    return chiste;
  }


  /*********************************************************************
   * AJAX
   */

  function ajax(url, data, callback) {
    var xhr = new XMLHttpRequest();

    if (!callback) {
      callback = data;
      data = null;
      xhr.open('GET', url, true);
    } else {
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      data = JSON.stringify(data);
    }

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 400) {
        // Success!
        try {
          var data = JSON.parse(xhr.responseText);
          callback(null, data);
        } catch (err) {
          callback(err);
        }
      } else {
        // We reached our target server, but it returned an error
        callback(xhr.status);
      }
    };

    xhr.onerror = function() {
      // There was a connection error of some sort
      callback('NETWORK_ERROR');
    };

    xhr.send(data);
  }
})();
