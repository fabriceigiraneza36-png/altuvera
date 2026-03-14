import React from "react";
import PageHeader from "../components/common/PageHeader";

const LAST_UPDATED = "March 3, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using Altuvera services, you agree to these Terms of Service. If you do not agree, please do not use our platform.",
    ],
  },
  {
    title: "2. Services and Eligibility",
    body: [
      "Altuvera provides travel-related information, destination content, and booking support services.",
      "You must provide accurate information and be legally able to enter into a binding agreement when creating an account or submitting a booking request.",
    ],
  },
  {
    title: "3. Account Responsibilities",
    body: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
      "Notify us immediately if you suspect unauthorized use.",
    ],
  },
  {
    title: "4. Booking and Payments",
    body: [
      "Booking terms, deposits, payment timelines, cancellation policies, and itinerary confirmations are governed by the specific booking terms presented at checkout or in your booking agreement.",
      "You agree to provide accurate traveler and payment details required to process your booking.",
    ],
  },
  {
    title: "5. Prohibited Conduct",
    body: [
      "You may not misuse the platform, attempt unauthorized access, upload malicious content, infringe intellectual property rights, or engage in unlawful activity.",
    ],
  },
  {
    title: "6. Intellectual Property",
    body: [
      "All website content, including text, branding, logos, visuals, and software elements, is owned by or licensed to Altuvera and protected by applicable laws.",
    ],
  },
  {
    title: "7. Third-Party Services",
    body: [
      "Some services may involve third-party providers (e.g., payment processors, travel operators). Their services are subject to their own terms and policies.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      "To the extent allowed by law, Altuvera is not liable for indirect, incidental, special, or consequential damages arising from your use of the platform or third-party travel services.",
    ],
  },
  {
    title: "9. Indemnification",
    body: [
      "You agree to indemnify and hold Altuvera harmless from claims, losses, and expenses resulting from your misuse of the platform, breach of these terms, or violation of law.",
    ],
  },
  {
    title: "10. Changes to Terms",
    body: [
      "We may update these terms periodically. Continued use after updates constitutes acceptance of the revised terms.",
    ],
  },
  {
    title: "11. Governing Law",
    body: [
      "These terms are governed by applicable laws in the jurisdictions where Altuvera operates, unless otherwise required by consumer protection laws.",
    ],
  },
  {
    title: "12. Contact",
    body: ["For terms-related questions, contact altuverasafari@gmail.com."],
  },
];

export default function TermsOfService() {
  return (
    <div>
      <PageHeader
        title="Terms of Service"
        subtitle="The legal terms governing use of Altuvera services."
        backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920"
        breadcrumbs={[{ label: "Terms of Service" }]}
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
