/*
 * Pulse
 * Module: pulse.js
 * Prototype: v0.2.6
 *
 * DJs Mobiles Website Integration
 */

(function (window, document) {
  'use strict';

  const PULSE_ASSET_PATH = 'https://djripster.github.io/djsmobiles/pulse/web/';

  const PulseConfig = {
    publicVisible: false,
    publicAutoOpen: false,
    publicCanExpand: false,
    hideWhenExtensionActive: true
  };

  const Pulse = {
    version: '0.2.12',
    reader: null,
    article: null,
    conversation: null,
    isExpanded: true,
    iconPath: PULSE_ASSET_PATH + 'pulse.svg',
    isDeveloper: false,

    isMobile() {
      return window.matchMedia('(max-width: 768px)').matches;
    },

    isArticlePage() {
      return document.body &&
        document.body.classList.contains('item-view') &&
        !!document.querySelector('.post-body');
    },

    isExtensionActive() {
      return PulseConfig.hideWhenExtensionActive === true && (
        window.DJSPulseExtensionActive === true ||
        document.documentElement.hasAttribute('data-djs-pulse-extension') ||
        document.body && document.body.hasAttribute('data-djs-pulse-extension')
      );
    },

    canExpand() {
      return this.isDeveloper || PulseConfig.publicCanExpand === true;
    },

    getDesktopContainer() {
      return document.getElementById('pulse-container');
    },

    getMobileButtonContainer() {
      return document.getElementById('pulse-mobile-button');
    },

    getMobileCardContainer() {
      return document.getElementById('pulse-mobile-card');
    },

    getCardContainer() {
      return this.isMobile()
        ? this.getMobileCardContainer()
        : this.getDesktopContainer();
    },

    hideContainer(container) {
      if (!container) return;
      container.innerHTML = '';
      container.setAttribute('hidden', 'hidden');
      container.setAttribute('aria-hidden', 'true');
    },

    showContainer(container) {
      if (!container) return null;
      container.removeAttribute('hidden');
      container.removeAttribute('aria-hidden');
      return container;
    },

    hideForPublicVisitors() {
      this.hideContainer(this.getDesktopContainer());
      this.hideContainer(this.getMobileButtonContainer());
      this.hideContainer(this.getMobileCardContainer());
    },

    hideForExtension() {
      this.hideForPublicVisitors();
      this.reader = null;
      this.article = null;
      this.conversation = null;
    },

    clearInactiveMounts() {
      const desktop = this.getDesktopContainer();
      const mobileButton = this.getMobileButtonContainer();
      const mobileCard = this.getMobileCardContainer();

      if (this.isMobile()) {
        if (desktop) desktop.innerHTML = '';
      } else {
        if (mobileButton) mobileButton.innerHTML = '';
        if (mobileCard) mobileCard.innerHTML = '';
      }
    },

    init() {
      console.log('Pulse v' + this.version + ' loaded');

      const state = window.DjsPulseState;
      const intelligence = window.DJS_SITE_INTELLIGENCE;
      const core = window.DjsIntelligence;

      this.isDeveloper = state ? state.isDeveloper() : false;

      if (this.isExtensionActive()) {
        this.hideForExtension();
        return;
      }

      if (!this.isDeveloper && PulseConfig.publicVisible !== true) {
        this.hideForPublicVisitors();
        return;
      }

      this.reader = state ? state.load() : {
        isExpanded: false,
        followingSince: 'Today',
        isFirstVisit: true
      };

      this.article = intelligence && intelligence.ready
        ? intelligence
        : (core && typeof core.analyzeArticle === 'function'
          ? core.analyzeArticle()
          : null);

      if (state && this.article && this.isArticlePage()) {
        state.recordArticle(this.article);
        this.reader.articleHistory = state.getArticleHistory();
        this.reader.interests = state.getReaderInterests();
        this.reader.timeline = state.getReaderTimeline();
        this.reader.continueReading = state.getContinueReading();
      }

      if (state && this.reader) {
        this.reader.timeline = state.getReaderTimeline();
        this.reader.continueReading = state.getContinueReading();
      }

      this.conversation = core && typeof core.getPulseConversation === 'function'
        ? core.getPulseConversation(this.reader, this.article)
        : this.getFallbackConversation();

      const shouldAutoOpen = state
        ? state.shouldAutoOpen(this.reader, { publicAutoOpen: PulseConfig.publicAutoOpen })
        : false;

      this.isExpanded = shouldAutoOpen
        ? true
        : (this.canExpand() ? this.reader.isExpanded : false);

      if (shouldAutoOpen && state) {
        state.markAutoOpened();
      }

      this.render();
    },

    getFallbackConversation() {
      return {
        eyebrow: 'Your Pulse',
        title: 'Pulse is just getting started.',
        message: 'More will appear here as Pulse accompanies you on your journey.',
        mode: 'welcome',
        stats: [
          { label: 'Following since', value: 'Today' }
        ]
      };
    },

    escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    iconMarkup() {
      return '<img class="pulse-icon" src="' + this.escapeHtml(this.iconPath) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">';
    },

    titleMarkup() {
      return '<span class="pulse-title">' + this.iconMarkup() + '<span>Your Pulse</span></span>';
    },

    normalizeStatValue(label, value) {
      const rawLabel = String(label || '').toLowerCase();
      let result = String(value || '');

      if (rawLabel.indexOf('articles') !== -1) {
        result = result.replace(/\s*articles?\s*$/i, '');
      }

      if (rawLabel.indexOf('visits') !== -1) {
        result = result.replace(/\s*visits?\s*$/i, '');
      }

      return result;
    },

    normalizeStatLabel(label) {
      const value = String(label || '');

      if (/articles read/i.test(value)) return 'Read';
      if (/following since/i.test(value)) return 'Following';

      return value;
    },

    statsMarkup(stats) {
      if (!stats || !stats.length) return '';

      return '<section class="pulse-shelf pulse-shelf--stats" aria-label="Reader Stats">' +
        '<div class="pulse-stat-grid">' + stats.map((item) => {
          return '<div class="pulse-stat-tile">' +
            '<span>' + this.escapeHtml(this.normalizeStatLabel(item.label)) + '</span>' +
            '<strong>' + this.escapeHtml(this.normalizeStatValue(item.label, item.value)) + '</strong>' +
          '</div>';
        }).join('') + '</div>' +
      '</section>';
    },

    getReadingShelfItems() {
      const currentUrl = this.article && this.article.article
        ? this.article.article.url
        : (this.article && this.article.url ? this.article.url : '');

      const history = this.reader && Array.isArray(this.reader.articleHistory)
        ? this.reader.articleHistory
        : [];

      return history.filter((item) => {
        return item && item.url && item.title && item.url !== currentUrl;
      }).slice(0, 3);
    },

    continueReadingMarkup() {
      const items = this.getReadingShelfItems();

      if (!items.length) return '';

      return '<section class="pulse-shelf pulse-shelf--reading" aria-label="Continue Reading">' +
        '<div class="pulse-shelf__header">' +
          '<span class="pulse-shelf__title">Continue Reading</span>' +
        '</div>' +
        '<div class="pulse-reading-list">' +
          items.map((item, index) => {
            return '<a class="pulse-reading-item" href="' + this.escapeHtml(item.url) + '">' +
              '<span class="pulse-reading-item__number">' + String(index + 1) + '</span>' +
              '<span class="pulse-reading-item__title">' + this.escapeHtml(item.title) + '</span>' +
              '<span class="pulse-reading-item__arrow" aria-hidden="true">→</span>' +
            '</a>';
          }).join('') +
        '</div>' +
      '</section>';
    },

    expandedMarkup() {
      const conversation = this.conversation || this.getFallbackConversation();

      return `
        <button type="button" class="pulse-card__header" aria-expanded="true">
          ${this.titleMarkup()}
          <span class="pulse-card__chevron" aria-hidden="true">⌃</span>
        </button>
        <div class="pulse-card__body">
          <div class="pulse-card__eyebrow">${this.escapeHtml(conversation.eyebrow)}</div>
          <h2>${this.escapeHtml(conversation.title)}</h2>
          <p>${this.escapeHtml(conversation.message)}</p>
          ${this.statsMarkup(conversation.stats)}
          ${this.continueReadingMarkup()}
        </div>
      `;
    },

    collapsedMarkup() {
      const affordance = this.canExpand()
        ? '<span class="pulse-card__chevron" aria-hidden="true">⌄</span>'
        : '<span class="pulse-card__status" aria-hidden="true">Soon</span>';

      return `
        <button type="button" class="pulse-card__header" aria-expanded="false">
          ${this.titleMarkup()}
          ${affordance}
        </button>
      `;
    },

    mobileButtonMarkup() {
      return `
        <button type="button" class="pulse-mobile-trigger" aria-label="Open Your Pulse" aria-expanded="${this.isExpanded ? 'true' : 'false'}">
          ${this.iconMarkup()}
        </button>
      `;
    },

    toggleExpanded() {
      if (!this.canExpand()) {
        console.log('Pulse is visible, but the full website experience is developer-only for now.');
        return;
      }

      this.isExpanded = !this.isExpanded;

      if (window.DjsPulseState) {
        window.DjsPulseState.setExpanded(this.isExpanded);
      }

      this.render();
    },

    renderMobileButton() {
      const buttonContainer = this.showContainer(this.getMobileButtonContainer());
      if (!buttonContainer) return;

      buttonContainer.innerHTML = this.mobileButtonMarkup();

      const button = buttonContainer.querySelector('.pulse-mobile-trigger');
      if (!button) return;

      button.addEventListener('click', () => {
        this.toggleExpanded();
      });
    },

    render() {
      this.clearInactiveMounts();

      if (!this.isDeveloper && PulseConfig.publicVisible !== true) {
        this.hideForPublicVisitors();
        return;
      }

      if (this.isMobile()) {
        this.renderMobileButton();
      }

      const cardContainer = this.showContainer(this.getCardContainer());
      if (!cardContainer) return;

      cardContainer.innerHTML = '';

      if (this.isMobile() && !this.isExpanded) {
        return;
      }

      const card = document.createElement('section');
      const mode = this.conversation && this.conversation.mode ? this.conversation.mode : 'default';

      card.className = this.isExpanded
        ? 'pulse-card pulse-card--expanded pulse-card--' + mode
        : 'pulse-card pulse-card--collapsed' + (this.canExpand() ? '' : ' pulse-card--locked');

      card.innerHTML = this.isExpanded ? this.expandedMarkup() : this.collapsedMarkup();

      const header = card.querySelector('.pulse-card__header');

      if (header) {
        header.addEventListener('click', () => {
          this.toggleExpanded();
        });
      }

      cardContainer.appendChild(card);
    }
  };

  window.PulseConfig = PulseConfig;
  window.Pulse = Pulse;

document.addEventListener('DOMContentLoaded', () => {
  if (Pulse.isExtensionActive()) {
    Pulse.hideForExtension();
    return;
  }

  if (window.DJS_SITE_INTELLIGENCE && window.DJS_SITE_INTELLIGENCE.ready) {
    Pulse.init();
    return;
  }

  window.addEventListener('djs:intelligence-ready', () => {
    Pulse.init();
  }, { once: true });

  document.addEventListener('djs:pulse-extension-ready', () => {
    Pulse.hideForExtension();
  });

  window.setTimeout(() => {
    if (!Pulse.reader) {
      Pulse.init();
    }
  }, 800);
});
  
  let pulseResizeTimer = null;

  window.addEventListener('resize', () => {
    clearTimeout(pulseResizeTimer);
    pulseResizeTimer = setTimeout(() => {
      if (window.Pulse) {
        window.Pulse.render();
      }
    }, 150);
  });
})(window, document);
