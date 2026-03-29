import { LegalLayout } from "@/components/legal/legal-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Refund Policy | Inhumans Trade",
  description: "Official Pricing and Refund Policy for Inhumans Trade social trading platform.",
};

export default function PricingPage() {
  return (
    <LegalLayout title="Pricing & Refund Policy" lastUpdated="March 30, 2026">
      <section>
        <h2>1. Subscription Plans</h2>
        <p>
          Inhumans Trade offers tiered subscription plans for access to premium social trading features and verified trade data:
        </p>
        <ul>
          <li><strong>Free Plan:</strong> Basic access to public feeds and profile viewing.</li>
          <li><strong>Creator Pro:</strong> Standard subscription for traders who link their brokers and share verified data.</li>
          <li><strong>Follower Premium (Coming Soon):</strong> Subscription for advanced copy-trading and notification features.</li>
        </ul>
      </section>

      <section>
        <h2>2. Payments and Fees</h2>
        <p>
          All payments are processed securely through our authorized payment gateway (Razorpay). 
        </p>
        <ul>
          <li><strong>Recurring Billing:</strong> Subscriptions are billed on a monthly or annual basis as selected by the user.</li>
          <li><strong>Currency:</strong> All fees are stated and charged in Indian Rupees (INR).</li>
          <li><strong>Taxation:</strong> Applicable Goods and Services Tax (GST) will be charged in addition to the subscription fees.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cancellation Policy</h2>
        <p>
          You may cancel your subscription at any time via your Account Settings. 
        </p>
        <ul>
          <li>Upon cancellation, your premium access will remain active until the end of your current billing cycle.</li>
          <li>No further charges will be applied after the effective cancellation date.</li>
        </ul>
      </section>

      <section>
        <h2>4. Refund Policy</h2>
        <p>
          As our Platform provides immediate access to digital services and data, our refund policy is as follows:
        </p>
        <ul>
          <li><strong>7-Day Window:</strong> New subscribers are eligible for a full refund within 7 days of their initial purchase, provided they have not made extensive use of premium data.</li>
          <li><strong>No Pro-Rata Refunds:</strong> Aside from the initial 7-day window, there are no pro-rata refunds for partial months or unused periods.</li>
          <li><strong>Technical Issues:</strong> If a technical failure on our part prevents access to services for more than 48 hours, a credit or partial refund may be issued at our sole discretion.</li>
        </ul>
      </section>

      <section>
        <h2>5. Financial Performance Disclaimer</h2>
        <p>
          Subscription fees are for access to platform features and data verification services. 
        </p>
        <ul>
          <li><strong>No Guarantee:</strong> Fees paid for subscriptions do not guarantee trading profits or any specific financial results.</li>
          <li><strong>Losses:</strong> Trading losses incurred while using the Platform's data are not grounds for a refund.</li>
        </ul>
      </section>

      <section>
        <h2>6. Contact for Billing</h2>
        <p>
          For all billing-related inquiries or refund requests, please contact us at <strong>billing@inhumans.io</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}
