import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";
import en from "../src/i18n/translations/en.js";
import fil from "../src/i18n/translations/fil.js";

const root = resolve(import.meta.dirname, "../src");
const flatten = (value, prefix = "", output = new Map()) => {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object") flatten(child, path, output);
    else output.set(path, String(child));
  }
  return output;
};
const placeholders = (value) => [...value.matchAll(/\{([\w-]+)\}/g)].map((match) => match[1]).sort().join(",");
const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const file = resolve(dir, entry);
  return statSync(file).isDirectory() ? walk(file) : /\.(jsx?|tsx?)$/.test(file) ? [file] : [];
});

const english = flatten(en);
const filipino = flatten(fil);
let errors = 0;
for (const key of new Set([...english.keys(), ...filipino.keys()])) {
  if (!english.has(key) || !filipino.has(key)) {
    console.error(`Missing translation: ${key} (${english.has(key) ? "fil" : "en"})`);
    errors += 1;
  } else if (placeholders(english.get(key)) !== placeholders(filipino.get(key))) {
    console.error(`Placeholder mismatch: ${key} (en: ${placeholders(english.get(key))}; fil: ${placeholders(filipino.get(key))})`);
    errors += 1;
  }
}

for (const file of walk(root)) {
  if (file.includes(`${resolve(root, "i18n")}\\`) || file.includes(`${resolve(root, "i18n")}/`)) continue;
  const source = readFileSync(file, "utf8");
  const rel = relative(process.cwd(), file);
  for (const match of source.matchAll(/\bt\(\s*["']([^"']+)["']/g)) {
    const isObjectLookup = Object.keys(en).some((key) => key.startsWith(`${match[1]}.`))
      && Object.keys(fil).some((key) => key.startsWith(`${match[1]}.`));
    if ((!english.has(match[1]) || !filipino.has(match[1])) && !isObjectLookup) {
      const line = source.slice(0, match.index).split("\n").length;
      console.error(`Unknown static key: ${match[1]} (${rel}:${line})`);
      errors += 1;
    }
  }
  for (const match of source.matchAll(/\bt\(\s*(?!["'])/g)) {
    const line = source.slice(0, match.index).split("\n").length;
    console.warn(`Manual review: dynamic translation call (${rel}:${line})`);
  }
  for (const match of source.matchAll(/>\s*([A-Z][A-Za-z ]{3,})\s*</g)) {
    const line = source.slice(0, match.index).split("\n").length;
    console.warn(`Manual review: possible hardcoded UI text "${match[1].trim()}" (${rel}:${line})`);
  }
}

console.log(`Translation check complete: ${english.size} English keys, ${filipino.size} Filipino keys.`);
if (errors) process.exitCode = 1;
