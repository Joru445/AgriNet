import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { app } from "./config";
import { recordAuthDiagnostic } from "../utils/authDiagnostics";

export const auth = getAuth(app);

// Firebase, not application code, owns the persistent credential lifecycle.
// Consumers wait for this promise before concluding that no session exists.
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    recordAuthDiagnostic("local-persistence-unavailable", { code: error?.code || "unknown" });
    return null;
  });
