import React, { Component } from "react";
import {
  Card,
  DisplayText,
  Stack,
  Spinner,
  SkeletonBodyText,
  Icon,
  Page,
  Layout,
  Tabs,
  TextStyle
} from "@shopify/polaris";

import { UserProfile, TabsListCard, Player } from "./components";

class Landing extends Component {
  state = {
    currenctlyPlayingData: null,
    tabs: null,
    tabURL: null,
    lyricsURL: null,
    query: null,
    sideMenu: false,
    selectedCardTab: 0
  };

  componentDidMount() {
    this.fetchUser();
    this.fetchCurrenctlyPlaying();
    this.setState({ selectedCardTab: this.state.tabURL ? 0 : 1 });
  }

  fetchUser() {
    const { accessToken } = this.props;
    fetch("https://api.spotify.com/v1/me", {
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
          this.setState({ userData: data });
        }
      })
      .catch(error => {
        console.error("Error caught", error);
        window.location = window.location.origin;
      });
  }

  fetchCurrenctlyPlaying() {
    const { accessToken } = this.props;
    const pollerTimeout = 1000;

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
          clearInterval(poller);
          console.error("Error caught", error);
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
      .then(tabsData =>
        this.setState({
          tabs: tabsData,
          tabURL: tabsData.length > 0 ? tabsData[0].url : null
        })
      )
      .catch(error => console.warn(error));
  }

  fetchLyrics(name, artist) {
    const query = `${artist} - ${name}`;

    const url = new URL(window.location.origin + "/lyrics");
    url.searchParams.append("name", name);
    url.searchParams.append("artist", artist);

    return fetch(url)
      .then(response => response.json())
      .then(lyricsData => {
        const dataBody = lyricsData.message.body;
        const dataHeader = lyricsData.message.header;

        this.setState({
          query,
          lyricsURL:
            dataBody && dataHeader.status_code !== 404
              ? dataBody.lyrics.backlink_url
              : false
        });
      })
      .catch(error => {
        console.warn(error);
        this.setState({
          query,
          lyricsURL: false
        });
      });
  }

  updateTabURL(url) {
    this.setState({ tabURL: url, selectedCardTab: 0 });
  }

  handleTabChange(selectedTabIndex) {
    this.setState({ selectedCardTab: selectedTabIndex });
  }

  changeViewLayout() {
    this.setState({ sideMenu: !this.state.sideMenu });
  }

  render() {
    const {
      userData,
      currenctlyPlayingData,
      tabs,
      tabURL,
      lyricsURL,
      query,
      sideMenu,
      selectedCardTab
    } = this.state;

    const userProfile = userData ? (
      <UserProfile
        name={userData.display_name}
        email={userData.email}
        image={userData.images[0].url}
        uri={userData.uri}
      />
    ) : null;

    let player;
    if (currenctlyPlayingData && !currenctlyPlayingData.error) {
      const playingNow = currenctlyPlayingData.item;
      const progressLevel = parseFloat(
        (100 * currenctlyPlayingData.progress_ms) / playingNow.duration_ms
      ).toFixed(2);

      const tabQuery = `${playingNow.artists[0].name} - ${playingNow.name}`;

      if (query !== tabQuery) {
        this.fetchLyrics(playingNow.name, playingNow.artists[0].name);
        this.fetchTabs(tabQuery);
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

    let tabCard = null;
    let tabsListCard = null;
    if (tabs) {
      if (tabs.length > 0) {
        tabsListCard = (
          <TabsListCard
            tabs={tabs}
            onClick={this.updateTabURL.bind(this)}
            limited={!sideMenu}
          />
        );

        tabCard = (
          <iframe
            id="ugs"
            src={tabURL}
            title="ugs"
            width="100%"
            height="4000px"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
          />
        );
      } else {
        tabsListCard = (
          <Card sectioned>
            <Stack vertical spacing="tight" alignment="center">
              <DisplayText size="small">
                <TextStyle>No Tabs Available</TextStyle>
              </DisplayText>
              <p>
                <TextStyle variation="subdued">
                  Nothing found for <em>"{query}"</em>
                </TextStyle>
              </p>
              <Icon source="view" color="skyDark" />
            </Stack>
          </Card>
        );

        tabCard = (
          <Card.Section>
            <Stack distribution="center">
              <Icon source="view" color="skyDark" />
            </Stack>
          </Card.Section>
        );
      }
    } else {
      tabCard = (
        <Card.Section>
          <SkeletonBodyText />
        </Card.Section>
      );

      tabsListCard = (
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
      );
    }

    let lyricsCard = null;
    if (lyricsURL !== null) {
      lyricsCard = lyricsURL ? (
        <iframe
          id="lyrics"
          src={lyricsURL}
          title="lyrics"
          width="100%"
          height="4000px"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
        />
      ) : (
        <Card.Section>
          <Stack distribution="center">
            <Icon source="view" color="skyDark" />
          </Stack>
        </Card.Section>
      );
    } else {
      lyricsCard = (
        <Card.Section>
          <SkeletonBodyText />
        </Card.Section>
      );
    }

    const cardTabs = [
      {
        id: "tab-tab",
        content: "Tab",
        accessibilityLabel: "Tab",
        panelID: "tab-panel"
      },
      {
        id: "lyrics-tab",
        content: "Lyrics",
        panelID: "lyrics-panel"
      }
    ];

    const viewLayout = sideMenu ? (
      <Layout.Section secondary>
        {player}
        {tabsListCard}
      </Layout.Section>
    ) : (
      <React.Fragment>
        <Layout.Section secondary>{player}</Layout.Section>
        <Layout.Section>{tabsListCard}</Layout.Section>{" "}
      </React.Fragment>
    );

    return (
      <Page
        title={userProfile}
        primaryAction={{
          onClick: this.changeViewLayout.bind(this),
          icon: "view"
        }}
        fullWidth
      >
        <Layout>
          {viewLayout}
          <Layout.Section>
            <Card>
              <Tabs
                tabs={cardTabs}
                selected={selectedCardTab}
                onSelect={this.handleTabChange.bind(this)}
              />
              {selectedCardTab === 0 ? tabCard : lyricsCard}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Landing;
