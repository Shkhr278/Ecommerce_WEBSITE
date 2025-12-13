// server/index.js
import express from "express";
import session from "express-session";
import passport from "passport";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

import { routes } from "./routes.js";

const app = express();
const server = createServer(app);

// Trust proxy so secure cookies work on Render
app.set("trust proxy", 1);

// CORS – allow the Vercel frontend
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN, // e.g. "https://localspark.vercel.app"
    credentials: true,
  })
);

app.use(express.json());

// Session config – cart/favorites live here
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Mount API
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// WebSocket echo server (optional)
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
      // ignore
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Server running on port ${port} ✅`);
});
