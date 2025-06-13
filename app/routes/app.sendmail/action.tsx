import { ActionFunctionArgs, redirect } from "@remix-run/node";
import prisma from "../../db.server";
import { fetchProductsByVariantIds } from "./loader";
import { authenticate } from "../../shopify.server";
import sendMail from "../utils/sendMail";




function buildUrl( handle:string, variantId: string) {
  const BaseURL: string="https://chandansstore.myshopify.com";

  const url = `${BaseURL}/products/${handle}?variant=${variantId}`;
  return url;
};

function IdParser(id: string) {
  const parsedId = id.split("/").pop();
  return parsedId;
}


export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    /**
   * authenticating admin
   */
  const { admin } = await authenticate.admin(request);
  /**
   * find all the variantsIds from subscriptions table, which notified field is false
   */
    const subscriptionsData = await prisma.subscription.findMany({where: {notified: false}, select: {productId: true, variantId: true, email: true}});
    const formatedVariantIds = subscriptionsData.map((item) => `gid://shopify/ProductVariant/${item.variantId}`);

    /**
     * fetch all the products from store based by variantIds stored in subscriptions table
     */
    const products = await fetchProductsByVariantIds(admin,formatedVariantIds);
    console.log("ready to send mail");

    /**
     * sending mail to subscribed users
     */
    for (const item of products){
      /**
       * parsing product id and variant id from graphql id to store id
       */
      const itemProductId = (IdParser(item.product.id))!;
      const itemVariantId = (IdParser(item.id))!; 

      /**
       * fetching email from subscriptions list
       */
      const email = subscriptionsData.find((subItem) => subItem.variantId === itemVariantId && subItem.productId === itemProductId)?.email;
      /**
       * building url for current product variant
       */
      const url = buildUrl(item.product.handle, item.id);
      /**
       * sending mail
       */
      await sendMail(email!, item.product.title, item.title, url);

      /**
       * updating notified field to true, in subscriptions table
       */
      await prisma.subscription.update({where: {
        product_variant_unique: {
          productId:itemProductId,
          variantId:itemVariantId,
        },
      }, data: {notified: true}});
    };

    /**
     * return true, if mail is sent
     */
    return redirect("/app/sendmail");
  } catch (error) {
    console.error("Error sending mail:", error);
    return null;
  }
}