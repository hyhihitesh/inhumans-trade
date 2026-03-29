import { LegalLayout } from "@/components/legal/legal-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Inhumans Trade",
  description: "Official Terms of Service for Inhumans Trade social trading platform.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="March 30, 2026">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Inhumans Trade platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, you must immediately cease all use of the Platform.
        </p>
      </section>

      <section>
        <h2>2. Risk Disclosure (Critical)</h2>
        <p>
          Trading in financial instruments (stocks, options, futures, etc.) involves substantial risk of loss. The Platform provides tools for social trading and information sharing; however:
        </p>
        <ul>
          <li><strong>No Guarantee:</strong> Past performance is not indicative of future results. There is no guarantee that any strategy shared on the Platform will result in profits.</li>
          <li><strong>Personal Responsibility:</strong> Every user is solely responsible for their own trading decisions and financial outcomes. </li>
          <li><strong>Not Investment Advice:</strong> Content on the Platform, including trade posts from "Creators," is for informational purposes only and does NOT constitute financial or investment advice.</li>
        </ul>
      </section>

      <section>
        <h2>3. Creator and Follower Relationship</h2>
        <p>
          The Platform facilitates the sharing of trade data between Creators and Followers. 
        </p>
        <ul>
          <li><strong>Creators:</strong> Users who share their verified broker trades. Creators are not necessarily registered financial advisors.</li>
          <li><strong>Followers:</strong> Users who choose to view or copy trades. Followers acknowledge they are making independent decisions based on shared data.</li>
        </ul>
      </section>

      <section>
        <h2>4. Broker Integration</h2>
        <p>
          The Platform uses official APIs (e.g., Zerodha Kite Connect) to verify trades. By linking your broker account, you authorize the Platform to:
        </p>
        <ul>
          <li>Receive postback updates and order status information.</li>
          <li>Retrieve historical and real-time trade data for verification.</li>
          <li>Display verified trade performance on your public profile.</li>
        </ul>
      </section>

      <section>
        <h2>5. Limitation of Liability</h2>
        <p>
          Inhumans Trade, its founders, and employees shall not be liable for any direct, indirect, incidental, or consequential losses resulting from:
        </p>
        <ul>
          <li>Trading losses incurred while using the Platform.</li>
          <li>Technical failures, API delays, or platform downtime.</li>
          <li>Inaccuracy of data provided by third-party brokerages.</li>
        </ul>
      </section>

      <section>
        <h2>6. Termination</h2>
        <p>
          We reserve the right to suspend or terminate access to the Platform at our sole discretion, without notice, for any reason, including violation of these Terms.
        </p>
      </section>

      <section>
        <h2>7. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
        </p>
      </section>
    </LegalLayout>
  );
}
