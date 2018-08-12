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

export default function TabsCard({ tabs, onClick, limited }) {
  const classNames = limited
    ? "TabsCardList TabsCardList--limited"
    : "TabsCardList";

  return (
    <Card>
      <Card.Section>
        <DisplayText size="small">
          <TextStyle variation="strong">Tabs </TextStyle>
          <TextStyle variation="subdued">({tabs.length} results)</TextStyle>
        </DisplayText>
      </Card.Section>
      <div className={classNames}>
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
                  {artist} - {name}
                </Heading>
                <Stack spacing="tight" alignment="baseline">
                  <TextStyle variation="subdued">
                    ★ {rating} - {numberRates} Reviews
                  </TextStyle>
                  <Badge>{type}</Badge>
                </Stack>
              </ResourceList.Item>
            );
          }}
        />
      </div>
    </Card>
  );
}
