import React from "react";
import {
  Button,
  Caption,
  DisplayText,
  TextStyle,
  Stack
} from "@shopify/polaris";

import "./UserProfile.css";

export default function UserProfile({ name, image, uri, email }) {
  const avatar = image ? (
    <Button plain url={uri}>
      <img className="Avatar" src={image} alt={name} />
    </Button>
  ) : null;

  return (
    <div className="UserProfile">
      <Stack>
        {avatar}
        <Stack.Item fill>
          <DisplayText size="medium">Welcome to Live Tabs</DisplayText>
          <Caption>
            <TextStyle variation="subdued">{name ? name : email}</TextStyle>
          </Caption>
        </Stack.Item>
      </Stack>
    </div>
  );
}
