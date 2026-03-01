const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".data": "application/octet-stream",
};

http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);

  // Determine content type and encoding
  const isBrotli = filePath.endsWith(".br");
  const originalExt = isBrotli
    ? path.extname(filePath.slice(0, -3))
    : path.extname(filePath);
  const contentType = mimeTypes[originalExt] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === "ENOENT" ? 404 : 500);
      res.end(err.code === "ENOENT" ? "Not Found" : "Server Error");
      return;
    }

    const headers = { "Content-Type": contentType };
    if (isBrotli) {
      headers["Content-Encoding"] = "br";
    }

    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
