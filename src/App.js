import React, { Component } from "react";
import ugs from "ultimate-guitar-scraper";
import {
  AppProvider,
  Page,
  Card,
  Stack,
  Spinner,
  SkeletonPage,
  SkeletonBodyText,
  Layout
} from "@shopify/polaris";

import { Player } from "./components";
import "./App.css";

class App extends Component {
  state = {
    currenctlyPlayingData: null,
    tabs: null
  };

  componentDidMount() {
    this.fetchCurrenctlyPlaying();
  }

  fetchCurrenctlyPlaying() {
    const pollerTimeout = 1000;
    const token =
      "BQDHPtWR9gZapFYgNBGXSBMcc-qKYdlDMrO3hra5_aAaxRig0LlVbEZmOvUgQzopf5zJrFrdKmpyJEJkUaIw-DHQxtMWubWDVX_Qcs_3YJLvSw8hCMYpb3jLmJMogHXqPDVG__lKG2365jzNbSNFCBZNeTj8dYr6skDcBu0xz-qnSILbyFiS-cneSoN7DTASSaELN60L0ClI-9BxCwWUaJoEt4dsMuEr9LIO4eFGrvGsRdcyew_xJno-_xalb7VOxUF3QmYfPKpH5S_e";

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
          console.log("currenctlyPlayingData:", data);
          this.setState({ currenctlyPlayingData: data });
        })
        .catch(() => clearInterval(poller));
    };
    fetchData();

    const poller = setInterval(fetchData.bind(this), pollerTimeout);
  }

  fetchTabs(title) {
    ugs.search(
      {
        query: title,
        page: 1,
        type: ["Tab", "Chords", "Guitar Pro"]
      },
      (error, tabs) => {
        if (error) {
          console.log(error);
        } else {
          console.log(tabs);
        }
      }
    );
  }

  render() {
    const { currenctlyPlayingData, tabData } = this.state;
    const tab = tabData ? tabData : <SkeletonBodyText />;

    let player;
    if (currenctlyPlayingData && !currenctlyPlayingData.error) {
      const playingNow = currenctlyPlayingData.item;
      const progressLevel = parseFloat(
        (100 * currenctlyPlayingData.progress_ms) / playingNow.duration_ms
      ).toFixed(2);

      // this.fetchTabs(`${artistName} - ${songName}`);
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
