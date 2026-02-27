import React from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiShield,
} from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";

const AltuveraPaymentTermsContent = () => {
  const terms = [
    {
      icon: FiCheckCircle,
      title: "Booking Deposit",
      text: "A 30% deposit confirms your reservation. The remaining balance is due 30 days before departure.",
    },
    {
      icon: FiClock,
      title: "Final Payment Deadline",
      text: "For bookings made within 30 days of travel, full payment is required at the time of booking.",
    },
    {
      icon: FiAlertCircle,
      title: "Cancellation Terms",
      text: "Cancellation charges vary by notice period and partner commitments. Exact details are listed in your quote.",
    },
    {
      icon: FiShield,
      title: "Secure Transactions",
      text: "All payments are processed through secure channels. Please retain your payment confirmation records.",
    },
  ];

  const styles = {
    section: {
      padding: "90px 24px",
      background:
        "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 45%, #ECFDF5 100%)",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    intro: {
      textAlign: "center",
      marginBottom: "44px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(30px, 4.8vw, 44px)",
      color: "#064E3B",
      marginBottom: "10px",
    },
    subtitle: {
      color: "#4B5563",
      fontSize: "16px",
      maxWidth: "760px",
      margin: "0 auto",
      lineHeight: "1.8",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "22px",
      marginBottom: "36px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "18px",
      border: "1px solid #D1FAE5",
      padding: "24px",
      boxShadow: "0 10px 26px rgba(5, 150, 105, 0.1)",
      transition: "all 0.25s ease",
    },
    iconWrap: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      backgroundColor: "#DCFCE7",
      color: "#047857",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "14px",
    },
    cardTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "22px",
      color: "#111827",
      marginBottom: "8px",
    },
    cardText: {
      color: "#4B5563",
      fontSize: "14px",
      lineHeight: "1.7",
    },
    note: {
      backgroundColor: "white",
      border: "1px solid #A7F3D0",
      borderRadius: "16px",
      padding: "18px 20px",
      color: "#065F46",
      fontSize: "14px",
      lineHeight: "1.7",
      marginBottom: "48px",
    },
    // Styles for the legal terms section
    legalSection: {
      marginTop: "60px",
      borderTop: "2px solid #A7F3D0",
      paddingTop: "40px",
    },
    legalTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(24px, 4vw, 32px)",
      color: "#064E3B",
      marginBottom: "24px",
      textAlign: "center",
    },
    legalCard: {
      backgroundColor: "white",
      borderRadius: "18px",
      border: "1px solid #D1FAE5",
      padding: "32px",
      boxShadow: "0 10px 26px rgba(5, 150, 105, 0.1)",
    },
    legalText: {
      color: "#374151",
      fontSize: "15px",
      lineHeight: "1.7",
    },
    paragraph: {
      marginBottom: "20px",
    },
    list: {
      listStyle: "none",
      paddingLeft: "0",
      marginTop: "10px",
    },
    listItem: {
      marginBottom: "12px",
      paddingLeft: "24px",
      position: "relative",
    },
    listItemBold: {
      fontWeight: "600",
      color: "#065F46",
    },
    listItemContent: {
      display: "block",
    },
  };

  // Legal text content with "Altuvera" replacement
  const legalTermsContent = (
    <>
      <p style={styles.paragraph}>
        Altuvera is an EastAfrican Adventure Tourism Company which is offering tours to the democratic republic of congo, Uganda, Rwanda, Kenya & Tanzania with the option of multi-country safaris.
      </p>
      <p style={styles.paragraph}>
        Altuvera undertakes to provide all services offered subject to the terms and conditions stipulated below. These terms and conditions are accepted by the client when the deposit is paid. Please note these terms and conditions apply to Congo safaris, Rwanda Safaris, Uganda Safaris, Tanzania Safaris, and Kenya-based tours.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>1. Contract</h4>
      <p style={styles.paragraph}>
        The contract is between Altuvera – and any person (client) traveling or intending to travel on an itinerary. The contract, including all matters arising from it, is subject to Ugandan law and the exclusive jurisdiction of the Ugandan Courts. Altuvera has the sole authority to vary or omit any of these terms.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>2. How to Book</h4>
      <p style={styles.paragraph}>
        To secure a booking, Altuvera requires a completed Booking Form or e-mail, sent by the client, or the parent/legal guardian (if the client is under 18 years), and payment details (if a credit card is the preferred method of payment we require a number, expiry date, name on card) via our secure authorization form that will be sent to you by the reservation department. A booking is valid from the date Altuvera confirms acceptance in writing. Altuvera reserves the right to decline any booking at their discretion.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>3. Payment</h4>
      <p style={styles.paragraph}>
        Confirmed bookings require a deposit of 30% of total tour cost to cover safari activities like Gorilla permits, chimpanzee permit, Nyiragongo permit. The balance of all monies due, including any surcharges must be paid to Altuvera no later than 10-15 days prior to departure if your paying by credit card or payment made cash upon the commencement of the safari. In the case of non-payment of the balance by the due date, Altuvera will treat the client that he will pay the balance cash upon arrival. Please note that there is a 4% loading fee for all payments made by Visa and Master card credit cards.
      </p>
      <p style={styles.paragraph}>
        <strong>Note:</strong> All payments are received by Altuvera Account in Uganda Kampala.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>4. Travel Information</h4>
      <p style={styles.paragraph}>
        On receipt of full payment travel information will be forwarded by e-mail. This will include: confirmation, detailed itinerary, booking references and Name of the tour leader for your safari and the Tour guide.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>5. Fee Alterations of the booking</h4>
      <p style={styles.paragraph}>
        Altuvera will offer free alteration of the tour but some charges may apply like on changing gorilla permit, Chimpanzee permit. plus any additional costs incurred will be charged if a confirmed booking is changed or transferred.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>6. Cancellations</h4>
      <p style={styles.paragraph}>
        If it becomes necessary to cancel your holiday, you must notify Altuvera immediately in writing. Cancellation will take effect upon receipt by Altuvera of your written notice. An initial deposit of 30% of the total with your booking is not refundable.
      </p>
      <p style={styles.paragraph}>
        <strong>Cancellation Fees:</strong>
      </p>
      <p style={styles.paragraph}>
        The cancellation penalty depends on the number of days before tour departure:
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>60 -100 days 10% off safari Cost</li>
        <li style={styles.listItem}>59 – 32 days 25% off safari Cost</li>
        <li style={styles.listItem}>31 – 8 days 50% off safari Cost</li>
        <li style={styles.listItem}>7 – 3 days 75% off safari Cost</li>
        <li style={styles.listItem}>48 hours or less prior to arrival 100% tour cost</li>
      </ul>
      <p style={styles.paragraph}>
        <strong>Please Note:</strong>
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>Gorilla permits and chimpanzee permits are 100% non-refundable by UWA, RDB & ICCN.</li>
        <li style={styles.listItem}>There will be no refund for any unused services, late arrival or no-show of any of the members of the tour.</li>
        <li style={styles.listItem}>We strongly recommend that you take out travel insurance, including cancellation insurance!</li>
        <li style={styles.listItem}>Altuvera reserves the right to cancel tours at any time. In such event Altuvera will return all monies paid or offer an alternative tour.</li>
        <li style={styles.listItem}>Altuvera is not liable for any penalty charges associated with connecting air fares, in the event of a change to a tour departure time, date or cancellation.</li>
      </ul>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>7. Complaints</h4>
      <p style={styles.paragraph}>
        In the unlikely event that a client has a complaint about any of the travel arrangements, they must advise Altuvera staff member at the time and inform Altuvera in writing or via phone call. This will assist settlement of any grievance or complaint.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>8. Insurance</h4>
      <p style={styles.paragraph}>
        Altuvera recommends clients take out travel, health and cancellation insurances and accident insurance. Altuvera accepts no liability for personal injuries and losses.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>9. Prices</h4>
      <p style={styles.paragraph}>
        All accommodation prices are gross as indicated in the booking form. All prices include Local Government tax like Uganda is 18%, Congo 16%, Rwanda 18%.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>10. Changes to Tours</h4>
      <p style={styles.paragraph}>
        Adverse weather conditions may from time to time prevent the completion of advertised programs. The decision is normally made by the tour leader/Tour Guide at the time and is made in the best interests of the group and their safety. Altuvera cannot be held responsible for these changes.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>11. Refunds</h4>
      <p style={styles.paragraph}>
        No refunds will be made once travel has commenced: nor will any refund be available in respect of any tours, accommodation, hires, services or inclusions not utilized. We strongly recommend travel insurance cover for such eventualities. Weather interruptions to itineraries/tour packages are beyond our control. We will do all possible to rearrange services in such event, but cannot be held financially responsible for interruption under such circumstances. We strongly recommend travel insurance cover for such eventualities.
      </p>

      <h4 style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "28px", marginBottom: "12px" }}>12. Other Conditions</h4>
      <p style={styles.paragraph}>
        Altuvera as operator or agent finalizes all arrangements for these tours on the express condition that it shall not be held liable for any injury, loss, accident, delay or irregularity which may be occasioned either by reason of any defect in any vehicle, vessel or equipment or by Acts of God or through the acts of default of any company or person engaged in conveying the passengers or in carrying out our arrangements of the tours or otherwise in connection herewith.
      </p>
    </>
  );

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <AnimatedSection animation="fadeInUp">
          <div style={styles.intro}>
            <h2 style={styles.title}>Payment Terms</h2>
            <p style={styles.subtitle}>
              These terms provide a clear payment timeline and expectations for
              all confirmed trips. Final partner-specific conditions are always
              included in your booking confirmation.
            </p>
          </div>
        </AnimatedSection>

        <div style={styles.grid}>
          {terms.map((item, index) => (
            <AnimatedSection
              key={item.title}
              animation="fadeInUp"
              delay={index * 0.08}
            >
              <article
                style={styles.card}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={styles.iconWrap}>
                  <item.icon size={20} />
                </div>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardText}>{item.text}</p>
              </article>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fadeInUp">
          <div style={styles.note}>
            Terms may be adjusted for group packages, custom itineraries, and
            third-party partner requirements. Contact our team before payment if
            you need a country-specific invoice or payment schedule.
          </div>
        </AnimatedSection>

        {/* New Legal Terms Section */}
        <AnimatedSection animation="fadeInUp">
          <div style={styles.legalSection}>
            <h3 style={styles.legalTitle}>Complete Terms & Conditions</h3>
            <div style={styles.legalCard}>
              <div style={styles.legalText}>
                {legalTermsContent}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default AltuveraPaymentTermsContent;