const { OAuth2Client } = require("google-auth-library");
const { mongoDB } = require("../../utils/database");
const { uuid } = require("uuidv4");
const {
  createAccessToken,
  createRefreshToken,
} = require("../../utils/handleTokens");
const verify = require("jsonwebtoken/verify");
const { ObjectId } = require("bson");

const refreshTokenExp = 7 * 24 * 60 * 60 * 1000;
const accessTokenExp = 30 * 1000;

const client = new OAuth2Client(process.env.GAUTH_CLIENT_ID);

// Refresh token endpoint
exports.sendRefreshToken = async (req, res) => {
  const db = await mongoDB().db();
  const token = req.cookies.wc_RTN;

  if (!token) {
    return res.status(401).send({
      error: "Not Authorized!",
    });
  }

  let payload = null;
  try {
    payload = verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(401).send({
      error: "Not Authorized!",
    });
  }

  const { _id } = await db
    .collection("googleAuthUsers")
    .findOne({ _id: ObjectId(payload._id) });

  if (!_id) {
    return res.status(401).send({
      error: "Not Authorized!",
    });
  }

  const newAccessToken = createAccessToken(payload._id, accessTokenExp);
  const newRefreshToken = createRefreshToken(payload._id, refreshTokenExp);

  res.cookie("wc_RTN", newRefreshToken, {
    maxAge: refreshTokenExp,
    httpOnly: true,
  });

  return res.send({
    accessToken: newAccessToken,
  });
};

// Create / SigIn new user endpoint
exports.googlelogin = async (req, res) => {
  try {
    const db = await mongoDB().db();

    const { tokenId } = req.body;

    const { payload } = await client.verifyIdToken({
      idToken: tokenId,
    });

    if (!payload) {
      return res.status(401).json({
        error: "Session Expired!",
      });
    }

    const { name, picture, email } = payload;
    const { _id } = await db.collection("googleAuthUsers").findOne({ email });

    if (_id) {
      const refreshToken = createRefreshToken(_id, refreshTokenExp);
      const accessToken = createAccessToken(_id, accessTokenExp);

      res.cookie("wc_RTN", refreshToken, {
        maxAge: refreshTokenExp,
        httpOnly: true,
      });

      return res.json({
        accessToken: accessToken,
      });
    } else {
      const userUid = uuid();
      const { _id } = await db.collection("googleAuthUsers").insertOne({
        about: "Trying this clone...",
        authType: "google",
        avatar: picture,
        displayName: name,
        email: email,
        uid: userUid,
      });

      const refreshToken = createRefreshToken(_id, refreshTokenExp);
      const accessToken = createAccessToken(_id, accessTokenExp);

      res.cookie("wc_RTN", refreshToken, {
        maxAge: refreshTokenExp,
        httpOnly: true,
      });

      return res.json({
        accessToken: accessToken,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};