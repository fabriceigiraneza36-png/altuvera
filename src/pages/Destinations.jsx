import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { countries } from '../data/countries';
import { getAllDestinations } from '../data/destinations';
import DestinationCard from '../components/common/DestinationCard';

const Destinations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const allDestinations = getAllDestinations();
  
  const types = [...new Set(allDestinations.map(d => d.type))];
  
  const filteredDestinations = allDestinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || dest.countryId === selectedCountry;
    const matchesType = selectedType === 'all' || dest.type === selectedType;
    return matchesSearch && matchesCountry && matchesType;
  });

  const styles = {
    section: {
      padding: '56px 24px 110px',
      backgroundColor: '#F0FDF4',
      minHeight: '100vh',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    filters: {
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '30px',
      marginBottom: '40px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    },
    filtersTop: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    searchBox: {
      flex: 1,
      minWidth: '260px',
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
      outline: 'none',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box',
    },
    filterGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      flex: 1,
    },
    select: {
      padding: '16px 40px 16px 20px',
      fontSize: '15px',
      border: '2px solid #E5E7EB',
      borderRadius: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '18px',
      transition: 'border-color 0.3s ease',
      minWidth: '200px',
      flex: 1,
    },
    resultsInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultsCount: {
      fontSize: '15px',
      color: '#6B7280',
    },
    resultsCountNumber: {
      fontWeight: '700',
      color: '#059669',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '28px',
    },
    noResults: {
      textAlign: 'center',
      padding: '80px 20px',
      backgroundColor: 'white',
      borderRadius: '24px',
    },
    noResultsIcon: {
      fontSize: '64px',
      marginBottom: '20px',
    },
    noResultsTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '28px',
      color: '#1a1a1a',
      marginBottom: '12px',
    },
    noResultsText: {
      fontSize: '16px',
      color: '#6B7280',
      marginBottom: '24px',
    },
  };

  return (
    <div>
      <PageHeader 
        title="Destinations"
        subtitle="Explore extraordinary places across East Africa, from wildlife-rich savannas to ancient cultural sites."
        backgroundImage="https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1920"
        breadcrumbs={[{ label: 'Destinations' }]}
      />

      <section style={styles.section}>
        <div style={styles.container} className="destinations-page-container">
          <AnimatedSection animation="fadeInUp">
            <div style={styles.filters} className="destinations-filters">
              <div style={styles.filtersTop} className="destinations-filters-top">
                <div style={styles.searchBox} className="destinations-search-box">
                  <FiSearch size={20} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                    className="destinations-search-input"
                  />
                </div>
                <div style={styles.filterGroup} className="destinations-filter-group">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    style={styles.select}
                    className="destinations-select"
                  >
                    <option value="all">All Countries</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    style={styles.select}
                    className="destinations-select"
                  >
                    <option value="all">All Types</option>
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={styles.resultsInfo} className="destinations-results-info">
                <span style={styles.resultsCount}>
                  Showing <span style={styles.resultsCountNumber}>{filteredDestinations.length}</span> destinations
                </span>
              </div>
            </div>
          </AnimatedSection>

          {filteredDestinations.length > 0 ? (
            <div style={styles.grid} className="destinations-grid">
              {filteredDestinations.map((destination, index) => (
                <DestinationCard 
                  key={destination.id} 
                  destination={destination} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <AnimatedSection animation="fadeInUp">
              <div style={styles.noResults} className="destinations-no-results">
                <span style={styles.noResultsIcon}>🔍</span>
                <h3 style={styles.noResultsTitle}>No Destinations Found</h3>
                <p style={styles.noResultsText}>
                  Try adjusting your search or filter criteria.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCountry('all');
                    setSelectedType('all');
                  }}
                  variant="primary"
                >
                  Clear Filters
                </Button>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </div>
  );
};

export default Destinations;
