import prisma from "../../db.server";

export const loader = async () => {
  // This is where you would fetch data for the page, if needed.
  // For this example, we are not fetching any data.
  const res = await prisma.subscription.findMany({
    where: {
      notified: false,
    },
    select: {
      email: true,
      notified: true,
    },
  });

  if (!!res.length) {
    const subscriptions = res.map((item)=>{
      return {email: item.email, status: item.notified ? 'Sent' : 'Pending'};
    });

    return subscriptions;
  }
  console.error("Failed to fetch subscriptions");

  return null;
};