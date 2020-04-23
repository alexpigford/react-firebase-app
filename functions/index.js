const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.getChirps = functions.https.onRequest((req, res) => {
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

exports.createChirp = functions.https.onRequest((req, res) => {
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
