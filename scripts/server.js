require("dotenv").config();

const express = require("express");
const request = require("request");
const cors = require("cors");
const path = require("path");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const ugs = require("ultimate-guitar-scraper");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "http://localhost:4000/callback";

const generateRandomString = length => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";

const app = express();

app
  .use(express.static(`${__dirname}/public`))
  .use(cors())
  .use(cookieParser());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope = "user-read-playback-state";
  res.redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
      state
    })}`
  );
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      `/#${querystring.stringify({
        error: "state_mismatch"
      })}`
    );
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code,
        redirect_uri,
        grant_type: "authorization_code"
      },
      headers: {
        Authorization: `Basic ${new Buffer(
          client_id + ":" + client_secret
        ).toString("base64")}`
      },
      json: true
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;

        res.redirect(
          `/#${querystring.stringify({
            access_token,
            refresh_token
          })}`
        );
      } else {
        res.redirect(
          `/#${querystring.stringify({
            error: "invalid_token"
          })}`
        );
      }
    });
  }
});

app.get("/refresh_token", (req, res) => {
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization: `Basic ${new Buffer(
        client_id + ":" + client_secret
      ).toString("base64")}`
    },
    form: {
      grant_type: "refresh_token",
      refresh_token
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        access_token
      });
    }
  });
});

app.get("/tab", (req, res) => {
  console.log(req.query.title);
  res.send({ query: req.query.title, message: "Still testing" });
  // ugs.search(
  //   {
  //     query: req.query.title | "Higher",
  //     page: 1,
  //     type: ["Tab", "Chords", "Guitar Pro"]
  //   },
  //   (error, tabs) => {
  //     if (error) {
  //       console.error(error);
  //       res.send(error);
  //     } else {
  //       console.log(tabs);
  //       res.send(tabs);
  //     }
  //   }
  // );
});

console.log("Listening on 4000");
app.listen(4000);
