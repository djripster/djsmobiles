/*
 * Pulse State
 * Module: pulse-state.js
 * Prototype: v0.3.8
 *
 * DJs Mobiles Website Pulse reader memory.
 * Website-only storage. No extension dependency.
 */

(function (window) {
  'use strict';

  const STORAGE_PREFIX = 'djs_pulse_website_';

  const KEYS = {
    firstSeen: STORAGE_PREFIX + 'first_seen',
    lastSeen: STORAGE_PREFIX + 'last_seen',
    lastVisit: STORAGE_PREFIX + 'last_visit',
    lastAutoOpen: STORAGE_PREFIX + 'last_auto_open',
    expanded: STORAGE_PREFIX + 'expanded',
    visitCount: STORAGE_PREFIX + 'visit_count',
    articleHistory: STORAGE_PREFIX + 'article_history',
    migrationVersion: STORAGE_PREFIX + 'migration_version',
    sessionVisit: STORAGE_PREFIX + 'session_visit',
    developer: 'djs_pulse_dev'
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function todayKey(date) {
    const value = date instanceof Date ? date : new Date(date || Date.now());
    if (Number.isNaN(value.getTime())) return new Date().toISOString().slice(0, 10);
    return value.toISOString().slice(0, 10);
  }

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* localStorage may be unavailable in private modes. Pulse should still render. */
    }
  }


  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      /* sessionStorage may be unavailable. Pulse should still render. */
    }
  }


  function safeJsonParse(value, fallback) {
    if (!value) return fallback;

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function safeNumber(value, fallback) {
    const number = parseInt(value, 10);
    return Number.isNaN(number) ? fallback : number;
  }

  function cleanText(value, fallback) {
    return String(value || fallback || '')
      .replace(/^DJs Mobiles\s*\|\s*Expert Tech Insights & Mobile News Since 2010:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9+]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function has(text, term) {
    return (' ' + text + ' ').indexOf(' ' + term + ' ') !== -1;
  }

  const BRAND_NAMES = {
    apple: 'Apple',
    google: 'Google',
    samsung: 'Samsung',
    microsoft: 'Microsoft',
    motorola: 'Motorola',
    nothing: 'Nothing',
    oneplus: 'OnePlus',
    nokia: 'Nokia',
    blackberry: 'BlackBerry',
    sony: 'Sony',
    htc: 'HTC',
    lg: 'LG',
    verizon: 'Verizon',
    't mobile': 'T-Mobile',
    tmobile: 'T-Mobile',
    'at t': 'AT&T',
    att: 'AT&T',
    qualcomm: 'Qualcomm',
    huawei: 'Huawei',
    xiaomi: 'Xiaomi',
    vivo: 'Vivo'
  };

  function canonicalBrandName(value) {
    const raw = cleanText(value);
    if (!raw) return '';
    return BRAND_NAMES[normalize(raw)] || raw;
  }

  function migrateStoredHistory() {
    const targetVersion = 1;
    const currentVersion = safeNumber(safeGet(KEYS.migrationVersion), 0);

    if (currentVersion >= targetVersion) return;

    const history = safeJsonParse(safeGet(KEYS.articleHistory), []);

    if (Array.isArray(history)) {
      const migrated = history.map(function (item) {
        if (!item || typeof item !== 'object') return item;

        const next = Object.assign({}, item);
        next.brand = canonicalBrandName(item.brand);
        return next;
      });

      safeSet(KEYS.articleHistory, JSON.stringify(migrated));
    }

    safeSet(KEYS.migrationVersion, String(targetVersion));
  }

  function addTopic(topics, topic) {
    if (!topic) return topics;
    const list = Array.isArray(topics) ? topics.slice(0, 6) : [];
    if (list.indexOf(topic) === -1) list.push(topic);
    return list.slice(0, 6);
  }

  function cleanHistoryEntry(item) {
    if (!item || !item.url) return null;

    const title = cleanText(item.title, 'Untitled article');
    const text = normalize(title);
    let brand = cleanText(item.brand);
    let platform = cleanText(item.platform);
    let topics = Array.isArray(item.topics) ? item.topics.slice(0, 6) : [];

    if (has(text, 'pokemon') || has(text, 'pokémon')) {
      if (brand === 'Apple') brand = '';
      topics = addTopic(topics, 'Gaming');
    }

    if (has(text, 'brave') || has(text, 'browser') || has(text, 'firefox')) {
      if (brand === 'Microsoft' && !has(text, 'microsoft') && !has(text, 'surface')) brand = '';
      topics = addTopic(topics, 'Browsers');
    }

    if (brand === 'Apple' && (has(text, 'iphone and android') || has(text, 'ios and android'))) {
      brand = '';
    }

    if ((has(text, 'iphone') || has(text, 'ios') || has(text, 'ipad')) && has(text, 'android')) {
      platform = 'Mobile';
    }

    return {
      title,
      url: item.url,
      timestamp: item.timestamp || item.recordedAt || nowIso(),
      recordedAt: item.recordedAt || item.timestamp || nowIso(),
      brand,
      family: cleanText(item.family),
      familyId: cleanText(item.familyId),
      platform,
      type: cleanText(item.type, 'Article'),
      topics,
      isSponsored: item.isSponsored === true,
      isGuest: item.isGuest === true
    };
  }

  function canonicalUrl() {
    const canonical = window.document && window.document.querySelector
      ? window.document.querySelector('link[rel="canonical"]')
      : null;

    return canonical && canonical.href ? canonical.href : window.location.href.split('#')[0];
  }

  function formatMonthYear(isoValue) {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }
  function normalizeArticleInput(article) {
    if (!article) return null;

    const articleData = article.article || article;
    const pageData = article.page || {};

    return {
      title: articleData.title || pageData.title || window.document.title,
      url: articleData.url || pageData.url || canonicalUrl(),
      brand: articleData.brand || article.brand || '',
      family: articleData.family || article.family || '',
      familyId: articleData.familyId || article.familyId || '',
      platform: articleData.platform || article.platform || '',
      type: articleData.type || articleData.postType || article.postType || article.type || 'Article',
      topics: Array.isArray(articleData.topics)
        ? articleData.topics
        : (Array.isArray(article.topics) ? article.topics : []),
      isSponsored: articleData.isSponsored === true || article.isSponsored === true,
      isGuest: articleData.isGuest === true || article.isGuest === true
    };
  }
  const PulseState = {
    version: '0.3.8',
    keys: KEYS,

    load() {
      migrateStoredHistory();

      const current = nowIso();
      let firstSeen = safeGet(KEYS.firstSeen);
      const previousLastSeen = safeGet(KEYS.lastSeen);
      const expandedValue = safeGet(KEYS.expanded);
      const previousVisitCount = safeNumber(safeGet(KEYS.visitCount), 0);
      const sessionAlreadyCounted = safeSessionGet(KEYS.sessionVisit) === todayKey(current);
      const visitCount = sessionAlreadyCounted ? previousVisitCount : previousVisitCount + 1;

      if (!firstSeen) {
        firstSeen = current;
        safeSet(KEYS.firstSeen, firstSeen);
      }

      safeSet(KEYS.lastVisit, previousLastSeen || current);
      safeSet(KEYS.lastSeen, current);
      safeSet(KEYS.visitCount, String(visitCount));
      safeSessionSet(KEYS.sessionVisit, todayKey(current));

      return {
        firstSeen,
        lastSeen: current,
        previousLastSeen,
        lastVisit: previousLastSeen || current,
        lastAutoOpen: safeGet(KEYS.lastAutoOpen),
        isExpanded: expandedValue === null ? true : expandedValue === 'true',
        isFirstVisit: !previousLastSeen,
        followingSince: formatMonthYear(firstSeen),
        visitCount,
        articleHistory: this.getArticleHistory(),
        interests: this.getReaderInterests(),
        timeline: this.getReaderTimeline(),
        continueReading: this.getContinueReading(),
        weeklyPulse: this.getWeeklyPulse()
      };
    },

    setExpanded(value) {
      safeSet(KEYS.expanded, value ? 'true' : 'false');
    },

    getArticleHistory() {
      const history = safeJsonParse(safeGet(KEYS.articleHistory), []);
      if (!Array.isArray(history)) return [];

      const seenUrls = {};
      const cleaned = [];

      history.forEach(function (item) {
        const entry = cleanHistoryEntry(item);
        if (!entry || seenUrls[entry.url]) return;
        seenUrls[entry.url] = true;
        cleaned.push(entry);
      });

      const limited = cleaned.slice(0, 200);
      safeSet(KEYS.articleHistory, JSON.stringify(limited));
      return limited;
    },

    getReaderInterests() {
      const history = this.getArticleHistory();

      function rank(values) {
        const counts = {};

        values.forEach(function (value) {
          const name = cleanText(value);
          if (!name) return;
          counts[name] = (counts[name] || 0) + 1;
        });

        return Object.keys(counts)
          .map(function (key) {
            return {
              name: key,
              count: counts[key]
            };
          })
          .sort(function (a, b) {
            return b.count - a.count;
          });
      }

      const brands = [];
      const families = [];
      const platforms = [];
      const types = [];
      const topics = [];

      history.forEach(function (article) {
        if (!article) return;

        if (article.brand) brands.push(article.brand);
        if (article.family) families.push(article.family);
        if (article.platform) platforms.push(article.platform);
        if (article.type) types.push(article.type);

        if (Array.isArray(article.topics)) {
          article.topics.forEach(function (topic) {
            topics.push(topic);
          });
        }
      });

      return {
        brands: rank(brands),
        families: rank(families),
        platforms: rank(platforms),
        types: rank(types),
        topics: rank(topics),
        totalRead: history.length
      };
    },

    getReaderProfile() {
      return this.getReaderInterests();
    },

    getReaderTimeline() {
      const history = this.getArticleHistory();
      const groups = {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: []
      };

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneDay = 86400000;

      history.forEach(function (article) {
        if (!article) return;

        const rawDate = article.recordedAt || article.timestamp;
        const articleTime = new Date(rawDate).getTime();

        if (Number.isNaN(articleTime)) {
          groups.older.push(article);
          return;
        }

        if (articleTime >= startOfToday) {
          groups.today.push(article);
          return;
        }

        if (articleTime >= startOfToday - oneDay) {
          groups.yesterday.push(article);
          return;
        }

        if (articleTime >= startOfToday - (7 * oneDay)) {
          groups.thisWeek.push(article);
          return;
        }

        groups.older.push(article);
      });

      return {
        today: groups.today,
        yesterday: groups.yesterday,
        thisWeek: groups.thisWeek,
        older: groups.older,
        recent: history.slice(0, 5)
      };
    },

    getContinueReading(currentUrl) {
      const history = this.getArticleHistory();
      const activeUrl = currentUrl || canonicalUrl();

      const candidates = history.filter(function (article) {
        return article && article.url && article.url !== activeUrl;
      });

      const next = candidates.length ? candidates[0] : null;

      if (!next) {
        return {
          available: false,
          title: '',
          url: '',
          label: 'Continue Reading',
          message: ''
        };
      }

      return {
        available: true,
        title: next.title,
        url: next.url,
        label: 'Continue Reading',
        message: 'Pick up with a recent story from your Pulse history.',
        article: next
      };
    },


    getWeeklyPulse() {
      const history = this.getArticleHistory();
      const cutoff = Date.now() - (7 * 86400000);
      const recent = history.filter(function (article) {
        if (!article) return false;
        const rawDate = article.recordedAt || article.timestamp;
        const articleTime = new Date(rawDate).getTime();
        return !Number.isNaN(articleTime) && articleTime >= cutoff;
      });

      function rank(values) {
        const counts = {};

        values.forEach(function (value) {
          const name = cleanText(value);
          if (!name) return;
          counts[name] = (counts[name] || 0) + 1;
        });

        return Object.keys(counts)
          .map(function (name) {
            return { name, count: counts[name] };
          })
          .sort(function (a, b) {
            return b.count - a.count || a.name.localeCompare(b.name);
          });
      }

      const brands = [];
      const topics = [];
      const types = [];
      const activeDays = {};

      recent.forEach(function (article) {
        if (article.brand) brands.push(article.brand);
        if (article.type) types.push(article.type);
        if (Array.isArray(article.topics)) {
          article.topics.forEach(function (topic) {
            topics.push(topic);
          });
        }

        const rawDate = article.recordedAt || article.timestamp;
        activeDays[todayKey(rawDate)] = true;
      });

      const rankedBrands = rank(brands);
      const rankedTopics = rank(topics);
      const rankedTypes = rank(types);
      const dayCount = Object.keys(activeDays).length;

      return {
        available: recent.length >= 3,
        articleCount: recent.length,
        activeDays: dayCount,
        topBrand: rankedBrands[0] || null,
        topTopic: rankedTopics[0] || null,
        topType: rankedTypes[0] || null,
        articles: recent.slice(0, 5)
      };
    },

    recordArticle(article) {
      const normalizedArticle = normalizeArticleInput(article);
      if (!normalizedArticle) return null;

      const title = cleanText(normalizedArticle.title, window.document ? window.document.title : 'Untitled article');
      const url = normalizedArticle.url || canonicalUrl();
      const timestamp = nowIso();

      if (!title || !url) return null;

      const entry = cleanHistoryEntry({
        title,
        url,
        timestamp,
        brand: normalizedArticle.brand,
        family: normalizedArticle.family,
        familyId: normalizedArticle.familyId,
        platform: normalizedArticle.platform,
        type: normalizedArticle.type,
        topics: normalizedArticle.topics,
        isSponsored: normalizedArticle.isSponsored,
        isGuest: normalizedArticle.isGuest
      });

      if (!entry) return null;

      const history = this.getArticleHistory();
      const deduped = history.filter(function (item) {
        return item && item.url !== url;
      });

      deduped.unshift(entry);
      const limited = deduped.slice(0, 200);
      safeSet(KEYS.articleHistory, JSON.stringify(limited));

      return entry;
    },


    markAutoOpened(date) {
      safeSet(KEYS.lastAutoOpen, todayKey(date || Date.now()));
    },

    isDeveloper() {
      return safeGet(KEYS.developer) === 'true';
    },

    shouldAutoOpen(reader, options) {
      if (!reader) return false;

      const settings = options || {};
      const publicAutoOpen = settings.publicAutoOpen === true;
      const developerMode = this.isDeveloper();

      if (!developerMode && !publicAutoOpen) {
        return false;
      }

      const lastAutoOpen = reader.lastAutoOpen || '';
      return lastAutoOpen !== todayKey(Date.now());
    },

    getDaysSinceLastVisit(reader) {
      if (!reader || !reader.previousLastSeen) return 0;
      const then = new Date(reader.previousLastSeen).getTime();
      const now = Date.now();
      if (Number.isNaN(then)) return 0;
      return Math.max(0, Math.floor((now - then) / 86400000));
    },

    reset() {
      Object.keys(KEYS).forEach(function (name) {
        try {
          window.localStorage.removeItem(KEYS[name]);
        } catch (error) {}

        try {
          window.sessionStorage.removeItem(KEYS[name]);
        } catch (error) {}
      });
    }
  };

  window.DjsPulseState = PulseState;
})(window);
