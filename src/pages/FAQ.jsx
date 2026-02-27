import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiMessageCircle } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'booking', name: 'Booking & Payment' },
    { id: 'travel', name: 'Travel Logistics' },
    { id: 'safety', name: 'Health & Safety' },
    { id: 'experiences', name: 'Experiences' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How far in advance should I book my trip?',
      answer: 'We recommend booking at least 3-6 months in advance, especially for peak season travel (July-October, December-February) and gorilla permits. For flexible dates and fewer crowds, shoulder seasons can be booked with shorter notice.',
    },
    {
      id: 2,
      category: 'booking',
      question: 'What is your payment and cancellation policy?',
      answer: 'We require a 30% deposit to confirm your booking, with the balance due 60 days before departure. Our cancellation policy offers full refunds (minus admin fees) for cancellations more than 60 days out, 50% refund for 30-60 days, and no refund within 30 days. We strongly recommend travel insurance.',
    },
    {
      id: 3,
      category: 'booking',
      question: 'Can you customize itineraries?',
      answer: 'Absolutely! Every Altuvera journey is tailored to your preferences. Our travel specialists work with you to create the perfect itinerary based on your interests, timeframe, and budget. We can combine multiple countries, add extensions, or focus on specific interests like photography or birding.',
    },
    {
      id: 4,
      category: 'travel',
      question: 'What should I pack for an East African safari?',
      answer: 'Pack light, neutral-colored clothing (khaki, olive, tan), layers for variable temperatures, comfortable walking shoes, a warm jacket for early morning drives, sun protection, and binoculars. Most lodges offer laundry services. Remember soft-sided luggage for bush flights with strict weight limits (usually 15-20kg).',
    },
    {
      id: 5,
      category: 'travel',
      question: 'Do I need a visa to visit East African countries?',
      answer: 'Most visitors require visas, which can often be obtained on arrival or through e-visa systems. The East Africa Tourist Visa covers Kenya, Uganda, and Rwanda. We provide detailed visa guidance for each destination and can assist with the application process.',
    },
    {
      id: 6,
      category: 'travel',
      question: 'What is the best time to visit East Africa?',
      answer: 'The dry seasons (June-October and January-February) are generally best for wildlife viewing. However, each season offers unique experiences: July-October for the Great Migration, January-March for calving season, and green season for lower prices, fewer crowds, and excellent birding.',
    },
    {
      id: 7,
      category: 'safety',
      question: 'What vaccinations do I need?',
      answer: 'Yellow Fever vaccination is mandatory for many East African countries and may be required for entry. Other recommended vaccinations include Hepatitis A & B, Typhoid, and routine vaccinations. Malaria prophylaxis is essential. Consult a travel clinic 6-8 weeks before departure.',
    },
    {
      id: 8,
      category: 'safety',
      question: 'Is it safe to travel in East Africa?',
      answer: 'East Africa has a strong tourism infrastructure and excellent safety record for visitors. Our experienced guides, trusted partners, and 24/7 support ensure your safety throughout. We continuously monitor conditions and adjust itineraries if needed. Travel insurance with emergency evacuation coverage is essential.',
    },
    {
      id: 9,
      category: 'experiences',
      question: 'How do gorilla permits work?',
      answer: 'Gorilla permits must be pre-booked and are limited to protect the gorillas. Rwanda permits cost $1,500 and Uganda permits $700. Permits sell out months in advance during peak season. We handle the booking process and recommend securing permits as early as possible.',
    },
    {
      id: 10,
      category: 'experiences',
      question: 'What is the difficulty level for Kilimanjaro?',
      answer: 'Kilimanjaro requires no technical climbing skills but demands good physical fitness. Success rates vary by route and are highest with longer itineraries allowing proper acclimatization. We recommend the 7-8 day Machame or Lemosho routes. Pre-trip training with cardio and hiking is essential.',
    },
    {
      id: 11,
      category: 'experiences',
      question: 'Are children allowed on safari?',
      answer: 'Many lodges welcome children, and family safaris can be magical experiences. Age restrictions may apply for certain activities (gorilla trekking requires children to be 15+). We can recommend family-friendly lodges, shorter game drives, and engaging activities for young travelers.',
    },
    {
      id: 12,
      category: 'booking',
      question: 'What\'s included in your safari packages?',
      answer: 'Our packages typically include all accommodations, meals as specified, ground transportation in 4x4 vehicles, park fees, guide services, and airport transfers. International flights, visas, travel insurance, premium drinks, and gratuities are usually not included. Each quote is itemized for transparency.',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const styles = {
    section: {
      padding: '60px 24px 120px',
      backgroundColor: '#F0FDF4',
      minHeight: '100vh',
    },
    container: {
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '50px',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '42px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '16px',
    },
    subtitle: {
      fontSize: '18px',
      color: '#6B7280',
      marginBottom: '40px',
    },
    searchBox: {
      position: 'relative',
      maxWidth: '500px',
      margin: '0 auto 30px',
    },
    searchIcon: {
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280',
    },
    searchInput: {
      width: '100%',
      padding: '18px 20px 18px 55px',
      fontSize: '16px',
      border: '2px solid #E5E7EB',
      borderRadius: '16px',
      backgroundColor: 'white',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
    },
    categories: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    categoryTab: {
      padding: '12px 24px',
      borderRadius: '30px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    faqList: {
      marginTop: '40px',
    },
    faqItem: {
      backgroundColor: 'white',
      borderRadius: '20px',
      marginBottom: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    faqHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '28px 30px',
      cursor: 'pointer',
    },
    faqQuestion: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '18px',
      fontWeight: '600',
      color: '#1a1a1a',
      flex: 1,
      paddingRight: '20px',
    },
    faqToggle: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      backgroundColor: '#F0FDF4',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#059669',
      transition: 'all 0.3s ease',
      flexShrink: 0,
    },
    faqAnswer: {
      padding: '0 30px 28px',
      fontSize: '15px',
      color: '#4B5563',
      lineHeight: '1.8',
      borderTop: '1px solid #E5E7EB',
      paddingTop: '20px',
    },
    altuvераLine: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      background: 'linear-gradient(180deg, #059669 0%, #10B981 100%)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    ctaSection: {
      marginTop: '60px',
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '50px',
      textAlign: 'center',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    },
    ctaIcon: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      margin: '0 auto 24px',
    },
    ctaTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '28px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '12px',
    },
    ctaText: {
      fontSize: '16px',
      color: '#6B7280',
      marginBottom: '24px',
    },
  };

  return (
    <div>
      <PageHeader 
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about traveling with Altuvera."
        backgroundImage="https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1920"
        breadcrumbs={[{ label: 'FAQ' }]}
      />

      <section style={styles.section}>
        <div style={styles.container}>
          <AnimatedSection animation="fadeInUp">
            <div style={styles.header}>
              <h2 style={styles.title}>How Can We Help?</h2>
              <p style={styles.subtitle}>
                Browse our frequently asked questions or search for specific topics.
              </p>

              <div style={styles.searchBox}>
                <FiSearch size={20} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                  onFocus={(e) => e.target.style.borderColor = '#059669'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div style={styles.categories}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    style={{
                      ...styles.categoryTab,
                      backgroundColor: selectedCategory === category.id ? '#059669' : 'white',
                      color: selectedCategory === category.id ? 'white' : '#1a1a1a',
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <div style={styles.faqList}>
            {filteredFaqs.map((faq, index) => (
              <AnimatedSection key={faq.id} animation="fadeInUp" delay={index * 0.05}>
                <div 
                  style={styles.faqItem}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 35px rgba(5, 150, 105, 0.12)';
                    e.currentTarget.querySelector('.altuvera-line').style.opacity = '1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.querySelector('.altuvera-line').style.opacity = '0';
                  }}
                >
                  <div style={styles.altuvераLine} className="altuvera-line"></div>
                  <div 
                    style={styles.faqHeader}
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    <h3 style={styles.faqQuestion}>{faq.question}</h3>
                    <button 
                      style={{
                        ...styles.faqToggle,
                        backgroundColor: expandedFaq === faq.id ? '#059669' : '#F0FDF4',
                        color: expandedFaq === faq.id ? 'white' : '#059669',
                      }}
                    >
                      {expandedFaq === faq.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                  </div>
                  {expandedFaq === faq.id && (
                    <div style={styles.faqAnswer}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* CTA Section */}
          <AnimatedSection animation="fadeInUp">
            <div style={styles.ctaSection}>
              <div style={styles.ctaIcon}>
                <FiMessageCircle size={30} />
              </div>
              <h3 style={styles.ctaTitle}>Still Have Questions?</h3>
              <p style={styles.ctaText}>
                Our team is here to help you plan your perfect East African adventure.
              </p>
              <Button to="/contact" variant="primary">Contact Us</Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default FAQ;