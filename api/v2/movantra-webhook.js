
const crypto = require("crypto");

module.exports.config = {
  api: {
    bodyParser: false
  }
};

async function getRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk)
    );
  }

  return Buffer.concat(chunks);
}

function verifySignature(rawBody, signature, secret) {
  if (
    !signature ||
    typeof signature !== "string" ||
    !secret
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const receivedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    )
  );
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Movantra-Event, X-Movantra-Signature");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method not allowed."
    });
  }

  try {
    const secret = process.env.MOVANTRA_SECRET_KEY;

    if (!secret) {
      console.error("[Liora V2 Webhook] Missing MOVANTRA_SECRET_KEY.");

      return res.status(500).json({
        status: false,
        message: "Webhook is not configured."
      });
    }

    const rawBody = await getRawBody(req);

    const signature =
      req.headers["x-movantra-signature"] || "";

    if (!verifySignature(rawBody, signature, secret)) {
      console.warn("[Liora V2 Webhook] Invalid signature.");

      return res.status(401).json({
        status: false,
        message: "Invalid webhook signature."
      });
    }

    let payload;

    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({
        status: false,
        message: "Invalid JSON payload."
      });
    }

    const eventName =
      req.headers["x-movantra-event"] ||
      payload.event ||
      "";

    const supportedEvents = [
      "charge.success",
      "virtual_account.credit"
    ];

    if (!supportedEvents.includes(eventName)) {
      console.log("[Liora V2 Webhook] Event received:", eventName);

      return res.status(200).json({
        status: true,
        received: true,
        ignored: true,
        event: eventName
      });
    }

    const data = payload.data || {};

    console.log("[Liora V2 Webhook] Verified event received:", {
      event: eventName,
      reference: data.reference || null,
      amount: data.amount || null,
      currency: data.currency || null,
      mode: payload.mode || null,
      receivedAt: new Date().toISOString()
    });

    return res.status(200).json({
      status: true,
      received: true,
      verified: true,
      event: eventName,
      reference: data.reference || null
    });

  } catch (error) {
    console.error("[Liora V2 Webhook] Error:", error);

    return res.status(500).json({
      status: false,
      message: "Webhook processing failed."
    });
  }
}
