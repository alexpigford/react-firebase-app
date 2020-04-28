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
    return db
      .doc(`/chirps/${snapshot.data().chirpId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch((err) => console.error(err));
  });

// delete notification on unlike
exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

// reply notification
exports.createNotificationOnReply = functions.firestore
  .document("replies/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/chirps/${snapshot.data().chirpId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = db.batch();
      return db
        .collection("chirps")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const chirp = db.doc(`/chirps/${doc.id}`);
            batch.update(chirp, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onChirpDelete = functions.firestore
  .document("/chirps/{chirpId}")
  .onDelete((snapshot, context) => {
    const chirpId = context.params.chirpId;
    const batch = db.batch();
    return db
      .collection("replies")
      .where("chirpId", "==", chirpId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/replies/${doc.id}`));
        });
        return db.collection("likes").where("chirpId", "==", chirpId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("chirpId", "==", chirpId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => {
        console.error(err);
      });
  });
