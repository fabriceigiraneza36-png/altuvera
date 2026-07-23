// src/components/common/Navbar.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR v4.0 — Professional Navigation with Redesigned Search
// ═══════════════════════════════════════════════════════════════════════════════
// Features:
//  ✓ Fully responsive search overlay with glassmorphism design
//  ✓ Destination cards with auto-sliding image galleries
//  ✓ Smart scroll hide/show with floating logo
//  ✓ Desktop mega-dropdowns with country flags
//  ✓ Mobile slide-out menu with search trigger
//  ✓ User avatar menu with verified badge
//  ✓ Keyboard accessible (Escape to close, Enter to submit)
//  ✓ Optimistic search with abort controller
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiSearch, FiHeart, FiUser, FiLogOut, FiCalendar, FiSettings,
  FiChevronDown, FiChevronLeft, FiChevronRight, FiMapPin, FiX,
  FiMenu, FiArrowRight, FiGlobe, FiCompass, FiTrendingUp,
} from 'react-icons/fi'
import { useApp }           from '../../context/AppContext'
import { useUserAuth }      from '../../context/UserAuthContext'
import { getBrandLogoUrl, BRAND_LOGO_ALT } from '../../utils/seo'
import { preloadRoute }     from '../../utils/routeUtils'
import { getCountrySlug }   from '../../utils/countrySlugMap'
import { useCountries }     from '../../hooks/useCountries'
import { adaptDestination } from '../../utils/destinationAdapter'
import './Navbar.css'

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════════════════ */

const cn = (...c) => c.filter(Boolean).join(' ')

const POPULAR_SEARCHES = [
  { label: 'Safari Tours',    query: 'safari',    icon: FiCompass },
  { label: 'Mountain Treks',  query: 'mountain',  icon: FiTrendingUp },
  { label: 'Beach Getaways',  query: 'beach',     icon: FiGlobe },
  { label: 'Cultural Tours',  query: 'cultural',  icon: FiMapPin },
]

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH DESTINATION CARD — with auto-sliding gallery
═══════════════════════════════════════════════════════════════════════════ */

