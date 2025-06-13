import type { ActionFunctionArgs } from "@remix-run/node";
import shopify, { authenticate } from "../shopify.server";
import { StringOrNumber } from "./utils/types";
import { fetchProductsByVariantIds } from "./utils/fetchProductsByVariantsId";
import prisma from "../db.server";
import sendMail from "./utils/sendMail";
import { fetchStoreDetails } from "./utils/fetchStoreDetails";
import { buildUrl } from "./utils";

interface VariantPayload {
  id: StringOrNumber;
  product_id: StringOrNumber;
  title: string;
  price: StringOrNumber;
  position: StringOrNumber;
  inventory_policy: string;
  compare_at_price: StringOrNumber;
  option1: string;
  option2: string;
  option3: string;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string;
  sku: string;
  inventory_item_id: StringOrNumber;
  inventory_quantity: StringOrNumber;
  old_inventory_quantity: StringOrNumber;
  admin_graphql_api_id: string;
  image_id: StringOrNumber;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    console.log("Webhook received for variant in stock update");
    /**
     * authenticating the incoming webhook request and extracting payload and admin.
     */
    const { payload, admin } =
      await authenticate.webhook(request);

    /**
     * extracting required field from payload
     */
    const {
      id: variant_id,
      product_id,
      title: variant_title,
      inventory_quantity,
      admin_graphql_api_id,
      ...rest
    } = payload as unknown as VariantPayload;

    /**
     * fetch product's details(such as title handle) from store by adin_graphql_api_id
     */
    const productsDetails = await fetchProductsByVariantIds(admin, [
      admin_graphql_api_id,
    ]);
    const { product } = productsDetails[0];

    /**
     * fetching emailId form subscriptions table by variant_id and product_id, if anyone has subscribed for this variant and email has not been sent.
     */
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: {
        product_variant_unique: {
          productId: String(product_id),
          variantId: String(variant_id),
        },
        notified: false,
      },
      select: {
        email: true,
      },
    });

    /**
     * fetching store details, to get primary domain of the respective store.
     */
    const storeDetails = await fetchStoreDetails(admin);

    /**
     * building the variant url for current product variant.
     */
    const productVariantURL = buildUrl(
      storeDetails?.primaryDomain.url ?? "",
      product.handle,
      variant_id,
    );

    /**
     * returing with fake ok(200) response if subscription record not found for the current variant
     */
    if (!subscriptionRecord?.email)
      return new Response(
        JSON.stringify({ message: "Subcription not found for this variant" }),
        {
          status: 200,
        },
      );

    /**
     * sending mail
     */
    console.log("Sending mail...",subscriptionRecord.email,
      product.title,
      variant_title,
      productVariantURL,);
    await sendMail(
      subscriptionRecord.email,
      product.title,
      variant_title,
      productVariantURL,
    );
    console.log("mail sent...");

    /**
     * updating the record in subscriptions table, as notified = true
     */
    await prisma.subscription.update({
      where: {
        product_variant_unique: {
          productId: String(product_id),
          variantId: String(variant_id),
        },
      },
      data: {
        notified: true,
      },
    });

    /**
     * returning response
     */
    return new Response(JSON.stringify({ message: "Mail sent successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
};
