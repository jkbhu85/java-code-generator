/* eslint-disable */
const express = require("express");
const compression = require("compression");
const serveStatic = require("serve-static");

const port = process.env.PORT || 8080;

app = express();
app.use(compression());
app.use(serveStatic(__dirname + "/" ));

app.all("*", function (req, res) {
  res.status(200).sendFile(`${__dirname}/index.html`);
});

app.listen(port);
console.log("Server started.");
