import React from "react";
import {
  Card,
  Button,
  DisplayText,
  TextStyle,
  Page,
  Stack
} from "@shopify/polaris";

import spotifyIcon from "../../images/Spotify_Icon_RGB_Green.png";

class Login extends React.PureComponent {
  handleClick() {
    this.props.onClick();
  }

  render() {
    return (
      <Page singleColumn>
        <Card sectioned>
          <Stack vertical alignment="center" spacing="loose">
            <Stack vertical alignment="center" spacing="tight">
              <DisplayText size="large">Spotify Live Tabs</DisplayText>
              <DisplayText size="small">
                <TextStyle variation="subdued">
                  Music tabs based on what you are listening on Spotify
                </TextStyle>
              </DisplayText>
            </Stack>
            <Button outline size="slim" onClick={this.handleClick.bind(this)}>
              <Stack alignment="center" spacing="tight">
                <img src={spotifyIcon} width="30" alt="Spotify icon" />
                <TextStyle variation="strong">Login with Spotify</TextStyle>
              </Stack>
            </Button>
          </Stack>
        </Card>
      </Page>
    );
  }
}

export default Login;
