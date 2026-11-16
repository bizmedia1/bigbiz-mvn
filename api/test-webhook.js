
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: false,
      message: "GET only."
    });
  }

  const secret = process.env.MOVANTRA_SECRET_KEY;

  if (!secret) {
    return res.status(500).json({
      status: false,
      message: "MOVANTRA_SECRET_KEY missing."
    });
  }

  const payload = JSON.stringify({
    event: "charge.success",
    created_at: "2026-11-16T08:00:00+01:00",
    mode: "test",
    data: {
      reference: "LIORA_TEST_001",
      amount: 1500000,
      currency: "NGN",
      status: "success"
    }
  });

  const signature = crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(payload, "utf8"))
    .digest("hex");

  return res.status(200).json({
    status: true,
    payload,
    signature
  });
};
