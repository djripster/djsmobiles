/*
 * DJs Mobiles Intelligence
 * Module: intelligence.js
 * Prototype: v0.4.0
 *
 * Shared website intelligence layer.
 * Theme first. Pulse second.
 */

(function (window, document) {
  'use strict';

  const SITE_TITLE_PREFIX = /^DJs Mobiles\s*\|\s*Expert Tech Insights & Mobile News Since 2010:\s*/i;
  const LABEL_REGISTRY_URL = 'https://djripster.github.io/djsmobiles/theme/data/label-registry.json';

  const Intelligence = {
    version: '0.4.0',
    labelRegistry: null,
    labelRegistryReady: null,

    initLabelRegistry() {
      if (this.labelRegistryReady) return this.labelRegistryReady;

      if (typeof window.fetch !== 'function') {
        this.labelRegistryReady = Promise.resolve(null);
        return this.labelRegistryReady;
      }

      this.labelRegistryReady = window.fetch(LABEL_REGISTRY_URL, { cache: 'no-store' })
        .then(response => {
          if (!response || !response.ok) return null;
          return response.json();
        })
        .then(registry => {
          if (this.isValidRegistry(registry)) {
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

    isValidRegistry(registry) {
      if (!registry || Number(registry.version) < 4 || !registry.labels || typeof registry.labels !== 'object') return false;

      return Object.keys(registry.labels).every(label => {
        const entry = registry.labels[label];
        return !!entry &&
          typeof entry.id === 'string' && entry.id.length > 0 &&
          typeof entry.name === 'string' && entry.name.length > 0 &&
          typeof entry.kind === 'string' && entry.kind.length > 0 &&
          Array.isArray(entry.roles) && entry.roles.length > 0 &&
          entry.roles.every(role => typeof role === 'string' && role.length > 0);
      });
    },

    getRegistryEntryForLabel(label) {
      const labels = this.getLabelRegistryMap();
      const raw = String(label || '').trim();

      if (!raw) return null;
      if (labels[raw]) return labels[raw];

      /* Only explicit source-label or alias migrations are accepted. */
      for (const key in labels) {
        if (!Object.prototype.hasOwnProperty.call(labels, key)) continue;
        const entry = labels[key];
        if (entry && entry.sourceLabel === raw) return entry;
        if (entry && Array.isArray(entry.aliases) && entry.aliases.indexOf(raw) !== -1) return entry;
      }

      return null;
    },

    getRegistryEntryForId(id) {
      const target = String(id || '').trim();
      if (!target) return null;
      const labels = this.getLabelRegistryMap();
      for (const key in labels) {
        if (Object.prototype.hasOwnProperty.call(labels, key) && labels[key] && labels[key].id === target) {
          return labels[key];
        }
      }
      return null;
    },

    entryRoles(entry) {
      return entry && Array.isArray(entry.roles) ? entry.roles : [];
    },

    entryHasRole(entry, role) {
      const expected = this.normalize(role);
      return this.entryRoles(entry).some(value => this.normalize(value) === expected);
    },

    classifyLabels(labels) {
      const result = {
        managed: [],
        unclassified: [],
        brands: [],
        platforms: [],
        types: [],
        topics: [],
        interestSignals: []
      };

      if (!this.labelRegistry) {
        result.unclassified = (labels || []).map(label => String(label || '').trim()).filter(Boolean);
        return result;
      }

      (labels || []).forEach(label => {
        const entry = this.getRegistryEntryForLabel(label);
        const rawLabel = String(label || '').trim();
        if (!entry) {
          if (rawLabel && result.unclassified.indexOf(rawLabel) === -1) result.unclassified.push(rawLabel);
          return;
        }

        const name = entry.name || rawLabel;
        const roles = this.entryRoles(entry);
        const signal = {
          id: entry.id,
          name,
          kind: entry.kind,
          roles: roles.slice(),
          domains: Array.isArray(entry.domains) ? entry.domains.slice() : [],
          relationships: entry.relationships && typeof entry.relationships === 'object' ? { ...entry.relationships } : {},
          confidence: 'explicit-label',
          eligible: entry.kind !== 'content-type'
        };

        if (!result.managed.some(existing => existing.id === signal.id)) result.managed.push(signal);
        if (!result.interestSignals.some(existing => existing.id === signal.id)) result.interestSignals.push(signal);

        if (this.entryHasRole(entry, 'brand')) {
          result.brands.push({ id: entry.id, name });
        }

        if (entry.kind === 'platform' || this.entryHasRole(entry, 'platform')) {
          result.platforms.push({ id: entry.id, name });
        }

        if (entry.kind === 'content-type' || this.entryHasRole(entry, 'content-type')) {
          result.types.push({ id: entry.id, name });
        }

        if (this.entryHasRole(entry, 'topic')) {
          result.topics.push({ id: entry.id, name });
        }
      });

      ['brands', 'platforms', 'types', 'topics'].forEach(key => {
        result[key] = result[key].filter((entry, index, list) => list.findIndex(candidate => candidate.id === entry.id) === index);
      });

      return result;
    },

    detectBrand(title, labels) {
      const classified = this.classifyLabels(labels);
      return classified.brands.length ? classified.brands[0].name : '';
    },

    detectPlatform(title, labels) {
      const classified = this.classifyLabels(labels);
      return classified.platforms.length ? classified.platforms[0].name : '';
    },

    detectPostType(title, labels) {
      const classified = this.classifyLabels(labels);
      return classified.types.length ? classified.types[0].name : '';
    },

    detectTopics(title, labels) {
      const classified = this.classifyLabels(labels);
      const topics = classified.topics.map(topic => topic.name);
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
          managed: [],
          unclassified: [],
          brands: [],
          platforms: [],
          types: [],
          interestSignals: [],
          isHome: true
        };
      }

      const source = article || this.collectArticleFromPage();
      const title = this.cleanTitle(source?.title || document.title || '');
      const labels = source?.labels || [];
      const classified = this.classifyLabels(labels);

      return {
        title,
        labels,
        brand: classified.brands.length ? classified.brands[0].name : '',
        platform: classified.platforms.length ? classified.platforms[0].name : '',
        type: classified.types.length ? classified.types[0].name : '',
        topics: classified.topics.map(topic => topic.name),
        managed: classified.managed,
        unclassified: classified.unclassified,
        brands: classified.brands,
        platforms: classified.platforms,
        types: classified.types,
        interestSignals: classified.interestSignals,
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

      if (reader && Array.isArray(reader.articleHistory) && reader.articleHistory.length) {
        const totalRead = reader.articleHistory.length;

        stats.push({
          label: 'Articles read',
          value: totalRead === 1 ? '1 article' : totalRead + ' articles'
        });
      }

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
        totalRead: typeof interests.totalRead === 'number' ? interests.totalRead : history.length,
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
          mode: 'returning-long',
          title: 'It has been a while.',
          daysAway
        };
      }

      if (daysAway >= 7) {
        return {
          mode: 'returning-extended',
          title: 'We have missed you.',
          daysAway
        };
      }

      if (daysAway >= 3) {
        return {
          mode: 'returning-medium',
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
