/* DJs Mobiles Theme Core v17
   Step 2: qs helper migrated.
*/

(function () {
  window.DJS = window.DJS || {};
  window.DJS.version = '17.0.0';
  window.DJS.coreLoaded = true;

  window.DJS.qs = function (selector, scope) {
    return (scope || document).querySelector(selector);
  };
})();
