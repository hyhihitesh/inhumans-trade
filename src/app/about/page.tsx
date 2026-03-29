import { LegalLayout } from "@/components/legal/legal-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Inhumans Trade",
  description: "Official About and Contact page for Inhumans Trade social trading platform.",
};

export default function AboutPage() {
  return (
    <LegalLayout title="About Us" lastUpdated="March 30, 2026">
      <section>
        <h2>1. Mission</h2>
        <p>
          Inhumans Trade is a professional social trading infrastructure that empowers creators and investors. We aim to bring institutional-grade transparency to the retail trading ecosystem by providing verified trading data directly from official broker APIs.
        </p>
      </section>

      <section>
        <h2>2. Our Service</h2>
        <p>
          Our platform bridge the gap between skilled traders (Creators) and their audience (Followers). 
        </p>
        <ul>
          <li><strong>Verified Trades:</strong> We automatically ingest and verify every trade through official broker connections.</li>
          <li><strong>Institutional Grade:</strong> Our feed and analysis tools are built for high-performance trading environments.</li>
          <li><strong>Social Infrastructure:</strong> We provide the software layer for creators to build their trading communities securely.</li>
        </ul>
      </section>

      <section>
        <h2>3. Company</h2>
        <p>
          Inhumans Trade is an Indian business dedicated to financial technology and software development. 
        </p>
        <ul>
          <li><strong>Founder:</strong> Hitesh G S</li>
          <li><strong>Location:</strong> Bangalore, Karnataka, India</li>
        </ul>
      </section>

      <section>
        <h2>4. Contact Us</h2>
        <p>
          We are committed to providing exceptional support and transparency. For all inquiries, please reach out through the following channels:
        </p>
        <ul>
          <li><strong>General Inquiries:</strong> support@inhumans.io</li>
          <li><strong>Media & Partnerships:</strong> partners@inhumans.io</li>
        <li><strong>Compliance:</strong> compliance@inhumans.io</li>
        </ul>
      </section>

      <section>
        <h2>5. Business Address</h2>
        <address className="not-italic bg-slate-50 p-6 border border-slate-200 rounded-lg text-slate-700">
          Inhumans Trade<br />
          Mandya, Karnataka<br />
          India
        </address>
      </section>
    </LegalLayout>
  );
}
