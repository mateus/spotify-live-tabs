import React from "react";
import {
  Badge,
  Card,
  DisplayText,
  ResourceList,
  TextStyle,
  Heading,
  Stack
} from "@shopify/polaris";

import "./TabsListCard.css";

export default function TabsCard({ tabs, onClick }) {
  return (
    <Card>
      <Card.Section>
        <DisplayText size="small">
          <TextStyle variation="strong">Tabs </TextStyle>
          <TextStyle variation="subdued">({tabs.length} results)</TextStyle>
        </DisplayText>
      </Card.Section>
      <div className="TabsCardList">
        <ResourceList
          resourceName={{ singular: "Tab", plural: "Tabs" }}
          items={tabs}
          renderItem={item => {
            const { artist, name, rating, numberRates, type, url } = item;

            return (
              <ResourceList.Item
                id={url}
                onClick={onClick.bind(null, url)}
                shortcutActions={[
                  {
                    content: "View on Ultimate Guitar",
                    url,
                    external: true
                  }
                ]}
                accessibilityLabel={`Tab for ${name}`}
              >
                <Heading>
                  <Stack spacing="tight" alignment="baseline">
                    <span>{name}</span>
                    <Badge>{type}</Badge>
                    <TextStyle variation="subdued">
                      ★ {rating} - {numberRates} Reviews
                    </TextStyle>
                  </Stack>
                </Heading>
                <div>{artist}</div>
              </ResourceList.Item>
            );
          }}
        />
      </div>
    </Card>
  );
}
