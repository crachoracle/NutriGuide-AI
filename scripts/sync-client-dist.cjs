const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const clientDist = path.join(projectRoot, "client", "dist");
const rootDist = path.join(projectRoot, "dist");

if (!fs.existsSync(clientDist)) {
  console.error("Expected client/dist to exist after the client build.");
  process.exit(1);
}

fs.rmSync(rootDist, { force: true, recursive: true });
fs.cpSync(clientDist, rootDist, { recursive: true });
console.log("Synced client/dist to root dist for Vercel.");
