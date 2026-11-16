
const crypto = require("crypto");

const secret = process.env.MOVANTRA_SECRET_KEY;

if (!secret) {
  throw new Error("MOVANTRA_SECRET_KEY is missing.");
}

const payload = JSON.stringify({
  event: "charge.success",
  created_at: new Date().toISOString(),
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

console.log("PAYLOAD:");
console.log(payload);

console.log("\nSIGNATURE:");
console.log(signature);
