import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiArrowLeft, FiShare2, FiHeart, FiTwitter, FiFacebook } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { posts } from '../data/posts';

const PostDetail = () => {
  const { slug } = useParams();
  const post = posts.find(p => p.slug === slug);
  const relatedPosts = posts.filter(p => p.slug !== slug && p.category === post?.category).slice(0, 3);

  if (!post) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '40px'
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', marginBottom: '20px' }}>
          Post Not Found
        </h1>
        <Button to="/posts" variant="primary">View All Posts</Button>
      </div>
    );
  }

  const styles = {
    section: {
      padding: '60px 24px 120px',
      backgroundColor: 'white',
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    backLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#059669',
      textDecoration: 'none',
      fontWeight: '600',
      marginBottom: '40px',
    },
    header: {
      marginBottom: '40px',
    },
    category: {
      display: 'inline-block',
      padding: '8px 20px',
      backgroundColor: '#D1FAE5',
      borderRadius: '30px',
      color: '#059669',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '20px',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '48px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '24px',
      lineHeight: '1.2',
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: '30px',
      flexWrap: 'wrap',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '15px',
      color: '#6B7280',
    },
    author: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    authorAvatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    authorName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    featuredImage: {
      width: '100%',
      height: '450px',
      objectFit: 'cover',
      borderRadius: '24px',
      marginBottom: '40px',
    },
    content: {
      fontSize: '18px',
      color: '#4B5563',
      lineHeight: '2',
      marginBottom: '50px',
    },
    shareSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '30px 0',
      borderTop: '1px solid #E5E7EB',
      borderBottom: '1px solid #E5E7EB',
      marginBottom: '50px',
    },
    shareLabel: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    shareButtons: {
      display: 'flex',
      gap: '12px',
    },
    shareButton: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: '2px solid #E5E7EB',
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '50px',
    },
    tag: {
      padding: '8px 18px',
      backgroundColor: '#F0FDF4',
      borderRadius: '30px',
      fontSize: '14px',
      color: '#059669',
      fontWeight: '500',
    },
    relatedSection: {
      backgroundColor: '#F0FDF4',
      padding: '60px 24px',
    },
    relatedContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '32px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '30px',
      textAlign: 'center',
    },
    relatedGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '30px',
    },
    relatedCard: {
      backgroundColor: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.4s ease',
      textDecoration: 'none',
    },
    relatedImage: {
      height: '180px',
      width: '100%',
      objectFit: 'cover',
    },
    relatedContent: {
      padding: '24px',
    },
    relatedTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '20px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '8px',
    },
    relatedMeta: {
      fontSize: '13px',
      color: '#6B7280',
    },
  };

  return (
    <div>
      <section style={styles.section}>
        <div style={styles.container}>
          <AnimatedSection animation="fadeInUp">
            <Link to="/posts" style={styles.backLink}>
              <FiArrowLeft size={18} /> Back to Posts
            </Link>

            <div style={styles.header}>
              <span style={styles.category}>{post.category}</span>
              <h1 style={styles.title}>{post.title}</h1>
              <div style={styles.meta}>
                <div style={styles.author}>
                  <img src={post.authorImage} alt={post.author} style={styles.authorAvatar} />
                  <span style={styles.authorName}>{post.author}</span>
                </div>
                <span style={styles.metaItem}>
                  <FiCalendar size={16} /> {post.date}
                </span>
                <span style={styles.metaItem}>
                  <FiClock size={16} /> {post.readTime}
                </span>
              </div>
            </div>

            <img src={post.image} alt={post.title} style={styles.featuredImage} />

            <div style={styles.content}>
              <p>{post.excerpt}</p>
              <br />
              <p>{post.content}</p>
            </div>

            <div style={styles.shareSection}>
              <span style={styles.shareLabel}>Share this article:</span>
              <div style={styles.shareButtons}>
                {[FiTwitter, FiFacebook, FiShare2].map((Icon, index) => (
                  <button 
                    key={index}
                    style={styles.shareButton}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = 'inherit';
                    }}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.tags}>
              {post.tags.map((tag, index) => (
                <span key={index} style={styles.tag}>#{tag}</span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section style={styles.relatedSection}>
          <div style={styles.relatedContainer}>
            <AnimatedSection animation="fadeInUp">
              <h2 style={styles.sectionTitle}>Related Articles</h2>
            </AnimatedSection>
            <div style={styles.relatedGrid}>
              {relatedPosts.map((relPost, index) => (
                <AnimatedSection key={relPost.id} animation="fadeInUp" delay={index * 0.1}>
                  <Link 
                    to={`/post/${relPost.slug}`} 
                    style={styles.relatedCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(5, 150, 105, 0.12)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <img src={relPost.image} alt={relPost.title} style={styles.relatedImage} />
                    <div style={styles.relatedContent}>
                      <h3 style={styles.relatedTitle}>{relPost.title}</h3>
                      <span style={styles.relatedMeta}>{relPost.date} • {relPost.readTime}</span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PostDetail;