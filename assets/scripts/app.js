/* ===================================================================
   Programme des Églises de Maison — CCEAV
   Progressive enhancement: theme, filters, search, scroll reveal
   =================================================================== */
(function () {
  'use strict';

  /* ---- DOM refs -------------------------------------------------- */
  var cards       = Array.from(document.querySelectorAll('.week-card'));
  var trimesters  = Array.from(document.querySelectorAll('.trimester'));
  var filterBtns  = Array.from(document.querySelectorAll('.filter-btn'));
  var searchInput = document.getElementById('search');
  var noResults   = document.getElementById('no-results');
  var liveRegion  = document.getElementById('live-region');
  var navLinks    = Array.from(document.querySelectorAll('.nav-link'));

  /* ---- State ----------------------------------------------------- */
  var activeTrimester = 'all';
  var searchQuery     = '';
  var debounceTimer   = null;

  /* ================================================================ */
  /*  THEME TOGGLE (light / dark / auto)                              */
  /* ================================================================ */
  (function initTheme() {
    var btn   = document.getElementById('theme-toggle');
    var html  = document.documentElement;
    var meta  = document.getElementById('meta-theme');
    var STORE = 'theme';

    function currentEffective() {
      if (html.classList.contains('dark')) return 'dark';
      if (html.classList.contains('light')) return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function apply(mode) {
      html.classList.remove('light', 'dark');
      if (mode === 'light' || mode === 'dark') html.classList.add(mode);
      // Update theme-color meta for mobile browsers
      if (meta) meta.content = currentEffective() === 'dark' ? '#0e0f1a' : '#1e1a6e';
      try { localStorage.setItem(STORE, mode); } catch (e) { /* quota */ }
    }

    btn.addEventListener('click', function () {
      var saved = localStorage.getItem(STORE);
      var effective = currentEffective();
      // Cycle: auto → light → dark → auto  OR  toggle current
      var next = effective === 'dark' ? 'light' : 'dark';
      apply(next);
    });

    // Listen for OS changes when in auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      var saved = localStorage.getItem(STORE);
      if (!saved || (saved !== 'light' && saved !== 'dark')) {
        apply('auto');
      }
    });
  })();

  /* ================================================================ */
  /*  CUSTOM WEEK SELECTOR                                            */
  /* ================================================================ */
  (function initWeekSelector() {
    var trigger  = document.getElementById('week-trigger');
    var dropdown = document.getElementById('week-dropdown');
    var wrapper  = document.getElementById('week-selector');
    var label    = trigger.querySelector('span');
    if (!trigger || !dropdown) return;

    // Populate options from cards
    var weeks = [];
    cards.forEach(function (c) {
      var w = parseInt(c.dataset.week, 10);
      if (weeks.indexOf(w) === -1) weeks.push(w);
    });
    weeks.sort(function (a, b) { return a - b; });

    weeks.forEach(function (w) {
      var btn = document.createElement('button');
      btn.className = 'week-option';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', 'false');
      btn.dataset.week = w;
      btn.textContent = 'Semaine ' + w;
      dropdown.appendChild(btn);
    });

    function toggle(open) {
      var isOpen = open !== undefined ? open : dropdown.classList.contains('open') ? false : true;
      dropdown.classList.toggle('open', isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
    }

    trigger.addEventListener('click', function () { toggle(); });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) toggle(false);
    });

    // Close on Escape
    wrapper.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { toggle(false); trigger.focus(); }
    });

    // Selection via delegation
    dropdown.addEventListener('click', function (e) {
      var opt = e.target.closest('.week-option');
      if (!opt) return;
      var week = opt.dataset.week;
      label.textContent = 'Sem. ' + week;

      // Reset filters
      searchInput.value = '';
      searchQuery = '';
      setTrimesterFilter('all');

      // Scroll to card
      var card = document.querySelector('.week-card[data-week="' + week + '"]');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlight');
        setTimeout(function () { card.classList.remove('highlight'); }, 2200);
      }

      toggle(false);
    });
  })();

  /* ================================================================ */
  /*  NATIVE SELECT FALLBACK (no-js already shows it; also wire JS)   */
  /* ================================================================ */
  var weekSelectNative = document.getElementById('week-select');
  if (weekSelectNative) {
    weekSelectNative.addEventListener('change', function () {
      var week = weekSelectNative.value;
      if (!week) return;
      searchInput.value = '';
      searchQuery = '';
      setTrimesterFilter('all');
      var target = document.querySelector('.week-card[data-week="' + week + '"]');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('highlight');
        setTimeout(function () { target.classList.remove('highlight'); }, 2200);
      }
    });
  }

  /* ================================================================ */
  /*  TRIMESTER FILTER                                                */
  /* ================================================================ */
  function setTrimesterFilter(value) {
    activeTrimester = value;
    filterBtns.forEach(function (btn) {
      var isActive = btn.dataset.filter === value;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    applyFilters();
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTrimesterFilter(btn.dataset.filter);
    });
  });

  /* ================================================================ */
  /*  SEARCH                                                          */
  /* ================================================================ */
  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      searchQuery = searchInput.value.trim().toLowerCase();
      applyFilters();
    }, 250);
  });

  /* ================================================================ */
  /*  APPLY FILTERS (combined trimester + search)                     */
  /* ================================================================ */
  function applyFilters() {
    var visibleCount = 0;

    cards.forEach(function (card) {
      var matchT = activeTrimester === 'all' || card.dataset.trimester === activeTrimester;
      var matchS = true;
      if (searchQuery) {
        var title = (card.querySelector('.week-card__title') || {}).textContent || '';
        var refs  = (card.querySelector('.week-card__refs') || {}).textContent || '';
        var text  = (title + ' ' + refs).toLowerCase();
        matchS = text.indexOf(searchQuery) !== -1;
      }
      var show = matchT && matchS;
      card.hidden = !show;
      if (show) visibleCount++;
    });

    trimesters.forEach(function (sec) {
      if (activeTrimester !== 'all' && sec.dataset.trimester !== activeTrimester) {
        sec.hidden = true;
        return;
      }
      if (sec.dataset.trimester === '4') {
        sec.hidden = activeTrimester !== 'all' && activeTrimester !== '4';
        return;
      }
      var hasVisible = Array.from(sec.querySelectorAll('.week-card')).some(function (c) { return !c.hidden; });
      sec.hidden = !hasVisible && searchQuery !== '';
    });

    noResults.classList.toggle('visible', visibleCount === 0 && searchQuery !== '');

    if (searchQuery) {
      liveRegion.textContent = visibleCount === 0
        ? 'Aucun résultat trouvé.'
        : visibleCount + ' résultat' + (visibleCount > 1 ? 's' : '') + '.';
    } else {
      liveRegion.textContent = '';
    }
  }

  /* ================================================================ */
  /*  SMOOTH SCROLL for nav links (offset for sticky nav)             */
  /* ================================================================ */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      var target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', hash);
      }
    });
  });

  /* ================================================================ */
  /*  SCROLL-REVEAL (IntersectionObserver)                            */
  /* ================================================================ */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    cards.forEach(function (card) { revealObs.observe(card); });
  } else {
    cards.forEach(function (card) { card.classList.add('visible'); });
  }

  /* ================================================================ */
  /*  ACTIVE NAV HIGHLIGHT on scroll                                  */
  /* ================================================================ */
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navLinks.forEach(function (link) {
              var isMatch = link.getAttribute('href') === '#' + id;
              link.classList.toggle('active', isMatch);
              link.setAttribute('aria-current', isMatch ? 'true' : 'false');
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '-80px 0px -60% 0px' }
    );
    trimesters.forEach(function (sec) { navObs.observe(sec); });
  }

  /* ================================================================ */
  /*  BACK TO TOP                                                     */
  /* ================================================================ */
  (function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    function checkScroll() {
      btn.classList.toggle('visible', window.scrollY > 600);
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

})();
