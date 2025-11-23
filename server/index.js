import express from "express";
import session from "express-session";
import passport from "passport";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { routes } from "./api/routes.js"; // ← your main API router
import cors from "cors";

const app = express();
const server = createServer(app);

// IMPORTANT: trust proxy so secure cookies work behind Render's proxy
app.set("trust proxy", 1);

// WebSocket server (simple echo on /ws)
const wss = new WebSocketServer({ noServer: true });

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN, // e.g. "https://localspark.vercel.app"
    credentials: true,
  })
);

// middleware
app.use(express.json());

// SESSION CONFIG – this is what makes cart/favorites persist
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

// mount API routes
app.use("/api", routes);

// health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// WebSocket upgrade
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

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Server running on port ${port} ✅`);
});
