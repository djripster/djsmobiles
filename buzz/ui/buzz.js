/**
 * DJs Mobiles — Buzz
 * Meadow headline renderer.
 *
 * @version v1.0.0
 */
(function(window, document) {
  'use strict';

  var BUZZ_DATA_URL = 'https://djripster.github.io/djsmobiles/buzz/hive/data/buzz.json';
  var MOUNT_ID = 'featured-buzz';

  var Buzz = {
    version: '1.0.0',
    items: [],
    index: 0,
    mount: null,
    observer: null,
    initialized: false,

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
        self.renderLoading();
        self.load();
      });

      this.observer.observe(document.body, { childList: true, subtree: true });
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
          self.index = 0;

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

        title = String(title).trim();
        url = String(url).trim();

        if (!title || !this.isSafeUrl(url)) continue;

        normalized.push({
          title: title,
          url: url,
          source: String(item.source || item.publisher || '').trim()
        });
      }

      return normalized;
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

    render: function() {
      if (!this.mount || !this.items.length) return;

      var self = this;
      var item = this.items[this.index];
      var controlsDisabled = this.items.length < 2;

      this.mount.innerHTML =
        '<div class="buzz-card">' +
          '<button class="buzz-nav buzz-nav--previous" type="button" aria-label="Previous Buzz headline"' + (controlsDisabled ? ' disabled' : '') + '>' +
            '<span class="buzz-chevron buzz-chevron--left" aria-hidden="true"></span>' +
          '</button>' +
          '<a class="buzz-headline" href="' + this.escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="buzz-label">Buzz</span>' +
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
    },

    renderLoading: function() {
      if (!this.mount) return;
      this.mount.innerHTML =
        '<div class="buzz-card buzz-card--status" aria-live="polite">' +
          '<span class="buzz-label">Buzz</span>' +
          '<span class="buzz-status">Loading headlines…</span>' +
        '</div>';
    },

    renderEmpty: function() {
      if (!this.mount) return;
      this.mount.innerHTML = '';
      this.mount.setAttribute('hidden', 'hidden');
    },

    renderError: function() {
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
