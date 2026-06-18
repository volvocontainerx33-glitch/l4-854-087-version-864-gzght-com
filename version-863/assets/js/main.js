(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = $("[data-menu-button]");
    var menu = $("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = $all("[data-hero-slide]");
    var dots = $all("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function setupHeroSearch() {
    var form = $("[data-hero-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = $("input", form);
      var query = input ? input.value.trim() : "";
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  function setupFilter() {
    var panel = $("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = $("[data-filter-input]", panel);
    var typeSelect = $("[data-filter-type]", panel);
    var regionSelect = $("[data-filter-region]", panel);
    var yearSelect = $("[data-filter-year]", panel);
    var resetButton = $("[data-filter-reset]", panel);
    var cards = $all(".movie-card");
    var empty = $("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && input) {
      input.value = initial;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var regionValue = normalize(regionSelect && regionSelect.value);
      var yearValue = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(" "));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (typeValue && normalize(card.dataset.type) !== typeValue) {
          ok = false;
        }
        if (regionValue && normalize(card.dataset.region) !== regionValue) {
          ok = false;
        }
        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function setupPlayer() {
    var shell = $("[data-player-shell]");
    var video = $("[data-player]");
    var button = $("[data-play-button]");
    if (!shell || !video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var ready = false;
    var hlsInstance = null;

    function prepare() {
      if (ready || !stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      ready = true;
    }

    function play() {
      prepare();
      var result = video.play();
      shell.classList.add("is-playing");
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    shell.addEventListener("click", function (event) {
      if (event.target === video || event.target === shell) {
        play();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupHeroSearch();
    setupFilter();
    setupPlayer();
  });
})();
