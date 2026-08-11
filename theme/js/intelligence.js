/*
 * DJs Mobiles Intelligence
 * Module: intelligence.js
 * Prototype: v0.3.0
 *
 * Shared website intelligence layer.
 * Theme first. Pulse second.
 */

(function (window, document) {
  'use strict';

  const SITE_TITLE_PREFIX = /^DJs Mobiles\s*\|\s*Expert Tech Insights & Mobile News Since 2010:\s*/i;
  const LABEL_REGISTRY_URL = 'https://djripster.github.io/djsmobiles/theme/data/label-registry.json';

  const Intelligence = {
    version: '0.3.0',
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
      if (entry && Array.isArray(entry.roles) && entry.roles.length) return entry.roles;
      if (entry && Array.isArray(entry.classes)) return entry.classes;
      if (entry && (entry.class || entry.type || entry.kind)) return [entry.class || entry.type || entry.kind];
      return [];
    },

    entryHasRole(entry, role) {
      const expected = this.normalize(role);
      return this.entryRoles(entry).some(value => this.normalize(value) === expected);
    },

    classifyLabels(labels) {
      const result = {
        brand: null,
        platform: null,
        type: null,
        topics: []
      };

      if (!this.labelRegistry) return result;

      (labels || []).forEach(label => {
        const entry = this.getRegistryEntryForLabel(label);
        if (!entry) return;

        const name = entry.name || String(label || '').trim();

        if (this.entryHasRole(entry, 'brand') && !result.brand) {
          result.brand = {
            id: entry.id || this.normalize(name).replace(/\s+/g, '-'),
            name
          };
          return;
        }

        if (this.entryHasRole(entry, 'platform') && !result.platform) {
          result.platform = {
            id: entry.id || this.normalize(name).replace(/\s+/g, '-'),
            name
          };
          const ownerId = entry.relationships && entry.relationships.owner;
          const owner = this.getRegistryEntryForId(ownerId);
          if (owner && this.entryHasRole(owner, 'brand') && !result.brand) {
            result.brand = { id: owner.id, name: owner.name || ownerId };
          }
          return;
        }

        if (this.entryHasRole(entry, 'content-type') && !result.type) {
          result.type = {
            id: entry.id || this.normalize(name).replace(/\s+/g, '-'),
            name
          };
          return;
        }

        if (this.entryHasRole(entry, 'topic')) {
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
      return classified.brand ? classified.brand.name : '';
    },

    detectPlatform(title, labels) {
      const classified = this.classifyLabels(labels);
      return classified.platform ? classified.platform.name : '';
    },

    detectPostType(title, labels) {
      const classified = this.classifyLabels(labels);
      return classified.type ? classified.type.name : '';
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
