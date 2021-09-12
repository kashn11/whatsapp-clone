const { ObjectID } = require("bson");
const { verify } = require("jsonwebtoken");
const {
  getActiveUsers,
  addToActiveUsers,
  getActiveUserByObjectId,
  removeActiveUserByObjectId,
} = require("./utils/activeUsers");
const { mongoDB } = require("./utils/database");

const socketMain = async (io, socket) => {
  try {
    const jwtToken = socket.handshake.auth.accessToken;
    const { _id } = verify(jwtToken, process.env.JWT_ACCESS_SECRET);

    // MongoDb instance;
    const db = await mongoDB().db();
    const userPayload = await db
      .collection("googleAuthUsers")
      .findOne({ _id: ObjectID(_id) });

    const users = await db.collection("googleAuthUsers").find().toArray();

    // // Handle User Active Session
    if (!getActiveUserByObjectId(_id)) {
      console.log("New session!");
      // New Session
      addToActiveUsers({
        socketId: socket.id,
        objectId: _id,
      });
    } else {
      console.log("Prev Disconnected, New session!");
      // Old session removed
      const prevSocketId = getActiveUserByObjectId(_id)?.socketId;
      console.log(prevSocketId, io.sockets.sockets.get(prevSocketId));
      if (io.sockets.sockets.get(prevSocketId)) {
        console.log(prevSocketId + "disconnected");
        io.sockets.sockets.get(prevSocketId).emit("multipleSession");
        io.sockets.sockets.get(prevSocketId).disconnect(true);
      }
      removeActiveUserByObjectId(_id);
      // New session added
      addToActiveUsers({
        socketId: socket.id,
        objectId: _id,
      });
    }

    // Signin success state
    socket.emit("signInSuccess", {
      uid: userPayload.uid,
      displayName: userPayload.displayName,
      email: userPayload.email,
      avatar: userPayload.avatar,
      createdOn: userPayload.createdOn,
      about: userPayload.about,
    });

    // Send users existing in DB back to sender
    socket.on("getTotalUsers", () => {
      const filterUsers = users
        .filter((me) => me._id != _id)
        .map((user) => {
          return {
            ...user,
            status: getActiveUserByObjectId(user._id.toString()) ? true : false,
          };
        });
      socket.emit("setInitialTotalUsers", filterUsers);
    });

    // Update logged user state to others
    socket.broadcast.emit("updateTotalUsers", {
      objectId: userPayload._id,
      uid: userPayload.uid,
      displayName: userPayload.displayName,
      email: userPayload.email,
      avatar: userPayload.avatar,
      createdOn: userPayload.createdOn,
      about: userPayload.about,
    });

    // Handle online status
    socket.broadcast.emit("online", _id);

    // Handle disconnect event
    socket.on("disconnect", () => {
      socket.broadcast.emit("offline", _id);
      removeActiveUserByObjectId(_id);
      console.log(socket.id, "Disconnected");
    });
  } catch (err) {
    console.log("MAIN SOCKET ERR", err);
  }
};

module.exports = socketMain;
