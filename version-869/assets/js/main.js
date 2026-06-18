(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        slider.addEventListener("mouseenter", stopTimer);
        slider.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    filterRoots.forEach(function (root) {
        var container = root.parentElement || document;
        var input = root.querySelector("[data-search-input]");
        var yearSelect = root.querySelector("[data-filter-year]");
        var typeSelect = root.querySelector("[data-filter-type]");
        var categorySelect = root.querySelector("[data-filter-category]");
        var empty = root.querySelector("[data-filter-empty]");
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(input ? input.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var category = normalize(categorySelect ? categorySelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var title = normalize(card.getAttribute("data-title"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var matchesQuery = !query || searchText.indexOf(query) !== -1 || title.indexOf(query) !== -1;
                var matchesYear = !year || cardYear.indexOf(year) !== -1;
                var matchesType = !type || cardType.indexOf(type) !== -1;
                var matchesCategory = !category || cardCategory === category;
                var shouldShow = matchesQuery && matchesYear && matchesType && matchesCategory;

                card.classList.toggle("filter-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });
})();
