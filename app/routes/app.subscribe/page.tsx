import { Layout, Page, LegacyCard, DataTable } from "@shopify/polaris"



type SubscriptionRow = {
  email: string;
  status: string;
};

import { useLoaderData } from "react-router-dom";

const Subscribe = () => {

  const subscriptions = useLoaderData() as SubscriptionRow[] | null;
  const formattedRows = subscriptions ? subscriptions.map((sub) => [sub.email, sub.status]) : [];



  return (
    <Page title="Waiting for notification">
      <LegacyCard>
        <DataTable
          columnContentTypes={[
            'text',
            'text',
          ]}
          headings={[
            'Email',
            'Status',
          ]}
          rows={formattedRows}
        />
      </LegacyCard>
    </Page>
  );
};

export default Subscribe