import React, { Component } from "react";
import {
  Page,
  Card,
  Stack,
  Spinner,
  SkeletonBodyText,
  Layout,
  DisplayText,
  TextStyle
} from "@shopify/polaris";

import { Player } from "../../components";

class Landing extends Component {
  state = {
    currenctlyPlayingData: null,
    tabs: null,
    query: null
  };

  componentDidMount() {
    this.fetchCurrenctlyPlaying();
  }

  fetchCurrenctlyPlaying() {
    const { accessToken } = this.props;
    const pollerTimeout = 1000;

    // TODO: Write error states
    const fetchData = () => {
      fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer " + accessToken
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            window.location = window.location.origin;
          } else {
            this.setState({ currenctlyPlayingData: data });
          }
        })
        .catch(error => {
          // REFRESH TOKEN
          clearInterval(poller);
          window.location = window.location.origin;
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
      .then(tabsData => tabsData)
      .catch(error => console.warn(error));
  }

  render() {
    const { currenctlyPlayingData, tabs, query } = this.state;

    let tab = null;
    if (tabs) {
      tab =
        tabs.length > 0 ? (
          <Card>
            <iframe
              id="ugs"
              src={tabs[0].url}
              title="ugs"
              width="100%"
              frameBorder="0"
              style={{ height: "100vh" }}
            />
          </Card>
        ) : (
          <Card sectioned>
            <DisplayText size="small">
              <TextStyle>Tab Not Found</TextStyle>
            </DisplayText>
          </Card>
        );
    } else {
      tab = (
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
      );
    }

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
      <Page title="Spotify Live Tabs" fullWidth>
        <Layout>
          <Layout.Section secondary>{player}</Layout.Section>
          <Layout.Section>{tab}</Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Landing;
