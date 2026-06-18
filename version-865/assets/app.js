(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(panel, results) {
    if (!panel) {
      return;
    }
    if (!results.length) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }
    panel.innerHTML = results.slice(0, 10).map(function (movie) {
      return [
        '<a href="' + movie.link + '">',
        '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
        '<span>',
        '<strong>' + movie.title + '</strong>',
        '<small>' + movie.year + ' · ' + movie.type + ' · ' + movie.genre + '</small>',
        '</span>',
        '</a>'
      ].join('');
    }).join('');
    panel.classList.add('open');
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var panel = form.querySelector('[data-search-results]');

    if (!input || !panel) {
      return;
    }

    input.addEventListener('input', function () {
      var query = normalize(input.value);
      if (!query || !window.MovieSearchIndex) {
        renderSearch(panel, []);
        return;
      }
      var results = window.MovieSearchIndex.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags).indexOf(query) !== -1;
      });
      renderSearch(panel, results);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstLink = panel.querySelector('a');
      if (firstLink) {
        window.location.href = firstLink.getAttribute('href');
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('open');
      }
    });
  });

  var localFilter = document.querySelector('[data-local-filter]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var cardGrid = document.querySelector('[data-card-grid]');

  function applyLocalTools() {
    if (!cardGrid) {
      return;
    }
    var cards = Array.prototype.slice.call(cardGrid.querySelectorAll('[data-card]'));
    var query = localFilter ? normalize(localFilter.value) : '';

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region'));
      card.classList.toggle('hidden-card', query && haystack.indexOf(query) === -1);
    });

    if (sortSelect) {
      var mode = sortSelect.value;
      var visibleCards = cards.slice().sort(function (a, b) {
        var ay = Number((a.getAttribute('data-year') || '').match(/\d{4}/));
        var by = Number((b.getAttribute('data-year') || '').match(/\d{4}/));
        if (mode === 'year-desc') {
          return (by || 0) - (ay || 0);
        }
        if (mode === 'year-asc') {
          return (ay || 0) - (by || 0);
        }
        if (mode === 'title') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        return 0;
      });
      visibleCards.forEach(function (card) {
        cardGrid.appendChild(card);
      });
    }
  }

  if (localFilter) {
    localFilter.addEventListener('input', applyLocalTools);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', applyLocalTools);
  }
})();
