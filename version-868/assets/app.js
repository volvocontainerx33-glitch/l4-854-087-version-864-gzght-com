(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    start();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var targetSelector = form.getAttribute('data-target') || '[data-card-list]';
      var list = document.querySelector(targetSelector);
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      var queryInput = form.querySelector('[data-filter="query"]');
      var categorySelect = form.querySelector('[data-filter="category"]');
      var regionSelect = form.querySelector('[data-filter="region"]');
      var yearSelect = form.querySelector('[data-filter="year"]');
      var countNode = form.querySelector('[data-result-count]');
      var resetButton = form.querySelector('[data-filter-reset]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (queryInput && initialQuery && !queryInput.value) {
        queryInput.value = initialQuery;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var query = normalize(queryInput ? queryInput.value : '');
        var category = categorySelect ? categorySelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesCategory = !category || card.getAttribute('data-category') === category;
          var matchesRegion = !region || card.getAttribute('data-region') === region;
          var matchesYear = !year || card.getAttribute('data-year') === year;
          var shouldShow = matchesQuery && matchesCategory && matchesRegion && matchesYear;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }
      }

      [queryInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (queryInput) {
            queryInput.value = '';
          }
          if (categorySelect) {
            categorySelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.defer = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video[data-src]');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-src');
      var hlsInstance = null;

      function hideButton() {
        button.classList.add('is-hidden');
      }

      function playVideo() {
        if (!source) {
          return;
        }

        if (video.getAttribute('data-ready') === 'true') {
          video.play();
          hideButton();
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.setAttribute('data-ready', 'true');
          video.play();
          hideButton();
          return;
        }

        loadHlsScript(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.setAttribute('data-ready', 'true');
              video.play();
              hideButton();
            });
          }
        });
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', hideButton);
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
