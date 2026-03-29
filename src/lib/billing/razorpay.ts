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

/**
 * Creates a linked account for a creator using Razorpay Route.
 */
export async function createLinkedAccount(creatorData: {
  email: string;
  name: string;
  pan: string;
  phone: string;
}) {
  return (razorpay as any).accounts.create({
    email: creatorData.email,
    phone: creatorData.phone,
    contact_name: creatorData.name,
    profile: {
      category: "financial_services",
      subcategory: "financial_information_services",
    },
    legal_business_name: creatorData.name,
    business_type: "individual",
    legal_info: {
      pan: creatorData.pan,
    },
  });
}

/**
 * Generates a KYC onboarding link for a linked account.
 * Note: Check Razorpay docs for the exact dashboard link structure or use Hosted Onboarding.
 */
export function generateOnboardingLink(accountId: string): string {
  // This is a placeholder for the actual onboarding link generation logic
  // Typically you'd use Razorpay's Hosted Onboarding or return a deep link.
  return `https://dashboard.razorpay.com/onboarding/${accountId}`;
}
