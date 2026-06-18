(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = (next) => {
      if (!slides.length) {
        return;
      }

      current = (next + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === current);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
      window.setInterval(() => showSlide(current + 1), 5600);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const filterSelect = document.querySelector('[data-filter-select]');
  const yearSelect = document.querySelector('[data-year-select]');
  const regionSelect = document.querySelector('[data-region-select]');
  const cards = Array.from(document.querySelectorAll('[data-search-card]'));

  const params = new URLSearchParams(window.location.search);

  if (searchInput && params.get('q')) {
    searchInput.value = params.get('q');
  }

  const applyFilters = () => {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const genre = filterSelect ? filterSelect.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value.trim().toLowerCase() : '';
    const region = regionSelect ? regionSelect.value.trim().toLowerCase() : '';

    cards.forEach((card) => {
      const text = (card.getAttribute('data-search-text') || '').toLowerCase();
      const cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
      const cardYear = (card.getAttribute('data-year') || '').toLowerCase();
      const cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
      const keywordPass = !keyword || text.includes(keyword);
      const genrePass = !genre || cardGenre.includes(genre) || text.includes(genre);
      const yearPass = !year || cardYear.includes(year);
      const regionPass = !region || cardRegion.includes(region);

      card.classList.toggle('is-hidden', !(keywordPass && genrePass && yearPass && regionPass));
    });
  };

  [searchInput, filterSelect, yearSelect, regionSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (cards.length) {
    applyFilters();
  }
})();
