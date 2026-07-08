/*
 * DJs Mobiles Intelligence
 * Module: intelligence.js
 * Prototype: v0.2.4
 *
 * Shared website intelligence layer.
 * Theme first. Pulse second.
 */

(function (window, document) {
  'use strict';

  const SITE_TITLE_PREFIX = /^DJs Mobiles\s*\|\s*Expert Tech Insights & Mobile News Since 2010:\s*/i;
  const LABEL_REGISTRY_URL = 'https://djripster.github.io/djsmobiles/theme/data/label-registry.json';

  const Intelligence = {
    version: '0.2.5',
    labelRegistry: null,
    labelRegistryReady: null,

    initLabelRegistry() {
      if (this.labelRegistryReady) return this.labelRegistryReady;

      if (typeof window.fetch !== 'function') {
        this.labelRegistryReady = Promise.resolve(null);
        return this.labelRegistryReady;
      }

      this.labelRegistryReady = window.fetch(LABEL_REGISTRY_URL, { cache: 'no-cache' })
        .then(response => {
          if (!response || !response.ok) return null;
          return response.json();
        })
        .then(registry => {
          if (registry && registry.labels) {
            this.labelRegistry = registry;
          }

          return this.labelRegistry;
        })
        .catch(() => null);

      return this.labelRegistryReady;
    },

    isHomePage() {
      const path = window.location.pathname.replace(/\/+$/, '');
      return path === '' || path === '/';
    },

    isArticlePage() {
      return document.body &&
        document.body.classList.contains('item-view') &&
        !!document.querySelector('.post-body');
    },

    normalize(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9+]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },

    has(text, term) {
      return (' ' + text + ' ').indexOf(' ' + term + ' ') !== -1;
    },

    hasAny(text, terms) {
      return (terms || []).some(term => this.has(text, term));
    },

    cleanTitle(value) {
      const title = String(value || document.title || '')
        .replace(SITE_TITLE_PREFIX, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (title.indexOf(': ') !== -1 && title.toLowerCase().indexOf('djs mobiles') === 0) {
        return title.split(': ').slice(1).join(': ').trim();
      }

      return title;
    },

    getArticleRoot() {
      return document.querySelector('.post-outer, article, .post, .blog-posts .post') || document;
    },


    getLabelRegistryMap() {
      return this.labelRegistry && this.labelRegistry.labels
        ? this.labelRegistry.labels
        : {};
    },

    getRegistryEntryForLabel(label) {
      const labels = this.getLabelRegistryMap();
      const raw = String(label || '').trim();

      if (!raw) return null;
      if (labels[raw]) return labels[raw];

      const normalized = this.normalize(raw);

      for (const key in labels) {
        if (Object.prototype.hasOwnProperty.call(labels, key) && this.normalize(key) === normalized) {
          return labels[key];
        }
      }

      return null;
    },

    classifyLabels(labels) {
      const result = {
        brand: null,
        platform: null,
        type: null,
        topics: []
      };

      (labels || []).forEach(label => {
        const entry = this.getRegistryEntryForLabel(label);
        if (!entry) return;

        const entryClass = entry.class || entry.type || '';
        const normalizedClass = this.normalize(entryClass);
        const name = entry.name || String(label || '').trim();

        if (normalizedClass === 'brand' && !result.brand) {
          result.brand = {
            id: entry.id || this.normalize(name).replace(/\s+/g, '-'),
            name
          };
          return;
        }

        if (normalizedClass === 'platform' && !result.platform) {
          result.platform = {
            id: entry.id || this.normalize(name).replace(/\s+/g, '-'),
            name
          };
          return;
        }

        if ((normalizedClass === 'content type' || normalizedClass === 'content-type' || normalizedClass === 'content') && !result.type) {
          result.type = {
            id: entry.id || this.normalize(name).replace(/\s+/g, '-'),
            name
          };
          return;
        }

        if (normalizedClass === 'topic') {
          const topic = {
            id: entry.id || this.normalize(name).replace(/\s+/g, '-'),
            name
          };

          if (!result.topics.some(existing => existing.name === topic.name)) {
            result.topics.push(topic);
          }
        }
      });

      return result;
    },

    detectBrand(title, labels) {
      const classified = this.classifyLabels(labels);
      if (classified.brand) return classified.brand.name;
      const titleText = this.normalize(title || '');
      const labelText = this.normalize((labels || []).join(' '));

      const topicOnlySignals = [
        'pokemon',
        'pokémon',
        'brave browser',
        'brave',
        'firefox',
        'chrome browser',
        'browser review'
      ];

      const productContextBrands = [
        ['Samsung', ['samsung', 'galaxy']],
        ['Apple', ['apple', 'homepod', 'iphone', 'ipad', 'macbook', 'imac', 'airpods', 'apple watch']],
        ['Google', ['google', 'pixel', 'nest', 'chromecast']],
        ['Microsoft', ['microsoft', 'surface', 'xbox']],
        ['Motorola', ['motorola', 'moto', 'razr']],
        ['Nothing', ['nothing', 'cmf']],
        ['OnePlus', ['oneplus']],
        ['Nokia', ['nokia']],
        ['BlackBerry', ['blackberry']],
        ['Sony', ['sony', 'xperia', 'wh 1000xm', 'wh1000xm', 'playstation']],
        ['HTC', ['htc']],
        ['LG', ['lg']],
        ['Verizon', ['verizon']],
        ['T-Mobile', ['t mobile', 'tmobile']],
        ['AT&T', ['at t', 'att']],
        ['Qualcomm', ['qualcomm', 'snapdragon']]
      ];

      for (const [brand, terms] of productContextBrands) {
        const directBrandName = this.normalize(brand);

        if (this.has(titleText, directBrandName)) {
          return brand;
        }

        const productTerms = terms.filter(function (term) {
          return ['homepod', 'iphone', 'ipad', 'macbook', 'imac', 'airpods', 'apple watch', 'galaxy', 'pixel', 'nest', 'chromecast', 'surface', 'xbox', 'moto', 'razr', 'xperia', 'wh 1000xm', 'wh1000xm', 'playstation', 'snapdragon'].indexOf(term) !== -1;
        });

        if (productTerms.some(term => this.has(titleText, term))) {
          if (brand === 'Apple' && this.hasAny(titleText, topicOnlySignals) && !this.has(titleText, 'apple')) {
            continue;
          }

          return brand;
        }
      }

      for (const [brand, terms] of productContextBrands) {
        const brandName = this.normalize(brand);

        if (this.has(labelText, brandName)) {
          return brand;
        }

        const strongTerms = terms.filter(function (term) {
          return ['galaxy', 'pixel', 'surface', 'moto', 'razr', 'xperia', 'snapdragon'].indexOf(term) !== -1;
        });

        if (strongTerms.some(term => this.has(labelText, term))) {
          return brand;
        }
      }

      return '';
    },

    detectPlatform(title, labels) {
      const classified = this.classifyLabels(labels);
      if (classified.platform) return classified.platform.name;

      const titleText = this.normalize(title || '');
      const labelText = this.normalize((labels || []).join(' '));
      const text = titleText + ' ' + labelText;

      const hasAndroid = this.has(text, 'android');
      const hasIos = this.has(text, 'ios') || this.has(text, 'iphone') || this.has(text, 'ipad');

      if (hasAndroid && hasIos) return 'Mobile';
      if (this.has(text, 'windows phone')) return 'Windows Phone';
      if (this.has(text, 'chrome os')) return 'Chrome OS';
      if (hasAndroid) return 'Android';
      if (hasIos) return 'iOS';
      if (this.has(titleText, 'windows')) return 'Windows';
      if (this.has(titleText, 'mac') || this.has(titleText, 'macos')) return 'Mac';

      return '';
    },

    detectPostType(title, labels) {
      const classified = this.classifyLabels(labels);
      if (classified.type) return classified.type.name;

      const text = this.normalize((title || '') + ' ' + (labels || []).join(' '));

      if (this.has(text, 'specs') || this.has(text, 'spec')) return 'Specs';
      if (this.has(text, 'review') || this.has(text, 'reviews')) return 'Review';
      if (this.has(text, 'editorial') || this.has(text, 'opinion') || this.has(text, 'analysis')) return 'Editorial';
      if (this.has(text, 'guide') || this.has(text, 'guides') || this.has(text, 'how to')) return 'Guide';
      if (this.has(text, 'deal') || this.has(text, 'deals')) return 'Deals';

      return 'News';
    },

    detectTopics(title, labels) {
      const classified = this.classifyLabels(labels);
      const text = this.normalize((title || '') + ' ' + (labels || []).join(' '));
      const topics = classified.topics.map(topic => topic.name);

      const topicMap = [
        ['AI', ['ai', 'artificial intelligence', 'galaxy ai', 'gemini', 'apple intelligence']],
        ['Browsers', ['browser', 'browsers', 'chrome', 'firefox', 'safari', 'edge', 'brave']],
        ['Privacy', ['privacy', 'private browsing']],
        ['Security', ['security', 'malware', 'password', 'passkey']],
        ['Camera', ['camera', 'photo', 'video', 'imaging']],
        ['Battery', ['battery', 'charging']],
        ['Foldables', ['foldable', 'foldables', 'z fold', 'z flip', 'razr']],
        ['Android Updates', ['android update', 'android beta', 'security patch', 'pixel update']],
        ['Gaming', ['gaming', 'game', 'pokemon', 'pokémon', 'console']],
        ['Wearables', ['wear os', 'watch', 'wearable']],
        ['Carriers', ['carrier', 'mvno', '5g', 'verizon', 't mobile', 'tmobile', 'at t', 'att']]
      ];

      for (const [topic, terms] of topicMap) {
        if (terms.some(term => this.has(text, term))) {
          if (topics.indexOf(topic) === -1) topics.push(topic);
        }
      }

      return topics;
    },

    collectArticleFromPage() {
      const root = this.getArticleRoot();
      const titleNode = root.querySelector('.post-title, h1') || document.querySelector('.post-title, h1, title');
      const labelNodes = root.querySelectorAll('.post-label-chip, a[rel="tag"]');
      const labels = [];

      labelNodes.forEach(function (node) {
        const label = String(node.textContent || '').trim();
        if (label && labels.indexOf(label) === -1) labels.push(label);
      });

      return {
        title: titleNode ? String(titleNode.textContent || '').trim() : document.title,
        labels
      };
    },

    analyzeArticle(article) {
      if (this.isHomePage() || !this.isArticlePage()) {
        return {
          title: 'DJs Mobiles',
          labels: [],
          brand: '',
          platform: '',
          type: 'Home',
          topics: [],
          isHome: true
        };
      }

      const source = article || this.collectArticleFromPage();
      const title = this.cleanTitle(source?.title || document.title || '');
      const labels = source?.labels || [];

      return {
        title,
        labels,
        brand: this.detectBrand(title, labels),
        platform: this.detectPlatform(title, labels),
        type: this.detectPostType(title, labels),
        topics: this.detectTopics(title, labels),
        isHome: false
      };
    },

    formatLastVisit(reader) {
      if (!reader || !reader.previousLastSeen) return 'Today';

      const daysAway = window.DjsPulseState
        ? window.DjsPulseState.getDaysSinceLastVisit(reader)
        : 0;

      if (daysAway <= 0) return 'Today';
      if (daysAway === 1) return 'Yesterday';

      return daysAway + ' days ago';
    },

    buildReaderStats(reader) {
      const stats = [
        {
          label: 'Following since',
          value: reader?.followingSince || 'Recently'
        },
        {
          label: 'Last visit',
          value: this.formatLastVisit(reader)
        }
      ];

      if (reader && typeof reader.visitCount !== 'undefined') {
        const count = Number(reader.visitCount) || 0;

        stats.push({
          label: 'Visits',
          value: count === 1 ? '1 visit' : count + ' visits'
        });
      }

      return stats;
    },

    getPulseConversation(reader) {
      const profile = this.buildPulseReaderProfile(reader);
      const state = this.getPulseConversationState(reader, profile);
      const stats = this.buildReaderStats(reader);

      return {
        eyebrow: 'Your Pulse',
        title: state.title,
        message: this.buildPulseConversationMessage(state, profile),
        mode: state.mode,
        stats
      };
    },

    buildPulseReaderProfile(reader) {
      const interests = reader && reader.interests ? reader.interests : {};
      const history = reader && Array.isArray(reader.articleHistory) ? reader.articleHistory : [];

      function top(list) {
        return Array.isArray(list) && list.length ? list[0] : null;
      }

      return {
        totalRead: history.length,
        topBrand: top(interests.brands),
        topFamily: top(interests.families),
        topPlatform: top(interests.platforms),
        topType: top(interests.types),
        topTopic: top(interests.topics)
      };
    },

    getPulseConversationState(reader, profile) {
      const daysAway = window.DjsPulseState && reader
        ? window.DjsPulseState.getDaysSinceLastVisit(reader)
        : 0;

      if (reader && reader.isFirstVisit) {
        return {
          mode: 'welcome',
          title: 'Welcome to Pulse.',
          daysAway
        };
      }

      if (daysAway >= 30) {
        return {
          mode: 'returning',
          title: 'It has been a while.',
          daysAway
        };
      }

      if (daysAway >= 7) {
        return {
          mode: 'returning',
          title: 'We have missed you.',
          daysAway
        };
      }

      if (daysAway >= 3) {
        return {
          mode: 'returning',
          title: 'Here is where you left off.',
          daysAway
        };
      }

      if (daysAway >= 1) {
        return {
          mode: 'returning',
          title: 'Welcome back.',
          daysAway
        };
      }

      if (profile.totalRead > 0) {
        return {
          mode: 'active',
          title: 'Your Pulse is active.',
          daysAway
        };
      }

      return {
        mode: 'welcome',
        title: 'Pulse is just getting started.',
        daysAway
      };
    },

    buildPulseConversationMessage(state, profile) {
      const profileNote = this.buildPulseProfileNote(profile);

      if (state.mode === 'welcome' && state.title === 'Welcome to Pulse.') {
        return 'Pulse remembers what you read and helps DJs Mobiles feel more personal over time.';
      }

      if (profileNote) return profileNote;

      if (state.daysAway >= 30) {
        return 'Welcome back. Pulse is ready to help you reconnect with what matters most.';
      }

      if (state.daysAway >= 7) {
        return 'A lot can happen in a week. Pulse will help you pick things back up.';
      }

      if (state.daysAway >= 3) {
        return 'Pulse is keeping track of your reading so you can ease back in.';
      }

      if (state.daysAway >= 1) {
        return 'Pulse is starting to learn what you like reading on DJs Mobiles.';
      }

      if (profile.totalRead > 0) {
        return 'Pulse is quietly keeping track of what you read.';
      }

      return 'More will appear here as Pulse accompanies you on your journey.';
    },

    buildPulseProfileNote(profile) {
      if (profile.topFamily) {
        return 'You have been spending time with ' + profile.topFamily.name + ' coverage lately.';
      }

      if (profile.topBrand) {
        return 'You have been reading a lot about ' + profile.topBrand.name + ' lately.';
      }

      if (profile.topTopic) {
        return 'You have been exploring ' + profile.topTopic.name + ' stories lately.';
      }

      if (profile.topType) {
        return 'Most of your recent reading has been around ' + profile.topType.name + ' coverage.';
      }

      return '';
    }
      };
  Intelligence.initLabelRegistry();
  window.DjsIntelligence = Intelligence;
})(window, document);
