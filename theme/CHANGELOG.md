# DJs Mobiles Theme Changelog

Historical release notes for the DJs Mobiles Blogger theme. The Blogger XML should contain only the current production theme; release history belongs here in the repository.

## Current Theme

- **Version:** v17.0
- **Last Updated:** 2026
- **Theme Signature:** `DJSMOBILES_THEME_SIGNATURE = DJSM-V14-8-0-A11Y`

## Version Scheme

- `x.0.0` = Major visual/structural overhaul
- `x.1.0` = New functionality added
- `x.x.1` = Bug fix

---

## Releases

### v12.0.0

- Original custom theme build

### v12.1.0

- SEO meta, hamburger nav, JSON-LD, async scripts

### v12.2.0

- Code cleanup: removed dead Google+/Reactions/tooltipCss,
  fixed publisher in JSON-LD, removed Mailchimp/Infolinks,
  fixed footer SimpleIcons, fixed Specs Zone link,
  removed via.placeholder.com fallback,
  introduced per-script versioning

### v12.2.1

- Bug fix: mobile menu not working — script-hamburger
  wrapped in DOMContentLoaded

### v12.2.2

- Bug fix: mobile menu still broken — moved toggle logic
  to inline onclick attributes to bypass Blogger CDATA

### v12.3.5

- Bug fix: Disqus URL variables had & encoded as HTML
  entities outside CDATA block, causing SyntaxError.
  Removed " encoding and rely on CDATA to protect the
  variables from Blogger XML encoding. script-disqus v4
  Displays on single post view only
  script-disqus v1

### v12.3.9

- Bug fix: Disqus removed and re-added correctly.
  Uses standard disqus_config() pattern.
  script-disqus rewritten as v1

### v12.3.10

- Bug fix: Added pageType debug logging to diagnose
  b:if condition not evaluating. script-disqus v2

### v12.3.12

- Bug fix: Removed CDATA wrapper from Disqus script so
  Blogger parses data: variables correctly. Switched to
  " entity encoding for JS strings. script-disqus v4

### v12.3.13

- Bug fix: 404 page handled inside Blog widget main
  includable using data:blog.pageType == error_page
  since Blogger custom 404 field not injected into
  custom themes

### v12.4.0

- New feature: Twitter/X Card meta tags added.
  Post pages use featured image with fallback to
  twitter.png. All other pages use twitter.png.
  twitter-cards v1

### v12.4.3

- New feature: Apple Touch Icons and iOS favicon added.
  Single 512px source image scaled via sizes attribute.
  ios-icons v1

### v12.5.0

- New feature: Search icon in nav bar. Clicking opens
  a floating dropdown below the nav. Icon sits next to
  hamburger on mobile. Closes on outside click or Escape.
  search-bar v1, script-search v2

### v12.5.1

- Bug fix: Search dropdown not opening on click. Wrapped
  in DOMContentLoaded, added stopPropagation to submit
  button, fixed document click check to use btn.contains.
  Hamburger and search icon colour changed to primary.
  script-search v3

### v12.6.0

- New feature: Sticky header shrink on scroll. Nav bar
  subtly compresses padding and deepens shadow after
  scrolling 60px. Smooth CSS transition. Reverts on
  scroll back to top. script-shrink v1

### v13.0.0

- Refactor: centralized UI JavaScript architecture,
  removed theme inline UI handlers, improved state
  management for mobile nav, search, and lightbox.
  script-core v1

### v13.1.0

- Cleanup pass: improved font loading, added theme color,
  added lazy-loading/decoding hints for theme assets,
  added article robots meta, and automatic lazy-loading
  for post/sidebar images where safe.
  performance-cleanup v1

### v13.2.0

- Mobile containment pass: fixed search-result overflow
  on smaller screens with stronger width, wrapping, and
  overflow rules for post content, snippets, tables,
  media embeds, and long strings.
  mobile-overflow-fix v1

### v14.0.0

- Major visual overhaul: redesigned homepage/article cards,
  refined metadata presentation, upgraded navigation,
  improved sidebar and footer styling, and introduced
  a cleaner magazine-style layout. visual-refresh v1

### v14.1.6

- New feature: homepage featured area now loads directly
  from the Featured label feed for stable rendering.
  Uses one hero and two supporting cards with cleaned
  summaries and stronger image fallback.
  featured-homepage v2

### v14.2.0

- Homepage polish pass: refined featured-area spacing,
  improved hero and supporting card proportions,
  and tightened homepage visual rhythm.
  homepage-polish v1

