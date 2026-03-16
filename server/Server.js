const http = require("http");
const fs = require("fs");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();

const port = 8004;
const baseDir = path.join(__dirname, "..", "F1");

const db = new sqlite3.Database('./users.db');

http.createServer((req, res) => {

    //Password
    if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { username, password } = JSON.parse(body);

            const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
            db.get(query, [username, password], (err, row) => {
              res.writeHead(200, { "Content-Type": "application/json" });
                if (err) {
                    res.end(JSON.stringify({ success: false, message: "Database error" }));
                } else if (row) {
                    res.end(JSON.stringify({ success: true, user: row.username }));
                } else {
                    res.end(JSON.stringify({ success: false, message: "Wrong username or password" }));
                }
            });
        });
        return;
    }

    //Server
    let filePath = req.url === "/" ? "/index.html" : req.url;
    let fullPath = path.join(baseDir, filePath);

    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
}).listen(port, "0.0.0.0", () => {
    console.log(`Server draait op poort ${port}`);
});

//Makes db
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT UNIQUE, password TEXT)");
    db.run("INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'dolfijn123')");
});