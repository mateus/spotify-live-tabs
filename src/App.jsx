import React, { Component } from "react";
import {
  AppProvider,
  Page,
  Card,
  Stack,
  Spinner,
  SkeletonBodyText,
  Layout
} from "@shopify/polaris";

import { Player } from "./components";
import "./App.css";

class App extends Component {
  state = {
    currenctlyPlayingData: null,
    tabs: null,
    query: null
  };

  componentDidMount() {
    this.fetchCurrenctlyPlaying();
  }

  fetchCurrenctlyPlaying() {
    const pollerTimeout = 1000;
    const token =
      "BQCC5MpMmVKlhNbf8yIVOFv7DTOlRPIoX1ZlB_H2wLFt_MQCG8UNjicQRhc_WfWDhArEmKfCZ7eaYpIe2E-Z9DxiGr-1VeWyv9ijSB0cbqSJFtOcmT4OzBdM-6D0P9c_Gy5JGBqXrvDKIZAT1Gh6XXJFnut7ZdlykhmKIf_Y2SJP4rfxgPHkh1KLArKd5lF_xOpaQOp2qAFjaubxIn7LKjGrUjK9Kg2bS9WIRnVQWrvtvRlFlt7UbULi4YqnjLL85UGLt68Ip_Yvb348";

    // TODO: Write error states
    const fetchData = () => {
      fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer " + token
        }
      })
        .then(response => response.json())
        .then(data => {
          console.warn("currenctlyPlayingData:", data);
          this.setState({ currenctlyPlayingData: data });
        })
        .catch(error => {
          // REFRESH TOKEN
          console.warn(error);
          clearInterval(poller);
        });
    };
    fetchData();

    const poller = setInterval(fetchData.bind(this), pollerTimeout);
  }

  fetchTabs(title) {
    const url = new URL(window.location.origin + "/tab");
    url.searchParams.append("title", title);

    return fetch(url)
      .then(response => response.json())
      .then(tabsData => {
        console.warn("tabsData", tabsData);

        return tabsData;
      })
      .catch(error => console.warn(error));
  }

  render() {
    const { currenctlyPlayingData, tabData, query } = this.state;

    const tab = tabData ? tabData : <SkeletonBodyText />;

    let player;
    if (currenctlyPlayingData && !currenctlyPlayingData.error) {
      const playingNow = currenctlyPlayingData.item;
      const progressLevel = parseFloat(
        (100 * currenctlyPlayingData.progress_ms) / playingNow.duration_ms
      ).toFixed(2);
      const tabQuery = `${playingNow.artists[0].name} - ${playingNow.name}`;

      if (query !== tabQuery) {
        this.fetchTabs(tabQuery).then(tabsData => {
          this.setState({ tabs: tabsData, query: tabQuery });
        });
      }

      player = (
        <Player
          albumImage={playingNow.album.images[0].url}
          albumName={playingNow.album.name}
          songName={playingNow.name}
          artists={playingNow.artists}
          progressLevel={progressLevel}
          progressMS={currenctlyPlayingData.progress_ms}
          durationMS={playingNow.duration_ms}
          spotifyURI={playingNow.uri}
        />
      );
    } else {
      player = (
        <Card sectioned>
          <Stack distribution="center">
            <Spinner size="large" />
          </Stack>
        </Card>
      );
    }

    return (
      <AppProvider>
        <Page title="Spotify Live Tabs" fullWidth>
          <Layout>
            <Layout.Section>
              <Card title="Tab" sectioned>
                {tab}
              </Card>
            </Layout.Section>
            <Layout.Section secondary>{player}</Layout.Section>
          </Layout>
        </Page>
      </AppProvider>
    );
  }
}

export default App;
