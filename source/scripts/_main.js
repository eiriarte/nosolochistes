(function() {
  var ups, downs;
  var bgModal, shareModal, btnCopyLink, prevFocus, cpLinkTitle, cpLinkInput;
  var btnCloseModal, msgCopied;
  var shareURL = {
    'Twitter': 'https://twitter.com/intent/tweet?text=%tw_text%&url=%url%&via=feti_chistes&hashtags=chistes',
    'Facebook': 'https://www.facebook.com/sharer/sharer.php?u=%url%',
    'Google+': 'https://plus.google.com/share?url=%url%',
    'WhatsApp': 'https://api.whatsapp.com/send?text=%text%%20%url%'
  };
  var shareUTM = {
    'Twitter': 'utm_source=twitter&utm_medium=social&utm_campaign=fchtoolbar',
    'Facebook': 'utm_source=facebook&utm_medium=social&utm_campaign=fchtoolbar',
    'Google+': 'utm_source=gplus&utm_medium=social&utm_campaign=fchtoolbar',
    'WhatsApp': 'utm_source=whatsapp&utm_medium=social&utm_campaign=fchtoolbar'
  };

  document.addEventListener('DOMContentLoaded', function() {
    var btnMenu = document.getElementById('btn-menu');
    bgModal = document.querySelector('.popup-bg');
    shareModal = document.querySelector('.popup');
    btnCopyLink = document.querySelector('.btn-copy-link');
    btnCloseModal = document.querySelector('.btn-close-copy');
    msgCopied = document.querySelector('.msg-copied');
    cpLinkTitle = document.getElementById('link-title');
    cpLinkInput = document.getElementById('link-input');

    document.body.onkeydown = onKeyDown;
    btnCopyLink.onclick = copyLink;
    btnCloseModal.onclick = closeModal;
    btnMenu.onclick = function() { toggleMenu(btnMenu); };
    document.querySelectorAll('.btn.expand-share').forEach(expandShare);
    document.querySelectorAll('.btn-social').forEach(function(btn) {
      btn.onclick = btn.title === 'Copiar enlace' ?
        function() { linkShare(btn); } :
        function() { socialShare(btn); };
    });

    loadVotes();
    updateButtons();
    addVoteListeners();
    showCookieConsent();
  });

  // TODO: Añadir a /blog/* → blog_base.html, _share.scss→blog.scss, _blog.js
  // TODO: probar en posts

  // ----------------------------------------------------------------------------
  // EMERGENTE
  // ----------------------------------------------------------------------------

  // Accesibilidad del emergente: teclas Esc y Tab
  function onKeyDown(e) {
    if (!bgModal.classList.contains('visible')) return;
    var CODE_ESC = 27;
    var CODE_TAB = 9;
    var key = e.key || e.keyCode;

    if (key === CODE_ESC || key === 'Escape') {
      closeModal();
    } else if (key == CODE_TAB || key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === btnCloseModal) {
          e.preventDefault();
          btnCopyLink.focus();
        }
      } else {
        if (document.activeElement === btnCopyLink) {
          e.preventDefault();
          btnCloseModal.focus();
        }
      }
    }
  }

  // Botón cerrar-emergente
  function closeModal() {
    bgModal.classList.remove('visible');
    shareModal.classList.remove('visible');
    prevFocus.focus();
  }

  // Botón copiar-enlace
  function copyLink() {
    cpLinkInput.select();
    if (document.execCommand('copy')) {
      msgCopied.setAttribute('aria-hidden', 'false');
      msgCopied.setAttribute('role', 'alert');
      msgCopied.classList.add('visible');
      setTimeout(function() {
        msgCopied.classList.remove('visible');
        msgCopied.setAttribute('aria-hidden', 'true');
        msgCopied.removeAttribute('role');
      }, 2000);
      ga('send', {
        hitType: 'event',
        eventCategory: cpLinkInput.value.indexOf('/chiste/') !== -1
          ? 'Chiste' : 'Categoría',
        eventAction: 'Copiar Enlace',
        eventLabel: cpLinkInput.value.split('/').pop()
      });
    }
  }


  // ----------------------------------------------------------------------------
  // BOTONES SOCIALES
  // ----------------------------------------------------------------------------

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

  // Clic en un botón de compartir en Facebook, Twitter, Google+ o WhatsApp
  function socialShare(btn) {
    var tw_text, text,
      url = btn.parentElement.dataset.url || window.location.href;
    var category = url.indexOf('/chiste/') !== -1 ? 'Chiste' : 'Categoría';
    var label = url.split('/').pop();
    url = url.split('?')[0] + '?' + shareUTM[btn.title];
    url = shareURL[btn.title].replace('%url%', encodeURIComponent(url));
    if (btn.parentElement.classList.contains('share-item')) {
      // Compartir chiste desde categoría
      text = btn.parentElement.parentElement.parentElement
        .querySelector('.text').textContent;
    } else if (btn.parentElement.id) {
      // Compartir chiste desde permalink
      text = document.querySelector('.text').textContent;
    } else {
      // Compartir categoría
      text = document.title;
    }
    tw_text = text;
    if (tw_text.length > 228) { // Para Twitter: 280 - enlace - etiqueta - "vía"
      tw_text = tw_text.slice(0, 225) + '[…]';
    }
    url = url.replace('%tw_text%', encodeURIComponent(tw_text));
    url = url.replace('%text%', encodeURIComponent(text));
    window.open(url, '_blank');
    ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: 'Compartir en ' + btn.title,
      eventLabel: label
    });
  }

  // Clic en un botón de "Copiar enlace"
  function linkShare(btn) {
    var title, url = btn.parentElement.dataset.url || window.location.href;
    prevFocus = document.activeElement || btn;
    if (btn.parentElement.classList.contains('share-item')) {
      title = btn.parentElement.parentElement.parentElement
        .querySelector('.title').textContent;
    } else {
      title = document.title;
    }
    cpLinkTitle.textContent = title;
    cpLinkInput.value = url;
    bgModal.classList.add('visible');
    shareModal.classList.add('visible');
    btnCopyLink.focus();
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