### v14.2.0

- Homepage polish pass: refined featured-area spacing,
  improved hero balance, upgraded supporting card
  proportions, and added subtle hover/depth polish
  for a more premium magazine-style homepage.
  homepage-polish v1

### v14.2.1

- Mobile polish: reduced featured hero crowding on
  smaller screens with shorter summaries, tighter
  spacing, lighter hero height, and cleaner mobile
  typography. homepage-polish v2

### v14.2.2

- Bug fix: Disqus comments loading on static pages.
  Tightened condition to pageType == item so comments
  only render on posts, not pages.
  script-disqus v5

### v14.3

- Added Specs-Sheet Style so that posts with the Label Specs
  can use the style for their tables

### v14.4.5

- Desktop hero rebalance: reduced featured hero height
  so the featured area stays under roughly half the screen
  on 1080p displays, tightened title scale, and compacted
  supporting cards for better above-the-fold density.
  homepage-polish v3

### v14.6.1

- New feature: added Latest Reviews rail above Trending in
  the right sidebar using the Review label feed.
  sidebar-reviews v1

### v14.4.4

- Desktop rebalance pass: reduced featured hero dominance
  on larger screens and tightened featured spacing for
  a cleaner, more visible homepage above the fold.
  homepage-polish v3

### v14.7.0

- New feature: added reusable review component styles to
  the theme — protocol/option grid cards, branded feature
  checklist, performance rating bars, and notice/callout
  boxes. Extracted from post-level CSS so all review posts
  can use these components without inline styles.
  review-components v3

### v14.8.3

- Mobile nav visual polish: added smoother accordion motion,

### v14.8.4

- Mobile featured hero optimization: reduced mobile title scale,
  tightened hero spacing, shortened hero height, reduced CTA size,
  and hid non-essential hero elements on very small screens.
  featured-homepage v4
  clearer chevrons, stronger level hierarchy, and cleaner
  spacing/separation for collapsed mobile navigation groups.
  mobile-nav-polish v1

### v14.8.5

- Mobile featured balance fix: restored a smaller featured kicker,
  reduced title dominance further, tightened mobile hero spacing,
  and rebalanced the hero for stronger editorial hierarchy.
  featured-homepage v4

### v14.7.2

- Bug fix: excluded .tech-table from the generic responsive
  table block rule and moved specs styling fully into the
  theme so spec posts no longer rely on inline CSS.
  spec-sheet v3

### v14.8.6

- Review system enhancement pass: added reusable verdict, pros/cons,
  key takeaways, score strip, and review-heading utility styles,
  plus refined spacing for review-focused article layouts.
  review-components v3

### v14.7.3

- Visual polish: upgraded Latest Reviews sidebar cards and
  refined theme-controlled spec summaries/tables for a
  cleaner, more premium presentation.
  sidebar-reviews v2, spec-sheet v4

### v14.8.9

- Image layout refinement: reduced the visual buffer around post
  images by giving article images a controlled desktop breakout
  while preserving mobile responsiveness and card integrity.
  image-layout v1

### v14.7.4

- Cleanup: consolidated homepage featured-area CSS into a
  single maintainable final ruleset while preserving the
  existing desktop, tablet, and mobile appearance.
  homepage-polish v4

### v14.9.0

- Article update callout system: added reusable update/follow-up
  boxes for evolving stories, including standard and important
  variants for top-of-post editorial updates.
  editorial-updates v1

### v14.7.5

- Visual polish: unified CTA/button styling across featured
  READ MORE, post READ MORE, buy buttons, and pagination;
  reduced featured hero title overflow risk on desktop with
  a more forgiving title scale and spacing.
  cta-system v1, homepage-polish v5

### v14.9.1

- Update box color refinement and baseline reconciliation:
  shifted editorial update callouts to a purple identity,
  removed duplicated legacy review blocks, and cleaned up
  version/changelog drift for a clearer master baseline.
  editorial-updates v2, review-components v3

### v14.9.2

- UX polish pass: added no-breakout image control, refined
  editorial block spacing, introduced section-divider utility,
  improved top-of-post spacing, and added subtle interaction
  polish for protocol cards.
  image-layout v2, editorial-rhythm v1

### v14.9.3.1

- Updated story signal pass: added an automatic Updated chip
  to post meta when a single article contains an update-box,
  without changing homepage feeds, sidebar review loading,
  or shared feed renderer logic.
  editorial-updates v3

