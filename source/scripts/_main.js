(function() {
  var itemsPerPage = 20;
  var numPage = 1;
  var loadingPage = false;
  var endReached = false;
  var loader;
  var ups, downs;

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
    loadVotes();
    updateButtons();
    addVoteListeners();
  });

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
    ups.forEach(pressButton('vup', 'vdown'));
    downs.forEach(pressButton('vdown', 'vup'));
  }

  function pressButton(action, other) {
    return function(id) {
      var press = document.getElementById(action + ':' + id);
      var unPress = document.getElementById(other + ':' + id);
      if (!press || press.classList.contains('pressed')) return;
      press.className += ' pressed';
      press.setAttribute('aria-pressed', 'true');
      unPress.className = unPress.className.replace( ' pressed', '' );
      unPress.setAttribute('aria-pressed', 'false');
    }
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
      page.appendChild(newItem(item, template));
    });
    document.querySelector('main').insertBefore(page, loader);
    updateButtons();
    addVoteListeners();
    numPage++;
    ga('send', {
      hitType: 'event',
      eventCategory: 'Página',
      eventAction: 'avance',
      eventValue: numPage
    });
  }

  function newItem(item, template) {
    var clone = template.cloneNode(true);
    var catLink = clone.querySelector('.category a');
    var titleLink = clone.querySelector('.title a');
    var date = clone.querySelector('.date');
    var upVoteBtn = clone.querySelector('.btn.vote.up');
    var downVoteBtn = clone.querySelector('.btn.vote.down');
    clone.querySelector('.name').textContent = item.autor;
    date.setAttribute('datetime', item.datetime);
    date.textContent = item.fecha;
    if (titleLink) {
      titleLink.textContent = item.titulo;
      titleLink.setAttribute('href', '/chiste/' + item._id);
    }
    if (catLink) {
      catLink.textContent = item.categoria.menu;
      catLink.setAttribute('href', '/chistes/' + item.categoria._id);
    }
    nl2br(clone.querySelector('.text'), item.texto);
    resetVoteBtn(upVoteBtn, 'vup:' + item._id, item.ups);
    resetVoteBtn(downVoteBtn, 'vdown:' + item._id, item.downs);
    return clone;
  }

  function resetVoteBtn(btn, id, votes) {
    btn.id = id;
    btn.className = 'btn vote';
    btn.setAttribute('aria-pressed', 'false');
    btn.querySelector('.nvotes').textContent = votes;
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
