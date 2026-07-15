export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {

    const {
      firstName,
      lastName
    } = req.body;

    const bvn = process.env.REGISTRATION_NUMBER;

    const response = await fetch(
      "https://mevonpay.com.ng/V1/createtempva",
      {
        method: "POST",
        headers: {
          Authorization: process.env.MEVON_SECRET_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          type: "rubies",

          fname: firstName,

          lname: lastName,

          registration_number: bvn

          // amount: amount,
          // currency: "NGN"

        })
      }
    );

    const text = await response.text();

    let data;

    try {

      data = JSON.parse(text.trim());

    } catch {

      return res.status(500).json({
        success: false,
        message: "Non JSON response",
        response: text
      });

    }

    return res.status(response.ok ? 200 : 400).json(data);

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }

}
