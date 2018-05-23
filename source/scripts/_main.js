(function() {
  var ups, downs;

  document.addEventListener('DOMContentLoaded', function() {
    var btnMenu = document.getElementById('btn-menu');

    btnMenu.onclick = function() { toggleMenu(btnMenu); };
    document.querySelectorAll('.btn.expand-share').forEach(expandShare);

    loadVotes();
    updateButtons();
    addVoteListeners();
    showCookieConsent();
  });

  // Expandir la botonera social de un item
  function expandShare(btn) {
    if (!btn.onclick) btn.onclick = function() {
      toggleMenu(btn);
      var cardId = btn.dataset.cardId;
      var edge = document.querySelector('.share').getBoundingClientRect().top;
      var card = document.getElementById(cardId);
      var cardBottom = card.getBoundingClientRect().bottom + 16;
      var offset = edge - cardBottom;
      var firstButton = document.getElementById('share:' + cardId)
        .querySelector('button');
      if (offset < 0) {
        window.scrollBy(0, -offset);
      }
      firstButton.focus();
    };
  }


  // ----------------------------------------------------------------------------
  // VOTACIÓN DE ITEMS
  // ----------------------------------------------------------------------------

  function loadVotes() {
    ups = JSON.parse(localStorage.getItem('fch-ups') || '[]');
    downs = JSON.parse(localStorage.getItem('fch-downs') || '[]');
  }

  function saveVotes() {
    localStorage.setItem('fch-ups', JSON.stringify(ups));
    localStorage.setItem('fch-downs', JSON.stringify(downs));
  }

  function vote(action, id) {
    var add = (action === 'vup') ? ups : downs;
    var remove = (action === 'vup') ? downs : ups;
    var idx = remove.indexOf(id);
    if (idx !== -1) {
      remove.splice(idx, 1);
    }
    add.push(id);
    saveVotes();
    updateButtons();
    return (idx !== -1);
  }

  function updateButtons() {
    ups.forEach(pressVoteBtn('vup', 'vdown'));
    downs.forEach(pressVoteBtn('vdown', 'vup'));
  }

  function pressVoteBtn(action, other) {
    return function(id) {
      var press = document.getElementById(action + ':' + id);
      var unPress = document.getElementById(other + ':' + id);
      if (!press || press.classList.contains('pressed')) return;
      press.className += ' pressed';
      press.setAttribute('aria-pressed', 'true');
      unPress.className = unPress.className.replace( ' pressed', '' );
      unPress.setAttribute('aria-pressed', 'false');
    };
  }

  function addVoteListeners() {
    document.querySelectorAll('.btn.vote').forEach(function(btn) {
      if (!btn.onclick) btn.onclick = voteListener;
    });
  }

  function voteListener() {
    var params = this.id.split(':');
    var action = params[0];
    var other = (action === 'vup') ? 'vdown' : 'vup';
    var id = params[1];
    var url = '/chiste/' + id + '/action';
    var that = this;
    var reverse; // Booleano que indica si el voto ha revertido uno anterior

    if (this.classList.contains('pressed')) return;

    reverse = vote(action, id);

    ajax(url, { action: action, reverse: reverse }, function(err, data) {
      var otherBtn = document.getElementById(other + ':' + id);
      if (err) return console.error(err);
      that.querySelector('.nvotes').textContent = data.votes;
      otherBtn.querySelector('.nvotes').textContent = data.otherVotes;
    });

    ga('send', {
      hitType: 'event',
      eventCategory: 'Chiste',
      eventAction: (action === 'vup') ? 'Me Gusta' : 'No Me Gusta',
      eventLabel: id
    });
  }


  // ----------------------------------------------------------------------------
  // VARIOS GENÉRICOS
  // ----------------------------------------------------------------------------

  // Despliege accesible de un desplegable controlado por botón
  function toggleMenu(btn) {
    var menu = document.getElementById(btn.getAttribute('aria-controls'));
    if (btn.getAttribute('aria-expanded') === 'true') {
      btn.setAttribute( 'aria-expanded', 'false' );
      menu.setAttribute( 'aria-expanded', 'false' );
    } else {
      btn.setAttribute( 'aria-expanded', 'true' );
      menu.setAttribute( 'aria-expanded', 'true' );
    }
  }

  // Muestra el jodido aviso de cookies
  function showCookieConsent() {
    var cookieConsent = document.querySelector('.cconsent');
    var cconsentFlagURL = 'https://d2pcbc801cuv3o.cloudfront.net/cconsent.json';

    if (!localStorage || !localStorage.getItem('duendes-cc')) {
      // Comprobamos si puede acceder a una URL georestringida a la UE
      ajax(cconsentFlagURL, function(error, data) {
        if (data && data.location === 'europe') {
          // Mostrar el aviso de cookies
          cookieConsent.className += ' visible';
          document.querySelector('.cconsent .close').onclick = function() {
            // Ocultar el aviso de cookies
            cookieConsent.className = 'cconsent';
            // No mostrar más veces
            if (localStorage) localStorage.setItem('duendes-cc', '1');
          };
        } else {
          // No intentar mostrar más veces
          if (localStorage) localStorage.setItem('duendes-cc', '1');
        }
      });
    }
  }


  // Petición/envío vía AJAX
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
