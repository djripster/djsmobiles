#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const SOURCES_FILE = path.join(ROOT, 'sources.json');
const STORIES_FILE = path.join(ROOT, 'stories.json');

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function stripTags(value = '') {
  return decodeXml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

function firstMatch(block, patterns) {
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match) return decodeXml(match[1]);
  }
  return '';
}

function canonicalizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach((key) => {
    url.searchParams.delete(key);
  });
  url.hash = '';
  return url.toString();
}

function storyId(sourceId, url) {
  return `${sourceId}-${crypto.createHash('sha256').update(url).digest('hex').slice(0, 16)}`;
}

function parseFeed(xml, source) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];

  return blocks.map((block) => {
    const headline = stripTags(firstMatch(block, [/<title[^>]*>([\s\S]*?)<\/title>/i]));
    const rawUrl = firstMatch(block, [
      /<link[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i,
      /<link[^>]*>([\s\S]*?)<\/link>/i,
      /<guid[^>]*isPermaLink=["']true["'][^>]*>([\s\S]*?)<\/guid>/i
    ]);
    const publishedRaw = firstMatch(block, [
      /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i,
      /<published[^>]*>([\s\S]*?)<\/published>/i,
      /<updated[^>]*>([\s\S]*?)<\/updated>/i
    ]);

    if (!headline || !rawUrl) return null;

    let url;
    try {
      url = canonicalizeUrl(rawUrl);
    } catch {
      return null;
    }

    const parsedDate = publishedRaw ? new Date(publishedRaw) : null;
    const publishedAt = parsedDate && !Number.isNaN(parsedDate.valueOf()) ? parsedDate.toISOString() : null;

    return {
      id: storyId(source.id, url),
      headline,
      url,
      sourceId: source.id,
      brandIds: source.brandId ? [source.brandId] : [],
      publishedAt,
      collectedAt: new Date().toISOString(),
      type: 'standard'
    };
  }).filter(Boolean);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJsonAtomic(file, data) {
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(temp, file);
}

async function collectSource(source) {
  const method = source.collection?.preferred;
  const endpoint = source.collection?.[method]?.url;

  if (!source.enabled) return { source, status: 'disabled', stories: [] };
  if (!endpoint) return { source, status: 'invalid', stories: [], error: `Missing ${method} URL` };
  if (!['rss', 'atom'].includes(method)) {
    return { source, status: 'unsupported', stories: [], error: `Unsupported collection method: ${method}` };
  }

  try {
    const response = await fetch(endpoint, {
      headers: { 'user-agent': 'DJsMobiles-Hive/1.0 (+https://www.djsmobiles.com)' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    return { source, status: 'ok', stories: parseFeed(xml, source) };
  } catch (error) {
    return { source, status: 'failed', stories: [], error: error.message };
  }
}

async function main() {
  const sourceRegistry = await readJson(SOURCES_FILE);
  const storyStore = await readJson(STORIES_FILE).catch(() => ({ schemaVersion: 1, stories: [] }));
  const existing = new Map((storyStore.stories || []).map((story) => [story.url, story]));

  for (const source of sourceRegistry.sources || []) {
    const result = await collectSource(source);
    console.log(`[${result.status}] ${source.name}${result.error ? ` - ${result.error}` : ` - ${result.stories.length} items`}`);
    for (const story of result.stories) {
      const previous = existing.get(story.url);
      existing.set(story.url, previous ? { ...story, collectedAt: previous.collectedAt } : story);
    }
  }

  const stories = [...existing.values()].sort((a, b) => {
    return new Date(b.publishedAt || b.collectedAt) - new Date(a.publishedAt || a.collectedAt);
  });

  await writeJsonAtomic(STORIES_FILE, {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    stories
  });

  console.log(`Stored ${stories.length} unique stories.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
