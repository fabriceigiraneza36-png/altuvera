import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin, FiArrowRight, FiCheck } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setIsSubmitting(false);
      setEmail('');
    }, 1000);
  };

  const currentYear = new Date().getFullYear();
  const isMobile = viewportWidth <= 640;
  const isTablet = viewportWidth <= 1024;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const styles = {
    footer: {
      backgroundColor: '#022C22',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    },
    pattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '200px',
      background: 'linear-gradient(180deg, rgba(5, 150, 105, 0.1) 0%, transparent 100%)',
      pointerEvents: 'none',
    },
    topSection: {
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      padding: '60px 24px',
      position: 'relative',
    },
    topContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '40px',
      alignItems: 'center',
    },
    topContent: {},
    topTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '32px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '12px',
    },
    topText: {
      fontSize: '16px',
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: '1.7',
    },
    subscribeForm: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    subscribeInput: {
      flex: '1',
      minWidth: '250px',
      padding: '18px 24px',
      borderRadius: '14px',
      border: 'none',
      fontSize: '15px',
      outline: 'none',
      backgroundColor: 'white',
      color: '#1a1a1a',
      boxSizing: 'border-box',
    },
    subscribeButton: {
      padding: '18px 32px',
      backgroundColor: '#022C22',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
    },
    successMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '18px 24px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '14px',
      color: 'white',
      fontWeight: '600',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile
        ? '56px 16px calc(26px + env(safe-area-inset-bottom, 0px))'
        : isTablet
          ? '68px 20px 34px'
          : '80px 24px 40px',
      position: 'relative',
      zIndex: 1,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: isMobile ? '28px' : isTablet ? '38px' : '48px',
      marginBottom: isMobile ? '34px' : '60px',
    },
    column: {},
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
    },
    logoIcon: {
      width: isMobile ? '46px' : '52px',
      height: isMobile ? '46px' : '52px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: isMobile ? '20px' : '22px',
      fontWeight: '700',
      fontFamily: "'Playfair Display', serif",
    },
    logoText: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? '26px' : '30px',
      fontWeight: '700',
      color: 'white',
    },
    tagline: {
      fontSize: isMobile ? '14px' : '15px',
      color: 'rgba(255,255,255,0.7)',
      marginBottom: isMobile ? '18px' : '24px',
      lineHeight: '1.7',
    },
    socialLinks: {
      display: 'flex',
      gap: isMobile ? '10px' : '12px',
    },
    socialLink: {
      width: isMobile ? '46px' : '44px',
      height: isMobile ? '46px' : '44px',
      borderRadius: '12px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: 'none',
    },
    columnTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: '600',
      marginBottom: isMobile ? '16px' : '24px',
      color: 'white',
    },
    linksList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    linkItem: {
      marginBottom: isMobile ? '10px' : '14px',
    },
    link: {
      color: 'rgba(255,255,255,0.7)',
      textDecoration: 'none',
      fontSize: isMobile ? '14px' : '15px',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: isMobile ? '34px' : 'auto',
    },
    contactItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: isMobile ? '12px' : '14px',
      marginBottom: isMobile ? '14px' : '20px',
    },
    contactIcon: {
      width: isMobile ? '42px' : '40px',
      height: isMobile ? '42px' : '40px',
      borderRadius: '10px',
      backgroundColor: 'rgba(5, 150, 105, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#10B981',
      flexShrink: 0,
    },
    contactText: {
      fontSize: isMobile ? '14px' : '15px',
      color: 'rgba(255,255,255,0.8)',
      lineHeight: '1.6',
    },
    divider: {
      height: '1px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginBottom: '30px',
    },
    bottom: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'flex-start' : 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '14px' : '20px',
    },
    copyright: {
      fontSize: isMobile ? '13px' : '14px',
      color: 'rgba(255,255,255,0.6)',
    },
    bottomLinks: {
      display: 'flex',
      gap: isMobile ? '14px' : '24px',
      flexWrap: 'wrap',
    },
    bottomLink: {
      color: 'rgba(255,255,255,0.6)',
      textDecoration: 'none',
      fontSize: isMobile ? '13px' : '14px',
      transition: 'color 0.3s ease',
      minHeight: isMobile ? '30px' : 'auto',
    },
    certifications: {
      display: 'flex',
      gap: isMobile ? '10px' : '16px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    certBadge: {
      padding: isMobile ? '8px 12px' : '8px 16px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '8px',
      fontSize: isMobile ? '11px' : '12px',
      color: '#10B981',
      fontWeight: '600',
    },
  };

  const countries = [
    { name: 'Kenya', path: '/country/kenya' },
    { name: 'Tanzania', path: '/country/tanzania' },
    { name: 'Uganda', path: '/country/uganda' },
    { name: 'Rwanda', path: '/country/rwanda' },
    { name: 'Ethiopia', path: '/country/ethiopia' },
    
  ];

  const quickLinks = [
    { name: 'Destinations', path: '/destinations' },
    { name: 'Services', path: '/services' },
    { name: 'Virtual Tours', path: '/virtual-tour' },
    { name: 'Travel Tips', path: '/tips' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'FAQ', path: '/faq' },
  ];

  const socialIcons = [
    { icon: FiFacebook, label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61585299893450' },
    { icon: FiTwitter, label: 'Twitter', url: '#' },
    { icon: FiInstagram, label: 'Instagram', url: 'https://www.instagram.com/altu.vera1/' },
    { icon: FiYoutube, label: 'YouTube', url: '#' },
  ];

  return (
    <footer style={styles.footer}>

      <div style={styles.pattern}></div>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.column}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>A</div>
              <span style={styles.logoText}>Altuvera</span>
            </div>
            <p style={styles.tagline}>
              "True adventure in High & Deep Culture"
              <br /><br />
              Your gateway to extraordinary East African experiences. We craft journeys that transform, inspire, and create lasting memories.
            </p>
            <div style={styles.socialLinks}>
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.label}
                  style={styles.socialLink}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Destinations</h3>
            <ul style={styles.linksList}>
              {countries.map((country) => (
                <li key={country.name} style={styles.linkItem}>
                  <Link 
                    to={country.path} 
                    style={styles.link}
                    onMouseOver={(e) => e.target.style.color = '#10B981'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    {country.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Quick Links</h3>
            <ul style={styles.linksList}>
              {quickLinks.map((link) => (
                <li key={link.name} style={styles.linkItem}>
                  <Link 
                    to={link.path} 
                    style={styles.link}
                    onMouseOver={(e) => e.target.style.color = '#10B981'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Contact Us</h3>
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <FiMapPin size={18} />
              </div>
              <span style={styles.contactText}>
                Altuvera House, Safari Way<br />
                Nairobi, Kenya
              </span>
            </div>
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <FiPhone size={18} />
              </div>
              <span style={styles.contactText}>
                +254 700 123 456<br />
                +254 733 987 654
              </span>
            </div>
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <FiMail size={18} />
              </div>
              <span style={styles.contactText}>
                info@altuvera.com<br />
                bookings@altuvera.com
              </span>
            </div>
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {currentYear} Altuvera. All rights reserved. Crafted with passion for East Africa.
          </p>
          <div style={styles.certifications}>
            <span style={styles.certBadge}>🌱 Eco-Certified</span>
            <span style={styles.certBadge}>⭐ ATTA Member</span>
          </div>
          <div style={styles.bottomLinks}>
            <Link 
              to="/privacy" 
              style={styles.bottomLink}
              onMouseOver={(e) => e.target.style.color = '#10B981'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              style={styles.bottomLink}
              onMouseOver={(e) => e.target.style.color = '#10B981'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
            >
              Terms of Service
            </Link>
            <Link 
              to="/cookies" 
              style={styles.bottomLink}
              onMouseOver={(e) => e.target.style.color = '#10B981'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
