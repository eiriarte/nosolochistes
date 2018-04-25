(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var cookieConsent = document.querySelector('.cconsent');
    var cconsentFlagURL = 'https://d2pcbc801cuv3o.cloudfront.net/cconsent.json';
    var btnMenu = document.getElementById('btn-menu');
    var mobileMenu = document.getElementById('nav-menu');

    showTOC();

    btnMenu.onclick = function() {
      toggleMenu(btnMenu, mobileMenu);
    };

    // Cookie Law
    if (!localStorage || !localStorage.getItem('fch-cc')) {
      // Comprobamos si puede acceder a una URL georestringida a la UE
      ajax(cconsentFlagURL, function(error, data) {
        if (data && data.location === 'europe') {
          // Mostrar el aviso de cookies
          cookieConsent.className += ' visible';
          document.querySelector('.cconsent .close').onclick = function() {
            // Ocultar el aviso de cookies
            cookieConsent.className = 'cconsent';
            // No mostrar más veces
            if (localStorage) localStorage.setItem('fch-cc', '1');
          }
        } else {
          // No intentar mostrar más veces
          if (localStorage) localStorage.setItem('fch-cc', '1');
        }
      });
    }
  });

  function showTOC() {
    var sections, toc = document.querySelector('.toc');
    if (toc) {
      list = document.createElement('ol');
      sections = document.querySelectorAll('article>h2');
      for (var i = 0; i < sections.length; i++) {
        var link = document.createElement('a');
        link.textContent = sections[i].textContent;
        link.setAttribute('href', '#' + sections[i].id);
        list.appendChild(document.createElement('li')).appendChild(link);
      }
      toc.appendChild(document.createElement('h2')).textContent = toc.title;
      toc.appendChild(list);
    }
  }

  /**
  * Despliega/oculta el menú (o menús)
  * @param {object}<Element> btn - Botón que causa el despliegue/ocultación
  * @param {object}<Element> menu - Menú que se despliega/oculta
  */
  function toggleMenu(btn, menu) {
    if ( -1 !== menu.className.indexOf( 'open' ) ) {
      menu.className = menu.className.replace( ' open', '' );
      btn.className = btn.className.replace( ' open', '' );
      btn.setAttribute( 'aria-expanded', 'false' );
      menu.setAttribute( 'aria-expanded', 'false' );
    } else {
      menu.className += ' open';
      btn.className += ' open';
      btn.setAttribute( 'aria-expanded', 'true' );
      menu.setAttribute( 'aria-expanded', 'true' );
    }
  }

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
