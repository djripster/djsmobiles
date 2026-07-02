# DJs Mobiles GitHub Pages Assets

This repo contains website-hosted scripts and current brand assets for DJs Mobiles.

## Structure

```text
djsmobiles/
  djsmobiles.js              # Compatibility copy for existing Blogger URL
  theme/js/djsmobiles.js     # Organized theme JavaScript location
  assets/brand/              # Current brand/logo/banner assets
  assets/icons/              # Current app/site icons
  docs/                      # Project documentation and handoffs
```

## Notes

- Keep `djsmobiles.js` at the repo root until Blogger has been updated to the organized path.
- The organized canonical path for the theme script is `theme/js/djsmobiles.js`.
- Legacy/old website assets have been moved into a separate archive ZIP instead of staying in the active repo.

## Next planned addition

Website Pulse should be imported later under:

```text
pulse-web/css/
pulse-web/js/
pulse-web/assets/
```

The theme/page should eventually expose `window.DjsArticleContext`, and Pulse should read that context rather than duplicating article intelligence.
