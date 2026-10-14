import test, { after, before, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectId = "agrinet-security-test";
let env;

function client(uid = null) {
  return uid
    ? env.authenticatedContext(uid, { email: `${uid}@example.test` }).firestore()
    : env.unauthenticatedContext().firestore();
}

async function seed(data) {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all(Object.entries(data).map(([path, value]) =>
      setDoc(doc(db, path), value),
    ));
  });
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: process.env.FIRESTORE_EMULATOR_HOST?.split(":")[0] || "127.0.0.1",
      port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(":")[1] || 8080),
      rules: readFileSync(resolve(root, "firestore.rules"), "utf8"),
    },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await seed({
    "products/public-product": { farmerId: "farmer-a", name: "Tomatoes", available: true },
    "users/consumer-a": { uid: "consumer-a", role: "consumer", email: "private@example.test", phone: "+639000000000", status: "active" },
    "farmers/farmer-a": { uid: "farmer-a", email: "farmer-private@example.test", phone: "+639000000001" },
    "groups/group-a": { name: "North Growers", active: true },
    "group-memberships/group-a_consumer-a": { groupId: "group-a", userId: "consumer-a", status: "pending" },
    "group-managers/group-a_manager-a": { groupId: "group-a", userId: "manager-a", active: true, permissions: ["group.edit"] },
    "conversations/conversation-a": { participants: ["consumer-a", "farmer-a"] },
    "messages/message-a": { conversationId: "conversation-a", senderId: "consumer-a", text: "private" },
    "inquiries/inquiry-a": { consumerId: "consumer-a", farmerId: "farmer-a", status: "accepted" },
    "notifications/notification-a": { recipientId: "consumer-a", read: false },
    "reports/report-a": { reporterId: "consumer-a", reportedUserId: "farmer-a", status: "pending" },
    "reviews/review-a": { inquiryId: "inquiry-a", farmerId: "farmer-a", reviewerId: "consumer-a", rating: 5 },
    "product-reviews/review-a": { inquiryId: "inquiry-a", productId: "public-product", reviewerId: "consumer-a", rating: 5 },
    "userSessions/consumer-a/sessions/session-a": { uid: "consumer-a", revokedAt: null },
    "userSecurityEvents/consumer-a/events/event-a": { event: "session-created" },
  });
});

after(async () => env?.cleanup());

test("anonymous marketplace reads are public but all product mutations are backend-only", async () => {
  await assertSucceeds(getDoc(doc(client(), "products/public-product")));
  await assertFails(updateDoc(doc(client("farmer-a"), "products/public-product"), { available: false }));
  await assertFails(setDoc(doc(client("farmer-a"), "products/new-product"), { farmerId: "farmer-a" }));
});

test("private profiles, group state, notifications, and backend records deny direct SDK access", async () => {
  const outsider = client("outsider");
  await assertFails(getDoc(doc(outsider, "users/consumer-a")));
  await assertFails(getDoc(doc(outsider, "farmers/farmer-a")));
  await assertFails(getDoc(doc(outsider, "groups/group-a")));
  await assertFails(getDoc(doc(outsider, "group-memberships/group-a_consumer-a")));
  await assertFails(setDoc(doc(outsider, "group-managers/group-a_outsider"), { groupId: "group-a", userId: "outsider", active: true }));
  await assertFails(getDoc(doc(client("consumer-a"), "notifications/notification-a")));
  await assertFails(updateDoc(doc(client("consumer-a"), "notifications/notification-a"), { read: true }));
  await assertFails(getDoc(doc(client("consumer-a"), "userSessions/consumer-a/sessions/session-a")));
  await assertFails(getDoc(doc(client("consumer-a"), "userSecurityEvents/consumer-a/events/event-a")));
});

test("messages, transactions, reports, and private review mutations cannot bypass APIs", async () => {
  const participant = client("consumer-a");
  const unrelated = client("outsider");
  await assertFails(getDoc(doc(participant, "conversations/conversation-a")));
  await assertFails(getDoc(doc(participant, "messages/message-a")));
  await assertFails(updateDoc(doc(participant, "inquiries/inquiry-a"), { status: "completed" }));
  await assertFails(getDoc(doc(unrelated, "reports/report-a")));
  await assertFails(updateDoc(doc(participant, "reviews/review-a"), { rating: 1 }));
  await assertFails(deleteDoc(doc(participant, "product-reviews/review-a")));
});

test("public reviews remain readable without exposing report or profile documents", async () => {
  await assertSucceeds(getDoc(doc(client(), "reviews/review-a")));
  await assertSucceeds(getDoc(doc(client(), "product-reviews/review-a")));
  await assertFails(getDoc(doc(client(), "reports/report-a")));
  await assertFails(getDoc(doc(client(), "users/consumer-a")));
  assert.ok(true);
});
