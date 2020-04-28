const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./utility/FBAuth");
const { db } = require("./utility/admin");

const {
  getAllChirps,
  postAChirp,
  getChirp,
  replyToChirp,
  likeChirp,
  unlikeChirp,
  deleteChirp,
} = require("./handlers/chirps");

const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");

// chirp routes
app.get("/chirps", getAllChirps);
app.get("/chirp/:chirpId", getChirp);
app.get("/chirp/:chirpId/like", FBAuth, likeChirp);
app.get("/chirp/:chirpId/unlike", FBAuth, unlikeChirp);
app.post("/chirp", FBAuth, postAChirp);
app.post("/chirp/:chirpId/reply", FBAuth, replyToChirp);
app.delete("/chirp/:chirpId", FBAuth, deleteChirp);

// users routes
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);

exports.api = functions.https.onRequest(app);

// like notification
exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate((snapshot) => {
    db.doc(`/chirps/${snapshot.data().chirpId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            chirpId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

// delete notification on unlike
exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

// reply notification
exports.createNotificationOnReply = functions.firestore
  .document("replies/{id}")
  .onCreate((snapshot) => {
    db.doc(`/chirps/${snapshot.data().chirpId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "reply",
            read: false,
            chirpId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
