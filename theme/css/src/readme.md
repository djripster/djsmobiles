# Core CSS Source Architecture

> **Status:** Future Architecture
>
> This directory represents the long-term source structure for the DJs Mobiles Core CSS platform.
>
> It is intentionally designed ahead of implementation so that future development follows a consistent architecture rather than requiring major reorganization later.

---

# Philosophy

Core is designed around a simple principle:

> **Build for tomorrow. Deliver today.**

The production website should remain stable and lightweight, while the source architecture should be free to evolve into a maintainable, modular system.

This folder exists to organize CSS by responsibility rather than by convenience.

---

# Production Model

The live website should only load a single stylesheet:

```html
<link rel="stylesheet" href="https://djripster.github.io/djsmobiles/theme/css/core.css">
```

Regardless of how many source files exist inside `src/`, the production website should continue using one optimized stylesheet.

This provides:

- predictable load order
- browser caching
- fewer HTTP requests
- easier deployment
- simpler debugging

---

# Source Structure

Current planned architecture:

```
src/

00-tokens.css
01-reset.css
02-base.css
03-typography.css
04-layout.css

05-navigation.css
06-search.css
07-homepage.css
08-article.css
09-components.css
10-feeds.css
11-lightbox.css
12-pulse-hooks.css
13-accents.css
14-utilities.css
```

The numbering establishes permanent load order and should remain stable.

---

# Layer Philosophy

## Foundation

These files establish the visual language of Core.

```
00 Tokens
01 Reset
02 Base
03 Typography
```

Responsibilities include:

- colors
- spacing
- typography
- CSS variables
- global resets
- default elements

---

## Structure

```
04 Layout
```

Responsible for:

- page layout
- containers
- wrappers
- grids
- responsive structure

---

## Features

Each feature owns its own styling.

```
05 Navigation
06 Search
07 Homepage
08 Article
09 Components
10 Feeds
11 Lightbox
```

A feature should not rely on unrelated feature files whenever possible.

---

## Integration

```
12 Pulse Hooks
```

Contains styling that exists specifically for Pulse integration.

Core owns the styling.

Pulse owns the experience.

---

## Optional Systems

```
13 Accents
```

Reserved for temporary or optional visual additions.

Examples:

- America 250
- Full Moon
- Seasonal decorations
- Anniversary assets
- Celebration graphics

Core should support these without requiring changes to the website structure.

---

## Utilities

```
14 Utilities
```

Reusable helper classes.

Examples:

- spacing
- visibility
- alignment
- accessibility helpers

---

# Current Workflow

Today there is **no build pipeline**.

Development should follow this process:

```
Edit source CSS

↓

Test

↓

Copy approved changes into core.css

↓

Commit

↓

Deploy
```

This keeps production simple while allowing the architecture to mature.

---

# Future Workflow

Long-term, Core may introduce a build process.

Conceptually:

```
src/

↓

Core Build

↓

core.css

↓

GitHub

↓

Production
```

When that happens:

- source files become the editable files
- `core.css` becomes generated
- Blogger continues loading only `core.css`

No changes to the website should be required.

---

# Why This Exists

This directory is intentionally created before it is fully used.

The goal is not to migrate CSS immediately.

The goal is to ensure every future CSS improvement naturally fits into a long-term architecture.

Planning first avoids expensive reorganizations later.

---

# Core Principle

The production website should remain simple.

The source architecture should remain scalable.

Core is designed to evolve over many years, not just the next release.

Good architecture is built long before it becomes necessary.
