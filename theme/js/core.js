/*
 * DJs Mobiles Theme
 * Module: core.js
 * Theme Version: v17.0
 */

(function(window, document) {
  'use strict';

  window.DjsTheme = window.DjsTheme || {};

  window.DjsTheme.qs = function(selector, scope) {
    return (scope || document).querySelector(selector);
  };

  window.DjsTheme.closeMenu = function(menu, button) {
    if (!menu || !button) return;
    menu.classList.remove('open');
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };

  window.DjsTheme.openMenu = function(menu, button) {
    if (!menu || !button) return;
    menu.classList.add('open');
    button.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
  };

  window.DjsTheme.toggleMenu = function(menu, button) {
    if (!menu || !button) return false;
    var isOpen = menu.classList.contains('open');

    if (isOpen) {
      window.DjsTheme.closeMenu(menu, button);
      return false;
    }

    window.DjsTheme.openMenu(menu, button);
    return true;
  };

})(window, document);
