import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams } from "react-router-dom";
import { FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { countries } from '../data/countries';
import DestinationCard from '../components/common/DestinationCard';
import { useCountryDestinations, useDestinations } from "../hooks/useDestinations";

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounce search query to prevent excessive URL updates and re-renders
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearchQuery]);

  // Sync URL -> input (handles direct links and back/forward navigation)
  useEffect(() => {
    const urlValue = searchParams.get("search") || "";
    if (urlValue !== searchQuery) {
      setSearchQuery(urlValue);
      setDebouncedSearchQuery(urlValue);
    }
  }, [searchParams, searchQuery]);

  // Sync debounced search -> URL (replace to avoid a history entry per keystroke)
  useEffect(() => {
    const urlValue = searchParams.get("search") || "";
    if (urlValue === debouncedSearchQuery) return;

    const next = new URLSearchParams(searchParams);
    if (debouncedSearchQuery) next.set("search", debouncedSearchQuery);
    else next.delete("search");

    setSearchParams(next, { replace: true });
  }, [searchParams, debouncedSearchQuery, setSearchParams]);

  const {
    destinations: allDestinations,
    loading: allLoading,
    error: allError,
  } = useDestinations();
  const {
    destinations: countryDestinations,
    loading: countryLoading,
    error: countryError,
  } = useCountryDestinations(selectedCountry !== "all" ? selectedCountry : "");

  const activeDestinations =
    selectedCountry === "all" ? allDestinations : countryDestinations;

  const types = useMemo(
    () => [...new Set(activeDestinations.map((d) => d.type).filter(Boolean))],
    [activeDestinations]
  );

    const filteredDestinations = useMemo(() => {
      const query = debouncedSearchQuery.toLowerCase().trim();
      if (!query) return activeDestinations;
      
      return activeDestinations.filter((dest) => {
        const searchableFields = [
          dest.name,
          dest.description,
          dest.shortDescription,
          dest.location,
          dest.country,
          dest.capital,
          dest.region,
          dest.subRegion,
          dest.type,
          dest.category,
          Array.isArray(dest.highlights) ? dest.highlights.join(' ') : '',
          Array.isArray(dest.tags) ? dest.tags.join(' ') : '',
        ].filter(Boolean).join(' ').toLowerCase();
        
        const matchesSearch = searchableFields.includes(query);
        const matchesType = selectedType === "all" || dest.type === selectedType;
        return matchesSearch && matchesType;
      });
    }, [activeDestinations, debouncedSearchQuery, selectedType]);

  const loading = selectedCountry === "all" ? allLoading : countryLoading;
  const error = selectedCountry === "all" ? allError : countryError;

  const styles = {
    section: {
      padding: '40px 24px 80px',
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
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '28px',
      minHeight: '400px', // Prevent layout shift
      alignItems: 'start', // Ensure cards align to top
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

  // Add spin animation keyframes
  const spinKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Inject keyframes if not already present
  useEffect(() => {
    const styleSheet = document.getElementById('destinations-animations');
    if (!styleSheet) {
      const style = document.createElement('style');
      style.id = 'destinations-animations';
      style.textContent = spinKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div>
      <PageHeader 
        title="Destinations"
        subtitle="Explore extraordinary places across East Africa, from wildlife-rich savannas to ancient cultural sites."
        backgroundImage="https://i.pinimg.com/1200x/ca/2b/b9/ca2bb955ebe6cde00add738468d44f30.jpg"
        breadcrumbs={[{ label: 'Destinations' }]}
      />

      <section style={styles.section}>
        <div style={styles.container} className="destinations-page-container">
          <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <div style={styles.filters} className="destinations-filters">
              <div style={styles.filtersTop} className="destinations-filters-top">
                <div style={styles.searchBox} className="destinations-search-box">
                  <FiSearch size={20} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      ...styles.searchInput,
                      borderColor: isSearching ? '#3B82F6' : '#E5E7EB',
                      boxShadow: isSearching ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                      paddingRight: searchQuery ? '50px' : '16px',
                    }}
                    className="destinations-search-input"
                  />
                  {isSearching && (
                    <div style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      border: '2px solid #E5E7EB',
                      borderTop: '2px solid #3B82F6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6B7280',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#374151'}
                      onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
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
                  {isSearching ? (
                    'Searching destinations...'
                  ) : (
                    `Showing ${filteredDestinations.length} destinations${debouncedSearchQuery ? ` for "${debouncedSearchQuery}"` : ''}`
                  )}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <AnimatedSection animation="fadeInUp">
              <div style={styles.noResults} className="destinations-no-results">
                <h3 style={styles.noResultsTitle}>Loading destinations...</h3>
                <p style={styles.noResultsText}>
                  Fetching the latest destinations from the server.
                </p>
              </div>
            </AnimatedSection>
          ) : error ? (
            <AnimatedSection animation="fadeInUp">
              <div style={styles.noResults} className="destinations-no-results">
                <h3 style={styles.noResultsTitle}>Unable to load destinations</h3>
                <p style={styles.noResultsText}>{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                >
                  Retry
                </Button>
              </div>
            </AnimatedSection>
          ) : filteredDestinations.length > 0 ? (
            <AnimatedSection animation="fadeInUp">
              <div style={styles.grid} className="destinations-grid">
                {filteredDestinations.map((destination, index) => (
                  <div 
                    key={destination.id || destination._id || `dest-${index}`}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      opacity: isSearching ? 0.7 : 1,
                      transform: isSearching ? 'scale(0.98)' : 'scale(1)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                    }}
                  >
                    <DestinationCard 
                      destination={destination} 
                      index={index} 
                    />
                  </div>
                ))}
              </div>
            </AnimatedSection>
          ) : (
            <AnimatedSection animation="fadeInUp">
              <div style={styles.noResults} className="destinations-no-results">
                <span style={styles.noResultsIcon}>🔍</span>
                <h3 style={styles.noResultsTitle}>
                  {debouncedSearchQuery ? 'No destinations found' : 'No destinations available'}
                </h3>
                <p style={styles.noResultsText}>
                  {debouncedSearchQuery 
                    ? `We couldn't find any destinations matching "${debouncedSearchQuery}". Try adjusting your search or filters.`
                    : 'There are currently no destinations available. Please check back later.'
                  }
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {debouncedSearchQuery && (
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setDebouncedSearchQuery('');
                      }}
                      variant="outline"
                    >
                      Clear Search
                    </Button>
                  )}
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCountry('all');
                      setSelectedType('all');
                      setDebouncedSearchQuery('');
                    }}
                    variant="primary"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </div>
  );
};

export default Destinations;
