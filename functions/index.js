const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("../../../Downloads/social-project-87c4c68cc54f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-project-cc707.firebaseio.com",
});

const express = require("express");
const app = express();

app.get("/chirps", (req, res) => {
  admin
    .firestore()
    .collection("chirps")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let chirps = [];
      data.forEach((doc) => {
        chirps.push({
          chirpId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(chirps);
    })
    .catch((err) => console.error(err));
});

app.post("/chirp", (req, res) => {
  const newChirp = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
  };

  admin
    .firestore()
    .collection("chirps")
    .add(newChirp)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong." });
      console.error(err);
    });
});

exports.api = functions.https.onRequest(app);
