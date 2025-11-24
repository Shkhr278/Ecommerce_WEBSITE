// server/index.js
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

import routes from "./api/routes.js";

const app = express();
const server = createServer(app);

// IMPORTANT: trust proxy so secure cookies work behind Render's proxy
app.set("trust proxy", 1);

// CORS – allow frontend (Vercel) to send cookies
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN, // e.g. "https://localspark.vercel.app"
    credentials: true,
  })
);

// JSON body
app.use(express.json());

// ---- SESSION CONFIG (Mongo Atlas) ----
if (!process.env.MONGO_URL) {
  console.error("MONGO_URL is not set – session store will fail!");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 60 * 60 * 24 * 7, // 7 days
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      // For production (Render + Vercel, different domains), allow cross-site cookies
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ---- API routes ----
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ---- WebSocket setup (optional, like before) ----
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const { url } = request;
  if (url && url.startsWith("/ws")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log("Received message:", message.toString());
    try {
      ws.send("Echo: " + message.toString());
    } catch {
      // ignore send errors
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

// Start server
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server running on port ${port} ✅`);
});
