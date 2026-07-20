export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      email,
      amount,
      name,
      phone
    } = req.body;
if (!email || !amount || !name) {
  return res.status(400).json({
    email,
    amount,
    name,
    phone,
    body: req.body
  });
}

    const response = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: `NEXTEL_${Date.now()}`,
          amount,
          currency: "NGN",
          payment_options: "banktransfer",
          redirect_url: "https://t.me/nextelverifyapp?text=Hello%20,%20Admin%20.%20I%20have%20just%20made%20my%20payment%20for%20the%20NEXTEL%20E-sim%20Activation%20.%20Please%20confirm%20my%20payment",

          customer: {
            email,
            phone_number: phone,
            name,
          },

          customizations: {
            title: "Nextel",
            description: "Membership Payment",
          },
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json({
      link: data.data.link,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}
