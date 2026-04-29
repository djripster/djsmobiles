/*!
 * DJs Mobiles — Production JavaScript
 * https://www.djsmobiles.com
 * Version: 15.4.0
 * Cache-bust: ?v=15.4.0
 *
 * Includes: script-core, script-search, script-hamburger,
 *           featured-homepage, sidebar-reviews, compact-feed,
 *           script-lightbox, script-shrink, related-content,
 *           device-family-intel, amazon-buy-now, affiliate-disclosure
 *
 * Disqus embed intentionally excluded (requires Blogger template variables).
 */
/* script-core v1 | Centralized UI controller */
(function() {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function closeMenu(menu, button) {
    if (!menu || !button) return;
    menu.classList.remove('open');
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }

  function openMenu(menu, button) {
    if (!menu || !button) return;
    menu.classList.add('open');
    button.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
  }

  function toggleMenu(menu, button) {
    if (!menu || !button) return false;
    var isOpen = menu.classList.contains('open');
    if (isOpen) {
      closeMenu(menu, button);
      return false;
    }
    openMenu(menu, button);
    return true;
  }

  function initMobileAccordion(menu) {
    if (!menu) return;

    function closePanel(toggle) {
      if (!toggle) return;
      var panel = qs('#' + toggle.getAttribute('aria-controls'));
      if (!panel) return;
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('open');
    }

    function openPanel(toggle) {
      if (!toggle) return;
      var panel = qs('#' + toggle.getAttribute('aria-controls'));
      if (!panel) return;
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('open');
    }

    function closeSiblingTopLevelToggles(current) {
      var groups = menu.children;
      for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        if (!group.classList || !group.classList.contains('mobile-nav-group')) continue;
        var toggle = qs(':scope > .mobile-nav-toggle', group);
        if (toggle && toggle !== current) closePanel(toggle);
      }
    }

    var toggles = menu.querySelectorAll('.mobile-nav-toggle');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', function() {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        var isTopLevel = this.parentNode && this.parentNode.parentNode === menu;
        if (expanded) {
          closePanel(this);
          return;
        }
        if (isTopLevel) closeSiblingTopLevelToggles(this);
        openPanel(this);
      });
    }
  }

  function initHamburger() {
    var button = qs('#hamburger-btn');
    var menu = qs('#nav-mobile');
    if (!button || !menu) return;

    initMobileAccordion(menu);

    button.addEventListener('click', function() {
      var opened = toggleMenu(menu, button);
      if (opened) {
        closeMenu(qs('#search-dropdown'), qs('#search-icon-btn'));
      }
    });

    menu.addEventListener('click', function(event) {
      var link = event.target.closest('a');
      if (link) closeMenu(menu, button);
    });
  }

  function initSearch() {
    var button = qs('#search-icon-btn');
    var dropdown = qs('#search-dropdown');
    var input = qs('#search-dropdown-input');
    var submit = qs('#search-dropdown-btn');
    var suggestions = qs('#search-suggestions');
    if (!button || !dropdown || !input || !submit || !suggestions) return;

    var debounceTimer = null;
    var activeQuery = '';
    var activeScript = null;

    function doSearch() {
      var q = input.value.trim();
      if (q) {
        window.location.href = 'https://www.djsmobiles.com/search?q=' + encodeURIComponent(q);
      }
    }

    function closeSuggestions() {
      suggestions.classList.remove('is-open');
      suggestions.innerHTML = '';
    }

    function openSuggestions() {
      if (suggestions.innerHTML) suggestions.classList.add('is-open');
    }

    function renderContextSearchSuggestions() {
      var intel = window.djsDeviceIntel || {};
      var base = '';
      if (intel.family) base = djsFamilyLabel(intel.family);
      else if (intel.brand) base = djsCapitalizeWords(intel.brand);
      else if (intel.labels && intel.labels.length) base = djsCapitalizeWords(intel.labels[0]);
      if (!base) return false;

      var presets = [
        { type: 'Hub', title: 'Explore ' + base, q: base },
        { type: 'Specs', title: base + ' specs', q: base + ' specs' },
        { type: 'Review', title: base + ' review', q: base + ' review' },
        { type: 'Compare', title: base + ' vs alternatives', q: base + ' vs' }
      ];
      var items = [];
      for (var i = 0; i < presets.length; i++) {
        items.push(
          '<a class="search-suggestion-item" href="/search?q=' + encodeURIComponent(presets[i].q) + '">' +
            '<span class="search-suggestion-type">' + djsEscapeHtml(presets[i].type) + '</span>' +
            '<span class="search-suggestion-content">' +
              '<span class="search-suggestion-title">' + djsEscapeHtml(presets[i].title) + '</span>' +
              '<span class="search-suggestion-meta">Suggested from this post</span>' +
            '</span>' +
          '</a>'
        );
      }
      suggestions.innerHTML = items.join('');
      openSuggestions();
      return true;
    }

    function getEntryType(entry) {
      var fallback = 'Post';
      if (!entry || !entry.category || !entry.category.length) return fallback;

      var categories = [];
      for (var i = 0; i < entry.category.length; i++) {
        if (entry.category[i] && entry.category[i].term) categories.push(String(entry.category[i].term));
      }

      var joined = categories.join(' | ').toLowerCase();
      if (joined.indexOf('review') !== -1) return 'Review';
      if (joined.indexOf('spec') !== -1) return 'Specs';
      if (joined.indexOf('guide') !== -1 || joined.indexOf('how to') !== -1) return 'Guide';
      if (joined.indexOf('deal') !== -1) return 'Deals';
      if (joined.indexOf('news') !== -1) return 'News';
      return fallback;
    }

    function getEntryMeta(entry) {
      var pieces = [];
      var type = getEntryType(entry);

      if (entry && entry.category && entry.category.length) {
        for (var i = 0; i < entry.category.length; i++) {
          var term = entry.category[i] && entry.category[i].term ? String(entry.category[i].term) : '';
          var lowered = term.toLowerCase();
          if (!term) continue;
          if (lowered === type.toLowerCase()) continue;
          if (lowered.indexOf('spec') !== -1 && type === 'Specs') continue;
          if (lowered.indexOf('review') !== -1 && type === 'Review') continue;
          if ((lowered.indexOf('guide') !== -1 || lowered.indexOf('how to') !== -1) && type === 'Guide') continue;
          pieces.push(term);
          break;
        }
      }

      return pieces.join(' &#183; ') || 'DJs Mobiles';
    }

    function highlightQuery(title, query) {
      var safeTitle = djsEscapeHtml(title);
      var safeQuery = djsEscapeHtml(query);
      if (!safeTitle || !safeQuery) return safeTitle;

      var titleLower = safeTitle.toLowerCase();
      var queryLower = safeQuery.toLowerCase();
      var index = titleLower.indexOf(queryLower);
      if (index === -1) return safeTitle;

      return safeTitle.slice(0, index) + '<mark>' + safeTitle.slice(index, index + safeQuery.length) + '</mark>' + safeTitle.slice(index + safeQuery.length);
    }

    function renderSuggestions(feed, query) {
      if (query !== activeQuery) return;
      if (!feed || !feed.feed || !feed.feed.entry || !feed.feed.entry.length) {
        suggestions.innerHTML = '<div class="search-suggestion-empty">No quick matches found. Press Enter to search the full site.</div>';
        openSuggestions();
        return;
      }

      var entries = feed.feed.entry.slice(0, 5);
      var items = [];

      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var type = getEntryType(entry);
        items.push(
          '<a class="search-suggestion-item" href="' + djsEscapeHtml(djsFeedGetLink(entry)) + '">' +
            '<span class="search-suggestion-type">' + djsEscapeHtml(type) + '</span>' +
            '<span class="search-suggestion-content">' +
              '<span class="search-suggestion-title">' + highlightQuery(djsFeedGetTitle(entry), query) + '</span>' +
              '<span class="search-suggestion-meta">' + djsEscapeHtml(getEntryMeta(entry)) + '</span>' +
            '</span>' +
          '</a>'
        );
      }

      suggestions.innerHTML = items.join('');
      openSuggestions();
    }

    window.djsSearchSuggestFeed = function(feed) {
      renderSuggestions(feed, activeQuery);
    };

    function requestSuggestions(query) {
      if (activeScript && activeScript.parentNode) activeScript.parentNode.removeChild(activeScript);
      activeScript = document.createElement('script');
      activeScript.id = 'djs-search-suggest-feed';
      activeScript.src = '/feeds/posts/default?alt=json-in-script&max-results=5&orderby=published&q=' + encodeURIComponent(query) + '&callback=djsSearchSuggestFeed';
      document.body.appendChild(activeScript);
    }

    function onInputChange() {
      var q = input.value.trim();
      activeQuery = q;

      if (q.length < 2) {
        if (!q) renderContextSearchSuggestions();
        else closeSuggestions();
        return;
      }

      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(function() {
        requestSuggestions(q);
      }, 220);
    }

    button.addEventListener('click', function(event) {
      event.stopPropagation();
      var opened = toggleMenu(dropdown, button);
      if (opened) {
        closeMenu(qs('#nav-mobile'), qs('#hamburger-btn'));
        if (!input.value.trim()) renderContextSearchSuggestions();
        window.setTimeout(function() { input.focus(); }, 50);
      } else {
        closeSuggestions();
      }
    });

    submit.addEventListener('click', function(event) {
      event.stopPropagation();
      doSearch();
    });

    input.addEventListener('input', onInputChange);

    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        doSearch();
        return;
      }
      if (event.key === 'Escape') {
        closeSuggestions();
      }
    });

    input.addEventListener('focus', function() {
      if (!input.value.trim()) { renderContextSearchSuggestions(); return; }
      if (input.value.trim().length >= 2 && suggestions.innerHTML) openSuggestions();
    });

    suggestions.addEventListener('click', function(event) {
      event.stopPropagation();
    });

    dropdown.addEventListener('click', function(event) {
      event.stopPropagation();
    });

    document.addEventListener('click', function(event) {
      if (!dropdown.contains(event.target) && !button.contains(event.target)) {
        closeMenu(dropdown, button);
        closeSuggestions();
      }
    });
  }

  function initHttpsUpgrade() {
    var imgs = document.getElementsByTagName('img');
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].src.indexOf('http://') === 0) {
        imgs[i].src = imgs[i].src.replace('http://', 'https://');
      }
    }
  }

  function initPerformanceCleanup() {
    var lazyImages = document.querySelectorAll('.post-body img, .home-snippet img, .sidebar-area img, .video-card img');
    for (var i = 0; i < lazyImages.length; i++) {
      var img = lazyImages[i];
      if (img.id === 'djs-lightbox-img') continue;
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
    }

    var iframes = document.querySelectorAll('.post-body iframe, .video-card iframe');
    for (var j = 0; j < iframes.length; j++) {
      if (!iframes[j].getAttribute('loading')) iframes[j].setAttribute('loading', 'lazy');
      if (!iframes[j].getAttribute('referrerpolicy')) iframes[j].setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    }
  }

  function initShrinkHeader() {
    var nav = qs('#nav-wrapper');
    if (!nav) return;
    var threshold = 60;

    function updateNavState() {
      if (window.pageYOffset > threshold) {
        nav.classList.add('shrunk');
      } else {
        nav.classList.remove('shrunk');
      }
    }

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
  }


  function djsEscapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(new RegExp(String.fromCharCode(39), "g"), "&#39;");
  }

  function djsCleanFeaturedText(raw, limit) {
    var value = String(raw || '')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\.review-wrap\s*\{[^}]*\}/gi, ' ')
      .replace(/#[0-9a-f]{3,6}(?=\s|;|,|\.|$)/gi, ' ')
      .replace(/font-family:[^;]+;?/gi, ' ')
      .replace(/font-size:[^;]+;?/gi, ' ')
      .replace(/line-height:[^;]+;?/gi, ' ')
      .replace(/color:[^;]+;?/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (value.length <= limit) return value;
    return value.slice(0, limit).replace(/\s+\S*$/, '') + '...';
  }

  function djsFeedGetLink(entry) {
    if (!entry || !entry.link) return '';
    for (var i = 0; i < entry.link.length; i++) {
      if (entry.link[i].rel === 'alternate') return entry.link[i].href;
    }
    return '';
  }

  function djsFeedGetTitle(entry) {
    return entry && entry.title && entry.title.$t ? entry.title.$t : '';
  }

  function djsFeedGetImage(entry, size) {
    size = size || '/s1600/';
    if (entry && entry.media$thumbnail && entry.media$thumbnail.url) {
      return entry.media$thumbnail.url.replace(/\/s72-c\//, size);
    }

    var html = '';
    if (entry && entry.content && entry.content.$t) html = entry.content.$t;
    else if (entry && entry.summary && entry.summary.$t) html = entry.summary.$t;

    var match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];

    return 'https://cdn.jsdelivr.net/gh/djripster/djsmobiles@gh-pages/twitter.png';
  }

  function djsFeedGetCategories(entry) {
    if (!entry || !entry.category || !entry.category.length) return [];
    var out = [];
    for (var i = 0; i < entry.category.length; i++) {
      if (entry.category[i] && entry.category[i].term) out.push(String(entry.category[i].term));
    }
    return out;
  }

  function djsGetFeaturedBadge(entry) {
    var categories = djsFeedGetCategories(entry);
    var map = [
      { terms: ['Review', 'Reviews'], label: 'Review', cls: 'is-review' },
      { terms: ['Specs'], label: 'Specs', cls: 'is-specs' },
      { terms: ['Deals', 'Deal'], label: 'Deal', cls: 'is-deals' },
      { terms: ['Guide', 'Guides', 'Editorial'], label: 'Guide', cls: 'is-guide' }
    ];

    for (var i = 0; i < map.length; i++) {
      for (var j = 0; j < map[i].terms.length; j++) {
        if (categories.indexOf(map[i].terms[j]) !== -1) return map[i];
      }
    }

    return { label: 'News', cls: 'is-news' };
  }

  function djsFeaturedBadgeHtml(entry) {
    var badge = djsGetFeaturedBadge(entry);
    return '<span class="featured-badge ' + djsEscapeHtml(badge.cls) + '">' + djsEscapeHtml(badge.label) + '</span>';
  }

  /* featured-homepage v5 | Skeleton swap + clean hide on empty/failed feed */
  window.djsFeaturedFeed = function(feed) {
    var section = qs('#homepage-featured');
    if (!section) return;

    if (!feed || !feed.feed || !feed.feed.entry || !feed.feed.entry.length) {
      section.classList.remove('is-loading');
      section.classList.add('is-hidden');
      return;
    }

    try {
      var entries = feed.feed.entry.slice(0, 3);

      function getDate(entry) {
        if (!entry.published || !entry.published.$t) return '';
        var d = new Date(entry.published.$t);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      function getSummary(entry) {
        var raw = '';
        if (entry.summary && entry.summary.$t) raw = entry.summary.$t;
        else if (entry.content && entry.content.$t) raw = entry.content.$t;
        return djsCleanFeaturedText(raw, window.innerWidth <= 768 ? 100 : 155);
      }

      var hero = entries[0];
      var heroSkel = qs('#featured-hero-skel');
      var heroReal = qs('#featured-hero-real');
      var heroTitle = qs('#featured-hero-title');
      var heroMeta = qs('#featured-hero-meta');
      var heroSummary = qs('#featured-hero-summary');
      var heroLink = qs('#featured-hero-link');
      var heroMedia = qs('#featured-hero-media');
      var side = qs('#featured-side');

      if (heroTitle) {
        heroTitle.innerHTML = '<a href="' + djsEscapeHtml(djsFeedGetLink(hero)) + '">' + djsEscapeHtml(djsFeedGetTitle(hero)) + '</a>';
      }
      if (heroMeta) {
        heroMeta.innerHTML =
          '<time>' + djsEscapeHtml(getDate(hero)) + '</time>' +
          '<span class="post-meta-sep">&#8226;</span>' +
          djsFeaturedBadgeHtml(hero);
      }
      if (heroSummary) heroSummary.textContent = getSummary(hero);
      if (heroLink) heroLink.href = djsFeedGetLink(hero);
      if (heroMedia) heroMedia.style.backgroundImage = 'url("' + djsFeedGetImage(hero, '/s1600/') + '")';

      if (heroSkel) heroSkel.style.display = 'none';
      if (heroReal) heroReal.style.display = '';

      if (side) {
        var cards = [];
        for (var j = 1; j < entries.length; j++) {
          cards.push(
            '<article class="featured-card">' +
              '<div class="featured-card-thumb" style="background-image:url("' + djsEscapeHtml(djsFeedGetImage(entries[j], '/s1600/')) + '")"></div>' +
              '<div class="featured-card-body">' +
                '<div class="featured-meta">' +
                  '<time>' + djsEscapeHtml(getDate(entries[j])) + '</time>' +
                  '<span class="post-meta-sep">&#8226;</span>' +
                  djsFeaturedBadgeHtml(entries[j]) +
                '</div>' +
                '<h3 class="featured-card-title"><a href="' + djsEscapeHtml(djsFeedGetLink(entries[j])) + '">' + djsEscapeHtml(djsFeedGetTitle(entries[j])) + '</a></h3>' +
                '<p class="featured-card-summary">' + djsEscapeHtml(getSummary(entries[j])) + '</p>' +
              '</div>' +
            '</article>'
          );
        }
        side.innerHTML = cards.join('');
      }

      section.classList.remove('is-loading');
      section.classList.add('is-ready');
    } catch (e) {
      section.classList.remove('is-loading');
      section.classList.add('is-hidden');
    }
  };

  function loadFeaturedHomepage() {
    var section = qs('#homepage-featured');
    if (!section) return;

    var existing = qs('#djs-featured-feed');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var script = document.createElement('script');
    script.id = 'djs-featured-feed';
    script.src = '/feeds/posts/default/-/Featured?alt=json-in-script&max-results=3&callback=djsFeaturedFeed';
    document.body.appendChild(script);
  }


  /* sidebar-reviews v3 | Skeleton swap + clean hide on empty/failed feed */
  window.djsSidebarReviews = function(feed) {
    var rail = qs('#sidebar-reviews-rail');
    var container = qs('#sidebar-reviews');
    if (!rail || !container) return;

    if (!feed || !feed.feed || !feed.feed.entry || !feed.feed.entry.length) {
      rail.classList.remove('is-loading');
      rail.classList.add('is-hidden');
      return;
    }

    try {
      var entries = feed.feed.entry.slice(0, 4);
      var items = [];

      for (var j = 0; j < entries.length; j++) {
        items.push(
          '<a class="sidebar-review-item" href="' + djsEscapeHtml(djsFeedGetLink(entries[j])) + '">' +
            '<span class="sidebar-review-thumb" style="background-image:url("' + djsEscapeHtml(djsFeedGetImage(entries[j], '/s1600/')) + '")"></span>' +
            '<span class="sidebar-review-title">' + djsEscapeHtml(djsFeedGetTitle(entries[j])) + '</span>' +
          '</a>'
        );
      }

      container.innerHTML = items.join('');
      rail.classList.remove('is-loading');
      rail.classList.add('is-ready');
    } catch (e) {
      rail.classList.remove('is-loading');
      rail.classList.add('is-hidden');
    }
  };

  function loadSidebarReviews() {
    var rail = qs('#sidebar-reviews-rail');
    if (!rail) return;

    var existing = qs('#djs-sidebar-reviews-feed');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var script = document.createElement('script');
    script.id = 'djs-sidebar-reviews-feed';
    script.src = '/feeds/posts/default/-/Review?alt=json-in-script&max-results=4&callback=djsSidebarReviews';
    document.body.appendChild(script);
  }

  function isSinglePostView() {
    return !!document.querySelector('.post-body') && !document.querySelector('.home-snippet');
  }

  function initUpdatedStoryChip() {
    if (!isSinglePostView()) return;

    var postBodies = document.querySelectorAll('.post-body');
    var i = 0;
    while (i !== postBodies.length) {
      var postBody = postBodies[i];
      if (postBody.querySelector('.update-box')) {
        var post = postBody.closest('.post');
        if (post) {
          var meta = post.querySelector('.post-meta-row');
          if (meta && !meta.querySelector('.updated-story-chip')) {
            var chip = document.createElement('span');
            chip.className = 'updated-story-chip';
            chip.textContent = 'Updated';
            meta.appendChild(chip);
          }
        }
      }
      i++;
    }
  }

  function djsGetTextLabels(nodes) {
    var labels = [];
    var i = 0;
    while (i !== nodes.length) {
      var value = (nodes[i].textContent || '').replace(/^\s+|\s+$/g, '');
      if (value) labels.push(value);
      i++;
    }
    return labels;
  }

  function djsGetEntryLabels(entry) {
    var labels = [];
    if (!entry || !entry.category) return labels;
    var i = 0;
    while (i !== entry.category.length) {
      if (entry.category[i] && entry.category[i].term) labels.push(entry.category[i].term);
      i++;
    }
    return labels;
  }

  function djsHasLabel(labels, value) {
    var i = 0;
    while (i !== labels.length) {
      if ((labels[i] || '').toLowerCase() === (value || '').toLowerCase()) return true;
      i++;
    }
    return false;
  }

  function djsFirstMatchingLabel(labels, options) {
    var i = 0;
    while (i !== options.length) {
      if (djsHasLabel(labels, options[i])) return options[i];
      i++;
    }
    return '';
  }

  function djsInferPostType(labels) {
    if (djsHasLabel(labels, 'Specs')) return 'Specs';
    if (djsHasLabel(labels, 'Review')) return 'Review';
    if (djsHasLabel(labels, 'Guide')) return 'Guide';
    if (djsHasLabel(labels, 'Guides')) return 'Guide';
    if (djsHasLabel(labels, 'Deals')) return 'Deals';
    return 'News';
  }

  function djsRelatedFetch(label, callbackName) {
    var script = document.createElement('script');
    script.src = '/feeds/posts/default/-/' + encodeURIComponent(label) + '?alt=json-in-script&max-results=12&callback=' + callbackName;
    document.body.appendChild(script);
    return script;
  }

  function djsRelatedEntryIntel(entry) {
    var entryLabels = djsGetEntryLabels(entry);
    var entryTitle = djsNormalizeIntelText(djsFeedGetTitle(entry));
    var entryPlatform = djsFirstMatchingLabel(entryLabels, ['Android', 'iOS', 'Windows', 'Windows Phone', 'Chrome OS', 'Mac']);
    return {
      labels: entryLabels,
      title: entryTitle,
      postType: djsInferPostType(entryLabels),
      brand: djsDetectBrand(entryLabels, entryTitle),
      family: djsDetectFamily(entryTitle, djsDetectBrand(entryLabels, entryTitle)),
      platform: entryPlatform
    };
  }

  function djsFamilyLabel(value) {
    if (!value) return '';
    if (value === 'galaxy-z-fold') return 'Galaxy Z Fold';
    if (value === 'galaxy-z-flip') return 'Galaxy Z Flip';
    if (value === 'galaxy-s') return 'Galaxy S';
    if (value === 'galaxy-a') return 'Galaxy A';
    if (value === 'pixel-a') return 'Pixel A';
    if (value === 'pixel-pro') return 'Pixel Pro';
    if (value === 'pixel-fold') return 'Pixel Fold';
    if (value === 'pixel-mainline') return 'Pixel';
    if (value === 'iphone-pro') return 'iPhone Pro';
    if (value === 'iphone-se') return 'iPhone SE';
    if (value === 'iphone-mainline') return 'iPhone';
    if (value === 'razr') return 'Razr';
    if (value === 'surface') return 'Surface';
    return value.replace(/-/g, ' ');
  }

  function djsCapitalizeWords(value) {
    return String(value || '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim().replace(/(^|\s)([a-z])/g, function(match) {
      return match.toUpperCase();
    });
  }

  function djsDeviceContextLabel(family, brand, platform) {
    var familyLabel = djsFamilyLabel(family || '');
    if (familyLabel) return djsCapitalizeWords(familyLabel);
    if (brand) return djsCapitalizeWords(brand);
    if (platform) return djsCapitalizeWords(platform);
    return 'This Topic';
  }

  function djsDeviceContextTitle(prefix, family, brand, platform) {
    return String(prefix || 'More on') + ' ' + djsDeviceContextLabel(family, brand, platform);
  }

  function djsReserveRelatedLink(link) {
    if (!link) return;
    if (!window.djsRelatedReservedLinks) window.djsRelatedReservedLinks = {};
    window.djsRelatedReservedLinks[link.replace(/#.*$/, '')] = true;
  }

  function djsIsRelatedLinkReserved(link) {
    var clean = (link || '').replace(/#.*$/, '');
    return !!(clean && window.djsRelatedReservedLinks && window.djsRelatedReservedLinks[clean]);
  }

  function djsCrossIntentScore(currentType, candidateType) {
    if (!candidateType) return 0;
    if (currentType === 'Specs') {
      if (candidateType === 'Review') return 7;
      if (candidateType === 'Guide') return 5;
      if (candidateType === 'News') return 2;
      if (candidateType === 'Specs') return 1;
    }
    if (currentType === 'Review') {
      if (candidateType === 'Specs') return 7;
      if (candidateType === 'Guide') return 5;
      if (candidateType === 'News') return 2;
      if (candidateType === 'Review') return 1;
    }
    if (currentType === 'Guide') {
      if (candidateType === 'Specs' || candidateType === 'Review') return 6;
      if (candidateType === 'News') return 2;
      if (candidateType === 'Guide') return 1;
    }
    if (currentType === 'Deals') {
      if (candidateType === 'Review') return 4;
      if (candidateType === 'Specs') return 3;
      if (candidateType === 'News') return 2;
      if (candidateType === 'Deals') return 1;
    }
    if (currentType === 'News') {
      if (candidateType === 'Review' || candidateType === 'Specs') return 4;
      if (candidateType === 'Guide') return 3;
      if (candidateType === 'News') return 1;
    }
    return 0;
  }

  function initDeviceContextBlock() {
    if (!isSinglePostView()) return;

    var post = document.querySelector('.post');
    var postBody = document.querySelector('.post-body');
    if (!post || !postBody || post.querySelector('.device-context-bridge')) return;

    var intel = window.djsDeviceIntel || {};
    var labelNodes = post.querySelectorAll('.post-meta-row .post-label-chip');
    var labels = djsGetTextLabels(labelNodes);
    var postType = intel.postType ? String(intel.postType).charAt(0).toUpperCase() + String(intel.postType).slice(1) : djsInferPostType(labels);
    var brand = intel.brand ? String(intel.brand).charAt(0).toUpperCase() + String(intel.brand).slice(1) : djsFirstMatchingLabel(labels, ['Samsung', 'Apple', 'Google', 'Motorola', 'Microsoft', 'Nokia', 'BlackBerry', 'Sony', 'HTC', 'LG', 'Nothing', 'OnePlus', 'Xiaomi']);
    var family = intel.family || '';
    var platform = djsFirstMatchingLabel(labels, ['Android', 'iOS', 'Windows', 'Windows Phone', 'Chrome OS', 'Mac']);
    if (!family && !brand && !platform) return;

    var contextLabel = djsDeviceContextLabel(family, brand, platform);
    var context = document.createElement('section');
    context.className = 'device-context-bridge';
    var chips = [];
    if (postType) chips.push(postType);
    if (brand) chips.push(brand);
    if (family) chips.push(djsFamilyLabel(family));
    if (!family && platform) chips.push(platform);

    var chipHtml = [];
    var i = 0;
    while (i !== chips.length) {
      if (chips[i]) chipHtml.push('<span class="device-context-chip">' + djsEscapeHtml(chips[i]) + '</span>');
      i++;
    }

    context.innerHTML =
      '<span class="device-context-kicker">Device Intelligence</span>' +
      '<h3 class="device-context-title">More on ' + djsEscapeHtml(contextLabel) + '</h3>' +
      '<p class="device-context-note">Follow related reviews, specs, guides, and news tied to this device family across DJs Mobiles.</p>' +
      '<div class="device-context-chips">' + chipHtml.join('') + '</div>';
    postBody.appendChild(context);
  }

  function initRelatedBridge() {
    if (!isSinglePostView()) return;

    var post = document.querySelector('.post');
    var postBody = document.querySelector('.post-body');
    if (!post || !postBody || post.querySelector('.related-bridge')) return;

    var labelNodes = post.querySelectorAll('.post-meta-row .post-label-chip');
    var labels = djsGetTextLabels(labelNodes);
    var intel = window.djsDeviceIntel || {};
    var postType = intel.postType ? String(intel.postType).charAt(0).toUpperCase() + String(intel.postType).slice(1) : djsInferPostType(labels);
    var brand = intel.brand ? String(intel.brand).charAt(0).toUpperCase() + String(intel.brand).slice(1) : djsFirstMatchingLabel(labels, ['Samsung', 'Apple', 'Google', 'Motorola', 'Microsoft', 'Nokia', 'BlackBerry', 'Sony', 'HTC', 'LG', 'Nothing', 'OnePlus', 'Xiaomi']);
    var family = intel.family || '';
    var platform = djsFirstMatchingLabel(labels, ['Android', 'iOS', 'Windows', 'Windows Phone', 'Chrome OS', 'Mac']);
    var currentUrl = window.location.href.replace(/#.*$/, '');
    var bridge = document.createElement('section');
    bridge.className = 'related-bridge';
    var relatedTitle = djsDeviceContextTitle('More on', family, brand, platform);
    bridge.innerHTML = '<h3 class="related-bridge-title">' + djsEscapeHtml(relatedTitle) + '</h3><div class="related-bridge-grid"></div>';
    postBody.appendChild(bridge);
    var grid = bridge.querySelector('.related-bridge-grid');

    function render(entries) {
      if (!grid) return;
      if (!entries.length) {
        grid.innerHTML = '<p class="related-bridge-empty">More related coverage will appear here as the site expands.</p>';
        return;
      }
      var items = [];
      var i = 0;
      while (i !== entries.length) {
        var entry = entries[i];
        var entryIntel = djsRelatedEntryIntel(entry);
        var kicker = djsFamilyLabel(entryIntel.family) || entryIntel.postType || brand || platform || 'News';
        items.push(
          '<a class="related-bridge-item" href="' + djsEscapeHtml(djsFeedGetLink(entry)) + '">' +
            '<span class="related-bridge-kicker">' + djsEscapeHtml(kicker) + '</span>' +
            '<p class="related-bridge-item-title">' + djsEscapeHtml(djsFeedGetTitle(entry)) + '</p>' +
          '</a>'
        );
        i++;
      }
      grid.innerHTML = items.join('');
      var renderedLinks = grid.querySelectorAll('.related-bridge-item');
      var renderedIndex = 0;
      while (renderedIndex !== renderedLinks.length) {
        djsReserveRelatedLink(renderedLinks[renderedIndex].getAttribute('href') || '');
        renderedIndex++;
      }
    }

    function scoreEntry(entry) {
      var info = djsRelatedEntryIntel(entry);
      var score = 0;
      var sameBrand = brand && info.brand && info.brand.toLowerCase() === brand.toLowerCase();
      var samePlatform = platform && info.platform && info.platform.toLowerCase() === platform.toLowerCase();
      var sameFamily = family && info.family === family;

      if (sameFamily) score += 34;
      if (sameFamily && info.postType !== postType) score += 12;
      if (sameFamily && sameBrand) score += 8;
      if (postType !== 'News' && info.postType === postType) score += 6;
      score += djsCrossIntentScore(postType, info.postType);
      if (sameBrand) score += 5;
      if (samePlatform) score += 2;

      if (family && sameBrand && !sameFamily) score -= 7;
      if (family && sameBrand && !info.family) score -= 4;
      if (family && !sameFamily && info.family) score -= 3;

      return score;
    }

    function dedupeAndSort(entries) {
      var filtered = [];
      var seen = {};
      var i = 0;
      while (i !== entries.length) {
        var link = djsFeedGetLink(entries[i]).replace(/#.*$/, '');
        if (link && link !== currentUrl && !seen[link] && !djsIsRelatedLinkReserved(link)) {
          seen[link] = true;
          filtered.push(entries[i]);
        }
        i++;
      }
      filtered.sort(function(a, b) { return scoreEntry(b) - scoreEntry(a); });
      return filtered.slice(0, 3);
    }

    var fetchQueue = [];
    function pushLabel(label) {
      if (!label) return;
      if (fetchQueue.indexOf(label) === -1) fetchQueue.push(label);
    }

    if (postType === 'Specs') {
      pushLabel(brand);
      pushLabel('Review');
      pushLabel('Guides');
      pushLabel('Specs');
      pushLabel(platform);
    } else if (postType === 'Review') {
      pushLabel(brand);
      pushLabel('Specs');
      pushLabel('Guides');
      pushLabel('Review');
      pushLabel(platform);
    } else if (postType === 'Deals') {
      pushLabel(brand);
      pushLabel('Review');
      pushLabel('Specs');
      pushLabel('Deals');
      pushLabel(platform);
    } else if (postType === 'Guide') {
      pushLabel(brand);
      pushLabel('Specs');
      pushLabel('Review');
      pushLabel('Guides');
      pushLabel(platform);
    } else {
      pushLabel(brand);
      pushLabel(platform);
      pushLabel('Review');
      pushLabel('Specs');
      pushLabel('News');
    }

    if (!fetchQueue.length) {
      render([]);
      return;
    }

    var pending = fetchQueue.length;
    var collected = [];

    function handleDone() {
      pending--;
      if (pending <= 0) render(dedupeAndSort(collected));
    }

    var fetchIndex = 0;
    while (fetchIndex !== fetchQueue.length) {
      (function(label, index) {
        var callbackName = 'djsRelatedFeedCallback_' + index;
        window[callbackName] = function(feed) {
          try {
            var entries = (feed && feed.feed && feed.feed.entry) ? feed.feed.entry.slice(0) : [];
            collected = collected.concat(entries);
          } catch (e) {}
          try { delete window[callbackName]; } catch (err) { window[callbackName] = null; }
          handleDone();
        };
        djsRelatedFetch(label, callbackName);
      })(fetchQueue[fetchIndex], fetchIndex);
      fetchIndex++;
    }
  }



  function djsDeviceHubSearchUrl(query) {
    return '/search?q=' + encodeURIComponent(String(query || '').replace(/^\s+|\s+$/g, ''));
  }

  function djsDeviceHubCompareTerms(family, brand, platform) {
    if (family === 'galaxy-s') return ['Google Pixel', 'iPhone Pro', 'OnePlus'];
    if (family === 'galaxy-z-fold') return ['Pixel Fold', 'Galaxy Z Flip', 'Surface Duo'];
    if (family === 'galaxy-z-flip') return ['Motorola Razr', 'Galaxy Z Fold', 'Galaxy S'];
    if (family === 'pixel-mainline' || family === 'pixel-pro' || family === 'pixel-a') return ['Galaxy S', 'iPhone', 'OnePlus'];
    if (family === 'iphone-pro' || family === 'iphone-mainline') return ['Galaxy S', 'Google Pixel', 'OnePlus'];
    if (family === 'razr') return ['Galaxy Z Flip', 'Galaxy Z Fold', 'Motorola'];
    if (brand) return [brand + ' specs', brand + ' review', brand + ' news'];
    if (platform) return [platform + ' specs', platform + ' reviews', platform + ' guides'];
    return [];
  }

  function initDeviceHubBlock() {
    if (!isSinglePostView()) return;

    var post = document.querySelector('.post');
    var postBody = document.querySelector('.post-body');
    if (!post || !postBody || post.querySelector('.device-hub')) return;

    var intel = window.djsDeviceIntel || {};
    var labelNodes = post.querySelectorAll('.post-meta-row .post-label-chip');
    var labels = djsGetTextLabels(labelNodes);
    var postType = intel.postType ? String(intel.postType).charAt(0).toUpperCase() + String(intel.postType).slice(1) : djsInferPostType(labels);
    var brand = intel.brand ? String(intel.brand).charAt(0).toUpperCase() + String(intel.brand).slice(1) : djsFirstMatchingLabel(labels, ['Samsung', 'Apple', 'Google', 'Motorola', 'Microsoft', 'Nokia', 'BlackBerry', 'Sony', 'HTC', 'LG', 'Nothing', 'OnePlus', 'Xiaomi']);
    var family = intel.family || '';
    var platform = djsFirstMatchingLabel(labels, ['Android', 'iOS', 'Windows', 'Windows Phone', 'Chrome OS', 'Mac']);
    if (!family && !brand && !platform) return;

    var contextLabel = djsDeviceContextLabel(family, brand, platform);
    var currentUrl = window.location.href.replace(/#.*$/, '');
    var hub = document.createElement('section');
    hub.className = 'device-hub';

    var quickLinks = [
      { label: 'All coverage', query: contextLabel },
      { label: 'Reviews', query: contextLabel + ' review' },
      { label: 'Specs', query: contextLabel + ' specs' },
      { label: 'News', query: contextLabel + ' news' },
      { label: 'Guides', query: contextLabel + ' guide' }
    ];
    var linkHtml = [];
    var i = 0;
    while (i !== quickLinks.length) {
      linkHtml.push('<a class="device-hub-link" href="' + djsEscapeHtml(djsDeviceHubSearchUrl(quickLinks[i].query)) + '">' + djsEscapeHtml(quickLinks[i].label) + '</a>');
      i++;
    }

    var compareTerms = djsDeviceHubCompareTerms(family, brand, platform);
    var compareHtml = [];
    i = 0;
    while (i !== compareTerms.length) {
      compareHtml.push('<a class="device-hub-compare-link" href="' + djsEscapeHtml(djsDeviceHubSearchUrl(contextLabel + ' vs ' + compareTerms[i])) + '">' + djsEscapeHtml(compareTerms[i]) + '</a>');
      i++;
    }

    hub.innerHTML =
      '<div class="device-hub-header">' +
        '<span class="device-hub-kicker">Device Hub</span>' +
        '<h3 class="device-hub-title">Explore ' + djsEscapeHtml(contextLabel) + '</h3>' +
        '<p class="device-hub-note">A cleaner path to related reviews, specs, guides, news, and comparisons connected to this device or topic.</p>' +
        '<div class="device-hub-actions">' + linkHtml.join('') + '</div>' +
        (compareHtml.length ? '<h4 class="device-hub-subtitle">Compare with</h4><div class="device-hub-compare">' + compareHtml.join('') + '</div>' : '') +
      '</div>' +
      '<h4 class="device-hub-subtitle">Connected coverage</h4>' +
      '<div class="device-hub-grid"><p class="device-hub-empty">Finding related coverage...</p></div>';

    postBody.appendChild(hub);
    var grid = hub.querySelector('.device-hub-grid');

    function scoreEntry(entry) {
      var info = djsRelatedEntryIntel(entry);
      var score = 0;
      var sameFamily = family && info.family === family;
      var sameBrand = brand && info.brand && info.brand.toLowerCase() === brand.toLowerCase();
      var samePlatform = platform && info.platform && info.platform.toLowerCase() === platform.toLowerCase();
      if (sameFamily) score += 36;
      if (sameFamily && info.postType !== postType) score += 14;
      if (sameBrand) score += 8;
      if (samePlatform) score += 3;
      score += djsCrossIntentScore(postType, info.postType);
      if (family && sameBrand && !sameFamily) score -= 6;
      return score;
    }

    function render(entries) {
      if (!grid) return;
      var filtered = [];
      var seen = {};
      var i = 0;
      while (i !== entries.length) {
        var link = djsFeedGetLink(entries[i]).replace(/#.*$/, '');
        if (link && link !== currentUrl && !seen[link] && !djsIsRelatedLinkReserved(link)) {
          seen[link] = true;
          filtered.push(entries[i]);
        }
        i++;
      }
      filtered.sort(function(a, b) { return scoreEntry(b) - scoreEntry(a); });
      filtered = filtered.slice(0, 4);
      if (!filtered.length) {
        grid.innerHTML = '<p class="device-hub-empty">More connected coverage will appear here as this device hub grows.</p>';
        return;
      }
      var items = [];
      i = 0;
      while (i !== filtered.length) {
        var entryIntel = djsRelatedEntryIntel(filtered[i]);
        var label = djsFamilyLabel(entryIntel.family) || entryIntel.postType || brand || platform || 'Coverage';
        items.push(
          '<a class="device-hub-card" href="' + djsEscapeHtml(djsFeedGetLink(filtered[i])) + '">' +
            '<span class="device-hub-card-label">' + djsEscapeHtml(label) + '</span>' +
            '<p class="device-hub-card-title">' + djsEscapeHtml(djsFeedGetTitle(filtered[i])) + '</p>' +
          '</a>'
        );
        i++;
      }
      grid.innerHTML = items.join('');
    }

    var fetchLabels = [];
    function pushLabel(label) {
      if (!label) return;
      if (fetchLabels.indexOf(label) === -1) fetchLabels.push(label);
    }
    pushLabel(brand);
    pushLabel(platform);
    pushLabel('Review');
    pushLabel('Specs');
    pushLabel('Guides');
    pushLabel('News');

    if (!fetchLabels.length) {
      render([]);
      return;
    }

    var pending = fetchLabels.length;
    var collected = [];
    var fetchIndex = 0;
    while (fetchIndex !== fetchLabels.length) {
      (function(label, index) {
        var callbackName = 'djsDeviceHubCallback_' + index;
        window[callbackName] = function(feed) {
          try {
            var entries = (feed && feed.feed && feed.feed.entry) ? feed.feed.entry.slice(0) : [];
            collected = collected.concat(entries);
          } catch (e) {}
          try { delete window[callbackName]; } catch (err) { window[callbackName] = null; }
          pending--;
          if (pending <= 0) render(collected);
        };
        djsRelatedFetch(label, callbackName);
      })(fetchLabels[fetchIndex], fetchIndex);
      fetchIndex++;
    }
  }

  function initContentBridge() {
    if (!isSinglePostView()) return;

    var post = document.querySelector('.post');
    var postBody = document.querySelector('.post-body');
    if (!post || !postBody || post.querySelector('.content-bridge')) return;

    var intel = window.djsDeviceIntel || {};
    var labelNodes = post.querySelectorAll('.post-meta-row .post-label-chip');
    var labels = djsGetTextLabels(labelNodes);
    var postType = intel.postType ? String(intel.postType).charAt(0).toUpperCase() + String(intel.postType).slice(1) : djsInferPostType(labels);
    var brand = intel.brand ? String(intel.brand).charAt(0).toUpperCase() + String(intel.brand).slice(1) : djsFirstMatchingLabel(labels, ['Samsung', 'Apple', 'Google', 'Motorola', 'Microsoft', 'Nokia', 'BlackBerry', 'Sony', 'HTC', 'LG', 'Nothing', 'OnePlus', 'Xiaomi']);
    var family = intel.family || '';
    var platform = djsFirstMatchingLabel(labels, ['Android', 'iOS', 'Windows', 'Windows Phone', 'Chrome OS', 'Mac']);
    var currentUrl = window.location.href.replace(/#.*$/, '');

    var bridge = document.createElement('section');
    bridge.className = 'content-bridge';
    var bridgeTitle = family ? djsDeviceContextTitle('Next steps for', family, brand, platform) : 'Explore More';
    bridge.innerHTML = '<h3 class="content-bridge-title">' + djsEscapeHtml(bridgeTitle) + '</h3><div class="content-bridge-grid"></div>';
    postBody.appendChild(bridge);
    var grid = bridge.querySelector('.content-bridge-grid');

    function getTargets() {
      if (postType === 'Specs') {
        return [
          { type: 'Review', label: 'Review', kicker: 'Read the review', note: 'See how this device performs in real-world use.' },
          { type: 'News', label: brand || platform || 'News', kicker: 'Latest coverage', note: 'Catch up on newer stories tied to this device or brand.' }
        ];
      }
      if (postType === 'Review') {
        return [
          { type: 'Specs', label: 'Specs', kicker: 'View full specs', note: 'Jump into the technical breakdown and hardware details.' },
          { type: 'News', label: brand || platform || 'News', kicker: 'More coverage', note: 'See what else is happening around this device and brand.' }
        ];
      }
      if (postType === 'Guide') {
        return [
          { type: 'Specs', label: 'Specs', kicker: 'View related specs', note: 'Compare the hardware behind the devices mentioned here.' },
          { type: 'Review', label: 'Review', kicker: 'Read related reviews', note: 'See hands-on impressions and buying advice next.' }
        ];
      }
      return [
        { type: 'Specs', label: 'Specs', kicker: 'View related specs', note: 'Dive into the hardware details behind this story.' },
        { type: 'Review', label: 'Review', kicker: 'Read related reviews', note: 'See how related devices actually perform.' }
      ];
    }

    function scoreForTarget(entry, target) {
      var info = djsRelatedEntryIntel(entry);
      var score = 0;
      var sameBrand = brand && info.brand && info.brand.toLowerCase() === brand.toLowerCase();
      var samePlatform = platform && info.platform && info.platform.toLowerCase() === platform.toLowerCase();
      var sameFamily = family && info.family === family;
      if (target.type && info.postType === target.type) score += 14;
      if (sameFamily) score += 26;
      if (sameFamily && target.type && info.postType === target.type) score += 14;
      if (sameBrand) score += 6;
      if (samePlatform) score += 2;
      if (family && sameBrand && !sameFamily) score -= 6;
      if (family && sameBrand && !info.family) score -= 3;
      return score;
    }

    function bestEntry(entries, target) {
      var best = null;
      var bestScore = -1;
      var seen = {};
      var i = 0;
      while (i !== entries.length) {
        var entry = entries[i];
        var link = djsFeedGetLink(entry).replace(/#.*$/, '');
        if (!link || link === currentUrl || seen[link] || djsIsRelatedLinkReserved(link)) {
          i++;
          continue;
        }
        seen[link] = true;
        var score = scoreForTarget(entry, target);
        if (score > bestScore) {
          bestScore = score;
          best = entry;
        }
        i++;
      }
      if (bestScore <= 0) return null;
      return best;
    }

    function render(targets, buckets) {
      if (!grid) return;
      var items = [];
      var i = 0;
      while (i !== targets.length) {
        var entry = bestEntry(buckets[i], targets[i]);
        if (entry) {
          items.push(
            '<a class="content-bridge-item" href="' + djsEscapeHtml(djsFeedGetLink(entry)) + '">' +
              '<span class="content-bridge-label">' + djsEscapeHtml(targets[i].kicker) + '</span>' +
              '<p class="content-bridge-item-title">' + djsEscapeHtml(djsFeedGetTitle(entry)) + '</p>' +
              '<p class="content-bridge-item-note">' + djsEscapeHtml(targets[i].note) + '</p>' +
            '</a>'
          );
        }
        i++;
      }
      if (!items.length) {
        grid.innerHTML = '<p class="content-bridge-empty">More connected coverage will appear here as related specs, reviews, and news expand.</p>';
        return;
      }
      grid.innerHTML = items.join('');
      var renderedLinks = grid.querySelectorAll('.content-bridge-item');
      var renderedIndex = 0;
      while (renderedIndex !== renderedLinks.length) {
        djsReserveRelatedLink(renderedLinks[renderedIndex].getAttribute('href') || '');
        renderedIndex++;
      }
    }

    var targets = getTargets();
    var pending = targets.length;
    var buckets = [];
    var idx = 0;
    while (idx !== targets.length) {
      buckets.push([]);
      idx++;
    }

    function fetchTarget(target, targetIndex) {
      var labelsToFetch = [];
      function pushLabel(label) {
        if (!label) return;
        if (labelsToFetch.indexOf(label) === -1) labelsToFetch.push(label);
      }

      pushLabel(target.label);
      pushLabel(brand);
      pushLabel(platform);
      if (family && target.type === 'Review') pushLabel('Specs');
      if (family && target.type === 'Specs') pushLabel('Review');

      var localPending = labelsToFetch.length;
      if (!localPending) {
        pending--;
        if (pending <= 0) render(targets, buckets);
        return;
      }

      var i = 0;
      while (i !== labelsToFetch.length) {
        (function(label, callbackIndex) {
          var callbackName = 'djsContentBridgeCallback_' + targetIndex + '_' + callbackIndex;
          window[callbackName] = function(feed) {
            try {
              var entries = (feed && feed.feed && feed.feed.entry) ? feed.feed.entry.slice(0) : [];
              buckets[targetIndex] = buckets[targetIndex].concat(entries);
            } catch (e) {}
            try { delete window[callbackName]; } catch (err) { window[callbackName] = null; }
            localPending--;
            if (localPending <= 0) {
              pending--;
              if (pending <= 0) render(targets, buckets);
            }
          };
          djsRelatedFetch(label, callbackName);
        })(labelsToFetch[i], i);
        i++;
      }
    }

    var targetIndex = 0;
    while (targetIndex !== targets.length) {
      fetchTarget(targets[targetIndex], targetIndex);
      targetIndex++;
    }
  }

  function djsNormalizeIntelText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9+]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function djsCollectSinglePostLabels() {
    var labels = [];
    var chips = document.querySelectorAll('.item-view .post-meta-row .post-label-chip');
    for (var i = 0; i < chips.length; i++) {
      var label = djsNormalizeIntelText(chips[i].textContent || chips[i].innerText || '');
      if (label && labels.indexOf(label) === -1) labels.push(label);
    }
    return labels;
  }

  function djsIntelHas(text, term) {
    return (' ' + text + ' ').indexOf(' ' + term + ' ') !== -1;
  }

  function djsDetectPostType(labels, title) {
    var text = labels.join(' | ') + ' | ' + title;
    if (djsIntelHas(text, 'spec') || djsIntelHas(text, 'specs')) return 'specs';
    if (djsIntelHas(text, 'review') || djsIntelHas(text, 'reviews')) return 'review';
    if (djsIntelHas(text, 'guide') || djsIntelHas(text, 'how to') || djsIntelHas(text, 'howto') || djsIntelHas(text, 'tutorial')) return 'guide';
    if (djsIntelHas(text, 'deal') || djsIntelHas(text, 'deals') || djsIntelHas(text, 'sale') || djsIntelHas(text, 'discount')) return 'deals';
    return 'news';
  }

  function djsDetectBrand(labels, title) {
    var text = labels.join(' | ') + ' | ' + title;
    var brands = [
      ['samsung', ['samsung', 'galaxy']],
      ['apple', ['apple', 'iphone', 'ipad', 'mac']],
      ['google', ['google', 'pixel', 'nest']],
      ['microsoft', ['microsoft', 'surface', 'lumia', 'windows phone']],
      ['motorola', ['motorola', 'moto', 'razr']],
      ['nothing', ['nothing', 'cmf']],
      ['oneplus', ['oneplus']],
      ['nokia', ['nokia']],
      ['sony', ['sony', 'xperia']],
      ['blackberry', ['blackberry']],
      ['htc', ['htc']],
      ['lg', ['lg']]
    ];
    for (var i = 0; i < brands.length; i++) {
      for (var j = 0; j < brands[i][1].length; j++) {
        if (djsIntelHas(text, brands[i][1][j])) return brands[i][0];
      }
    }
    return '';
  }

  function djsDetectFamily(title, brand) {
    var text = title;
    if (djsIntelHas(text, 'galaxy z fold') || djsIntelHas(text, 'z fold')) return 'galaxy-z-fold';
    if (djsIntelHas(text, 'galaxy z flip') || djsIntelHas(text, 'z flip')) return 'galaxy-z-flip';
    if (/galaxy s[0-9]/.test(text) || djsIntelHas(text, 'galaxy s ultra') || djsIntelHas(text, 'galaxy s plus')) return 'galaxy-s';
    if (/galaxy a[0-9]/.test(text)) return 'galaxy-a';
    if (/pixel [0-9]+a/.test(text) || djsIntelHas(text, 'pixel a')) return 'pixel-a';
    if (/pixel [0-9]+ pro/.test(text) || djsIntelHas(text, 'pixel pro')) return 'pixel-pro';
    if (djsIntelHas(text, 'pixel fold')) return 'pixel-fold';
    if (/pixel [0-9]/.test(text)) return 'pixel-mainline';
    if (/iphone [0-9]+ pro/.test(text) || djsIntelHas(text, 'iphone pro')) return 'iphone-pro';
    if (djsIntelHas(text, 'iphone se')) return 'iphone-se';
    if (/iphone [0-9]+/.test(text)) return 'iphone-mainline';
    if (djsIntelHas(text, 'ipad pro')) return 'ipad-pro';
    if (djsIntelHas(text, 'ipad air')) return 'ipad-air';
    if (djsIntelHas(text, 'ipad mini')) return 'ipad-mini';
    if (djsIntelHas(text, 'surface pro')) return 'surface-pro';
    if (djsIntelHas(text, 'surface laptop')) return 'surface-laptop';
    if (djsIntelHas(text, 'lumia')) return 'lumia';
    if (djsIntelHas(text, 'razr')) return 'razr';
    if (djsIntelHas(text, 'moto g')) return 'moto-g';
    if (djsIntelHas(text, 'moto edge')) return 'moto-edge';
    if (djsIntelHas(text, 'nothing phone') || /phone \([0-9]\)/.test(text)) return 'nothing-phone';
    if (djsIntelHas(text, 'cmf phone')) return 'cmf-phone';
    if (/oneplus [0-9]+/.test(text)) return 'oneplus-number';
    if (djsIntelHas(text, 'nord')) return 'oneplus-nord';
    if (djsIntelHas(text, 'xperia')) return 'xperia';
    if (brand === 'samsung' && djsIntelHas(text, 'galaxy')) return 'galaxy';
    if (brand === 'google' && djsIntelHas(text, 'pixel')) return 'pixel';
    if (brand === 'apple' && djsIntelHas(text, 'iphone')) return 'iphone';
    return '';
  }

  function initDeviceFamilyFramework() {
    var body = document.body;
    if (!body || !body.classList.contains('item-view')) return;

    var titleNode = document.querySelector('.item-view .post-title');
    var title = djsNormalizeIntelText(titleNode ? (titleNode.textContent || titleNode.innerText || '') : document.title);
    var labels = djsCollectSinglePostLabels();
    var postType = djsDetectPostType(labels, title);
    var brand = djsDetectBrand(labels, title);
    var family = djsDetectFamily(title, brand);

    window.djsDeviceIntel = {
      postType: postType,
      brand: brand,
      family: family,
      labels: labels,
      title: title
    };

    body.setAttribute('data-djs-post-type', postType || 'news');
    if (brand) body.setAttribute('data-djs-brand', brand);
    if (family) body.setAttribute('data-djs-family', family);
  }


  function djsBuildAmazonQuery(raw) {
    var query = String(raw || '')
      .replace(/\s*[\|\-:]+\s*DJs Mobiles.*$/i, '')
      .replace(/(review|reviews|specs|specifications|guide|guides|how to|hands-on|first look|vs\.?|versus|deals?)/gi, ' ')
      .replace(/[\(\)\[\]\{\}:,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return query;
  }

  function djsGetAmazonButtonText(postType) {
    if (postType === 'review') return 'Check price on Amazon';
    if (postType === 'specs') return 'View on Amazon';
    return 'See current deals';
  }

  function initAmazonBuyNowLinks() {
    var postButtons = document.querySelectorAll('.post-body .buy-now-button');
    if (!postButtons.length) return;

    var AFFILIATE_TAG = 'djsmobiles04-20';
    var body = document.body;
    var postType = body ? (body.getAttribute('data-djs-post-type') || '') : '';
    var buttonText = djsGetAmazonButtonText(postType);
    var intelTitle = window.djsDeviceIntel && window.djsDeviceIntel.title ? window.djsDeviceIntel.title : '';
    var titleNode = document.querySelector('.item-view .post-title, .post-single .post-title, .post-title');
    var rawTitle = intelTitle || (titleNode ? (titleNode.textContent || titleNode.innerText || '') : document.title);
    var query = djsBuildAmazonQuery(rawTitle);
    if (!query) return;

    var amazonUrl = 'https://www.amazon.com/s?k=' + encodeURIComponent(query);
    if (AFFILIATE_TAG && AFFILIATE_TAG !== 'YOUR-AMAZON-TAG') {
      amazonUrl += '&tag=' + encodeURIComponent(AFFILIATE_TAG);
    }

    for (var i = 0; i < postButtons.length; i++) {
      postButtons[i].setAttribute('href', amazonUrl);
      postButtons[i].setAttribute('target', '_blank');
      postButtons[i].setAttribute('rel', 'nofollow sponsored noopener');
      postButtons[i].textContent = buttonText;
    }
  }

  function initAffiliateDisclosure() {
    var postBody = document.querySelector('.item-view .post-body, .post-single .post-body, .post-body');
    if (!postBody) return;
    if (postBody.querySelector('.djs-affiliate-disclosure')) return;
    if (!postBody.querySelector('.buy-now-button')) return;

    var disclosure = document.createElement('div');
    disclosure.className = 'notice-box djs-affiliate-disclosure';
    disclosure.innerHTML = '<strong>Affiliate disclosure:</strong> This post may contain affiliate links. As an Amazon Associate, DJs Mobiles earns from qualifying purchases.';
    postBody.insertBefore(disclosure, postBody.firstChild);
  }

  function initStickyReviewCta() {
    var body = document.body;
    if (!body || body.getAttribute('data-djs-post-type') !== 'review') return;

    var sticky = document.getElementById('djs-sticky-review-cta');
    var stickyLink = document.getElementById('djs-sticky-review-link');
    var sourceButton = document.querySelector('.post-body .buy-now-button');
    if (!sticky || !stickyLink || !sourceButton) return;

    stickyLink.setAttribute('href', sourceButton.getAttribute('href') || '#');
    stickyLink.textContent = sourceButton.textContent || 'Check price on Amazon';

    function updateStickyState() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var trigger = Math.max(320, Math.floor((document.documentElement.scrollHeight - window.innerHeight) * 0.18));
      if (scrollTop > trigger) {
        sticky.classList.add('is-visible');
      } else {
        sticky.classList.remove('is-visible');
      }
    }

    updateStickyState();
    window.addEventListener('scroll', updateStickyState, { passive: true });
  }

  /* compact-feed v2 | Wider image extraction + polished fallback */
  function initCompactFeedCards() {
    var cards = document.querySelectorAll('.post.post-multi');
    if (!cards.length) return;

    function upgradeThumbUrl(src) {
      if (!src) return '';
      src = src.replace(/\/s\d+(-[a-z]+)?\//, '/s1600/');
      src = src.replace(/"/g, '%22');
      return src;
    }

    function extractThumbSrc(card) {
      var imgs = card.querySelectorAll('img');
      for (var k = 0; k < imgs.length; k++) {
        var img = imgs[k];
        var w = img.naturalWidth || parseInt(img.getAttribute('width') || '0', 10);
        var h = img.naturalHeight || parseInt(img.getAttribute('height') || '0', 10);
        if (w > 0 && w < 60) continue;
        if (h > 0 && h < 60) continue;
        var src = img.currentSrc
          || img.getAttribute('src')
          || img.getAttribute('data-src')
          || img.getAttribute('data-original')
          || '';
        if (src && src.indexOf('data:') !== 0) return upgradeThumbUrl(src);
      }
      return '';
    }

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var titleLink = card.querySelector('.post-title a');
      if (!titleLink) continue;

      var href = titleLink.getAttribute('href') || '';
      if (!href) continue;
      card.setAttribute('data-card-href', href);
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');

      var thumb = card.querySelector('.post-list-thumb');
      var src = extractThumbSrc(card);
      if (thumb && src) {
        thumb.style.backgroundImage = 'url("' + src + '")';
        thumb.classList.add('has-image');
      }

      card.addEventListener('click', function(event) {
        if (event.defaultPrevented) return;
        if (event.target.closest('a, button, input, textarea, select')) return;
        var destination = this.getAttribute('data-card-href');
        if (destination) window.location.href = destination;
      });

      card.addEventListener('keydown', function(event) {
        if (event.key !== 'Enter') return;
        if (event.target.closest('a, button, input, textarea, select')) return;
        var destination = this.getAttribute('data-card-href');
        if (destination) window.location.href = destination;
      });
    }
  }

  function initLightbox() {
    var lightbox = qs('#djs-lightbox');
    var image = qs('#djs-lightbox-img');
    var caption = qs('#djs-lightbox-caption');
    var closeButton = qs('#djs-lightbox-close');
    if (!lightbox || !image || !caption || !closeButton) return;

    function getLargeImage(src) {
      return src ? src.replace(/\/s\d+(-[a-z]+)?\//, '/s1600/') : '';
    }

    function openLightbox(src, alt) {
      image.src = getLargeImage(src);
      image.alt = alt || '';
      caption.textContent = alt || '';
      caption.style.display = alt ? 'block' : 'none';
      lightbox.classList.add('active');
      document.body.classList.add('djs-lb-open');
      closeButton.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.classList.remove('djs-lb-open');
      image.src = '';
      image.alt = '';
    }

    document.addEventListener('click', function(event) {
      var target = event.target;
      if (!target) return;

      if (target.tagName === 'IMG' && target.closest('.post-body,.post-outer,.home-snippet')) {
        if (target.closest('.site-header,.site-footer,.sidebar-area,.author-profile,.avatar-image-container')) return;
        event.preventDefault();
        openLightbox(target.currentSrc || target.src, target.alt);
        return;
      }

      var link = target.closest('a');
      if (link && link.closest('.post-body,.post-outer,.home-snippet')) {
        var childImage = qs('img', link);
        if (!childImage) return;
        if (link.closest('.site-header,.site-footer,.sidebar-area,.author-profile,.avatar-image-container')) return;
        event.preventDefault();
        openLightbox(childImage.currentSrc || childImage.src, childImage.alt);
      }
    });

    lightbox.addEventListener('click', function(event) {
      if (event.target === lightbox) closeLightbox();
    });

    closeButton.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeMenu(qs('#search-dropdown'), qs('#search-icon-btn'));
        closeMenu(qs('#nav-mobile'), qs('#hamburger-btn'));
        if (lightbox.classList.contains('active')) closeLightbox();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initHamburger();
    initSearch();
    initHttpsUpgrade();
    initPerformanceCleanup();
    initShrinkHeader();
    initCompactFeedCards();
    initDeviceFamilyFramework();
    loadFeaturedHomepage();
    loadSidebarReviews();
    initUpdatedStoryChip();
    initDeviceHubBlock();
    initAmazonBuyNowLinks();
    initAffiliateDisclosure();
    initStickyReviewCta();
    initLightbox();
  });
})();