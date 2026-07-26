# Decision Log
## 2026-07-25

### Decision
Web Pulse adapts to the reader.
Extension Pulse adapts to the owner.

### Context
Several weeks of using the developer build showed that the website feels most natural when it quietly infers interests rather than asking users to configure them. Conversely, the browser extension is a personal workspace where customization is expected.

### Evidence
- Pulse local storage demonstrated that article history naturally forms story patterns.
- Design discussions consistently favored adaptive behavior over additional widgets.
- Reader memory proved more valuable than engagement metrics.

### Guiding Principle
If a feature requires user configuration, it probably belongs in the extension.
If a feature can be inferred through observation, it probably belongs on the website.
