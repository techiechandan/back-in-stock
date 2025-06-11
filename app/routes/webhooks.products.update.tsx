import type { ActionFunctionArgs } from "@remix-run/node";
import shopify,{authenticate} from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // console.log("Webhook received - raw request:", await request.text());
    console.log("Webhook received - raw request:");
    const { payload, session, topic, shop } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);
    // console.log("Payload:", JSON.stringify(payload, null, 2));

    return new Response(JSON.stringify({message:"Webhook received"}), {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
};
