(function () {
  const qs = (selector, root) => (root || document).querySelector(selector);
  const qsa = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  function setupMenu() {
    const button = qs('[data-menu-toggle]');
    const panel = qs('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      const open = panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    const slider = qs('[data-hero-slider]');
    if (!slider) return;
    const slides = qsa('[data-hero-slide]', slider);
    const dots = qsa('[data-hero-dot]', slider);
    if (!slides.length) return;
    let index = 0;
    let timer = null;
    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-pressed', i === index ? 'true' : 'false');
      });
    };
    const start = function () {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    const stop = function () {
      if (timer) clearInterval(timer);
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupLocalFilter() {
    const input = qs('[data-local-search]');
    const year = qs('[data-year-filter]');
    const cards = qsa('[data-movie-card]');
    const empty = qs('[data-empty-state]');
    if (!cards.length) return;
    const run = function () {
      const keyword = normalize(input ? input.value : '');
      const yearValue = year ? year.value : '';
      let shown = 0;
      cards.forEach(function (card) {
        const text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-tags'));
        const cardYear = card.getAttribute('data-year') || '';
        const matchKeyword = !keyword || text.indexOf(keyword) > -1;
        const matchYear = !yearValue || cardYear === yearValue;
        const visible = matchKeyword && matchYear;
        card.style.display = visible ? '' : 'none';
        if (visible) shown += 1;
      });
      if (empty) empty.classList.toggle('show', shown === 0);
    };
    if (input) input.addEventListener('input', run);
    if (year) year.addEventListener('change', run);
    run();
  }

  function setupGlobalSearch() {
    const forms = qsa('[data-global-search]');
    const data = globalThis.MOVIE_SEARCH_INDEX || [];
    forms.forEach(function (form) {
      const input = qs('input', form);
      const results = qs('[data-search-results]', form);
      if (!input || !results) return;
      const render = function () {
        const keyword = normalize(input.value);
        results.innerHTML = '';
        if (keyword.length < 1) {
          results.classList.remove('open');
          return;
        }
        const hits = data.filter(function (item) {
          return normalize(item.t + ' ' + item.y + ' ' + item.g + ' ' + item.r + ' ' + item.o).indexOf(keyword) > -1;
        }).slice(0, 12);
        if (!hits.length) {
          const empty = document.createElement('div');
          empty.className = 'search-hit';
          empty.innerHTML = '<div class="search-thumb"></div><div><strong>暂无匹配影片</strong><p>换一个片名、年份或题材试试</p></div>';
          results.appendChild(empty);
        } else {
          hits.forEach(function (item) {
            const link = document.createElement('a');
            link.className = 'search-hit';
            link.href = item.u;
            link.innerHTML = '<span class="search-thumb" style="background-image:url(\'' + item.c + '\')"></span><span><strong>' + escapeHtml(item.t) + '</strong><span>' + escapeHtml(item.y + ' · ' + item.r + ' · ' + item.g) + '</span><p class="line-clamp-2">' + escapeHtml(item.o) + '</p></span>';
            results.appendChild(link);
          });
        }
        results.classList.add('open');
      };
      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) results.classList.remove('open');
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      const video = qs('video', player);
      const cover = qs('.player-cover', player);
      const button = qs('.play-trigger', player);
      if (!video) return;
      const source = video.getAttribute('data-video') || '';
      let attached = false;
      const attach = function () {
        if (attached || !source) return;
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }
        if (globalThis.Hls && globalThis.Hls.isSupported()) {
          const hls = new globalThis.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          return;
        }
        video.src = source;
      };
      const play = function () {
        attach();
        video.controls = true;
        if (cover) cover.classList.add('is-hidden');
        const action = video.play();
        if (action && typeof action.catch === 'function') action.catch(function () {});
      };
      if (cover) cover.addEventListener('click', play);
      if (button) button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupGlobalSearch();
    setupPlayers();
  });
})();
