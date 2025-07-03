import express from "express";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import send from "send";

const app = express();

const sslOptions = {
  key: process.env.SSL_KEY_FILE ? fs.readFileSync(process.env.SSL_KEY_FILE) : undefined,
  cert: process.env.SSL_CRT_FILE ? fs.readFileSync(process.env.SSL_CRT_FILE) : undefined,
};

// Serve static files (including Vite build output)
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/dist", express.static(path.join(__dirname, "..", "dist")));

// Adding tabs to our app. This will setup routes to various views
// Setup home page
app.get("/", (req, res) => {
  send(req, path.join(__dirname, "views", "tab.html")).pipe(res);
});

// Setup the static tab
app.get("/tab", (req, res) => {
  send(req, path.join(__dirname, "views", "tab.html")).pipe(res);
});

// API proxy (when running in production, the Azure Functions are at /api)
if (process.env.NODE_ENV === "production") {
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });
}

// Create HTTP server
const port = process.env.port || process.env.PORT || 3333;

if (sslOptions.key && sslOptions.cert) {
  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
}
