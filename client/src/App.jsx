import React, { Component } from "react";
import { AppProvider } from "@shopify/polaris";

import { Landing, Login } from "./views";

const stateKey = "spotify_auth_state";

class App extends Component {
  state = {
    accessToken: getUrlParams("access_token"),
    localStorageData: null
  };

  componentDidMount() {
    this.getLocalStorage();
  }

  handleLogin() {
    const client_id = process.env.REACT_APP_CLIENT_ID;
    const redirect_uri = window.location.origin;
    const state = generateRandomString(16);

    localStorage.setItem(stateKey, state);
    const scope =
      "user-read-playback-state user-read-private user-read-birthdate user-read-email";

    let url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url += "&client_id=" + encodeURIComponent(client_id);
    url += "&scope=" + encodeURIComponent(scope);
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    url += "&state=" + encodeURIComponent(state);

    window.location = url;
  }

  getLocalStorage() {
    const localStorageData = localStorage.getItem("spotify-live-tabs");

    if (localStorageData !== null) {
      this.setState({ localStorageData });
    }
  }

  render() {
    const { accessToken, localStorageData } = this.state;
    const parsedLocalStorageData = JSON.parse(localStorageData);

    const content = accessToken ? (
      <Landing
        accessToken={accessToken}
        sideMenu={localStorageData && parsedLocalStorageData.sideMenu}
      />
    ) : (
      <Login onClick={this.handleLogin} />
    );

    return <AppProvider>{content}</AppProvider>;
  }
}

function generateRandomString(length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getUrlParams(prop) {
  const params = {};
  const url = new URL(window.location.href);
  const definitions = url.hash.substring(1).split("&");

  definitions.forEach(function(val, key) {
    const parts = val.split("=", 2);
    params[parts[0]] = parts[1];
  });

  return prop && prop in params ? params[prop] : null;
}

export default App;
