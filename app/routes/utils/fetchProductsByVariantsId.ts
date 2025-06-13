

const query = `#graphql
  query getProductByVariantId($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        id
        title
        product {
          id
          title
          handle
        }
      }
    }
  }`;






  export interface ProductVariantNode {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
    };
    url: string;
  }
  
  export interface GraphQLResponse {
    data?: {
      node: ProductVariantNode | null;
    };
  }
  
/**
 * Fetches product variant details from the Shopify store using GraphQL queries.
 *
 * @param admin - The authenticated admin client to make GraphQL requests.
 * @param variantIds - An array of variant IDs for which to fetch product details.
 * @returns A promise that resolves to an array of ProductVariantNode objects, 
 *          filtered to exclude any null results due to failed requests.
 */

  export async function fetchProductsByVariantIds(
    admin: any,
    variantIds: string[]
  ) {
    const results = await Promise.all(
      variantIds.map(async (variantId) => {
        try {
          const response = await admin.graphql(query, {
            variables: { id: variantId },
          });
  
          const json = (await response.json()) as GraphQLResponse;
  
          if (json?.data?.node) {
            return json.data.node;
          }
        } catch (err) {
          console.error(`Error fetching variantId ${variantId}:`, err);
        }
  
        return null;
      })
    );
  
    // Filter out nulls in case of any failed requests
    return results.filter(Boolean) as ProductVariantNode[];
  }