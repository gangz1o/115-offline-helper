;(function (global) {
  'use strict';

  function normalizeCid(value) {
    const cid = String(value ?? '').trim();
    return /^\d+$/.test(cid) ? cid : '';
  }

  function parsePathLine(line) {
    const raw = String(line || '').trim();
    if (!raw) return null;

    const idx = raw.lastIndexOf(':');
    if (idx === -1) {
      const cidOnly = normalizeCid(raw);
      if (!cidOnly) return null;
      return { name: '', cid: cidOnly };
    }

    const name = raw.slice(0, idx).trim();
    const cid = normalizeCid(raw.slice(idx + 1));
    if (!cid) return null;
    return { name, cid };
  }

  function parsePathList(rawText) {
    const lines = String(rawText || '').split('\n');
    const result = [];
    const seen = new Set();

    for (const line of lines) {
      const item = parsePathLine(line);
      if (!item) continue;
      if (seen.has(item.cid)) continue;
      seen.add(item.cid);
      result.push(item);
    }

    return result;
  }

  function getDisplayName(item, rootLabel = '根目录') {
    if (!item) return rootLabel;
    if (item.cid === '0') return rootLabel;
    if (item.name) return item.name;
    return `CID:${item.cid}`;
  }

  function formatPathLabel(item, rootLabel = '根目录') {
    if (!item || item.cid === '0') return rootLabel;
    if (item.name) return item.name;
    return `CID:${item.cid}`;
  }

  function buildPathOptions(rawList, rootLabel = '根目录') {
    const parsed = parsePathList(rawList);
    const hasRoot = parsed.some(item => item.cid === '0');
    const withRoot = hasRoot ? parsed : [{ name: rootLabel, cid: '0' }, ...parsed];
    return withRoot;
  }

  function findPathByCid(rawList, cid) {
    const target = normalizeCid(cid) || '0';
    return buildPathOptions(rawList).find(item => item.cid === target) || null;
  }

  global.Push115PathUtils = {
    normalizeCid,
    parsePathList,
    buildPathOptions,
    findPathByCid,
    getDisplayName,
    formatPathLabel,
  };
})(typeof window !== 'undefined' ? window : globalThis);
