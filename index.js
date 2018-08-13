const express = require("express");
const cors = require("cors");
const ugs = require("ultimate-guitar-scraper");
const fetch = require("node-fetch");
const path = require("path");
const { URL } = require("url");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const app = express();
app.use(express.static(path.join(__dirname, "client/build"))).use(cors());

app.get("/tab", (req, res) => {
  if (req.query.title) {
    ugs.search(
      {
        query: req.query.title,
        page: 1,
        type: ["Tab", "Chords", "Guitar Pro"]
      },
      (error, tabs) => {
        if (error) {
          console.log(
            new Date().toTimeString(),
            "/tab",
            "ERROR:",
            req.query.title,
            error.message
          );
          res.send(error);
        } else {
          console.log(
            new Date().toTimeString(),
            "/tab",
            "SUCCESS",
            req.query.title
          );
          res.send(tabs);
        }
      }
    );
  } else {
    res.send({ message: "No title provided" });
  }
});

app.get("/lyrics", (req, res) => {
  const query = `${req.query.artist} - ${req.query.name}`;
  console.log(new Date().toTimeString(), "--- NEW REQUREST -", query);

  if (req.query.name && req.query.artist) {
    const url = new URL("https://api.musixmatch.com/ws/1.1/matcher.lyrics.get");

    const params = {
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
          console.log(
            new Date().toTimeString(),
            "/lyrics",
            query,
            "ERROR:",
            data.error
          );
          res.send(data.error);
        } else {
          console.log(new Date().toTimeString(), "/lyrics", "SUCCESS", query);
          res.send(data);
        }
      })
      .catch(error => {
        console.log(
          new Date().toTimeString(),
          "/lyrics",
          "Error caught",
          error
        );
      });
  } else {
    res.send({ message: "No name or artist provided" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
