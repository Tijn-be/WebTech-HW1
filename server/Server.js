const http = require("http");
const fs = require("fs");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();

const port = 8004;
const baseDir = path.join(__dirname, "..", "F1");
const db = new sqlite3.Database('./users.db');

http.createServer((req, res) => {

    //Server
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    //Login
    if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
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
            } catch (e) {
                res.writeHead(400);
                res.end("Invalid JSON");
            }
        });
        return;
    }

    //Register
    if (req.method === 'POST' && req.url === '/register') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
                db.run(query, [username, password], function(err) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    if (err) {
                        if (err.message.includes("UNIQUE")) {
                            res.end(JSON.stringify({ success: false, message: "Username already exist!" }));
                        } else {
                            res.end(JSON.stringify({ success: false, message: "Database fault" }));
                        }
                    } else {
                        res.end(JSON.stringify({ success: true, message: "Account created!" }));
                    }
                });
            } catch (e) {
                res.writeHead(400);
                res.end("Invalid JSON");
            }
        });
        return;
    }
    
    let filePath = req.url === "/" ? "/index.html" : req.url;
    let fullPath = path.join(baseDir, filePath);

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("File not found: " + filePath);
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
    console.log(`Server running on port ${port}`);
});

//Makes db
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT UNIQUE, password TEXT)");
    db.run("INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'dolfijn123')");
});