import { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../../db.server";
import shopify, { authenticate } from "../../shopify.server";

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






interface ProductVariantNode {
  id: string;
  title: string;
  product: {
    id: string;
    title: string;
    handle: string;
  };
  url: string;
}

interface GraphQLResponse {
  data?: {
    node: ProductVariantNode | null;
  };
}

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







interface GetProductByVariantResponse {
  data?: {
    node: {
      id: string;
      title: string;
      product: {
        id: string;
        title: string;
      };
    };
  };
}



export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  /**
   * Get all subscriptions records with notified = false
   */
  const res = await prisma.subscription.findMany({
    where: { notified: false },
    select: { productId: true, variantId: true, shop: true },
  });

  console.log("res=====>>>>>",res);

 /**
  * formating variantIds for GraphQL Query
  */
  const variantIds = res.map((item) => `gid://shopify/ProductVariant/${item.variantId}`);

  /**
   * Fetch all products from store based by variantIds stored in subscriptions table
   */
  const products = await fetchProductsByVariantIds(admin, variantIds);
  
  /**
   * Return products if found else return null
   */
  if(products.length){
    return products;
  }

  return null;
};
