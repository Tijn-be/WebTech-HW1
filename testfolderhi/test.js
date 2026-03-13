const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 8004;
const baseDir = path.join(__dirname, "..");

http.createServer((req, res) => {

    let filePath = req.url === "/" ? "/index.html" : req.url;
    let fullPath = path.join(baseDir, filePath);

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Bestand niet gevonden: " + filePath);
            return;
        }


        let ext = path.extname(fullPath);
        let contentType = "text/html";
        if (ext === ".css") contentType = "text/css";
        if (ext === ".js") contentType = "text/javascript";

        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}).listen(port, "0.0.0.0");

console.log(`Server draait op poort ${port}`);

// var http = require("http");
// var fs = require("fs");

// http
//   .createServer(function (req, res) {
//     res.writeHead(200, { "Content-Type": "text/html" });
//     res.end(fs.readFileSync("../index.html"));
//   })
//   .listen(8004, "0.0.0.0");

// console.log("Server running on port 8004");
