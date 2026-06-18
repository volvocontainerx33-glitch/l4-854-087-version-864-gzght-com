const MovieSite = (function () {
    function initMenu() {
        const button = document.querySelector("[data-menu-toggle]");
        const menu = document.querySelector("[data-nav-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function yearMatches(cardYear, value) {
        if (!value) {
            return true;
        }
        const year = parseInt(cardYear, 10);
        if (value.indexOf("-") > -1) {
            const parts = value.split("-").map(function (item) {
                return parseInt(item, 10);
            });
            return year >= parts[0] && year <= parts[1];
        }
        return cardYear === value;
    }

    function initFilters() {
        const panels = Array.from(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            const container = panel.parentElement;
            const list = container ? container.querySelector("[data-card-list]") : null;
            if (!list) {
                return;
            }
            const search = panel.querySelector("[data-search-input]");
            const type = panel.querySelector("[data-filter-type]");
            const year = panel.querySelector("[data-filter-year]");
            const category = panel.querySelector("[data-filter-category]");
            const reset = panel.querySelector("[data-reset-filters]");
            const cards = Array.from(list.querySelectorAll(".movie-card"));

            function apply() {
                const keyword = search ? search.value.trim().toLowerCase() : "";
                const typeValue = type ? type.value : "";
                const yearValue = year ? year.value : "";
                const categoryValue = category ? category.value : "";
                cards.forEach(function (card) {
                    const text = card.getAttribute("data-title") || "";
                    const cardType = card.getAttribute("data-type") || "";
                    const cardYear = card.getAttribute("data-year") || "";
                    const cardCategory = card.getAttribute("data-category") || "";
                    const matched = (!keyword || text.indexOf(keyword) > -1) &&
                        (!typeValue || cardType === typeValue) &&
                        yearMatches(cardYear, yearValue) &&
                        (!categoryValue || cardCategory === categoryValue);
                    card.classList.toggle("is-hidden-card", !matched);
                });
            }

            [search, type, year, category].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    apply();
                });
            }
        });
    }

    function initPlayer(config) {
        const video = document.querySelector("[data-movie-player]");
        const cover = document.querySelector("[data-player-cover]");
        const button = document.querySelector("[data-play-button]");
        if (!video || !config || !config.source) {
            return;
        }
        let loaded = false;
        let hls = null;

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(config.source);
                hls.attachMedia(video);
            } else {
                video.src = config.source;
            }
            loaded = true;
        }

        function start() {
            load();
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });

    return {
        initPlayer: initPlayer
    };
})();
