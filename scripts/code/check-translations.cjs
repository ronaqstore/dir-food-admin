'use strict';

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { Reporter } = require('./lib/reporter.cjs');
const { walkTree } = require('./lib/walkTree.cjs');

const r = new Reporter('Translation Keys & Locale Parity Audit', { emoji: '🌐' });
const messagesDir = path.join(__dirname, '../../messages');
const srcRoot = path.join(__dirname, '../../src');
const locales = ['en', 'ur', 'ps', 'roman'];

function flat(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flat(v, key, out);
    } else {
      out[key] = v;
    }
  }
  return out;
}

const maps = {};
for (const locale of locales) {
  const file = path.join(messagesDir, `${locale}.json`);
  if (!fs.existsSync(file)) {
    r.addViolation(`messages/${locale}.json`, 1, `Missing locale file messages/${locale}.json`);
    continue;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    maps[locale] = flat(parsed);
  } catch (err) {
    r.addViolation(`messages/${locale}.json`, 1, `Invalid JSON in messages/${locale}.json: ${err.message}`);
  }
}

if (maps.en) {
  const enKeys = Object.keys(maps.en);
  const allEnKeys = new Set(enKeys);
  const knownTopNamespaces = new Set(enKeys.map((k) => k.split('.')[0]).filter(Boolean));

  for (const locale of locales) {
    if (locale === 'en' || !maps[locale]) continue;
    for (const key of enKeys) {
      if (!(key in maps[locale])) {
        r.addViolation(
          `messages/${locale}.json`,
          1,
          `Missing key "${key}" (present in en.json)`,
          { fix: `Add "${key}" to messages/${locale}.json` }
        );
      }
    }
    for (const key of Object.keys(maps[locale])) {
      if (!allEnKeys.has(key)) {
        r.addViolation(
          `messages/${locale}.json`,
          1,
          `Extra key "${key}" not present in en.json`,
          { fix: `Remove or add matching key to messages/en.json` }
        );
      }
    }
  }

  for (const locale of locales) {
    if (!maps[locale]) continue;
    for (const [key, val] of Object.entries(maps[locale])) {
      if (typeof val === 'string' && val.trim() === '') {
        r.addViolation(
          `messages/${locale}.json`,
          1,
          `Empty translation value for key "${key}"`,
          { fix: `Provide translated text for "${key}" in messages/${locale}.json` }
        );
      }
    }
  }

  const srcFiles = [];
  walkTree(srcRoot, (full, rel) => {
    srcFiles.push({ full, rel });
  });

  for (const { full: file, rel: relPath } of srcFiles) {
    if (relPath.includes('.test.') || relPath.includes('.spec.')) continue;

    const code = fs.readFileSync(file, 'utf8');
    let ast;
    try {
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
      });
    } catch {
      continue;
    }

    traverse(ast, {
      CallExpression(p) {
        const callee = p.node.callee;
        let ns = '';

        if (callee.type === 'Identifier') {
          const binding = p.scope.getBinding(callee.name);
          if (binding && binding.path) {
            const init = binding.path.node?.init;
            const call = init && init.type === 'AwaitExpression' ? init.argument : init;
            if (call && call.type === 'CallExpression') {
              const hookName = call.callee?.name;
              if (
                hookName === 'useTranslations' ||
                hookName === 'getTranslations' ||
                hookName === 'useT'
              ) {
                const arg0 = call.arguments[0];
                if (arg0 && arg0.type === 'StringLiteral') {
                  ns = arg0.value;
                } else if (arg0 && arg0.type === 'ObjectExpression') {
                  const nsProp = arg0.properties.find(
                    (prop) => prop.key && (prop.key.name === 'namespace' || prop.key.value === 'namespace')
                  );
                  if (nsProp && nsProp.value && nsProp.value.type === 'StringLiteral') {
                    ns = nsProp.value.value;
                  }
                }

                const arg = p.node.arguments[0];
                if (arg && arg.type === 'StringLiteral') {
                  const key = arg.value.trim();
                  if (!key || key.includes(' ') || key.length > 100) return;

                  let candidate = ns ? `${ns}.${key}` : key;
                  if (!allEnKeys.has(candidate) && allEnKeys.has(key)) {
                    candidate = key;
                  }

                  if (!allEnKeys.has(candidate)) {
                    r.addViolation(
                      relPath,
                      p.node.loc?.start?.line,
                      `Translation key "${candidate}" does not exist in messages/en.json`,
                      { fix: `Add "${candidate}" to messages/en.json` }
                    );
                    return;
                  }

                  for (const loc of locales) {
                    if (maps[loc] && !(candidate in maps[loc])) {
                      r.addViolation(
                        relPath,
                        p.node.loc?.start?.line,
                        `Translation key "${candidate}" missing from messages/${loc}.json`,
                        { fix: `Add "${candidate}" to messages/${loc}.json` }
                      );
                    }
                  }
                }
              }
            }
          }
        }
      },

      JSXAttribute(p) {
        const name = p.node.name?.name;
        if (
          name === 'pageTitle' ||
          name === 'pageDescription' ||
          name === 'titleKey' ||
          name === 'labelKey'
        ) {
          const val = p.node.value;
          if (val && val.type === 'StringLiteral') {
            const propKey = val.value.trim();
            const topNs = propKey.split('.')[0];
            if (knownTopNamespaces.has(topNs)) {
              if (!allEnKeys.has(propKey)) {
                r.addViolation(
                  relPath,
                  p.node.loc?.start?.line,
                  `Translation key "${propKey}" referenced in prop "${name}" does not exist in messages/en.json`,
                  { fix: `Add "${propKey}" to messages/en.json` }
                );
                return;
              }
              for (const loc of locales) {
                if (maps[loc] && !(propKey in maps[loc])) {
                  r.addViolation(
                    relPath,
                    p.node.loc?.start?.line,
                    `Translation key "${propKey}" missing from messages/${loc}.json`,
                    { fix: `Add "${propKey}" to messages/${loc}.json` }
                  );
                }
              }
            }
          }
        }
      }
    });
  }
}

r.finish({
  fixTip: 'Ensure all translation keys referenced in code exist across all 4 locales (en, ur, ps, roman).'
});

