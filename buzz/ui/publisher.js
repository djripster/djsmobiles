#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = __dirname;
const STORIES_FILE = path.join(ROOT, 'stories.json');
const BUZZ_FILE = path.join(ROOT, 'buzz.json');
const MAX_ITEMS = 15;
const MAX_AGE_HOURS = 24;

async function writeJsonAtomic(file, data) {
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(temp, file);
}

async function main() {
  const store = JSON.parse(await fs.readFile(STORIES_FILE, 'utf8'));
  const now = Date.now();
  const cutoff = now - MAX_AGE_HOURS * 60 * 60 * 1000;

  const eligible = (store.stories || [])
    .filter((story) => story.type === 'live' || new Date(story.publishedAt || story.collectedAt).valueOf() >= cutoff)
    .sort((a, b) => {
      if (a.type === 'live' && b.type !== 'live') return -1;
      if (b.type === 'live' && a.type !== 'live') return 1;
      return new Date(b.publishedAt || b.collectedAt) - new Date(a.publishedAt || a.collectedAt);
    })
    .slice(0, MAX_ITEMS)
    .map(({ id, headline, url, sourceId, brandIds, publishedAt, type }) => ({
      id,
      headline,
      url,
      sourceId,
      brandIds,
      publishedAt,
      type: type || 'standard'
    }));

  await writeJsonAtomic(BUZZ_FILE, {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    items: eligible
  });

  console.log(`Published ${eligible.length} items to buzz.json.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
