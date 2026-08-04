/* DJs Mobiles Core Article Context v1.3 */
(function () {
  function safeCall(fn, fallback) {
    try {
      return typeof fn === 'function' ? fn() : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function cleanTitle(value) {
    return String(value || '')
      .replace(/\s*[|—-]\s*DJs Mobiles.*$/i, '')
      .trim();
  }

  function normalizePageType(article) {
    if (article && article.isHome) return 'home';

    var path = window.location.pathname || '';
    if (path.indexOf('/p/') === 0) return 'page';
    if (path.indexOf('/search/label/') === 0) return 'label';
    if (path.indexOf('/search') === 0) return 'search';

    var body = document.body;
    if (body && body.classList.contains('item-view') && document.querySelector('.post-body')) {
      return 'article';
    }

    return 'unknown';
  }

  function familyDisplayName(value) {
    if (!value) return '';

    var map = {
      'galaxy-z-fold': 'Galaxy Z Fold',
      'galaxy-z-flip': 'Galaxy Z Flip',
      'galaxy-s': 'Galaxy S',
      'galaxy-a': 'Galaxy A',
      'pixel-a': 'Pixel A',
      'pixel-pro': 'Pixel Pro',
      'pixel-fold': 'Pixel Fold',
      'pixel-mainline': 'Pixel',
      'iphone-pro': 'iPhone Pro',
      'iphone-se': 'iPhone SE',
      'iphone-mainline': 'iPhone',
      'razr': 'Razr',
      'surface': 'Surface'
    };

    return map[value] || String(value).replace(/-/g, ' ');
  }

  function buildSiteIntelligence() {
    var intelligence = window.DjsIntelligence || {};
    var analyzed = safeCall(function () {
      return intelligence.analyzeArticle();
    }, {}) || {};

    var pageType = normalizePageType(analyzed);

    var article = null;

    if (pageType === 'article') {
      article = {
        type: analyzed.type || null,
        brand: analyzed.brand || null,
        platform: analyzed.platform || null,
        labels: analyzed.labels || [],
        topics: analyzed.topics || [],
        managedLabels: analyzed.managed || [],
        unclassifiedLabels: analyzed.unclassified || [],
        interestSignals: analyzed.interestSignals || [],
        isSponsored: false,
        isGuest: false
      };
    }

    return {
      schemaVersion: 1,
      ready: true,

      page: {
        type: pageType,
        url: window.location.href,
        title: cleanTitle(analyzed.title || document.title)
      },

      article: article
    };
  }

function publishSiteIntelligence() {
  var payload = buildSiteIntelligence();

  window.DJS_SITE_INTELLIGENCE = payload;

  // Website consumers
  window.dispatchEvent(new CustomEvent('djs:intelligence-ready', {
    detail: payload
  }));

  // Extension/content-script consumers
  document.dispatchEvent(new CustomEvent('djs:intelligence-ready', {
    detail: payload
  }));

  return payload;
}

  function publishWhenReady() {
    var intelligence = window.DjsIntelligence || {};
    var registryReady = safeCall(function () {
      return typeof intelligence.initLabelRegistry === 'function'
        ? intelligence.initLabelRegistry()
        : intelligence.labelRegistryReady;
    }, null);

    if (registryReady && typeof registryReady.then === 'function') {
      registryReady.then(publishSiteIntelligence).catch(publishSiteIntelligence);
      return;
    }

    publishSiteIntelligence();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', publishWhenReady);
  } else {
    publishWhenReady();
  }
})();
