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

    const {
      email,
      name,
      phone,
      customer_ref
    } = req.body;

    if (!email || !name || !customer_ref) {

      return res.status(400).json({
        status: false,
        message:
          "Email, name and customer_ref are required"
      });

    }

    const response = await fetch(
      "https://api.movantrapay.com/v1/palmpay/virtual-accounts",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.MOVANTRA_SECRET_KEY}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          customer_ref: customer_ref,

          name: name,

          email: email,

          phone: phone

        })

      }
    );

    const data =
      await response.json();

    console.log(
      "MOVANTRA RESPONSE:",
      JSON.stringify(data)
    );

    return res
      .status(response.status)
      .json(data);

  } catch (error) {

    return res.status(500).json({
      status: false,
      message: error.message
    });

  }

}
