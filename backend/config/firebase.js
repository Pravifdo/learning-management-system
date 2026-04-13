// Import Firebase Admin SDK
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccountPath = `${__dirname}/../serviceAccountKey.json`;
let serviceAccount;

try {
  const serviceAccountJSON = readFileSync(serviceAccountPath, "utf-8");
  serviceAccount = JSON.parse(serviceAccountJSON);
} catch (error) {
  console.warn("Service account key not found. Using environment variables instead.");
  // For development, you can also use environment variables
}

// Initialize Firebase Admin
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "newlms-62386",
  });
} else {
  // Fallback for development
  admin.initializeApp({
    projectId: "newlms-62386",
  });
}

// Get Firestore database reference - explicitly specify the default database
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const auth = admin.auth();

console.log("Firebase Admin initialized with project:", "newlms-62386");

// Test connection
db.collection("_test").limit(1).get()
  .then(() => console.log("✅ Firestore connection successful"))
  .catch((error) => console.error("❌ Firestore connection failed:", error.message));

export { admin, db, auth };