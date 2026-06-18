(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchBox = document.querySelector('[data-search-input]');
  var searchItems = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var noResults = document.querySelector('[data-no-results]');

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function filterCards(value) {
    var query = String(value || '').trim().toLowerCase();
    var visible = 0;

    searchItems.forEach(function (item) {
      var text = [
        item.getAttribute('data-title') || '',
        item.getAttribute('data-region') || '',
        item.getAttribute('data-type') || '',
        item.getAttribute('data-tags') || '',
        item.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var matched = !query || text.indexOf(query) !== -1;
      item.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchBox) {
    var initial = getQuery();
    if (initial) {
      searchBox.value = initial;
    }
    filterCards(searchBox.value);
    searchBox.addEventListener('input', function () {
      filterCards(searchBox.value);
    });
  }

  var video = document.querySelector('[data-video-player]');
  var playButton = document.querySelector('[data-play-button]');
  var hlsInstance = null;
  var playerReady = false;

  function attachVideo() {
    if (!video || playerReady) {
      return;
    }

    var source = video.getAttribute('data-stream');
    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    playerReady = true;
  }

  function startVideo() {
    if (!video) {
      return;
    }
    attachVideo();
    video.controls = true;
    if (playButton) {
      playButton.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
