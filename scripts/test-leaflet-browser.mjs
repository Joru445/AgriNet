import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { get } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);
const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));
const vitePath = join(process.cwd(), "node_modules", "vite", "bin", "vite.js");
const appPort = 4317;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getStatus(url) {
  return new Promise((resolve, reject) => {
    const request = get(url, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode));
    });
    request.on("error", reject);
  });
}

async function waitFor(getValue, description, timeout = 20_000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeout) {
    try {
      const value = await getValue();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await wait(150);
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ""}`);
}

function runBrowser(args, screenshotPath) {
  return new Promise((resolve, reject) => {
    const browser = spawn(chromePath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      clearInterval(screenshotPoll);
      resolve({ stdout, stderr, ...result });
    };
    const timeout = setTimeout(() => {
      browser.kill();
      finish({ code: null, timedOut: true });
    }, 15_000);
    const screenshotPoll = setInterval(() => {
      if (!existsSync(screenshotPath)) return;
      browser.kill();
      finish({ code: 0, rendered: true });
    }, 100);
    browser.stdout.setEncoding("utf8");
    browser.stderr.setEncoding("utf8");
    browser.stdout.on("data", (chunk) => { stdout += chunk; });
    browser.stderr.on("data", (chunk) => { stderr += chunk; });
    browser.on("error", (error) => {
      if (!settled) reject(error);
    });
    browser.on("close", (code) => finish({ code }));
  });
}

function stop(child) {
  if (child && !child.killed) child.kill();
}

const browserTestSkip = !chromePath
  ? "Chrome is not available. Set CHROME_PATH to enable this test."
  : process.env.AGRINET_RUN_BROWSER_TEST !== "1"
    ? "Set AGRINET_RUN_BROWSER_TEST=1 in a browser-capable environment to run this test."
    : false;

test("a fresh browser can directly load the canonical username profile route", { skip: browserTestSkip }, async (t) => {
  const vite = spawn(process.execPath, [vitePath, "--host", "127.0.0.1", "--port", String(appPort), "--strictPort", "--force"], {
    cwd: process.cwd(),
    stdio: "ignore",
  });
  const profileDir = mkdtempSync(join(tmpdir(), `agrinet-leaflet-${process.pid}-`));
  t.after(() => {
    stop(vite);
    rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 });
  });

  const profilePath = process.env.AGRINET_PROFILE_SMOKE_PATH || "/__profile_smoke__";
  await waitFor(
    () => getStatus(`http://127.0.0.1:${appPort}${profilePath}`).then((status) => status === 200),
    "Vite dev server",
  );
  const screenshotPath = join(profileDir, "me-route.png");
  const result = await runBrowser([
    "--headless=new",
    "--disable-gpu",
    "--disable-gpu-sandbox",
    "--disable-breakpad",
    "--no-first-run",
    "--no-default-browser-check",
    "--enable-logging=stderr",
    "--run-all-compositor-stages-before-draw",
    "--window-size=1280,720",
    `--user-data-dir=${profileDir}`,
    "--virtual-time-budget=3000",
    `--screenshot=${screenshotPath}`,
    `http://127.0.0.1:${appPort}${profilePath}`,
  ], screenshotPath);

  assert.equal(result.timedOut, undefined, `Chrome did not render ${profilePath} within 15 seconds.\n${result.stderr}`);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(existsSync(screenshotPath), true, "Chrome must render the direct username profile route.");
  assert.doesNotMatch(
    `${result.stdout}\n${result.stderr}`,
    /does not provide an export named ['"]t['"]|requested module.*leaflet\.js/i,
    "The direct username profile route must not load a mismatched Leaflet optimizer artifact.",
  );
});
