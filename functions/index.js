const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const express = require("express");
const app = express();

app.get("/chirps", (req, res) => {
  admin
    .firestore()
    .collection("chirps")
    .get()
    .then((data) => {
      let chirps = [];
      data.forEach((doc) => {
        chirps.push(doc.data());
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