const DestinationCard = ({ destination, onClick, index }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered]       = useState(false)
  const [imgError, setImgError]         = useState(new Set())
  const slideTimer = useRef(null)

  const images = useMemo(() => {
    const imgs = new Set()
    if (destination.heroImage) imgs.add(destination.heroImage)
    for (const arr of [destination.images, destination.gallery]) {
      if (Array.isArray(arr)) {
        arr.forEach(img => {
          const url = typeof img === 'string' ? img : img?.url || img?.src
          if (url) imgs.add(url)
        })
      }
    }
    return [...imgs].slice(0, 5)
  }, [destination])

  const validImages = useMemo(
    () => images.filter((_, i) => !imgError.has(i)),
    [images, imgError],
  )

  // Auto-slide
  useEffect(() => {
    if (validImages.length <= 1) return
    slideTimer.current = setInterval(() => {
      setCurrentSlide(p => (p + 1) % validImages.length)
    }, 3500)
    return () => clearInterval(slideTimer.current)
  }, [validImages.length])

  const goSlide = (dir, e) => {
    e.stopPropagation()
    e.preventDefault()
    clearInterval(slideTimer.current)
    setCurrentSlide(p =>
      dir === 'next'
        ? (p + 1) % validImages.length
        : (p - 1 + validImages.length) % validImages.length,
    )
    slideTimer.current = setInterval(() => {
      setCurrentSlide(p => (p + 1) % validImages.length)
    }, 3500)
  }

  const handleImgError = (idx) => {
    setImgError(prev => new Set([...prev, idx]))
  }

  return (
    <button
      className="srch-card"
      style={{ '--card-i': index }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      type="button"
      tabIndex={0}
      aria-label={`View ${destination.name}`}
    >
      {/* Image gallery */}
      <div className="srch-card__img-wrap">
        {validImages.length > 0 ? (
          validImages.map((img, i) => (
            <img
              key={`${img}-${i}`}
              src={img}
              alt={`${destination.name} ${i + 1}`}
              className={cn(
                'srch-card__img',
                i === currentSlide && 'srch-card__img--active',
              )}
              loading="lazy"
              draggable={false}
              onError={() => handleImgError(images.indexOf(img))}
            />
          ))
        ) : (
          <div className="srch-card__img-placeholder">
            <FiMapPin size={24} />
            <span>No image</span>
          </div>
        )}

        {/* Slide dots */}
        {validImages.length > 1 && (
          <div className="srch-card__dots">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'srch-card__dot',
                  i === currentSlide && 'srch-card__dot--active',
                )}
              />
            ))}
          </div>
        )}

        {/* Slide arrows on hover */}
        {validImages.length > 1 && isHovered && (
          <>
            <button
              className="srch-card__arrow srch-card__arrow--prev"
              onClick={e => goSlide('prev', e)}
              aria-label="Previous image"
              type="button"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              className="srch-card__arrow srch-card__arrow--next"
              onClick={e => goSlide('next', e)}
              aria-label="Next image"
              type="button"
            >
              <FiChevronRight size={14} />
            </button>
          </>
        )}

        {/* Category badge */}
        {destination.category && (
          <span className="srch-card__badge">{destination.category}</span>
        )}

        {/* Gradient overlay */}
        <div className="srch-card__gradient" />
      </div>

      {/* Hover overlay */}
      <div className={cn(
        'srch-card__overlay',
        isHovered && 'srch-card__overlay--visible',
      )}>
        <h4 className="srch-card__overlay-title">{destination.name}</h4>
        {destination.country && (
          <p className="srch-card__overlay-loc">
            <FiMapPin size={11} /> {destination.country}
          </p>
        )}
        <p className="srch-card__overlay-desc">
          {destination.description
            ? destination.description.slice(0, 100) + '…'
            : destination.shortDescription || 'Discover this amazing destination'}
        </p>
        {destination.price && (
          <p className="srch-card__overlay-price">
            From <strong>${destination.price}</strong>
          </p>
        )}
        <span className="srch-card__overlay-cta">
          View Details <FiArrowRight size={12} />
        </span>
      </div>

      {/* Bottom info bar */}
      <div className="srch-card__info">
        <h4 className="srch-card__name">{destination.name}</h4>
        {destination.country && (
          <p className="srch-card__location">
            <FiMapPin size={10} /> {destination.country}
          </p>
        )}
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH OVERLAY — fullscreen, glassmorphism, responsive grid
═══════════════════════════════════════════════════════════════════════════ */

