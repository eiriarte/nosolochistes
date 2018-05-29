(function() {
  var bgModal, shareModal, prevFocus;
  var cpLinkTitle, cpLinkInput, btnCopyLink, btnCloseModal, msgCopied;
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
    bgModal = document.querySelector('.popup-bg');
    shareModal = document.querySelector('.popup');
    msgCopied = document.querySelector('.msg-copied');
    btnCopyLink = document.querySelector('.btn-copy-link');
    btnCloseModal = document.querySelector('.btn-close-copy');
    cpLinkTitle = document.getElementById('link-title');
    cpLinkInput = document.getElementById('link-input');
    btnCopyLink.onclick = copyLink;
    btnCloseModal.onclick = closeModal;
    document.body.onkeydown = onKeyDown;
    document.querySelectorAll('.btn-social').forEach(function(btn) {
      btn.onclick = btn.title === 'Copiar enlace' ?
        function() { linkShare(btn); } :
        function() { socialShare(btn); };
    });
  });

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

  // Botón copiar-enlace (en el emergente Copiar Enlace)
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
        eventCategory: getCategory(cpLinkInput.value),
        eventAction: 'Copiar Enlace',
        eventLabel: cpLinkInput.value.split('/').pop() || 'feti-chistes.es'
      });
    }
  }


  // ----------------------------------------------------------------------------
  // BOTONES SOCIALES
  // ----------------------------------------------------------------------------

  // Clic en un botón de compartir en Facebook, Twitter, Google+ o WhatsApp
  function socialShare(btn) {
    var tw_text, text, url =
      (btn.parentElement.dataset.url || window.location.href)
        .replace(/\/pag\/\d+|\?.*$/g, '');
    var category = getCategory(url);
    var label = url.split('/').pop() || 'feti-chistes.es';
    url = url + '?' + shareUTM[btn.title];
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
    cpLinkInput.value = url.replace(/\/pag\/\d+|\?.*$/g, '');
    bgModal.classList.add('visible');
    shareModal.classList.add('visible');
    btnCopyLink.focus();
  }

  function getCategory(url) {
    if (url.indexOf('/chiste/') !== -1) return 'Chiste';
    if (url.indexOf('/chistes') !== -1 || url.length <= 24) return 'Categoría';
    return 'Blog';
  }

})();
