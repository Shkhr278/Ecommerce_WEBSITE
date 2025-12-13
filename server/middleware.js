import { log } from "./vite.js";

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err, req, res, next) {
  log(`Error: ${err.message}`, "error");
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
      "http"
    );
  });
  next();
}
