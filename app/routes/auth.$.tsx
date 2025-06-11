import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("ready to authenticate admin");
  // await authenticate.admin(request);

  // return null;

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    console.warn("⚠️ Missing `shop` parameter in admin auth route.");
    // Redirect to homepage or error
    return redirect("/?error=missing_shop");
  }

  await authenticate.admin(request);
  console.log("authenticated admin");
  return null;
};