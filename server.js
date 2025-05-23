// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { AccessToken } from "livekit-server-sdk";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const createToken = async () => {
  // if this room doesn't exist, it'll be automatically created when the first
  // client joins
  const random = Math.floor(Math.random() * 10000);
  const roomName = "room1";
  // identifier to be used for participant.
  // it's available as LocalParticipant.identity with livekit-client SDK
  const participantName = "User" + random.toString;

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      // token to expire after 10 minutes
      ttl: "10m",
    }
  );
  at.addGrant({ roomJoin: true, room: roomName });
  return await at.toJwt();
};

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("trust proxy", 1);
app.use(cookieParser());
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.render(path.join(dirname, "public", "index"), {
    wsServer: process.env.WS_SERVER,
  });
});

app.get("/get-token", async (req, res) => {
  const token = await createToken();
  res.status(200).json(token);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
