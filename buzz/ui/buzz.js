/**
 * DJs Mobiles — Buzz
 * Meadow headline renderer.
 *
 * @version v1.1.0
 */
(function(window, document) {
  'use strict';

  var BUZZ_DATA_URL = 'https://djripster.github.io/djsmobiles/buzz/hive/data/buzz.json';
  var MOUNT_ID = 'featured-buzz';
  var DEFAULT_ROTATION_MS = 12000;

  var Buzz = {
    version: '1.1.0',
    items: [],
    index: 0,
    mount: null,
    observer: null,
    initialized: false,
    mountEventsBound: false,
    rotationTimer: null,
    interactionPaused: false,
    rotationMs: DEFAULT_ROTATION_MS,

    /*
     * Type behaviors are intentionally data-driven. New item types can be
     * registered later without changing the renderer or navigation logic.
     */
    typeBehaviors: {
      standard: {
        label: 'Buzz',
        className: '',
        stopRotation: false
      },
      live: {
        label: 'Live',
        className: 'buzz-card--live',
        stopRotation: true
      }
    },

    registerType: function(type, behavior) {
      var normalizedType = this.normalizeType(type);
      if (!normalizedType || normalizedType === 'standard') return false;

      behavior = behavior || {};
      this.typeBehaviors[normalizedType] = {
        label: String(behavior.label || normalizedType).trim(),
        className: String(behavior.className || '').trim(),
        stopRotation: behavior.stopRotation === true
      };

      return true;
    },

    init: function() {
      if (this.initialized) {
        this.attachWhenReady();
        return;
      }

      this.initialized = true;
      this.attachWhenReady();
    },

    attachWhenReady: function() {
      var mount = document.getElementById(MOUNT_ID);
      if (mount) {
        this.stopObserving();
        this.mount = mount;
        this.bindMountEvents();
        this.renderLoading();
        this.load();
        return;
      }

      if (this.observer || !window.MutationObserver || !document.body) return;

      var self = this;
      this.observer = new MutationObserver(function() {
        var found = document.getElementById(MOUNT_ID);
        if (!found) return;
        self.stopObserving();
        self.mount = found;
        self.bindMountEvents();
        self.renderLoading();
        self.load();
      });

      this.observer.observe(document.body, { childList: true, subtree: true });
    },

    bindMountEvents: function() {
      if (!this.mount || this.mountEventsBound) return;

      var self = this;
      this.mountEventsBound = true;

      this.mount.addEventListener('mouseenter', function() {
        self.interactionPaused = true;
        self.clearRotation();
      });

      this.mount.addEventListener('mouseleave', function() {
        self.interactionPaused = false;
        self.syncRotation();
      });

      this.mount.addEventListener('focusin', function() {
        self.interactionPaused = true;
        self.clearRotation();
      });

      this.mount.addEventListener('focusout', function(event) {
        if (self.mount && event.relatedTarget && self.mount.contains(event.relatedTarget)) return;
        self.interactionPaused = false;
        self.syncRotation();
      });

      document.addEventListener('visibilitychange', function() {
        if (document.hidden) self.clearRotation();
        else self.syncRotation();
      });
    },

    stopObserving: function() {
      if (!this.observer) return;
      this.observer.disconnect();
      this.observer = null;
    },

    load: function() {
      var self = this;

      fetch(BUZZ_DATA_URL, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: { Accept: 'application/json' }
      })
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Buzz request failed with status ' + response.status);
          }
          return response.json();
        })
        .then(function(payload) {
          self.items = self.normalizePayload(payload);
          self.index = self.getInitialIndex();

          if (!self.items.length) {
            self.renderEmpty();
            return;
          }

          self.render();
        })
        .catch(function(error) {
          console.warn('Buzz could not load:', error);
          self.renderError();
        });
    },

    normalizePayload: function(payload) {
      var source = [];

      if (Array.isArray(payload)) source = payload;
      else if (payload && Array.isArray(payload.items)) source = payload.items;
      else if (payload && Array.isArray(payload.headlines)) source = payload.headlines;
      else if (payload && Array.isArray(payload.buzz)) source = payload.buzz;

      var normalized = [];

      for (var i = 0; i < source.length; i++) {
        var item = source[i] || {};
        var title = item.title || item.headline || item.text || item.name || '';
        var url = item.url || item.link || item.href || item.sourceUrl || '';
        var type = this.normalizeType(item.type || 'standard');

        title = String(title).trim();
        url = String(url).trim();

        if (!title || !this.isSafeUrl(url)) continue;

        normalized.push({
          title: title,
          url: url,
          type: type,
          source: String(item.source || item.publisher || '').trim()
        });
      }

      return normalized;
    },

    normalizeType: function(value) {
      var type = String(value || 'standard')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]+/g, '-');

      return type || 'standard';
    },

    getTypeBehavior: function(type) {
      return this.typeBehaviors[type] || this.typeBehaviors.standard;
    },

    getInitialIndex: function() {
      for (var i = 0; i < this.items.length; i++) {
        if (this.getTypeBehavior(this.items[i].type).stopRotation) return i;
      }
      return 0;
    },

    hasRotationBlockingItem: function() {
      for (var i = 0; i < this.items.length; i++) {
        if (this.getTypeBehavior(this.items[i].type).stopRotation) return true;
      }
      return false;
    },

    isSafeUrl: function(value) {
      if (!value) return false;
      try {
        var parsed = new URL(value, window.location.origin);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch (error) {
        return false;
      }
    },

    previous: function() {
      if (!this.items.length) return;
      this.index = (this.index - 1 + this.items.length) % this.items.length;
      this.render();
    },

    next: function() {
      if (!this.items.length) return;
      this.index = (this.index + 1) % this.items.length;
      this.render();
    },

    clearRotation: function() {
      if (!this.rotationTimer) return;
      window.clearTimeout(this.rotationTimer);
      this.rotationTimer = null;
    },

    syncRotation: function() {
      var self = this;
      this.clearRotation();

      if (this.items.length < 2) return;
      if (this.interactionPaused || document.hidden) return;
      if (this.hasRotationBlockingItem()) return;

      this.rotationTimer = window.setTimeout(function() {
        self.rotationTimer = null;
        self.index = (self.index + 1) % self.items.length;
        self.render();
      }, this.rotationMs);
    },

    labelMarkup: function(item, behavior) {
      if (item.type === 'live') {
        return '<span class="buzz-label buzz-label--live">' +
          '<span class="buzz-live-dot" aria-hidden="true"></span>' +
          this.escapeHtml(behavior.label) +
        '</span>';
      }

      return '<span class="buzz-label">' + this.escapeHtml(behavior.label || 'Buzz') + '</span>';
    },

    render: function() {
      if (!this.mount || !this.items.length) return;

      var self = this;
      var item = this.items[this.index];
      var behavior = this.getTypeBehavior(item.type);
      var controlsDisabled = this.items.length < 2;
      var cardClass = 'buzz-card' + (behavior.className ? ' ' + behavior.className : '');

      this.mount.removeAttribute('hidden');
      this.mount.setAttribute('data-buzz-type', item.type);
      this.mount.innerHTML =
        '<div class="' + this.escapeHtml(cardClass) + '" aria-live="polite">' +
          '<button class="buzz-nav buzz-nav--previous" type="button" aria-label="Previous Buzz headline"' + (controlsDisabled ? ' disabled' : '') + '>' +
            '<span class="buzz-chevron buzz-chevron--left" aria-hidden="true"></span>' +
          '</button>' +
          '<a class="buzz-headline" href="' + this.escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' +
            this.labelMarkup(item, behavior) +
            '<span class="buzz-headline__text">' + this.escapeHtml(item.title) + '</span>' +
          '</a>' +
          '<button class="buzz-nav buzz-nav--next" type="button" aria-label="Next Buzz headline"' + (controlsDisabled ? ' disabled' : '') + '>' +
            '<span class="buzz-chevron buzz-chevron--right" aria-hidden="true"></span>' +
          '</button>' +
        '</div>';

      var previousButton = this.mount.querySelector('.buzz-nav--previous');
      var nextButton = this.mount.querySelector('.buzz-nav--next');

      if (previousButton) previousButton.addEventListener('click', function() { self.previous(); });
      if (nextButton) nextButton.addEventListener('click', function() { self.next(); });

      this.syncRotation();
    },

    renderLoading: function() {
      this.clearRotation();
      if (!this.mount) return;
      this.mount.removeAttribute('hidden');
      this.mount.innerHTML =
        '<div class="buzz-card buzz-card--status" aria-live="polite">' +
          '<span class="buzz-label">Buzz</span>' +
          '<span class="buzz-status">Loading headlines…</span>' +
        '</div>';
    },

    renderEmpty: function() {
      this.clearRotation();
      if (!this.mount) return;
      this.mount.innerHTML = '';
      this.mount.setAttribute('hidden', 'hidden');
    },

    renderError: function() {
      this.clearRotation();
      if (!this.mount) return;
      this.mount.innerHTML = '';
      this.mount.setAttribute('hidden', 'hidden');
    },

    escapeHtml: function(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  };

  window.DJSBuzz = Buzz;
})(window, document);
