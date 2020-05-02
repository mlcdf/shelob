// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const url = require("url");

const express = require("express");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");

const lib = require("./lib");

const app = express();

// Register bodyParser middleware
// For each request, fill request.body
app.use(bodyParser.json());

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

const caching = lib.cache(
  process.env.CACHE_LOCATION,
  parseInt(process.env.CACHE_DURATION, 10)
);

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.post("/url", caching, (request, response) => {
  if (request.body.url === undefined || request.body.url === "") {
    response.status(400).send({ error: "'url' field is missing or empty" });
    return;
  }

  lib.extract(request.body.url)
    .then(data => {
      response.send(data);
    })
    .catch(err => {
      response.status(500).send(err);
      console.log(err);
    });
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500);
  res.send("Oops, something went wrong...");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
