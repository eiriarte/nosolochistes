(function() {
  var itemsPerPage = 20;
  var numPage = 1;
  var loadingPage = false;
  var endReached = false;
  var loader;
  
  document.addEventListener('DOMContentLoaded', function() {
    var btnMenu = document.getElementById('btn-menu');
    var mobileMenu = document.getElementById('nav-menu');
    loader = document.querySelector('.loader');
    btnMenu.onclick = function() {
      toggleMenu(btnMenu, mobileMenu);
    };
    window.onscroll = function() {
      if (endReached || loadingPage) return;
      if (window.pageYOffset <
        document.body.scrollHeight - window.innerHeight - 200) return;
      setLoading(true);
      loadItems();
    }
  });

  function setLoading(loading) {
    loadingPage = loading;
    if (!loader) return;
    if (loading) {
      loader.className += ' show';
    } else {
      loader.className = loader.className.replace(' show', '');
    }
  }

  function loadItems() {
    var url, numItems = document.querySelectorAll('article').length;
    if (numItems < itemsPerPage) {
      endReached = true;
      setLoading(false);
      return;
    }
    url = window.location.pathname + '?skip=' + numItems;
    ajax(url, function(err, data) {
      if (err) {
        endReached = true;
        setLoading(false);
        console.error(err);
        return;
      }
      setLoading(false);
      addItems(data);
      if (data.length < 20) endReached = true;
    });
  }

  function addItems(items) {
    var page, template;
    if (typeof items !== 'object' || !items.length) return;
    page = document.createElement('section');
    template = document.querySelector('article');
    items.forEach(function(item) {
      var clone = template.cloneNode(true);
      var catLink = clone.querySelector('.category a');
      var date = clone.querySelector('.date');
      clone.querySelector('.title').textContent = item.titulo;
      clone.querySelector('.name').textContent = item.autor;
      date.setAttribute('datetime', item.datetime);
      date.textContent = item.fecha;
      if (catLink) {
        catLink.textContent = item.categoria.menu;
        catLink.setAttribute('href', '/chistes/' + item.categoria._id);
      }
      nl2br(clone.querySelector('.text'), item.texto);
      page.appendChild(clone);
    });
    document.querySelector('main').insertBefore(page, loader);
    numPage++;
    ga('send', {
      hitType: 'event',
      eventCategory: 'Página',
      eventAction: 'avance',
      eventValue: numPage
    });
  }

  function nl2br(textElement, str) {
    textElement.textContent = '';
    str.split(/\r\n|\n/).forEach(function(line, i) {
      if (i > 0) {
        textElement.appendChild(document.createElement('br'));
      }
      textElement.appendChild(document.createTextNode(line));
    });
  }

  /**
  * Despliega/oculta el menú (o menús)
  * @param {object}<Element> btn - Botón que causa el despliegue/ocultación
  * @param {object}<Element> menu - Menú que se despliega/oculta
  */
  function toggleMenu(btn, menu) {
    if ( -1 !== menu.className.indexOf( 'toggled' ) ) {
      menu.className = menu.className.replace( ' toggled', '' );
      btn.setAttribute( 'aria-expanded', 'false' );
      menu.setAttribute( 'aria-expanded', 'false' );
    } else {
      menu.className += ' toggled';
      btn.setAttribute( 'aria-expanded', 'true' );
      menu.setAttribute( 'aria-expanded', 'true' );
    }
  }

  function ajax(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

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

    xhr.send();
  }
})();