### v14.9.3.2

- Homepage snippet cleanup: hides editorial update-box callouts
  inside multi-post snippets so homepage/listing views stay
  visually clean when updates appear above post images.
  editorial-updates v3

### v14.9.3.3

- Dynamic related reading system: added a single-post
  Continue Reading bridge with documented matching logic
  based on post type, brand, and platform priorities.
  editorial-navigation v1

### v14.9.4.1

- Safe homepage intelligence pass: upgraded featured-area
  badges to use label-aware editorial types with premium
  visual styling, without changing feed loader behavior.
  homepage-intelligence v1

### v14.7.6

- Typography rhythm pass: refined article heading spacing,
  paragraph/list rhythm, content block spacing, and long-form
  readability across posts without altering layout structure.
  typography-rhythm v1

### v14.7.7

- Bug fix: removed desktop nav hover gap so News/Specs
  dropdown menus stay open while moving the pointer
  into submenu items. nav-hover-fix v1

### v14.7.8

- Performance trim pass: trimmed redundant feed helper
  JavaScript, narrowed mobile spec-summary targeting,
  and performed light housekeeping with no visual or
  behavioral changes. performance-trim v1

### v14.7.9

- Theme copyright hardening pass: strengthened ownership
  notice in theme metadata/footer, added internal theme
  signature markers, and reinforced branded attribution
  without changing site behavior or appearance.
  ownership-hardening v1

### v14.8.0

- Accessibility and focus polish: improved keyboard-visible
  focus states for navigation, search, CTAs, sidebar links,
  footer links, and pager controls without changing layout
  or interaction logic. accessibility-polish v1

### v14.8.1

- Maintenance cleanup: removed unused legacy Blogger includables
  and obsolete tooltip placeholder CSS that were no longer
  referenced anywhere in the theme. maintenance-cleanup v1

### v14.9.4.8

- Card rhythm polish pass: improved multi-post card spacing,
  steadier bottom CTA alignment, and added a bit more
  breathing room around homepage/sidebar card groupings
  without touching featured feed text behavior.
  card-rhythm v1

### v14.9.5.0

- Device family framework: added internal documentation,
  post-type/brand/family detection helpers, and single-post
  data attributes to support smarter related logic in later
  releases without changing homepage/feed rendering.
  device-family-intel v1

### v14.9.5.1

- Family-first related content refinement: upgraded
  Continue Reading and Explore More scoring to prefer
  stronger device-family matches, smarter cross-intent
  recommendations, and cleaner deduplication between
  related-content blocks without touching homepage feeds.
  editorial-navigation v2, content-bridge v2

### v15.2.0

- Device intelligence presentation: added a post-level
  More on device context block and smarter related-content
  headings using existing family/brand detection.
  device-context v1

### v15.2.0

- Bug fix: featured hero no longer leaves a blank gap when
  the Featured label feed returns no entries. Added shimmer
  skeleton loading state while feed fetches, and clean hide
  on empty or failed response. featured-homepage v5

### v15.2.1

- Thumbnail reliability pass: widened image extraction to
  search all imgs in the card (not just first), tries
  data-src lazy attributes, upgrades Blogger thumbnail URLs
  to full resolution, and polishes the no-image fallback
  into a consistent branded monogram state.
  compact-feed v2

### v15.2.2

- Bug fix: Latest Reviews sidebar no longer leaves a blank
  gap when the Review label feed is slow or returns no
  entries. Added shimmer skeleton loading state matching
  real item layout, and clean hide on empty/failed response.
  sidebar-reviews v3

### v15.2.3

- Post card hierarchy fix: swapped label chip before date
  in multi-post card meta row so category context leads.
  Footer balance pass: replaced sparse Stay Connected column
  with social links and an Explore by Topic label grid.
  post-card-meta v1, footer-balance v1

### v15.2.4

- Header depth pass: richer gradient background with radial
  blue glow, subtle dot texture, stronger logo drop shadow,
  site tagline beneath logo, and more defined bottom accent
  strip for stronger masthead presence.
  header-depth v1

### v15.3.0.1

- Bug fix: corrected djsEscapeHtml apostrophe escaping so
  generated HTML strings remain safe and valid inside Blogger XML.
  xml-safety-fix v1

### v15.3.1

- Device Hub groundwork: replaced the separate post-level
  device context/related/next-step presentation with a unified
  Device Hub block for single posts, built on existing brand,
  family, and post-type detection without touching homepage
  featured rendering. device-hub v1

