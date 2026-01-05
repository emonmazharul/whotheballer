export async function gTagAnalyzer(
  userId: string,
  eventName: string,
  params = {},
) {
  const GA_MEASUREMENT_ID = process.env.GTAG_MEASUREMENT_ID!;
  const GA_API_SECRET = process.env.GA_API_SECRET!;
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        client_id: userId,
        events: JSON.stringify([
          {
            name: eventName,
            params: params,
          },
        ]),
      },
    });
    console.log(`Event ${eventName} sent to GA4`);
  } catch (error) {
    console.error("Error sending event to GA4:", error);
  }
}
