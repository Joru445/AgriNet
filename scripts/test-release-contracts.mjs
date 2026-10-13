import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (name) => readFileSync(resolve(root, name), "utf8");
test("product writes use the authenticated backend, not Firestore fallback", () => {
  const service = src("src/services/product.service.js");
  assert.match(service, /apiCreateProduct/);
  assert.match(service, /apiUpdateProduct/);
  assert.match(service, /apiDeleteProduct/);
});
test("registration preserves unverified farmer profiles", () => {
  const reg = src("src/services/register.service.js");
  assert.match(reg, /verified: false/);
  assert.match(reg, /verificationStatus: "not_applied"/);
});
test("marketplace forwards group IDs", () => {
  assert.match(src("src/services/product.service.js"), /groupId/);
});