### v15.3.2

- Deeper internal linking: added hub quick links for reviews,
  specs, news, and guides plus compare-style topic links based
  on detected device family, brand, or platform.
  device-hub-links v1

### v15.3.3

- Search intelligence upgrade: search dropdown now offers
  contextual device-aware suggestions on single posts when a
  device family, brand, or platform is detected.
  search-intelligence v1

### v15.4.0

- Latest Posts section title polish: added left accent bar
  to .section-title matching the established review heading
  pattern for stronger editorial hierarchy on the homepage.
  section-title v1

### v15.5.0

- Post card snippet improvement: increased desktop snippet
  font size to 14px, expanded line clamp to 3 lines, and
  added min-height to guarantee snippet always shows on
  cards with long titles. snippet-polish v1

### v15.6.0

- Trending sidebar numbered rankings: replaced plain list
  with CSS counter-driven rank numbers in bold blue accent,
  subtle item dividers, and hover treatment for stronger
  editorial presence. trending-rankings v1

### v15.7.0

- Quick Take post format chip: added automatic styled pill
  above post body when the Quick-Take label is applied,
  matching the established Guest Post banner pattern.
  quick-take-chip v1

### v15.8.0

- Post type chip system: unified label-driven chip/banner
  system for single post view only (body.item-view).
- SLOT LOGIC:
  ::before = primary post type label (one wins via cascade)
  ::after  = Quick Take overlay (stacks on any type except Specs)
- PRIORITY ORDER (CSS cascade, last declaration wins):
  1. Guest Post — orange full-width banner, always overrides all
  2. Review     — amber pill "⭐ REVIEW"
  3. Guides     — green pill "🗺 GUIDE"
  4. Specs      — blue pill "📋 SPEC SHEET"
- QUICK TAKE RULES:
  - Uses ::after so it stacks alongside any ::before chip
  - Suppressed on Specs posts via explicit ::after display:none
  - Can appear on Review, Guides, News, or any other post type
- LABEL TO CSS CLASS MAPPING (Blogger convention):
  "Guest Post"  -> body.label-Guest-Post
  "Review"      -> body.label-Review
  "Guides"      -> body.label-Guides
  "Specs"       -> body.label-Specs
  "Quick Take"  -> body.label-Quick-Take
- CONFLICT RESOLUTION:
  Guest Post + Guides (e.g. guest guide posts): Guest Post
  banner wins, Guides chip suppressed by cascade.
  Specs + Quick Take: Quick Take suppressed via ::after none.
  Any type + Quick Take: both show (::before + ::after).
- post-type-chips v1

### v15.9.0

- Reading time estimate: JS calculates word count from
  post body text on single post view and injects a
  "X min read" chip into the post meta row.
  Return to top button: fixed bottom-left floating button,
  appears after 400px scroll on all pages, smooth scrolls
  to top on click. Sits bottom-left to avoid collision
  with sticky review CTA on bottom-right.
  reading-time v1, back-to-top v1

### v15.9.1

- Bug fix: featured hero kicker now reflects actual post
  type rather than always showing "Featured Story".
  Added id to kicker element and wired djsFeaturedFeed
  to update it using existing djsGetFeaturedBadge logic.
  Kicker labels: Featured Review, Featured Guide,
  Featured Specs, Featured Deal, Featured Story (default).
  featured-homepage v6

### v16.0.0

- Search suggestions overhaul: replaced live feed-based
  suggestion system with a static label catalogue.
  Zero extra HTTP requests, instant client-side filtering.
- SUGGESTION MODES:
  Empty input (any page)   — popular topic shortcuts
  Empty input (single post) — contextual device intel
  suggestions first, then topics
  Typed query              — filter static catalogue,
  highlight matches, link to
  label page or search results
- CATALOGUE STRUCTURE:
  Brands:    Samsung, Apple, Google, Nokia, BlackBerry,
  Microsoft, Motorola, Sony, HTC, LG, Nothing,
  OnePlus, Xiaomi
  Platforms: Android, iOS, Windows, Chrome OS,
  Windows Phone
  Content:   Review, Specs, Guides, Deals, Featured
  Topics:    MVNO, Apps, Brave, 5G, Foldable
- Removed: requestSuggestions, renderSuggestions,
  djsSearchSuggestFeed, getEntryType, getEntryMeta,
  activeScript — all live feed machinery eliminated.
  search-intelligence v2

### v16.1.0

