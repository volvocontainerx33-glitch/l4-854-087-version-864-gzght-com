(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  var hero = document.querySelector('.hero-showcase');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var quickSearch = document.querySelector('[data-quick-search]');
  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = quickSearch.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      window.location.href = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var year = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var keyword = normalize(input && input.value);
    var regionValue = normalize(region && region.value);
    var typeValue = normalize(type && type.value);
    var yearValue = normalize(year && year.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-desc'));
      var ok = true;
      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }
      if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
        ok = false;
      }
      if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
        ok = false;
      }
      if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    Array.prototype.slice.call(scope.querySelectorAll('input, select')).forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(scope);
      });
      control.addEventListener('change', function () {
        applyFilters(scope);
      });
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = scope.querySelector('[data-filter-input]');
    if (q && input) {
      input.value = q;
    }
    applyFilters(scope);
  });

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('play-layer');
    var button = document.getElementById('play-button');
    if (!video || !source) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;

    function bind() {
      if (loaded) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = source;
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function start() {
      bind();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (layer) {
      layer.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
