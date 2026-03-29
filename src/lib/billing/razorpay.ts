import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  // We log a warning but don't throw immediately to allow non-billing routes to work
  console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables.");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder",
});

/**
 * Verifies the signature of a Razorpay webhook or checkout response.
 */
export function verifyRazorpaySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Formats an INR amount for Razorpay (converts to paise).
 */
export function toPaise(amountInr: number): number {
  return Math.round(amountInr * 100);
}