- Cleanup: removed dormant image breakout CSS block
  (image-layout v1/v2) and the .no-breakout escape hatch.
  The breakout rule was never visibly active due to
  post card overflow containment, making both rules
  dead weight. No visual change.
  maintenance-cleanup v2

### v16.2.0

- Device Hub context block refinement: kicker, note text,
  and chips now degrade gracefully on editorial posts with
  no device family detected.
- BEHAVIOUR BY DETECTION LEVEL:
  Family detected  — kicker "Device Intelligence",
  note references "device family",
  chips: postType + brand + family + platform
  Brand only       — kicker "Editorial Context",
  note references "brand",
  chips: postType + brand + platform
  Platform only    — kicker "Editorial Context",
  note references "platform",
  chips: postType + platform
- device-context v2

### v16.2.0b

- Pagination indicator: added JS-driven page label between
  pager buttons. Shows "Page 1" on homepage, "Browse" on
  subsequent pages (Blogger URL params don't expose exact
  page number beyond page 1). Visual styling improved with
  stronger button presence and centre label.
  pager-indicator v1

### v16.2.0c

- Mobile bottom button collision fix: back-to-top button
  lifts to bottom: 76px on review posts under 480px
  so it clears the full-width sticky review CTA.
  Uses body[data-djs-post-type="review"] selector.
  back-to-top v2

### v16.3.0

- Label hierarchy fix: brand now always wins over platform
  in post intelligence detection. Fixes Surface Duo showing
  Android instead of Microsoft as primary context.
- CHANGES:
  - Platform-to-brand inference added after brand detection:
  ios          -> apple (if brand empty)
  windows phone -> microsoft (if brand empty)
  chrome os    -> google (if brand empty)
  android      -> no inference (multi-brand platform)
  - Platform stored in djsDeviceIntel for downstream use
  - Chip suppression: platform chip hidden when brand
  already implies it (ios+apple, windows+microsoft,
  chrome os+google, android shown only when no brand)
  - Surface Duo correctly shows Microsoft context since
  "surface" keyword maps to microsoft in djsDetectBrand
- device-family-intel v2

### v16.4.0

- Label chip priority fix: brand labels now always shown
  over platform labels in both card and single post views.
- APPROACH:
  Card view    — template stores all label names in a
  data-labels attribute on .home-snippet.
  JS reads the attribute, scores each label,
  updates the single visible chip text and
  href to the highest priority label.
  Zero extra DOM elements — no download impact.
  Single post  — all chips render as before. JS reorders
  them in the DOM so brand chip always leads.
- PRIORITY ORDER:
  1. Brand      (Samsung, Apple, Microsoft, Google etc.)
  2. Content    (Review, Specs, Guides, Deals)
  3. Platform   (Android, iOS, Windows etc.)
  4. Topic      (MVNO, Brave, Apps etc.)
- label-priority v1

### v16.5.0

- Disqus lazy load: Disqus embed script now only loads
  when #disqus_thread scrolls into the viewport using
  IntersectionObserver. Saves full Disqus bundle on every
  post view where the reader never scrolls to comments.
  disqus_config variables stay inline (require Blogger
  template variables). Falls back to immediate load on
  browsers without IntersectionObserver support.
  script-disqus v6

### v16.6.0

- Sidebar enrichment: added Latest Devices rail (6-item
  3x2 grid from Specs label feed, thumbnail + name),
  Explore by Topic pill grid (permanent, all pages),
  and 🔥 emoji to Trending widget title.
  Removed Explore by Topic from footer Stay Connected
  column — now lives exclusively in the sidebar.
  Footer revisit deferred to v16.7.0.
  sidebar-devices v1, sidebar-topics v1, trending-polish v1

### v16.7.0

- Footer redesign: replaced three heavy widget-box columns
  with a clean flat layout inspired by PhoneArena/TechCrunch.
  Logo + tagline left, flat link groups centre, socials right
  in main bar. Copyright + legal links in bottom strip.
  Removed widget card styling entirely from footer.
  footer-redesign v1

### v16.7.1

- Footer polish: switched to full horizontal logo at 40px
  height, increased brand-to-nav gap, added left accent
  bar to footer nav group headings matching section-title
  pattern, added visited link colour reset in footer.
  footer-redesign v2

### v16.7.2

- Bug fix: reverted footer to square logo (small_logo_2026.png)
  at 120px, removed tagline text below logo.
  footer-redesign v3

### v16.7.3

- Bug fix: h2/h3/h4 headings inside post body now hidden in
  compact card home-snippet so section headings no longer
  bleed through into homepage/listing previews.
  compact-feed v3

