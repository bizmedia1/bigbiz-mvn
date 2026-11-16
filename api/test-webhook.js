

const crypto = require("crypto");

const secret = process.env.MOVANTRA_SECRET_KEY;

if (!secret) {
  throw new Error("MOVANTRA_SECRET_KEY is missing.");
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
  .update(payload)
  .digest("hex");

console.log(JSON.stringify({
  payload,
  signature
}, null, 2));
