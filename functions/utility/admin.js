const admin = require("firebase-admin");

// admin.initializeApp();

const serviceAccount = require("../../../../Downloads/social-project-87c4c68cc54f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-project-cc707.firebaseio.com",
});

const db = admin.firestore();

module.exports = { admin, db };
