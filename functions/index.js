const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./utility/FBAuth");

const { getAllChirps, postAChirp } = require("./handlers/chirps");
const { signUp, login, uploadImage } = require("./handlers/users");

// chirp routes
app.get("/chirps", getAllChirps);
app.post("/chirp", FBAuth, postAChirp);

// users routes
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
