export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    const { firstName, lastName } = req.body;

    const response = await fetch(
      "https://mevonpay.com.ng/V1/createtempva",
      {
        method: "POST",
        headers: {
          Authorization: process.env.MEVON_SECRET_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fname: firstName || "Nextel",
          lname: lastName || "User"
        })
      }
    );

    const text = await response.text();

    let parsed;

    try {
      const result = JSON.parse(text);
      parsed = result.raw ? JSON.parse(result.raw) : result;
    } catch {
      return res.status(500).json({
        status: false,
        message: "Invalid response from MevonPay",
        response: text
      });
    }

    return res.status(200).json({
      status: true,
      account_number: parsed.account_number,
      account_name: parsed.account_name,
      bank_name: parsed.bank_name,
      reference: parsed.reference
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
}
