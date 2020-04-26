const { db } = require("../utility/admin");

exports.getAllChirps = (req, res) => {
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
};

exports.postAChirp = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "body must not be empty" });
  }

  const newChirp = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
  };

  db.collection("chirps")
    .add(newChirp)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

// get one chirp
exports.getChirp = (req, res) => {
  let chirpData = {};
  db.doc(`/chirps/${req.params.chirpId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "chirp not found" });
      }
      chirpData = doc.data();
      chirpData.chirpId = doc.id;
      return db
        .collection("replies")
        .orderBy("createdAt", "desc")
        .where("chirpId", "==", req.params.chirpId)
        .get();
    })
    .then((data) => {
      chirpData.replies = [];
      data.forEach((doc) => {
        chirpData.replies.push(doc.data());
      });
      return res.json(chirpData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// reply to a chirp
exports.replyToChirp = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ error: "must not be empty" });

  const newReply = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    chirpId: req.params.chirpId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };

  db.doc(`/chirps/${req.params.chirpId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "chirp not found" });
      }
      return db.collection("replies").add(newReply);
    })
    .then(() => {
      res.json(newReply);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "something went wrong" });
    });
};