function SearchOverlay({
  isOpen, onClose, searchValue, setSearchValue,
  searchResults, isSearching, onResultClick, onSubmit,
}) {
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const hasQuery   = searchValue.trim().length >= 2
  const hasResults = searchResults.length > 0
  const showEmpty  = hasQuery && !isSearching && !hasResults
  const showPrompt = !hasQuery && !isSearching && !hasResults

  const handlePopularClick = (query) => {
    setSearchValue(query)
    inputRef.current?.focus()
  }

  return (
    <div
      className={cn('srch', isOpen && 'srch--open')}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search destinations"
    >
      <div
        ref={containerRef}
        className="srch__container"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Search Header ─────────────────────────────────────────── */}
        <div className="srch__header">
          <div className="srch__header-inner">
            {/* Back button (mobile) */}
            <button
              className="srch__back"
              onClick={onClose}
              aria-label="Close search"
              type="button"
            >
              <FiChevronLeft size={22} />
            </button>

            {/* Search form */}
            <form onSubmit={onSubmit} className="srch__form">
              <div className="srch__input-wrap">
                <FiSearch className="srch__input-icon" size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  className="srch__input"
                  autoComplete="off"
                  autoFocus
                  spellCheck={false}
                />
                {searchValue && (
                  <button
                    type="button"
                    className="srch__clear"
                    onClick={() => {
                      setSearchValue('')
                      inputRef.current?.focus()
                    }}
                    aria-label="Clear search"
                  >
                    <FiX size={16} />
                  </button>
                )}
                {isSearching && (
                  <div className="srch__input-spinner" />
                )}
              </div>
            </form>

            {/* Cancel button (desktop) */}
            <button
              className="srch__cancel"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>

            {/* Close button (desktop circle) */}
            <button
              className="srch__close-btn"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Search meta bar */}
          {hasQuery && (
            <div className="srch__meta">
              {isSearching ? (
                <span className="srch__meta-text">
                  <span className="srch__meta-spinner" />
                  Searching for "{searchValue}"…
                </span>
              ) : hasResults ? (
                <span className="srch__meta-text">
                  <span className="srch__meta-count">{searchResults.length}</span>
                  {' '}destination{searchResults.length !== 1 ? 's' : ''} found
                  for "<strong>{searchValue}</strong>"
                </span>
              ) : (
                <span className="srch__meta-text srch__meta-text--empty">
                  No results for "<strong>{searchValue}</strong>"
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Search Body ───────────────────────────────────────────── */}
        <div className="srch__body">

          {/* Prompt — initial state */}
          {showPrompt && (
            <div className="srch__prompt">
              <div className="srch__prompt-icon">
                <FiCompass size={32} />
              </div>
              <h3 className="srch__prompt-title">
                Discover your next adventure
              </h3>
              <p className="srch__prompt-text">
                Search from hundreds of destinations across Africa and beyond
              </p>

              {/* Popular searches */}
              <div className="srch__popular">
                <p className="srch__popular-label">Popular searches</p>
                <div className="srch__popular-tags">
                  {POPULAR_SEARCHES.map(({ label, query, icon: Icon }) => (
                    <button
                      key={query}
                      type="button"
                      className="srch__popular-tag"
                      onClick={() => handlePopularClick(query)}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse all link */}
              <Link
                to="/destinations"
                className="srch__browse-all"
                onClick={onClose}
              >
                <FiGlobe size={14} />
                Browse all destinations
                <FiArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Loading skeleton */}
          {isSearching && !hasResults && (
            <div className="srch__skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="srch__skeleton-card" style={{ '--sk-i': i }}>
                  <div className="srch__skeleton-img" />
                  <div className="srch__skeleton-body">
                    <div className="srch__skeleton-line srch__skeleton-line--title" />
                    <div className="srch__skeleton-line srch__skeleton-line--sub" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="srch__empty">
              <div className="srch__empty-icon">
                <FiSearch size={36} />
              </div>
              <h3 className="srch__empty-title">No destinations found</h3>
              <p className="srch__empty-text">
                We couldn't find anything matching "{searchValue}".
                Try different keywords or explore our full collection.
              </p>
              <div className="srch__empty-actions">
                <button
                  type="button"
                  className="srch__empty-btn srch__empty-btn--clear"
                  onClick={() => {
                    setSearchValue('')
                    inputRef.current?.focus()
                  }}
                >
                  <FiX size={14} />
                  Clear search
                </button>
                <Link
                  to="/destinations"
                  className="srch__empty-btn srch__empty-btn--browse"
                  onClick={onClose}
                >
                  <FiGlobe size={14} />
                  Browse all
                </Link>
              </div>

              {/* Suggestions */}
              <div className="srch__empty-suggestions">
                <p className="srch__empty-suggest-label">Try searching for:</p>
                <div className="srch__empty-suggest-tags">
                  {POPULAR_SEARCHES.map(({ label, query }) => (
                    <button
                      key={query}
                      type="button"
                      className="srch__popular-tag"
                      onClick={() => handlePopularClick(query)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results grid */}
          {hasResults && (
            <>
              <div className="srch__grid">
                {searchResults.map((dest, idx) => (
                  <DestinationCard
                    key={dest.id || dest.slug || idx}
                    destination={dest}
                    index={idx}
                    onClick={() => onResultClick(dest)}
                  />
                ))}
              </div>

              {/* View all results */}
              <div className="srch__footer">
                <Link
                  to={`/destinations?search=${encodeURIComponent(searchValue)}`}
                  className="srch__view-all"
                  onClick={onClose}
                >
                  <FiSearch size={14} />
                  View all results for "{searchValue}"
                  <FiArrowRight size={14} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const Navbar = () => {
  /* ── State ──────────────────────────────────────────────────────────── */
  const [isScrolled, setIsScrolled]                   = useState(false)
  const [navHidden, setNavHidden]                     = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen]       = useState(false)
  const [activeDropdown, setActiveDropdown]            = useState(null)
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null)
  const [searchOpen, setSearchOpen]                   = useState(false)
  const [searchValue, setSearchValue]                 = useState('')
  const [searchResults, setSearchResults]             = useState([])
  const [isSearching, setIsSearching]                 = useState(false)
  const [userMenuOpen, setUserMenuOpen]               = useState(false)
  const [avatarLoaded, setAvatarLoaded]               = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  /* ── Hooks ──────────────────────────────────────────────────────────── */
  const location = useLocation()
  const navigate = useNavigate()
  const { favorites } = useApp()
  const { user, isAuthenticated, authLoading, openModal, logout } = useUserAuth()
  const { countries: backendCountries } = useCountries({ limit: 12 })

  /* ── Refs ───────────────────────────────────────────────────────────── */
  const headerRef           = useRef(null)
  const userMenuRef         = useRef(null)
  const dropdownTimer       = useRef(null)
  const searchAbortRef      = useRef(null)
  const latestSearchRef     = useRef('')
  const lastScrollYRef      = useRef(0)
  const prevNavHiddenRef    = useRef(false)
  const logoDetachedTimerRef = useRef(null)
  const logoRef             = useRef(null)
  const [logoDetached, setLogoDetached] = useState(false)
  const [logoRect, setLogoRect]         = useState(null)

  /* ── Dropdown Data ──────────────────────────────────────────────────── */
  const destinationsDropdown = useMemo(() => {
    const items = [
      { name: 'All Destinations', path: '/destinations', isOverview: true },
    ]
    if (backendCountries?.length > 0) {
      backendCountries.forEach(c =>
        items.push({
          name: c.name,
          flag: c.flagUrl || c.flag_url || c.flag || '',
          info: c.tagline || c.region || c.capital || c.continent
                || c.subRegion || c.shortDescription
                || (c.description ? `${c.description.slice(0, 60)}…` : ''),
          path: `/country/${getCountrySlug(c)}`,
        }),
      )
    }
    return items
  }, [backendCountries])

  const navLinks = useMemo(() => [
    { name: 'Home',            path: '/' },
    { name: 'Explore',         path: '/explore' },
    { name: 'Destinations',    path: '/destinations' },
    { name: 'Interactive Map', path: '/interactive-map' },
    { name: 'Tips',            path: '/tips' },
    {
      name: 'About',
      path: '/about',
      dropdown: [
        { name: 'About Us',       path: '/about' },
        { name: 'Our Services',   path: '/services' },
        { name: 'Payment Terms',  path: '/payment-terms' },
        { name: 'Our Team',       path: '/team' },
      ],
    },
    { name: 'Contact', path: '/contact' },
  ], [destinationsDropdown])

  const userMenuItems = useMemo(() => {
    const items = [
      { to: '/profile',     icon: FiUser,     label: 'Profile' },
      { to: '/my-bookings', icon: FiCalendar, label: 'Your Bookings' },
      { to: '/wishlist',    icon: FiHeart,    label: 'Your Wishlist' },
      { to: '/settings',    icon: FiSettings, label: 'Your Settings' },
    ]
    if (user?.role === 'admin' || user?.role === 'manager') {
      items.push({ to: '/admin/dashboard', icon: FiSettings, label: 'Admin Dashboard' })
    }
    return items
  }, [user?.role])

  /* ── Scroll hide/show ───────────────────────────────────────────────── */
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const lastY    = lastScrollYRef.current
        setIsScrolled(currentY > 20)
        if (currentY > 80) {
          if (currentY > lastY + 5)      setNavHidden(true)
          else if (currentY < lastY - 5) setNavHidden(false)
        } else {
          setNavHidden(false)
        }
        lastScrollYRef.current = currentY
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Logo detach on scroll hide ─────────────────────────────────────── */
  useEffect(() => {
    const prevHidden = prevNavHiddenRef.current
    prevNavHiddenRef.current = navHidden
    if (navHidden && !prevHidden) {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect()
        setLogoRect({ top: rect.top, left: rect.left })
      }
      setLogoDetached(true)
      if (logoDetachedTimerRef.current) clearTimeout(logoDetachedTimerRef.current)
    } else if (!navHidden && prevHidden) {
      if (logoDetachedTimerRef.current) clearTimeout(logoDetachedTimerRef.current)
      logoDetachedTimerRef.current = setTimeout(() => setLogoDetached(false), 500)
    }
    return () => {
      if (logoDetachedTimerRef.current) clearTimeout(logoDetachedTimerRef.current)
    }
  }, [navHidden])

  /* ── Utilities ──────────────────────────────────────────────────────── */
  const closeAll = useCallback(() => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
    setActiveMobileDropdown(null)
    setUserMenuOpen(false)
    setSearchOpen(false)
  }, [])

  useEffect(() => closeAll(), [location.pathname, closeAll])
  useEffect(() => setAvatarLoaded(false), [user?.avatar])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  /* ── Live search ────────────────────────────────────────────────────── */
  useEffect(() => {
    const q = searchValue.trim()
    latestSearchRef.current = q

    if (searchAbortRef.current) {
      searchAbortRef.current.abort()
      searchAbortRef.current = null
    }

    if (q.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const tid = setTimeout(async () => {
      setIsSearching(true)
      const ctrl = new AbortController()
      searchAbortRef.current = ctrl
      try {
        const res = await fetch(
          `${API_URL}/destinations/suggestions?q=${encodeURIComponent(q)}&limit=12`,
          { signal: ctrl.signal },
        )
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        if (latestSearchRef.current !== q) return
        const raw     = data?.data || data?.results || data || []
        const adapted = Array.isArray(raw)
          ? raw.map(adaptDestination).filter(Boolean)
          : []
        setSearchResults(adapted.slice(0, 12))
      } catch (err) {
        if (err.name !== 'AbortError' && latestSearchRef.current === q) {
          setSearchResults([])
        }
      } finally {
        if (latestSearchRef.current === q) setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(tid)
  }, [searchValue, API_URL])

  /* ── Close on Escape / outside click ────────────────────────────────── */
  useEffect(() => {
    const fn = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target))
        setActiveDropdown(null)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* ── Handlers ───────────────────────────────────────────────────────── */
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault()
    const q = searchValue.trim()
    if (q) {
      navigate(`/destinations?search=${encodeURIComponent(q)}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }, [searchValue, navigate])

  const handleResultClick = useCallback((dest) => {
    navigate(`/destinations/${dest.slug || dest.id}`)
    setSearchOpen(false)
    setSearchValue('')
    setSearchResults([])
  }, [navigate])

  const toggleMobileDropdown = useCallback(
    (n) => setActiveMobileDropdown(p => (p === n ? null : n)),
    [],
  )

  const handleDropdownEnter = useCallback((n) => {
    clearTimeout(dropdownTimer.current)
    setActiveDropdown(n)
  }, [])

  const handleDropdownLeave = useCallback(() => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150)
  }, [])

  const handleDesktopClick = useCallback((e, l) => {
    if (l.dropdown) {
      e.preventDefault()
      setActiveDropdown(p => (p === l.name ? null : l.name))
    }
  }, [])

  const handleDesktopDblClick = useCallback((e, l) => {
    if (l.dropdown) {
      e.preventDefault()
      setActiveDropdown(null)
      navigate(l.path)
    }
  }, [navigate])

  const isActive = useCallback(
    (l) =>
      location.pathname === l.path ||
      l.dropdown?.some(d => d.path === location.pathname) ||
      false,
    [location.pathname],
  )

  const getInitials = useCallback(() => {
    const n = user?.fullName || user?.name || ''
    return n
      ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : user?.email?.[0]?.toUpperCase() || 'U'
  }, [user])

  const displayName = useMemo(
    () => user?.fullName || user?.name || user?.email?.split('@')[0] || 'User',
    [user],
  )

  const providerLabel = useMemo(() => {
    const p = (user?.authProvider || '').toLowerCase()
    return p === 'google' ? 'Google' : p === 'github' ? 'GitHub' : 'Email'
  }, [user?.authProvider])

  const handleLogout = useCallback(() => {
    closeAll()
    logout()
    navigate('/')
  }, [closeAll, logout, navigate])

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */

  return (
    <>
      {/* ── FLOATING LOGO when nav hidden ── */}
      {logoDetached && logoRect && (
        <Link
          to="/"
          className="nav__logo nav__logo--floating"
          style={{
            position:      'fixed',
            top:           12,
            left:          logoRect.left,
            zIndex:        1100,
            opacity:       navHidden ? 0.35 : 0,
            transition:    'opacity 0.4s ease',
            pointerEvents: navHidden ? 'auto' : 'none',
          }}
          aria-label="Home"
        >
          <div className="nav__logo-glow" />
          <div className="nav__logo-img-wrapper">
            <img
              src={getBrandLogoUrl()}
              alt={BRAND_LOGO_ALT}
              className="nav__logo-img"
              draggable={false}
            />
          </div>
          <span className="nav__logo-text">Altuvera</span>
        </Link>
      )}

      {/* ═══ NAVBAR ═══ */}
      <nav
        ref={headerRef}
        role="navigation"
        className={cn(
          'nav',
          isScrolled && 'nav--scrolled',
          navHidden  && 'nav--hidden',
        )}
      >
        <div className="nav__inner">
          {/* Logo */}
          <Link
            ref={logoRef}
            to="/"
            className="nav__logo"
            aria-label="Altuvera Home"
          >
            <div className="nav__logo-glow" />
            <div className="nav__logo-img-wrapper">
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                className="nav__logo-img"
                draggable={false}
              />
            </div>
            <span className="nav__logo-text">Altuvera</span>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="nav__links">
            {navLinks.map((link, i) => (
              <div
                key={link.name}
                className="nav__item"
                style={{ '--i': i }}
                onMouseEnter={() => link.dropdown && handleDropdownEnter(link.name)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={link.path}
                  onClick={e => handleDesktopClick(e, link)}
                  onDoubleClick={e => handleDesktopDblClick(e, link)}
                  onTouchStart={() => link.dropdown && handleDropdownEnter(link.name)}
                  onMouseEnter={() => preloadRoute(link.path)}
                  className={cn(
                    'nav__link',
                    isActive(link) && 'nav__link--active',
                  )}
                  aria-expanded={link.dropdown ? activeDropdown === link.name : undefined}
                >
                  <span className="nav__link-text">{link.name}</span>
                  {link.dropdown && (
                    <FiChevronDown
                      size={14}
                      className={cn(
                        'nav__chevron',
                        activeDropdown === link.name && 'nav__chevron--open',
                      )}
                    />
                  )}
                  <span className="nav__link-underline" />
                  <span className="nav__link-shine" />
                </Link>

                {link.dropdown && (
                  <div
                    className={cn(
                      'nav__dropdown',
                      activeDropdown === link.name && 'nav__dropdown--open',
                    )}
                  >
                    <div className="nav__dropdown-inner">
                      {link.dropdown.map((sub, si) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={cn(
                            'nav__dropdown-link',
                            sub.info && 'nav__dropdown-link--rich',
                          )}
                          style={{ '--si': si }}
                          onClick={() => setActiveDropdown(null)}
                        >
                          {sub.flag ? (
                            <span className="nav__dropdown-flag">
                              {sub.flag.startsWith('http') || sub.flag.includes('/')
                                ? <img src={sub.flag} alt={`${sub.name} flag`} />
                                : sub.flag}
                            </span>
                          ) : (
                            <span className="nav__dropdown-dot" />
                          )}
                          <div className="nav__dropdown-text-wrap">
                            <span className="nav__dropdown-name">{sub.name}</span>
                            {sub.info && (
                              <span className="nav__dropdown-info">{sub.info}</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="nav__actions">
            {/* Search trigger */}
            <button
              className="nav__icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search destinations"
              type="button"
            >
              <FiSearch size={19} />
              <span className="nav__icon-ripple" />
            </button>

            {/* Favorites */}
            <Link to="/gallery" className="nav__icon-link">
              <span className="nav__icon-btn" role="button" aria-label="Favorites">
                <FiHeart size={19} />
                {favorites.length > 0 && (
                  <span className="nav__badge">{favorites.length}</span>
                )}
                <span className="nav__icon-ripple" />
              </span>
            </Link>

            {/* Auth */}
            {authLoading ? (
              <span className="nav__auth-skel" />
            ) : isAuthenticated ? (
              <div className="nav__user" ref={userMenuRef}>
                <button
                  className="nav__user-trigger"
                  onClick={() => setUserMenuOpen(p => !p)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  type="button"
                >
                  {user?.avatar ? (
                    <span className="nav__avatar-wrap">
                      {!avatarLoaded && <span className="nav__avatar-spin" />}
                      <img
                        src={user.avatar}
                        alt=""
                        className="nav__avatar-img"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)}
                      />
                    </span>
                  ) : (
                    <span className="nav__avatar-initials">{getInitials()}</span>
                  )}
                </button>

                <div className={cn(
                  'nav__user-drop',
                  userMenuOpen && 'nav__user-drop--open',
                )}>
                  <div className="nav__user-drop-head">
                    <div className="nav__user-drop-profile">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="nav__user-drop-avatar" />
                      ) : (
                        <span className="nav__user-drop-avatar-initials">{getInitials()}</span>
                      )}
                      <div className="nav__user-drop-info">
                        <p className="nav__user-drop-name">{displayName}</p>
                        <p className="nav__user-drop-email">{user?.email}</p>
                        <span className="nav__pill">
                          {user?.isVerified ? '✓ Verified' : providerLabel} account
                        </span>
                      </div>
                    </div>
                  </div>
                  {userMenuItems.map((m, mi) => (
                    <Link
                      key={m.to}
                      to={m.to}
                      className="nav__user-drop-item"
                      style={{ '--mi': mi }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <m.icon size={16} /> {m.label}
                    </Link>
                  ))}
                  <button className="nav__user-drop-out" onClick={handleLogout} type="button">
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="nav__sign-btn"
                onClick={() => openModal('login', { skipNotLoggedInMessage: true })}
                type="button"
              >
                <span>Sign In</span>
              </button>
            )}

            {/* Book Now CTA */}
            <Link to="/booking" className="nav__cta">
              <span>Book Now</span>
              <svg
                className="nav__cta-arrow"
                width="16" height="16"
                viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className={cn(
              'nav__hamburger',
              isMobileMenuOpen && 'nav__hamburger--open',
            )}
            onClick={() => setIsMobileMenuOpen(p => !p)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            <span className="nav__hamburger-box">
              <span className="nav__hline nav__hline--1" />
              <span className="nav__hline nav__hline--2" />
              <span className="nav__hline nav__hline--3" />
            </span>
          </button>
        </div>
      </nav>

      {/* ═══ SEARCH OVERLAY ═══ */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchValue('') }}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchResults={searchResults}
        isSearching={isSearching}
        onResultClick={handleResultClick}
        onSubmit={handleSearchSubmit}
      />

      {/* ── BACKDROP for mobile menu ── */}
      <div
        className={cn('backdrop', isMobileMenuOpen && 'backdrop--open')}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ═══ MOBILE MENU ═══ */}
      <aside
        className={cn('mm', isMobileMenuOpen && 'mm--open')}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Mobile Header */}
        <div className="mm__head">
          <Link
            to="/"
            className="mm__logo"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="mm__logo-img-wrapper">
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                className="mm__logo-img"
              />
            </div>
            <span className="mm__logo-text">Altuvera</span>
          </Link>
          <button
            className="mm__close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close"
            type="button"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Mobile Quick Search */}
        <div className="mm__search-bar">
          <button
            className="mm__search-trigger"
            onClick={() => {
              setIsMobileMenuOpen(false)
              setTimeout(() => setSearchOpen(true), 200)
            }}
            type="button"
          >
            <FiSearch size={18} />
            <span>Search destinations…</span>
          </button>
        </div>

        {/* Mobile Body */}
        <div className="mm__body">
          {navLinks.map((link, idx) => (
            <div key={link.name} className="mm__item" style={{ '--idx': idx }}>
              {link.dropdown ? (
                <>
                  <button
                    className={cn(
                      'mm__toggle',
                      activeMobileDropdown === link.name && 'mm__toggle--on',
                    )}
                    onClick={() => toggleMobileDropdown(link.name)}
                    aria-expanded={activeMobileDropdown === link.name}
                    type="button"
                  >
                    <span className="mm__toggle-text">{link.name}</span>
                    <FiChevronDown
                      size={18}
                      className={cn(
                        'mm__chev',
                        activeMobileDropdown === link.name && 'mm__chev--open',
                      )}
                    />
                  </button>
                  <div className={cn(
                    'mm__sub',
                    activeMobileDropdown === link.name && 'mm__sub--open',
                  )}>
                    {link.dropdown.map((sub, si) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={cn(
                          'mm__sub-link',
                          sub.info && 'mm__sub-link--rich',
                          location.pathname === sub.path && 'mm__sub-link--active',
                        )}
                        style={{ '--si': si }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub.flag ? (
                          <span className="mm__sub-flag">
                            {sub.flag.startsWith('http') || sub.flag.includes('/')
                              ? <img src={sub.flag} alt={`${sub.name} flag`} />
                              : sub.flag}
                          </span>
                        ) : (
                          <span className="mm__sub-dot" />
                        )}
                        <div className="mm__sub-text-wrap">
                          <span className="mm__sub-name">{sub.name}</span>
                          {sub.info && (
                            <span className="mm__sub-info">{sub.info}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className={cn(
                    'mm__link',
                    location.pathname === link.path && 'mm__link--active',
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          <div className="mm__divider" />

          {/* Mobile Auth */}
          <div className="mm__auth">
            {isAuthenticated ? (
              <>
                <div className="mm__profile">
                  {user?.avatar ? (
                    <span className="mm__pav-wrap">
                      {!avatarLoaded && <span className="nav__avatar-spin" />}
                      <img
                        src={user.avatar}
                        alt=""
                        className="mm__pav-img"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)}
                      />
                    </span>
                  ) : (
                    <span className="mm__pav-init">{getInitials()}</span>
                  )}
                  <div>
                    <p className="mm__pname">{displayName}</p>
                    <p className="mm__pemail">{user?.email}</p>
                    <p className="mm__pprov">{providerLabel} account</p>
                  </div>
                </div>
                {userMenuItems.map(m => (
                  <Link
                    key={m.to}
                    to={m.to}
                    className="mm__auth-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <m.icon size={18} /> {m.label}
                  </Link>
                ))}
                <button className="mm__out" onClick={handleLogout} type="button">
                  <FiLogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <button
                className="mm__sign"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  openModal('login', { skipNotLoggedInMessage: true })
                }}
                type="button"
              >
                <FiUser size={18} />
                Sign In / Sign Up
              </button>
            )}
          </div>

          {/* Mobile CTA */}
          <Link
            to="/booking"
            className="mm__cta"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Book Your Adventure</span>
            <FiArrowRight size={18} />
          </Link>
        </div>
      </aside>
    </>
  )
}

export default Navbar