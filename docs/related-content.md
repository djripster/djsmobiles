# Related Content Logic

**Introduced:** v14.9.5.1

## Purpose

Refines **Continue Reading** and **Explore More** recommendations on single post pages using stronger device-family awareness and cleaner separation between editorial discovery and next-step navigation.

## Ranking Priority

Recommendations are ranked using the following order:

1. Device family
2. Post intent / content type
3. Brand
4. Platform / topic fallback

## Behaviour

- Prioritizes matching devices from the same family.
- Boosts cross-intent journeys such as:
  - Specs → Review
  - Review → Guide
  - Guide → Review
- Penalizes generic same-brand matches when a more specific device-family match exists.
- Deduplicates recommendations between:
  - Continue Reading
  - Explore More

## Scope

This logic only affects single-post related content.

The following systems are intentionally unaffected:

- Homepage feeds
- Sidebar feeds
- Featured feed
- Search

## Design Goals

- Strong device clustering
- Higher quality recommendations
- Graceful fallback when only broad related coverage exists
- No duplicated recommendations
