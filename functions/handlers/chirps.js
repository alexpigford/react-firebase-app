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
