const { db } = require("../utility/admin");

// get all chirps
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
          replyCount: doc.data().replyCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
      });
      return res.json(chirps);
    })
    .catch((err) => console.error(err));
};

// post a chirp
exports.postAChirp = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "body must not be empty" });
  }

  const newChirp = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    replyCount: 0,
  };

  db.collection("chirps")
    .add(newChirp)
    .then((doc) => {
      const responseChirp = newChirp;
      responseChirp.chirpId = doc.id;
      res.json(responseChirp);
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
    return res.status(400).json({ reply: "must not be empty" });

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
      return doc.ref.update({ replyCount: doc.data().replyCount + 1 });
    })
    .then(() => {
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

// like a chirp
exports.likeChirp = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("chirpId", "==", req.params.chirpId)
    .limit(1);

  const chirpDocument = db.doc(`/chirps/${req.params.chirpId}`);

  let chirpData = {};

  chirpDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        chirpData = doc.data();
        chirpData.chirpId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "chirp not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            chirpId: req.params.chirpId,
            userHandle: req.user.handle,
          })
          .then(() => {
            chirpData.likeCount++;
            return chirpDocument.update({ likeCount: chirpData.likeCount });
          })
          .then(() => {
            return res.json(chirpData);
          });
      } else {
        return res.status(400).json({ error: "chirp already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// unlike a chirp
exports.unlikeChirp = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("chirpId", "==", req.params.chirpId)
    .limit(1);

  const chirpDocument = db.doc(`/chirps/${req.params.chirpId}`);

  let chirpData = {};

  chirpDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        chirpData = doc.data();
        chirpData.chirpId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "chirp not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "chirp not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            chirpData.likeCount--;
            return chirpDocument.update({ likeCount: chirpData.likeCount });
          })
          .then(() => {
            res.json(chirpData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// delete a chirp
exports.deleteChirp = (req, res) => {
  const document = db.doc(`/chirps/${req.params.chirpId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "chirp not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "chirp deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
