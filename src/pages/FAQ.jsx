import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiMessageCircle, FiHelpCircle } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { toAbsoluteUrl } from '../utils/seo';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const answerRefs = useRef({});

  const categories = [
    { id: 'all', name: 'All Questions', icon: '📋', count: 12 },
    { id: 'booking', name: 'Booking & Payment', icon: '💳', count: 4 },
    { id: 'travel', name: 'Travel Logistics', icon: '✈️', count: 3 },
    { id: 'safety', name: 'Health & Safety', icon: '🛡️', count: 2 },
    { id: 'experiences', name: 'Experiences', icon: '🌍', count: 3 },
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How far in advance should I book my trip?',
      answer:
        'We recommend booking at least 3-6 months in advance, especially for peak season travel (July-October, December-February) and gorilla permits. For flexible dates and fewer crowds, shoulder seasons can be booked with shorter notice.',
    },
    {
      id: 2,
      category: 'booking',
      question: 'What is your payment and cancellation policy?',
      answer:
        'We require a 30% deposit to confirm your booking, with the balance due 60 days before departure. Our cancellation policy offers full refunds (minus admin fees) for cancellations more than 60 days out, 50% refund for 30-60 days, and no refund within 30 days. We strongly recommend travel insurance.',
    },
    {
      id: 3,
      category: 'booking',
      question: 'Can you customize itineraries?',
      answer:
        'Absolutely! Every Altuvera journey is tailored to your preferences. Our travel specialists work with you to create the perfect itinerary based on your interests, timeframe, and budget. We can combine multiple countries, add extensions, or focus on specific interests like photography or birding.',
    },
    {
      id: 4,
      category: 'travel',
      question: 'What should I pack for an East African safari?',
      answer:
        'Pack light, neutral-colored clothing (khaki, olive, tan), layers for variable temperatures, comfortable walking shoes, a warm jacket for early morning drives, sun protection, and binoculars. Most lodges offer laundry services. Remember soft-sided luggage for bush flights with strict weight limits (usually 15-20kg).',
    },
    {
      id: 5,
      category: 'travel',
      question: 'Do I need a visa to visit East African countries?',
      answer:
        'Most visitors require visas, which can often be obtained on arrival or through e-visa systems. The East Africa Tourist Visa covers Kenya, Uganda, and Rwanda. We provide detailed visa guidance for each destination and can assist with the application process.',
    },
    {
      id: 6,
      category: 'travel',
      question: 'What is the best time to visit East Africa?',
      answer:
        'The dry seasons (June-October and January-February) are generally best for wildlife viewing. However, each season offers unique experiences: July-October for the Great Migration, January-March for calving season, and green season for lower prices, fewer crowds, and excellent birding.',
    },
    {
      id: 7,
      category: 'safety',
      question: 'What vaccinations do I need?',
      answer:
        'Yellow Fever vaccination is mandatory for many East African countries and may be required for entry. Other recommended vaccinations include Hepatitis A & B, Typhoid, and routine vaccinations. Malaria prophylaxis is essential. Consult a travel clinic 6-8 weeks before departure.',
    },
    {
      id: 8,
      category: 'safety',
      question: 'Is it safe to travel in East Africa?',
      answer:
        'East Africa has a strong tourism infrastructure and excellent safety record for visitors. Our experienced guides, trusted partners, and 24/7 support ensure your safety throughout. We continuously monitor conditions and adjust itineraries if needed. Travel insurance with emergency evacuation coverage is essential.',
    },
    {
      id: 9,
      category: 'experiences',
      question: 'How do gorilla permits work?',
      answer:
        'Gorilla permits must be pre-booked and are limited to protect the gorillas. Rwanda permits cost $1,500 and Uganda permits $700. Permits sell out months in advance during peak season. We handle the booking process and recommend securing permits as early as possible.',
    },
    {
      id: 10,
      category: 'experiences',
      question: 'What is the difficulty level for Kilimanjaro?',
      answer:
        'Kilimanjaro requires no technical climbing skills but demands good physical fitness. Success rates vary by route and are highest with longer itineraries allowing proper acclimatization. We recommend the 7-8 day Machame or Lemosho routes. Pre-trip training with cardio and hiking is essential.',
    },
    {
      id: 11,
      category: 'experiences',
      question: 'Are children allowed on safari?',
      answer:
        'Many lodges welcome children, and family safaris can be magical experiences. Age restrictions may apply for certain activities (gorilla trekking requires children to be 15+). We can recommend family-friendly lodges, shorter game drives, and engaging activities for young travelers.',
    },
    {
      id: 12,
      category: 'booking',
      question: "What's included in your safari packages?",
      answer:
        'Our packages typically include all accommodations, meals as specified, ground transportation in 4x4 vehicles, park fees, guide services, and airport transfers. International flights, visas, travel insurance, premium drinks, and gratuities are usually not included. Each quote is itemized for transparency.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            background: 'linear-gradient(120deg, #d1fae5 0%, #a7f3d0 100%)',
            padding: '1px 4px',
            borderRadius: '3px',
            color: '#065f46',
            fontWeight: '600',
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div>
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about Altuvera safaris: booking, payment, travel logistics, health & safety, and more."
        keywords={["FAQ", "travel questions", "safari booking", "travel advice", "East Africa"]}
        url="/faq"
        type="website"
        structuredData={faqJsonLd}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "FAQ", url: "/faq" }
        ]}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .faq-section {
          padding: 60px 24px 100px;
          background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 30%, #f8fffe 60%, #f0fdf4 100%);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .faq-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 15% 20%, rgba(5, 150, 105, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 85% 60%, rgba(16, 185, 129, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(5, 150, 105, 0.03) 0%, transparent 40%);
          pointer-events: none;
        }

        .faq-container {
          max-width: 920px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 56px;
        }

        .faq-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(16, 185, 129, 0.08));
          border: 1px solid rgba(5, 150, 105, 0.15);
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          color: #059669;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .faq-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 16px;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }

        .faq-title-accent {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .faq-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 18px;
          color: #64748b;
          max-width: 520px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }

        /* Search Box */
        .faq-search-wrapper {
          position: relative;
          max-width: 560px;
          margin: 0 auto 36px;
        }

        .faq-search-icon {
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          transition: color 0.3s ease;
          z-index: 2;
        }

        .faq-search-wrapper.focused .faq-search-icon {
          color: #059669;
        }

        .faq-search-input {
          width: 100%;
          padding: 20px 24px 20px 58px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          background: white;
          outline: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          color: #1e293b;
        }

        .faq-search-input::placeholder {
          color: #94a3b8;
        }

        .faq-search-input:focus {
          border-color: #059669;
          box-shadow: 0 4px 24px rgba(5, 150, 105, 0.12), 0 0 0 4px rgba(5, 150, 105, 0.06);
        }

        .search-clear {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          color: #64748b;
          transition: all 0.2s ease;
          z-index: 2;
        }

        .search-clear:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* Category Tabs */
        .faq-categories {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .faq-category-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 14px;
          border: 2px solid transparent;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .faq-category-tab.inactive {
          background: white;
          color: #475569;
          border-color: #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .faq-category-tab.inactive:hover {
          border-color: #059669;
          color: #059669;
          background: #f0fdf4;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.1);
        }

        .faq-category-tab.active {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
          transform: translateY(-1px);
        }

        .category-count {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 8px;
          min-width: 20px;
          text-align: center;
        }

        .faq-category-tab.active .category-count {
          background: rgba(255, 255, 255, 0.25);
          color: white;
        }

        .faq-category-tab.inactive .category-count {
          background: #f1f5f9;
          color: #64748b;
        }

        /* FAQ List */
        .faq-list {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-item {
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
        }

        .faq-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #059669 0%, #10b981 50%, #34d399 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 4px 0 0 4px;
        }

        .faq-item:hover {
          box-shadow: 0 8px 32px rgba(5, 150, 105, 0.1);
          border-color: rgba(5, 150, 105, 0.1);
          transform: translateY(-2px);
        }

        .faq-item:hover::before,
        .faq-item.expanded::before {
          opacity: 1;
        }

        .faq-item.expanded {
          box-shadow: 0 12px 40px rgba(5, 150, 105, 0.12);
          border-color: rgba(5, 150, 105, 0.15);
        }

        .faq-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 26px 28px;
          cursor: pointer;
          user-select: none;
          gap: 16px;
        }

        .faq-item-number {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          color: #059669;
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(16, 185, 129, 0.06));
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .faq-item.expanded .faq-item-number {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
        }

        .faq-item-question {
          font-family: 'Inter', sans-serif;
          font-size: 17px;
          font-weight: 650;
          color: #1e293b;
          flex: 1;
          line-height: 1.5;
          transition: color 0.3s ease;
        }

        .faq-item:hover .faq-item-question {
          color: #059669;
        }

        .faq-item-toggle {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 18px;
        }

        .faq-item-toggle.collapsed {
          background: #f0fdf4;
          color: #059669;
        }

        .faq-item-toggle.collapsed:hover {
          background: #d1fae5;
        }

        .faq-item-toggle.open {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .faq-toggle-icon {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
        }

        .faq-toggle-icon.rotated {
          transform: rotate(180deg);
        }

        /* Answer with smooth height animation */
        .faq-answer-wrapper {
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        }

        .faq-answer-wrapper.closed {
          max-height: 0;
          opacity: 0;
        }

        .faq-answer-wrapper.open {
          opacity: 1;
        }

        .faq-answer-content {
          padding: 0 28px 28px 80px;
          font-family: 'Inter', sans-serif;
          font-size: 15.5px;
          color: #475569;
          line-height: 1.85;
          position: relative;
        }

        .faq-answer-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 28px;
          right: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }

        .faq-answer-content p {
          margin: 0;
          padding-top: 20px;
        }

        /* No Results */
        .faq-no-results {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
        }

        .faq-no-results-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }

        .faq-no-results-text {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          margin-bottom: 8px;
          color: #64748b;
          font-weight: 600;
        }

        .faq-no-results-hint {
          font-size: 14px;
          color: #94a3b8;
        }

        /* CTA Section */
        .faq-cta {
          margin-top: 72px;
          background: white;
          border-radius: 28px;
          padding: 56px 40px;
          text-align: center;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(5, 150, 105, 0.06);
          position: relative;
          overflow: hidden;
        }

        .faq-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #059669, #10b981, #34d399, #10b981, #059669);
          background-size: 200% 100%;
          animation: shimmer 3s ease infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .faq-cta-icon-wrapper {
          width: 76px;
          height: 76px;
          border-radius: 24px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 28px;
          box-shadow: 0 12px 32px rgba(5, 150, 105, 0.3);
          transition: transform 0.3s ease;
        }

        .faq-cta:hover .faq-cta-icon-wrapper {
          transform: scale(1.05) rotate(-3deg);
        }

        .faq-cta-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .faq-cta-text {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #64748b;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        /* Result count */
        .faq-result-count {
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 20px;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .faq-section {
            padding: 48px 16px 100px;
          }

          .faq-item-header {
            padding: 20px 20px;
          }

          .faq-answer-content {
            padding: 0 20px 24px 20px;
          }

          .faq-item-number {
            display: none;
          }

          .faq-categories {
            gap: 8px;
          }

          .faq-category-tab {
            padding: 10px 16px;
            font-size: 13px;
          }

          .faq-cta {
            padding: 40px 24px;
          }
        }
      `}</style>

      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about traveling with Altuvera."
        backgroundImage="https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1920"
        breadcrumbs={[{ label: 'FAQ' }]}
      />

      <section className="faq-section">
        <div className="faq-container">
          <AnimatedSection animation="fadeInUp">
            <div className="faq-header">
              <div className="faq-badge">
                <FiHelpCircle size={16} />
                Knowledge Base
              </div>
              <h2 className="faq-title">
                How Can We <span className="faq-title-accent">Help</span>?
              </h2>
              <p className="faq-subtitle">
                Browse our frequently asked questions or search for specific topics
                about your East African adventure.
              </p>

              <div className={`faq-search-wrapper ${searchFocused ? 'focused' : ''}`}>
                <FiSearch size={20} className="faq-search-icon" />
                <input
                  type="text"
                  className="faq-search-input"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')}>
                    ✕
                  </button>
                )}
              </div>

              <div className="faq-categories">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count =
                    cat.id === 'all'
                      ? faqs.length
                      : faqs.filter((f) => f.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      className={`faq-category-tab ${isActive ? 'active' : 'inactive'}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                      <span className="category-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>

          {filteredFaqs.length > 0 && searchQuery && (
            <div className="faq-result-count">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} found
            </div>
          )}

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <AnimatedSection animation="fadeInUp">
                <div className="faq-no-results">
                  <span className="faq-no-results-icon">🔍</span>
                  <div className="faq-no-results-text">No matching questions found</div>
                  <div className="faq-no-results-hint">
                    Try a different search term or category
                  </div>
                </div>
              </AnimatedSection>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === faq.id;
                const answerHeight = answerRefs.current[faq.id]?.scrollHeight || 0;

                return (
                  <AnimatedSection
                    key={faq.id}
                    animation="fadeInUp"
                    delay={index * 0.04}
                  >
                    <div className={`faq-item ${isExpanded ? 'expanded' : ''}`}>
                      <div
                        className="faq-item-header"
                        onClick={() =>
                          setExpandedFaq(isExpanded ? null : faq.id)
                        }
                      >
                        <span className="faq-item-number">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="faq-item-question">
                          {highlightText(faq.question, searchQuery)}
                        </h3>
                        <button
                          className={`faq-item-toggle ${isExpanded ? 'open' : 'collapsed'}`}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <span
                            className={`faq-toggle-icon ${isExpanded ? 'rotated' : ''}`}
                          >
                            <FiChevronDown size={20} />
                          </span>
                        </button>
                      </div>

                      <div
                        className={`faq-answer-wrapper ${isExpanded ? 'open' : 'closed'}`}
                        style={{
                          maxHeight: isExpanded ? `${answerHeight + 60}px` : '0px',
                        }}
                      >
                        <div
                          className="faq-answer-content"
                          ref={(el) => (answerRefs.current[faq.id] = el)}
                        >
                          <p>{highlightText(faq.answer, searchQuery)}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })
            )}
          </div>

          <AnimatedSection animation="fadeInUp">
            <div className="faq-cta">
              <div className="faq-cta-icon-wrapper">
                <FiMessageCircle size={32} />
              </div>
              <h3 className="faq-cta-title">Still Have Questions?</h3>
              <p className="faq-cta-text">
                Our team of travel specialists is here to help you plan your perfect
                East African adventure.
              </p>
              <Button to="/contact" variant="primary">
                Contact Us
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
