# Pulse v0.2.24 / Pulse State v0.3.10 — 2026-07-28
- Removed the label-based Story Threads experiment and restored the shelf to Continue Reading.
- Stopped using `brand`, `topics`, and title keyword guesses to imply that a reader is following a story.
- Pulse State now preserves Core article intelligence as supplied; it no longer reclassifies past articles from title text.
- A future “Continue Following” shelf must consume an explicit, Core-published story-thread contract rather than derive it from Blogger labels.

# Pulse v0.2.23 / Pulse State v0.3.9 — 2026-07-27
- Moved Story Thread detection, grouping, and ranking from `pulse.js` to `pulse-state.js`.
- Added `DjsPulseState.getStoryThreads()` and included its output in the reader state returned by `load()`.
- Kept `pulse.js` focused on consuming Story Thread data for the Continue Following shelf.

# Pulse v0.2.23 / Pulse State v0.3.10 — 2026-07-27

- Moved Story Thread detection, grouping, and ranking from pulse.js to pulse-state.js.
- Added DjsPulseState.getStoryThreads() and included its output in the reader state returned by load().
- Kept pulse.js focused on consuming Story Thread data for the Continue Following shelf.

# Pulse v0.2.20

- Replaced the fixed “Your Pulse” header with reader-state-aware titles.
- Added the agreed title states for first launch, same-day activity, daily, weekly, missed, quiet, and no-history readers.
- Removed the separate eyebrow and conversation title to eliminate repeated labels.
- Preserved the existing shelves, icon hardening, styling, and behavior.
