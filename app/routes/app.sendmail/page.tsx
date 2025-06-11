import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  LegacyCard,
  DataTable,
  Button,
  Divider,
  Box,
  InlineStack,
} from "@shopify/polaris";
import React from "react";

interface LoaderData {
  id: string;
  title: string;
  product: {
    id: string;
    title: string;
  };
}

const SendMail = () => {
  const data = useLoaderData() as LoaderData[];
  console.log("data", data);
  const formatedData = data?.map((item) => ({
      product: item.product.title,
      variant: item.title,
      subscribed: "Yes",
      status: "Pending",
    }))?.map((item) => [item.product, item.variant, item.subscribed, item.status]);

  return (
    <Page title="Send Mail">
      <Layout>
        <Layout.Section>
          <LegacyCard
            title="Subscribed Products List with Pending Email"
            sectioned
          >
            <DataTable
              columnContentTypes={["text", "text", "text", "text"]}
              headings={["Product", "Variant", "Subscribed", "Status"]}
              rows={formatedData || []}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
      <Box></Box>
      <Box width="100%">
        <InlineStack align="center">
          <Form method="post">
            <Button submit>
              Send Mail
            </Button>
          </Form>
        </InlineStack>
      </Box>
    </Page>
  );
};

export default SendMail;
