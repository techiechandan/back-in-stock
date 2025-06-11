import { ActionFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { cors } from "remix-utils/cors";


export const loader = async ({ request }: ActionFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const variantId = url.searchParams.get("variantId");

    // if (request.method === "OPTIONS") {
    //   return cors(
    //     request,
    //     new Response(null, {
    //       status: 204,
    //       headers: {
    //         "Access-Control-Allow-Origin": "*",
    //         "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    //         "Access-Control-Allow-Headers": "Content-Type",
    //       },
    //     }),
    //   );
    // }
    if (request.method === "OPTIONS") {
    return cors(request, new Response(null, { status: 204 }));
  }

    const isSubscribed = await prisma.subscription.findFirst({
      where: {
        productId: productId!,
        variantId: variantId!,
      },
    });

    return cors(
      request,
      new Response(
        JSON.stringify({
          message: "Subscription details loaded successfully",
          isSubscribed: !!isSubscribed,
        }),
        { status: 200 },
      ),
    );
  } catch (error) {
    console.error("Error in loader:", error);
    return cors(
      request,
      new Response(JSON.stringify({ message: "Error in loader" }), {
        status: 500,
      }),
    );
  }
};

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const shop = formData.get("shopName") as string;
    const productId = formData.get("productId") as string;
    const variantId = formData.get("variantId") as string;
    const email = formData.get("email") as string;

    console.log("Received form data:", {
      shop,
      productId,
      variantId,
      email,
    });

    if (!shop || !productId || !variantId || !email) {
      return cors(
        request,
        new Response("Missing required fields", { status: 400 }),
      );
    }

    // insert data
    await prisma.subscription.upsert({
      where: {
        product_variant_unique: {
          productId,
          variantId,
        },
      },
      update: {
        email,
        shop,
      },
      create: {
        productId,
        variantId,
        email,
        shop,
      },
    });

    return cors(
      request,
      new Response(JSON.stringify({ message: "Thank you for subscribing!",success: true }), {
        status: 200,
      }),
    );
  } catch (error) {
    console.error("Error saving subscription details:", error);
    return cors(
      request,
      new Response(
        JSON.stringify({ message: "Error saving subscription details" }),
        { status: 500 },
      ),
    );
  }
}

async function saveSubscriptionDetails(shop: string, accessToken: string) {
  // This function should implement the logic to save the subscription details
  // to your database. This is a placeholder function.
  // You can use any database of your choice, such as MongoDB, PostgreSQL, etc.
}
