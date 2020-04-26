const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./utility/FBAuth");

const {
  getAllChirps,
  postAChirp,
  getChirp,
  replyToChirp,
  likeChirp,
  unlikeChirp,
} = require("./handlers/chirps");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

// chirp routes
app.get("/chirps", getAllChirps);
app.post("/chirp", FBAuth, postAChirp);
app.get("/chirp/:chirpId", getChirp);
// TODO: delete chirp
app.get("/chirp/:chirpId/like", FBAuth, likeChirp);
app.get("/chirp/:chirpId/unlike", FBAuth, unlikeChirp);
app.post("/chirp/:chirpId/reply", FBAuth, replyToChirp);

// users routes
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
