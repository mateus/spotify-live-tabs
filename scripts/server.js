require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const ugs = require("ultimate-guitar-scraper");
const fetch = require("node-fetch");

const app = express();

app
  .use(express.static(`${__dirname}/public`))
  .use(cors())
  .use(cookieParser());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/tab", (req, res) => {
  console.log('/tab', req.query.title);
  if (req.query.title) {
    ugs.search(
      {
        query: req.query.title,
        page: 1,
        type: ["Tab", "Chords", "Guitar Pro"]
      },
      (error, tabs) => {
        if (error) {
          console.log(req.query.title, error.message);
          console.log(error.message);
          res.send(error);
        } else {
          console.log(req.query.title, "SUCCESS");
          res.send(tabs);
        }
      }
    );
  } else {
    res.send({ message: "No title provided" });
  }
});

app.get("/lyrics", (req, res) => {
  if (req.query.name && req.query.artist) {
    console.log("/lyrics", req.query.name, req.query.artist);

    const url = new URL("https://api.musixmatch.com/ws/1.1/matcher.lyrics.get"),
      params = {
        format: "json",
        callback: "callback",
        q_track: req.query.name,
        q_artist: req.query.artist,
        apikey: process.env.REACT_APP_MUSICXMATCH_KEY
      };
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );

    fetch(url, {
      headers: {
        Accept: "text/plain"
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error("Data Error caught", data.error);
          res.send(data.error);
        } else {
          res.send(data);
        }
      })
      .catch(error => {
        console.error("Error caught", error);
      });
  } else {
    res.send({ message: "No name or artist provided" });
  }
});

console.log("Listening on 4000");
app.listen(4000);
