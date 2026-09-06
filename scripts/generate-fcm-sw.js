#!/usr/bin/env node

/**
 * generate-fcm-sw.js
 *
 * Reads the committed template from scripts/ and Firebase config from
 * environment variables (or .env.local as a local fallback), then writes
 * public/firebase-messaging-sw.js.
 *
 * Usage:
 *   node scripts/generate-fcm-sw.js
 *
 * The generated SW file is a build artifact and should NOT be committed.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const REQUIRED_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

// Read .env.local as fallback when env vars are not set
function loadEnvLocal() {
  const envPath = resolve(ROOT, ".env.local");

  if (!existsSync(envPath)) return {};

  const content = readFileSync(envPath, "utf-8");
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

// Merge: process.env takes precedence, .env.local fills gaps
function loadConfig() {
  const local = loadEnvLocal();
  const config = {};

  for (const key of REQUIRED_VARS) {
    config[key] = process.env[key] || local[key] || "";
  }

  return config;
}

// Read template from scripts/
function loadTemplate() {
  const templatePath = resolve(__dirname, "firebase-messaging-sw.template.js");
  return readFileSync(templatePath, "utf-8");
}

// Replace placeholders
function generate(template, config) {
  const replacements = {
    __FIREBASE_API_KEY__: config.VITE_FIREBASE_API_KEY,
    __FIREBASE_AUTH_DOMAIN__: config.VITE_FIREBASE_AUTH_DOMAIN,
    __FIREBASE_PROJECT_ID__: config.VITE_FIREBASE_PROJECT_ID,
    __FIREBASE_STORAGE_BUCKET__: config.VITE_FIREBASE_STORAGE_BUCKET,
    __FIREBASE_MESSAGING_SENDER_ID__: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
    __FIREBASE_APP_ID__: config.VITE_FIREBASE_APP_ID,
  };

  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replaceAll(placeholder, value);
  }
  return result;
}

// Main
const config = loadConfig();

// Validate all required variables are present
const missing = REQUIRED_VARS.filter((key) => !config[key]);
if (missing.length > 0) {
  console.error(
    `[FCM SW] Missing required environment variables: ${missing.join(", ")}`,
  );
  console.error(
    "[FCM SW] Set them in .env.local or as environment variables before building.",
  );
  process.exit(1);
}

const template = loadTemplate();
const output = generate(template, config);

// Ensure public/ directory exists
const publicDir = resolve(ROOT, "public");
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

const outPath = resolve(publicDir, "firebase-messaging-sw.js");
writeFileSync(outPath, output, "utf-8");

console.log("[FCM SW] Generated firebase-messaging-sw.js");
console.log("[FCM SW] Project:", config.VITE_FIREBASE_PROJECT_ID);
