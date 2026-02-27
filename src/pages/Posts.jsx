import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiCalendar, FiClock, FiArrowRight, FiUser } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import { posts } from '../data/posts';

const Posts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [...new Set(posts.map(p => p.category))];
  const featuredPosts = posts.filter(p => p.featured);
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const styles = {
    section: {
      padding: '60px 24px 120px',
      backgroundColor: '#F0FDF4',
      minHeight: '100vh',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    filters: {
      display: 'flex',
      gap: '20px',
      marginBottom: '50px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    searchBox: {
      flex: 1,
      minWidth: '300px',
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280',
    },
    searchInput: {
      width: '100%',
      padding: '16px 16px 16px 50px',
      fontSize: '15px',
      border: '2px solid #E5E7EB',
      borderRadius: '14px',
      backgroundColor: 'white',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box',
    },
    categoryTabs: {
      display: 'flex',
      gap: '10px',
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
    featuredSection: {
      marginBottom: '60px',
    },
    sectionTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '32px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '30px',
    },
    featuredCard: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: '0',
      backgroundColor: 'white',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.4s ease',
    },
    featuredImage: {
      height: '100%',
      minHeight: '400px',
      objectFit: 'cover',
    },
    featuredContent: {
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    postCategory: {
      display: 'inline-block',
      padding: '8px 18px',
      backgroundColor: '#D1FAE5',
      borderRadius: '30px',
      color: '#059669',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '20px',
      width: 'fit-content',
    },
    postTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '32px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '16px',
      lineHeight: '1.3',
    },
    postExcerpt: {
      fontSize: '16px',
      color: '#6B7280',
      lineHeight: '1.8',
      marginBottom: '24px',
    },
    postMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginBottom: '24px',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#6B7280',
    },
    readMore: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#059669',
      fontWeight: '600',
      textDecoration: 'none',
      fontSize: '15px',
    },
    postsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '30px',
    },
    postCard: {
      backgroundColor: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.4s ease',
    },
    postImage: {
      height: '200px',
      width: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease',
    },
    postContent: {
      padding: '28px',
    },
    postTitleSmall: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '20px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '12px',
      lineHeight: '1.4',
    },
    postExcerptSmall: {
      fontSize: '14px',
      color: '#6B7280',
      lineHeight: '1.7',
      marginBottom: '16px',
    },
    author: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingTop: '16px',
      borderTop: '1px solid #E5E7EB',
    },
    authorAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    authorName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    authorDate: {
      fontSize: '13px',
      color: '#6B7280',
    },
  };

  return (
    <div>
      <PageHeader 
        title="Travel Journal"
        subtitle="Stories, guides, and inspiration from East Africa's most experienced travelers."
        backgroundImage="https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=1920"
        breadcrumbs={[{ label: 'Posts' }]}
      />

      <section style={styles.section}>
        <div style={styles.container}>
          <AnimatedSection animation="fadeInUp">
            <div style={styles.filters}>
              <div style={styles.searchBox}>
                <FiSearch size={20} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                  onFocus={(e) => e.target.style.borderColor = '#059669'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <div style={styles.categoryTabs}>
                <button
                  style={{
                    ...styles.categoryTab,
                    backgroundColor: selectedCategory === 'all' ? '#059669' : 'white',
                    color: selectedCategory === 'all' ? 'white' : '#1a1a1a',
                  }}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Posts
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    style={{
                      ...styles.categoryTab,
                      backgroundColor: selectedCategory === category ? '#059669' : 'white',
                      color: selectedCategory === category ? 'white' : '#1a1a1a',
                    }}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Featured Post */}
          {featuredPosts[0] && selectedCategory === 'all' && !searchQuery && (
            <AnimatedSection animation="fadeInUp">
              <div style={styles.featuredSection}>
                <h2 style={styles.sectionTitle}>Featured Article</h2>
                <Link to={`/post/${featuredPosts[0].slug}`} style={{ textDecoration: 'none' }}>
                  <div 
                    style={styles.featuredCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(5, 150, 105, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <img 
                      src={featuredPosts[0].image} 
                      alt={featuredPosts[0].title}
                      style={styles.featuredImage}
                    />
                    <div style={styles.featuredContent}>
                      <span style={styles.postCategory}>{featuredPosts[0].category}</span>
                      <h3 style={styles.postTitle}>{featuredPosts[0].title}</h3>
                      <p style={styles.postExcerpt}>{featuredPosts[0].excerpt}</p>
                      <div style={styles.postMeta}>
                        <span style={styles.metaItem}>
                          <FiCalendar size={14} /> {featuredPosts[0].date}
                        </span>
                        <span style={styles.metaItem}>
                          <FiClock size={14} /> {featuredPosts[0].readTime}
                        </span>
                      </div>
                      <span style={styles.readMore}>
                        Read Article <FiArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </AnimatedSection>
          )}

          {/* Posts Grid */}
          <div style={styles.postsGrid}>
            {filteredPosts.map((post, index) => (
              <AnimatedSection key={post.id} animation="fadeInUp" delay={index * 0.05}>
                <Link to={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div 
                    style={styles.postCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(5, 150, 105, 0.12)';
                      e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
                      e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{ overflow: 'hidden' }}>
                      <img src={post.image} alt={post.title} style={styles.postImage} />
                    </div>
                    <div style={styles.postContent}>
                      <span style={styles.postCategory}>{post.category}</span>
                      <h3 style={styles.postTitleSmall}>{post.title}</h3>
                      <p style={styles.postExcerptSmall}>{post.excerpt}</p>
                      <div style={styles.author}>
                        <img src={post.authorImage} alt={post.author} style={styles.authorAvatar} />
                        <div>
                          <div style={styles.authorName}>{post.author}</div>
                          <div style={styles.authorDate}>{post.date} • {post.readTime}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Posts;