### v16.7.4

- Sidebar reorder: moved Trending above Explore by Topic
  so popular posts appear higher in the sidebar column.
  sidebar-topics v2

### v16.7.5

- Latest Devices rail now homepage-only: wrapped sidebar
  HTML block in data:view.url == data:blog.homepageUrl
  condition so it is absent on post, label, and search
  pages. loadSidebarDevices() relies on rail absence for
  early return on non-homepage views.
  sidebar-devices v2

### v16.7.6

- Performance: staggered sidebar feed loads to give the
  featured hero fetch clear bandwidth on page load.
  loadSidebarReviews delayed 400ms, loadSidebarDevices
  delayed 800ms after DOMContentLoaded. Targets LCP
  improvement on homepage.
  perf-feed-stagger v1

### v16.7.7

- Revert: removed feed stagger (v16.7.6) — LCP did not
  improve and desktop score slightly regressed. Root cause
  is JS-driven background-image pipeline, not bandwidth
  contention. Feeds restored to immediate DOMContentLoaded.
  perf-feed-stagger v2

### v16.7.8

- Sidebar visual polish: unified right-column widget rhythm,
  added accent-bar headings, refined Trending row hover states,
  improved topic pill density, and tightened Latest Reviews /
  Latest Devices spacing without changing feed logic.
  sidebar-polish v1

### v16.7.9

- Device Hub cleanup: renamed Hub quick link to All coverage,
  softened empty-state copy, changed Connected coverage to
  More from this device, and reused existing related-link
  reservation logic to reduce duplicate recommendations.
  device-hub-cleanup v1

### v16.8.0

- Homepage LCP preparation: featured hero now injects a real
  high-priority img element inside the existing hero media
  layer while preserving the background-image fallback and
  visual overlay. Layout and feed logic unchanged.
  homepage-lcp v1, featured-homepage v7

### v16.8.1

- Editorial label classification fix: separated Editorial
  from Guides in featured homepage badge logic so opinion
  pieces display as Featured Editorial instead of Featured Guide.
  Added Editorial post-type detection, search catalogue entry,
  label-priority support, and single-post Editorial chip styling.
  editorial-label v1

### v16.9.0

- Compare Block: added a single-post comparison prompt powered by
  existing device-family, brand, and platform intelligence.
  Generates safe search-based comparison links without touching
  homepage featured rendering or sidebar feed systems.
  compare-block v1

### v16.9.1

- Editorial System: softened Device Hub behaviour for Editorial
  posts with analysis-focused quick links, copy, and compare
  suppression so opinion pieces feel less product-buying focused.
  editorial-system v1

### v16.11

- Compare Block polish and Impact verification: added Impact
  site verification meta tag and refined comparison wording
  while keeping Editorial posts excluded from compare prompts.
  compare-block v2, impact-verification v1

### v16.12

- Search intelligence refinement: expanded static search catalogue
  with Editorial and device-family shortcuts including Galaxy S,
  Galaxy Z Fold, Pixel, iPhone Pro, and Razr; popular suggestions
  now include Editorial and family shortcuts while staying zero
  feed-request. search-intelligence v3

### v16.14

- Post Conversion polish: refined Amazon button behaviour,
  affiliate disclosure copy, and sticky review CTA handling so
  Review/Specs posts keep a strong conversion path while News
  and Editorial posts remain lighter and less sales-driven.
  post-conversion v1

### v16.15

- Homepage Editorial Promotion: strengthened Editorial visual
  treatment on homepage featured cards and hero badges without
  changing featured feed logic, homepage queries, or post systems.
  homepage-editorial-promotion v1

### v16.18

- Evergreen SEO Layer: added archive-strengthening and freshness
  planning markers for older Reviews, Specs, Editorials, and
  comparison-style posts while preserving homepage featured,
  search hub, Device Hub, and post conversion systems. evergreen-seo v1

### v16.19

- Stability / Optimization Pass: tightened scroll handling with
  requestAnimationFrame, made global content identity classing
  idempotent, added a short-lived MutationObserver for generated
  badges, and preserved all homepage featured/feed behaviour.
  stability-optimization v1

### v16.20

- SEO / Topic Refinement Pass: added lightweight label archive
  intros, expanded static search shortcuts, topic-intent scoring,
  freshness-aware related ranking, and crawl-friendly archive
  discovery without touching homepage featured/feed logic.
  seo-topic-refinement v1

