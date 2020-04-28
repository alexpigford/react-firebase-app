let db = {
  users: [
    {
      userId: "hahahahahahaha",
      email: "user@email.com",
      handle: "user",
      createdAt: "2020-04-24T16:56:17.572Z",
      imageUrl: "image/ha/haha",
      bio: "hi, this is my bio",
      website: "https://user.com",
      location: "Denver, CO",
    },
  ],

  chirps: [
    {
      userHandle: "user",
      body: "chirp body",
      createdAt: "2020-04-24T16:56:17.572Z",
      likeCount: 5,
      commentCount: 2,
    },
  ],
  replies: [
    {
      userHandle: "user",
      chirpId: "ahahahaha",
      body: "solid reply",
      createdAt: "2020-04-24T16:56:17.572Z",
    },
  ],
  notifications: [
    {
      recipient: "user",
      sender: "alex",
      read: "true | false",
      chirpId: "xdxdxdxd",
      type: "like | reply",
      createdAt: "2020-04-24T16:56:17.572Z",
    },
  ],
};

const userDetails = {
  credentials: {
    userId: "ahahahah",
    email: "user@email.com",
    handle: "user",
    createdAt: "2020-04-24T16:56:17.572Z",
    imageUrl: "image/ha/haha",
    bio: "hi, this is my bio",
    website: "https://user.com",
    location: "Denver, CO",
  },
  likes: [
    {
      userHandle: "user",
      chirpId: "hahahaha",
    },
    {
      userHandle: "user",
      chirpId: "jajajajaj",
    },
  ],
};
