(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5600);
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    var normalize = function (value) {
        return String(value || '').toLowerCase().trim();
    };

    var escapeHtml = function (value) {
        return String(value || '').replace(/[&<>"']/g, function (mark) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[mark];
        });
    };

    var applyFilter = function () {
        if (!filterCards.length) {
            return;
        }

        var keyword = normalize(filterInput ? filterInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        filterCards.forEach(function (card) {
            var content = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre')
            ].join(' '));
            var yearMatched = !year || card.getAttribute('data-year') === year;
            var regionMatched = !region || card.getAttribute('data-region') === region;
            var keywordMatched = !keyword || content.indexOf(keyword) !== -1;
            var matched = yearMatched && regionMatched && keywordMatched;

            card.classList.toggle('hidden-by-filter', !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    };

    [filterInput, yearSelect, regionSelect].forEach(function (element) {
        if (element) {
            element.addEventListener('input', applyFilter);
            element.addEventListener('change', applyFilter);
        }
    });

    applyFilter();

    window.setupMoviePlayer = function (videoId, sourceUrl, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);

        if (!video || !sourceUrl) {
            return;
        }

        var ready = false;

        var attachSource = function () {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = sourceUrl;
            }

            ready = true;
        };

        var start = function () {
            attachSource();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            video.setAttribute('controls', 'controls');
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!ready) {
                start();
            }
        });
    };

    var searchRoot = document.querySelector('[data-search-root]');

    if (searchRoot && window.SEARCH_MOVIES) {
        var input = searchRoot.querySelector('[data-search-input]');
        var button = searchRoot.querySelector('[data-search-button]');
        var results = searchRoot.querySelector('[data-search-results]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (input) {
            input.value = initial;
        }

        var renderSearch = function () {
            var query = normalize(input ? input.value : '');
            var items = window.SEARCH_MOVIES.filter(function (movie) {
                if (!query) {
                    return true;
                }
                return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags).indexOf(query) !== -1;
            }).slice(0, 80);

            if (!results) {
                return;
            }

            if (!items.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
                return;
            }

            results.innerHTML = items.map(function (movie) {
                return '<article class="movie-card">' +
                    '<a href="' + escapeHtml(movie.link) + '" class="poster-link"><img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-badge">' + escapeHtml(movie.category) + '</span></a>' +
                    '<div class="card-body"><h3><a href="' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
                    '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="card-foot"><span>★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.views) + ' 热度</span></div></div>' +
                    '</article>';
            }).join('');
        };

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                renderSearch();
            });
        }

        if (input) {
            input.addEventListener('input', renderSearch);
        }

        renderSearch();
    }
})();
