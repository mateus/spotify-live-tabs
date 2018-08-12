import React from "react";
import { Button, DisplayText, TextStyle, Stack } from "@shopify/polaris";

import "./UserProfile.css";

export default function UserProfile({ name, image, uri, email }) {
  return (
    <div className="UserProfile">
      <Stack>
        <Button plain url={uri}>
          <img className="Avatar" src={image} alt={name} />
        </Button>
        <Stack.Item fill>
          <DisplayText size="small">
            <TextStyle variation="strong">Logged in as</TextStyle>
          </DisplayText>
          <p>
            <TextStyle variation="subdued">{name ? name : email}</TextStyle>
          </p>
        </Stack.Item>
      </Stack>
    </div>
  );
}
