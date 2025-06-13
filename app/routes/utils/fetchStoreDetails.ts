const query = `#graphql
  query getStoreDomain {
    shop {
      name
      myshopifyDomain
      primaryDomain {
        url
        host
        sslEnabled
      }
    }
  }`;


  interface ShopInfoResponse {
  data: {
    shop: {
      name: string;
      myshopifyDomain: string;
      primaryDomain: {
        url: string;
        host: string;
        sslEnabled: boolean;
      };
    };
  };
}



/**
 * Fetches shop details using a graphql query
 * 
 * @param {any} admin - The authenticated admin client to make graphql requests.
 * @returns {Promise<ShopInfoResponse | null>} The shop info or null if the request failed
 */
export const fetchStoreDetails = async (admin: any) => {
  const response = await admin.graphql(query, {});

  const json = (await response.json()) as ShopInfoResponse;

  if (json?.data?.shop) {
    return json.data.shop;
  }

  return null;
};