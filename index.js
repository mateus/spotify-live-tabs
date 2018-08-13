if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var express = require("express");
var cors = require("cors");
var ugs = require("ultimate-guitar-scraper");
var fetch = require("node-fetch");
var path = require("path");
var URL = require("url");

var app = express();
app.use(express.static(path.join(__dirname, "client/build"))).use(cors());

app.get("/tab", function(req, res) {
  if (req.query.title) {
    ugs.search(
      {
        query: req.query.title,
        page: 1,
        type: ["Tab", "Chords", "Guitar Pro"]
      },
      function(error, tabs) {
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

app.get("/lyrics", function(req, res) {
  var query = req.query.artist + " - " + req.query.name;
  console.log(new Date().toTimeString(), "--- NEW REQUREST -", query);

  if (req.query.name && req.query.artist) {
    var url = new URL("https://api.musixmatch.com/ws/1.1/matcher.lyrics.get"),
      params = {
        format: "json",
        callback: "callback",
        q_track: req.query.name,
        q_artist: req.query.artist,
        apikey: process.env.REACT_APP_MUSICXMATCH_KEY
      };
    Object.keys(params).forEach(function(key) {
      return url.searchParams.append(key, params[key]);
    });

    fetch(url, {
      headers: {
        Accept: "text/plain"
      }
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
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
      .catch(function(error) {
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

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

var PORT = process.env.PORT || 5000;

app.listen(PORT, function() {
  console.log("Server running on port", PORT);
});
