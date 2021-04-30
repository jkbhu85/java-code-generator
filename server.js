/* eslint-disable */
const express = require("express");
const compression = require("compression");
const serveStatic = require("serve-static");

const port = process.env.PORT || 8080;
const appFolder = "dist/java-code-generator";

app = express();
app.use(compression());
app.use(serveStatic(__dirname + "/" + appFolder));

app.all("*", function (req, res) {
  res.status(200).sendFile(`/`, { root: appFolder });
});

app.listen(port);
console.log("Server started.");
