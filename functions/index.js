const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const serviceAccount = require("../../../Downloads/social-project-87c4c68cc54f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-project-cc707.firebaseio.com",
});

const firebaseConfig = {
  apiKey: "AIzaSyCYIBKtQeHN8-oe19DP-xAqIpGXFA6ykUY",
  authDomain: "social-project-cc707.firebaseapp.com",
  databaseURL: "https://social-project-cc707.firebaseio.com",
  projectId: "social-project-cc707",
  storageBucket: "social-project-cc707.appspot.com",
  messagingSenderId: "887851021548",
  appId: "1:887851021548:web:12125b52bb8ffd51eea1c9",
  measurementId: "G-GEN7V44F6N",
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// get
app.get("/chirps", (req, res) => {
  db.collection("chirps")
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

// post
app.post("/chirp", (req, res) => {
  const newChirp = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection("chirps")
    .add(newChirp)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong." });
      console.error(err);
    });
});

const isEmail = (email) => {
  // reg ex for validating email
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

// sign up
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = "must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "please enter a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "must not be empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "passwords do not match";
  if (isEmpty(newUser.handle)) errors.handle = "must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

// log in
app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};

  if (isEmpty(user.email)) errors.email = "must not be empty";
  if (isEmpty(user.password)) errors.password = "must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "wrong password, please try again" });
      } else return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
