var http = require("http");
http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    // add index.html file to the same folder and uncomment the line below to serve the file instead of "Hello World"
    res.write(fs.readFileSync("../index.html"));
  })
  .listen(8004, "localhost");
console.log("Server running at http://localhost:8004/");
