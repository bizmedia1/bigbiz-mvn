export default async function handler(req, res) {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method not allowed"
    });
  }

  try {

    const { email, name, phone } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        status: false,
        message: "Email and name are required"
      });
    }

    const response = await fetch(
      "https://api.movantrapay.com/v1/palmpay/virtual-accounts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MOVANTRA_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_ref: email,
          name,
          email,
          phone
        })
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {

    return res.status(500).json({
      status: false,
      message: error.message
    });

  }

}
