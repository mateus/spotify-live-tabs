import React from "react";
import {
  Card,
  DisplayText,
  TextStyle,
  Thumbnail,
  Stack,
  ProgressBar,
  Link
} from "@shopify/polaris";

import spotifyLogo from "../../images/Spotify_Logo_Black.png";

function Player({
  albumImage,
  albumName,
  songName,
  artists,
  progressLevel,
  progressMS,
  durationMS,
  spotifyURI
}) {
  const songNameSize = songName.length <= 20 ? "medium" : "small";
  const artistsList = artists.map(artist => artist.name).join(", ");

  return (
    <Card sectioned>
      <Stack vertical>
        <Stack wrap={false}>
          <Thumbnail source={albumImage} size="large" alt={albumName} />
          <Stack.Item fill>
            <DisplayText size={songNameSize}>{songName}</DisplayText>
            <p>
              <TextStyle variation="subdued">{artistsList}</TextStyle>
            </p>
          </Stack.Item>
        </Stack>
        <Stack vertical spacing="none">
          <ProgressBar progress={progressLevel} size="small" />
          <Stack spacing="tight">
            <Stack.Item fill>
              <TextStyle variation="subdued">
                {millisToMinutesAndSeconds(progressMS)}
              </TextStyle>
            </Stack.Item>
            <TextStyle variation="subdued">
              {millisToMinutesAndSeconds(durationMS)}
            </TextStyle>
          </Stack>
        </Stack>
        <Stack alignment="center" distribution="trailing">
          <Link url={spotifyURI}>
            <img src={spotifyLogo} alt="See it on Spotify" width="90" />
          </Link>
        </Stack>
      </Stack>
    </Card>
  );
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export default Player;