### v16.21

- Search UX Clarity Pass: replaced internal search suggestion
  taxonomy labels with user-facing categories, softened discovery
  pill styling, and hid suggestion category pills on mobile while
  preserving the existing search intelligence architecture.
  search-ux-clarity v1

### v16.22

- Editorial Discovery / Reading Flow Pass: refined related-content
  wording, softened editorial discovery cards, strengthened fresh
  coverage ranking, and added subtle reading-flow polish without
  touching homepage featured/feed architecture.
  editorial-discovery v1, reading-flow v1

### v16.23

- Topic Ecosystem Reinforcement: added lightweight topic-affinity
  mapping for foldables, Pixel, Galaxy AI, Android Beta,
  Snapdragon, iPhone, MVNO, and wearables; improved related
  ranking with authority-aware and ecosystem-aware scoring while
  preserving homepage featured/feed architecture.
  topic-ecosystem v1

### v16.24

- Authority Refinement Pass: refined cornerstone and evergreen
  weighting so definitive reviews, specs, guides, and comparison
  explainers surface more consistently without adding new UI.
  authority-refinement v1

### v16.25

- Reading Rhythm Polish: tightened longform spacing, related block
  rhythm, and metadata hierarchy for calmer article reading flow
  while preserving existing theme classes and systems.
  reading-rhythm-polish v1

### v16.26

- Discovery Consistency Pass: normalized discovery language and
  related-card emphasis so recommendations feel more curated and
  less mechanical across reviews, specs, guides, news, and
  editorial posts.
  discovery-consistency v1

### v16.27

- Evergreen Optimization Pass: refined evergreen authority scoring,
  softly de-emphasized temporary rumor/deal/news items as they
  age, and improved archive/internal-link weighting without new
  widgets or homepage/feed changes.
  evergreen-optimization v1

### v16.28

- Social Preview Quality Pass: upgraded Open Graph and Twitter/X
  card image meta to request larger 1200:630 social preview
  images from Blogger instead of small thumbnail URLs, improving
  IFTTT/X preview sharpness without changing post, homepage,
  or feed rendering.
  social-preview-quality v1

### v16.29

- Feed Loader Hardening Pass: hardened JSONP feed loading with
  timeout handling, onerror cleanup, unique callbacks, script
  removal, and post-render polish for generated feed content while
  preserving existing Blogger feed behaviour.
  feed-loader-hardening v1

### v17.0

- Repository Structure / Asset Path Alignment: updated theme
  asset references for the cleaned DJs Mobiles GitHub Pages
  structure, moved website Pulse script references to the
  djsmobiles repo path, and preserved existing Blogger theme
  behaviour while preparing the repo for Pulse web integration.
  repo-structure v1, pulse-web-paths v1

---

## Script Registry

