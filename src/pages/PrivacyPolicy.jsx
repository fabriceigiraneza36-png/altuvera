import React from "react";
import PageHeader from "../components/common/PageHeader";

const LAST_UPDATED = "March 3, 2026";

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "We collect personal information you provide directly, such as your name, email address, phone number, travel preferences, and account details.",
      "We may also collect technical information such as browser type, device information, IP address, and pages visited to improve platform performance and security.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "We use your data to provide and improve our services, process inquiries and bookings, send important trip or account updates, and provide customer support.",
      "When permitted by law, we may send marketing communications. You can opt out at any time.",
    ],
  },
  {
    title: "3. Sharing of Information",
    body: [
      "We do not sell your personal data.",
      "We may share information with trusted service providers and travel partners strictly to fulfill your booking, provide support, process payments, and comply with legal obligations.",
    ],
  },
  {
    title: "4. Cookies and Tracking",
    body: [
      "We use cookies and similar technologies for authentication, analytics, remembering preferences, and improving user experience.",
      "You can manage cookie preferences in your browser settings or via in-app consent controls where available.",
    ],
  },
  {
    title: "5. Data Retention",
    body: [
      "We keep personal information only as long as needed for service delivery, legal compliance, dispute resolution, and legitimate business purposes.",
    ],
  },
  {
    title: "6. Data Security",
    body: [
      "We apply reasonable technical and organizational safeguards to protect your information. No internet transmission or storage system can be guaranteed 100% secure.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal information, and to object to certain uses.",
      "To exercise these rights, contact us using the details below.",
    ],
  },
  {
    title: "8. International Transfers",
    body: [
      "Your information may be processed in countries other than your own. Where required, we apply appropriate safeguards for international data transfers.",
    ],
  },
  {
    title: "9. Contact Us",
    body: [
      "If you have privacy questions or requests, contact us at altuverasafari@gmail.com.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <PageHeader
        title="Privacy Policy"
        subtitle="How Altuvera collects, uses, and protects your information."
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920"
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      <section
        style={{
          background: "#f8fafc",
          padding: "56px 20px 96px",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            boxShadow: "0 8px 30px rgba(2, 44, 34, 0.06)",
            padding: "32px 22px",
          }}
        >
          <p style={{ marginTop: 0, color: "#475569", fontSize: 14 }}>
            Last updated: {LAST_UPDATED}
          </p>

          {sections.map((section) => (
            <article key={section.title} style={{ marginBottom: 22 }}>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 22,
                  fontFamily: "'Playfair Display', serif",
                  color: "#0f172a",
                }}
              >
                {section.title}
              </h2>
              {section.body.map((line) => (
                <p
                  key={line}
                  style={{
                    margin: "0 0 8px",
                    color: "#334155",
                    lineHeight: 1.7,
                    fontSize: 15,
                  }}
                >
                  {line}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
