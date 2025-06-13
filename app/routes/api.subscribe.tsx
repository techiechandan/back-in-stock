import { ActionFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { cors } from "remix-utils/cors";
import {authenticate} from "../shopify.server"

export const loader = async ({ request }: ActionFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId")?.trim();
    const variantId = url.searchParams.get("variantId")?.trim();
    const email = url.searchParams.get("email")?.trim();
    const shopName = url.searchParams.get("shopName")?.trim();
    const actionType = url.searchParams.get("actionType")?.trim();

    /**
     * CORS preflight request handling
     */
    if (request.method === "OPTIONS") {
      return cors(request, new Response(null, { status: 204 }));
    }

    switch (actionType?.toLowerCase()) {
      case "subscription_status":
        const isSubscribed = await prisma.subscription.findFirst({
          where: {
            productId: productId!,
            variantId: variantId!,
            email: email!,
            shop: shopName!,
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
      default:
        return cors(
          request,
          new Response(
            JSON.stringify({
              message: "Invalid action type",
            }),
            { status: 400 },
          ),
        );
    }
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
        new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 }),
      );
    }

    /**
     * saving subscription details, if it doesn't exist
     */
    await prisma.subscription.create({
      data: {
        productId,
        variantId,
        email,
        shop,
      },
    });
    
    return cors(
      request,
      new Response(
        JSON.stringify({
          message: "Thank you for subscribing!",
          success: true,
        }),
        {
          status: 200,
        },
      ),
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
};
