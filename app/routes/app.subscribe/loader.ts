import prisma from "../../db.server";

export const loader = async () => {
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