- **search-bar `v1`** — Search icon and floating dropdown
- **script-core `v1`** — Centralized UI controller
- **script-search `v5`** — Search dropdown handler
- **ios-icons `v2`** — Dedicated favicon and Apple touch icons
- **script-ga4 `v1`** — Google Analytics 4
- **facebook-ogp `v1`** — Facebook Open Graph Protocol
- **twitter-cards `v1`** — Twitter/X Card meta tags
- **json-ld-site `v1`** — Site identity structured data
- **script-https `v1`** — Image HTTP to HTTPS upgrade
- **script-hamburger `v4`** — Mobile nav hamburger toggle
- **script-lightbox `v2`** — Post image lightbox
- **script-disqus `v6`** — Disqus lazy load via IntersectionObserver
- **sidebar-devices `v2`** — Latest Devices rail now homepage-only via b:if condition
- **perf-feed-stagger `v2`** — Reverted — stagger made no LCP improvement, feeds back to immediate load
- **stability-opt `v1`** — v16.19 scroll and generated badge initialization cleanup
- **seo-topic-refinement `v1`** — Label archive intros, topic-intent scoring, freshness bias, and search shortcut expansion
- **topic-ecosystem `v1`** — Topic-affinity mapping, cornerstone-aware related scoring, and ecosystem fetch expansion
- **authority-refinement `v1`** — Cornerstone/evergreen ranking refinement for related discovery
- **reading-rhythm-polish `v1`** — Longform spacing and metadata hierarchy polish
- **discovery-consistency `v1`** — Curated related-language and discovery presentation refinement
- **evergreen-optimization `v1`** — Evergreen authority scoring and outdated temporary-news decay
- **feed-loader-hardening `v1`** — JSONP timeout/error handling, script cleanup, unique callbacks, and generated-content polish
- **social-preview-quality `v1`** — Larger Open Graph and Twitter/X preview image meta for social shares
- **sidebar-topics `v1`** — Explore by Topic pill grid in sidebar, permanent all pages
- **sidebar-polish `v1`** — Unified sidebar widget rhythm, headings, hover polish, and tighter topic pills
- **trending-polish `v1`** — Flame emoji added to Trending widget title
- **footer-redesign `v3`** — Footer polish: full logo, accent bars on headings, visited link reset
- **script-shrink `v2`** — Sticky header shrink on scroll
- **mobile-overflow-fix `v1`** — Mobile search/result containment rules
- **seo-pass `v1`** — Article schema, robots, metadata layout
- **visual-refresh `v1`** — Major visual redesign and card system
- **homepage-polish `v4`** — Featured homepage spacing and desktop/mobile polish
- **featured-homepage `v7`** — Hero uses real high-priority img with background fallback
- **compact-feed `v3`** — h2/h3/h4 headings hidden in home-snippet compact cards
- **homepage-lcp `v1`** — Featured hero image element for improved LCP visibility
- **post-card-meta `v1`** — Label chip before date in multi-post card meta row
- **footer-balance `v1`** — Stay Connected column social links + Explore by Topic grid
- **header-depth `v1`** — Richer masthead gradient, glow, texture, tagline, accent strip
- **sidebar-reviews `v3`** — Latest Reviews sidebar with skeleton loading + clean hide
- **review-components `v1`** — Protocol cards, feature list, rating bars, notice boxes
- **mobile-nav-polish `v1`** — Mobile accordion spacing, chevrons, and motion
- **maintenance-cleanup `v1`** — Removed unused legacy Blogger placeholders
- **ownership-hardening `v1`** — Theme signature and copyright markers
- **accessibility-polish `v1`** — Keyboard-visible focus states and usability polish
- **typography-rhythm `v1`** — Article spacing, headings, and long-form readability
- **spec-sheet `v4`** — Theme-controlled spec summaries and tech tables
- **sidebar-reviews `v2`** — Latest Reviews visual card polish
- **homepage-polish `v5`** — Featured title overflow safety and final CTA tuning
- **cta-system `v1`** — Shared call-to-action button polish
- **device-family-intel `v2`** — Brand wins over platform, platform-to-brand inference, chip suppression
- **label-priority `v1`** — Brand label always shown first over platform in card and post views
- **device-context `v2`** — Graceful degradation for brand/platform-only editorial posts
- **pager-indicator `v1`** — JS page label injected between pager buttons
- **back-to-top `v2`** — Mobile collision fix with sticky review CTA on review posts
- **xml-safety-fix `v1`** — Corrected HTML escape helper apostrophe handling
- **device-hub `v1`** — Unified post-level Device Hub block
- **device-hub-links `v1`** — Device-aware quick links and compare links
- **compare-block `v1`** — Single-post comparison prompt using device intelligence
- **editorial-system `v1`** — Editorial-aware Device Hub tone and compare suppression
- **editorial-linking `v1`** — Editorial-only More Editorial internal linking block
- **device-hub-cleanup `v1`** — Clearer Device Hub labels, empty states, and dedupe
- **search-intelligence `v3`** — Static label catalogue plus device family shortcuts, Editorial suggestions, zero feed requests
- **evergreen-seo `v1`** — Archive strengthening, freshness-aware continuation planning, and evergreen topic clustering
- **maintenance-cleanup `v2`** — Removed dormant image breakout CSS and no-breakout escape hatch
- **section-title `v1`** — Left accent bar on homepage Latest Posts section heading
- **snippet-polish `v1`** — Desktop card snippet font size, line clamp and min-height fix
- **trending-rankings `v1`** — CSS counter numbered rankings for Trending sidebar widget
- **quick-take-chip `v1`** — Automatic styled pill for Quick-Take labelled posts
- **post-type-chips `v1`** — Unified label-driven post type chip system for single post view
- **reading-time `v1`** — Word count based read time estimate injected into post meta row
- **back-to-top `v1`** — Fixed bottom-left return to top button with scroll trigger
- **card-rhythm `v1`** — Multi-post card spacing and CTA alignment polish
- **image-layout `v2`** — Controlled desktop breakout for post images with no-breakout escape hatch
- **editorial-rhythm `v1`** — Editorial block spacing and section divider utility
