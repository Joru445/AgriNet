#!/usr/bin/env node

/**
 * generate-fcm-sw.js
 *
 * Reads Firebase config from .env.local and generates
 * public/firebase-messaging-sw.js with the actual values.
 *
 * Usage:
 *   node scripts/generate-fcm-sw.js
 *
 * The generated SW file should NOT be committed to git.
 * It is listed in .gitignore.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Read .env.local
function loadEnvLocal() {
  const envPath = resolve(ROOT, ".env.local");
  let content;
  try {
    content = readFileSync(envPath, "utf-8");
  } catch {
    console.error("Could not read .env.local. Create it with Firebase config.");
    process.exit(1);
  }

  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    vars[key] = value;
  }
  return vars;
}

// Read template
function loadTemplate() {
  const templatePath = resolve(ROOT, "public", "firebase-messaging-sw.js");
  return readFileSync(templatePath, "utf-8");
}

// Replace placeholders
function generate(template, env) {
  const replacements = {
    __FIREBASE_API_KEY__: env.VITE_FIREBASE_API_KEY || "",
    __FIREBASE_AUTH_DOMAIN__: env.VITE_FIREBASE_AUTH_DOMAIN || "",
    __FIREBASE_PROJECT_ID__: env.VITE_FIREBASE_PROJECT_ID || "",
    __FIREBASE_STORAGE_BUCKET__: env.VITE_FIREBASE_STORAGE_BUCKET || "",
    __FIREBASE_MESSAGING_SENDER_ID__: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    __FIREBASE_APP_ID__: env.VITE_FIREBASE_APP_ID || "",
  };

  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replaceAll(placeholder, value);
  }
  return result;
}

// Main
const env = loadEnvLocal();
const template = loadTemplate();
const output = generate(template, env);

const outPath = resolve(ROOT, "public", "firebase-messaging-sw.js");
writeFileSync(outPath, output, "utf-8");

console.log("[FCM SW] Generated firebase-messaging-sw.js");
console.log("[FCM SW] Project:", env.VITE_FIREBASE_PROJECT_ID || "(not set)");
