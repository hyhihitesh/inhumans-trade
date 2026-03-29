import { LegalLayout } from "@/components/legal/legal-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Inhumans Trade",
  description: "Official Privacy Policy for Inhumans Trade social trading platform.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="March 30, 2026">
      <section>
        <h2>1. Overview</h2>
        <p>
          At Inhumans Trade, we prioritize the security of your financial data and privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our social trading Platform.
        </p>
      </section>

      <section>
        <h2>2. Data Collection</h2>
        <p>
          We collect information that you directly provide and data retrieved through broker integrations:
        </p>
        <ul>
          <li><strong>Registration Data:</strong> Name, email address, and authentication credentials (e.g., via Google OAuth).</li>
          <li><strong>Broker Data:</strong> When you link your broker (e.g., Zerodha), we collect trade data, order status, and performance metrics as provided by the broker's API.</li>
          <li><strong>Usage Data:</strong> Information about your interaction with the Platform, including log data and IP addresses.</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Usage</h2>
        <p>
          Your information is used to:
        </p>
        <ul>
          <li>Provide trade verification and social feed updates.</li>
          <li>Calculate platform-wide performance leaderboards.</li>
          <li>Send security alerts and transactional notifications.</li>
          <li>Comply with legal obligations and prevent fraud.</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Security & Encryption</h2>
        <p>
          We employ industry-standard security measures to protect your data. All sensitive broker tokens and credentials are encrypted at rest using AES-256-GCM. 
        </p>
        <p>
          We do not store your Zerodha password. Direct broker authentication is handled via official OAuth 2.0 flows on the broker's own platform.
        </p>
      </section>

      <section>
        <h2>5. Information Sharing</h2>
        <p>
          We do not sell your personal or financial data. We share information with:
        </p>
        <ul>
          <li><strong>Service Providers:</strong> Supabase (Database), Vercel (Hosting), and PostHog (Analytics) to operate the Platform.</li>
          <li><strong>Broker Partners:</strong> Data is shared back to brokers for the sole purpose of maintaining API connectivity.</li>
          <li><strong>Legal Authorities:</strong> When required by law or in response to valid legal requests from Indian authorities.</li>
        </ul>
      </section>

      <section>
        <h2>6. Your Data Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access and retrieve your personal data.</li>
          <li>Request deletion of your account and all associated linked data.</li>
          <li>Disconnect your broker account at any time via the Settings menu.</li>
        </ul>
      </section>

      <section>
        <h2>7. Contact Information</h2>
        <p>
          For any questions or privacy concerns, please contact our Data Protection Officer at <strong>support@inhumans.io</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}
