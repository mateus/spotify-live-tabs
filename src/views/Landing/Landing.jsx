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
  TextStyle
} from "@shopify/polaris";

import { UserProfile, TabsListCard, Player } from "./components";

class Landing extends Component {
  state = {
    currenctlyPlayingData: null,
    tabs: null,
    tabURL: null,
    query: null
  };

  componentDidMount() {
    this.fetchUser();
    this.fetchCurrenctlyPlaying();
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
      .then(tabsData => tabsData)
      .catch(error => console.warn(error));
  }

  updateTabURL(url) {
    this.setState({ tabURL: url });
  }

  render() {
    const { userData, currenctlyPlayingData, tabs, tabURL, query } = this.state;

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
        this.fetchTabs(tabQuery).then(tabsData => {
          this.setState({
            tabs: tabsData,
            tabURL: tabsData.length > 0 ? tabsData[0].url : null,
            query: tabQuery
          });
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

    let tabCard = null;
    let tabsListCard = null;
    if (tabs) {
      if (tabs.length > 0) {
        tabsListCard = <TabsListCard tabs={tabs} onClick={this.updateTabURL.bind(this)} />;

        tabCard = (
          <Card>
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
          </Card>
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
          <Card sectioned>
            <Stack distribution="center">
              <Icon source="view" color="skyDark" />
            </Stack>
          </Card>
        );
      }
    } else {
      tabCard = (
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
      );

      tabsListCard = (
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
      );
    }

    return (
      <Page
        title="Spotify Live Tabs"
        fullWidth
        breadcrumbs={[{ content: "Logout", url: window.location.origin }]}
      >
        <Layout>
          <Layout.Section secondary>
            <Stack vertical>
              {userProfile}
              {player}
            </Stack>
          </Layout.Section>
          <Layout.Section>{tabsListCard}</Layout.Section>
          <Layout.Section>{tabCard}</Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Landing;
