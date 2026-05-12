import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiDownload, FiCheckCircle, FiX, FiEye, FiAlertCircle, FiFileText, FiPrinter, FiShield } from 'react-icons/fi';
import { generateTravelGuide, generatePackageChecklist, downloadPDF, previewPDF } from '../../utils/pdfGenerator';
import './DownloadTips.css';

const DownloadTips = ({
  tips = [],
  tourName = 'East Africa Safari',
  tourData = {},
  expenses = {},
  userInfo = {},
  type = 'tips',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('download');
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const generatePDF = useCallback(() => {
    switch (type) {
      case 'checklist':
        return generatePackageChecklist(tourData, expenses, userInfo);
      case 'tips':
      default:
        return generateTravelGuide(tips, tourName);
    }
  }, [type, tourData, expenses, userInfo, tips, tourName]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStatus('preparing');
    setErrorMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pdf = generatePDF();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Altuvera_${tourName.replace(/\s+/g, '_')}_${type}_${timestamp}.pdf`;

      const result = downloadPDF(pdf, filename);

      if (result.success) {
        setDownloadStatus('success');
        setTimeout(() => {
          setDownloadStatus(null);
        }, 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setErrorMessage(error.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    setErrorMessage('');
    try {
      const pdf = generatePDF();
      const result = previewPDF(pdf);

      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Preview error:', error);
      setErrorMessage(error.message || 'Failed to preview PDF. Please try downloading instead.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDownloadStatus(null);
    setErrorMessage('');
    setActiveTab('download');
  };

  const getDocumentTitle = () => {
    switch (type) {
      case 'checklist':
        return 'Travel Checklist';
      case 'booking':
        return 'Booking Confirmation';
      default:
        return 'Travel Guide';
    }
  };

  if (!tips || tips.length === 0) return null;

  return (
    <>
      {/* Scroll Trigger */}
      <div ref={triggerRef} className="download-trigger" aria-hidden="true" />

      {/* Floating Action Button */}
      <div
        ref={buttonRef}
        className={`download-fab-wrapper ${isVisible ? 'download-fab-visible' : 'download-fab-hidden'} ${className}`}
      >
        <button
          onClick={() => setShowModal(true)}
          className="download-fab"
          aria-label={`Download ${getDocumentTitle()}`}
        >
          <span className="download-fab-pulse" />
          <span className="download-fab-ring" />
          <FiDownload className="download-fab-icon" />
          <span className="download-fab-label">Download PDF</span>
          <span className="download-fab-badge">{tips.length}</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="download-overlay" onClick={handleCloseModal}>
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="download-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-modal-title"
          >
            {/* Modal Header */}
            <header className="download-modal-header">
              <div className="download-modal-header-bg" />
              <div className="download-modal-header-content">
                <div className="download-modal-header-icon-wrapper">
                  <div className="download-modal-header-icon">
                    <FiFileText />
                  </div>
                </div>
                <div className="download-modal-header-text">
                  <h2 id="download-modal-title" className="download-modal-title">
                    {getDocumentTitle()}
                  </h2>
                  <p className="download-modal-subtitle">
                    {tourName}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="download-modal-close"
                  aria-label="Close download dialog"
                >
                  <FiX />
                </button>
              </div>

              {/* Tab Navigation */}
              <nav className="download-tabs">
                <button
                  className={`download-tab ${activeTab === 'download' ? 'download-tab-active' : ''}`}
                  onClick={() => setActiveTab('download')}
                >
                  <FiDownload className="download-tab-icon" />
                  <span>Download</span>
                </button>
                <button
                  className={`download-tab ${activeTab === 'contents' ? 'download-tab-active' : ''}`}
                  onClick={() => setActiveTab('contents')}
                >
                  <FiFileText className="download-tab-icon" />
                  <span>Contents</span>
                </button>
              </nav>
            </header>

            {/* Modal Body */}
            <div className="download-modal-body">
              {/* Download Tab */}
              {activeTab === 'download' && (
                <div className="download-tab-content download-tab-content-enter">
                  {/* Document Card */}
                  <div className="download-document-card">
                    <div className="download-document-preview">
                      <div className="download-document-mock">
                        <div className="download-document-mock-header" />
                        <div className="download-document-mock-lines">
                          <div className="download-document-mock-line download-document-mock-line-full" />
                          <div className="download-document-mock-line download-document-mock-line-3q" />
                          <div className="download-document-mock-line download-document-mock-line-half" />
                          <div className="download-document-mock-line download-document-mock-line-full" />
                          <div className="download-document-mock-line download-document-mock-line-2q" />
                        </div>
                        <div className="download-document-mock-footer">
                          <span>ALTUVERA</span>
                        </div>
                      </div>
                    </div>

                    <div className="download-document-info">
                      <h3 className="download-document-name">
                        Altuvera_{tourName.replace(/\s+/g, '_')}_{type}.pdf
                      </h3>
                      <div className="download-document-meta">
                        <span className="download-document-meta-item">
                          <FiFileText className="download-document-meta-icon" />
                          PDF Document
                        </span>
                        <span className="download-document-meta-divider">•</span>
                        <span className="download-document-meta-item">
                          <FiPrinter className="download-document-meta-icon" />
                          Print Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="download-features">
                    <div className="download-feature">
                      <div className="download-feature-icon">
                        <FiFileText />
                      </div>
                      <div className="download-feature-text">
                        <h4>Professional Layout</h4>
                        <p>Beautifully formatted guide with clear sections</p>
                      </div>
                    </div>
                    <div className="download-feature">
                      <div className="download-feature-icon">
                        <FiPrinter />
                      </div>
                      <div className="download-feature-text">
                        <h4>Print Optimized</h4>
                        <p>High quality output ready for printing</p>
                      </div>
                    </div>
                    <div className="download-feature">
                      <div className="download-feature-icon">
                        <FiShield />
                      </div>
                      <div className="download-feature-text">
                        <h4>Safety Info</h4>
                        <p>Important health and safety guidelines</p>
                      </div>
                    </div>
                    <div className="download-feature">
                      <div className="download-feature-icon">
                        <FiCheckCircle />
                      </div>
                      <div className="download-feature-text">
                        <h4>Complete Guide</h4>
                        <p>{tips.length} tips and recommendations included</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {downloadStatus === 'success' && (
                    <div className="download-status download-status-success">
                      <div className="download-status-icon-wrapper download-status-icon-success">
                        <FiCheckCircle />
                      </div>
                      <div className="download-status-content">
                        <h4>Download Complete!</h4>
                        <p>Your document has been saved to your downloads folder.</p>
                      </div>
                    </div>
                  )}

                  {downloadStatus === 'preparing' && (
                    <div className="download-status download-status-preparing">
                      <div className="download-status-icon-wrapper download-status-icon-preparing">
                        <div className="download-spinner" />
                      </div>
                      <div className="download-status-content">
                        <h4>Preparing Document...</h4>
                        <p>Generating your professional travel guide.</p>
                      </div>
                      <div className="download-progress-bar">
                        <div className="download-progress-fill" />
                      </div>
                    </div>
                  )}

                  {downloadStatus === 'error' && errorMessage && (
                    <div className="download-status download-status-error">
                      <div className="download-status-icon-wrapper download-status-icon-error">
                        <FiAlertCircle />
                      </div>
                      <div className="download-status-content">
                        <h4>Download Failed</h4>
                        <p>{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="download-actions">
                    <button
                      onClick={handlePreview}
                      disabled={isDownloading}
                      className="download-btn download-btn-secondary"
                    >
                      <FiEye className="download-btn-icon" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="download-btn download-btn-primary"
                    >
                      {isDownloading ? (
                        <>
                          <div className="download-btn-spinner" />
                          <span>Generating...</span>
                        </>
                      ) : downloadStatus === 'success' ? (
                        <>
                          <FiCheckCircle className="download-btn-icon" />
                          <span>Downloaded!</span>
                        </>
                      ) : (
                        <>
                          <FiDownload className="download-btn-icon" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Contents Tab */}
              {activeTab === 'contents' && (
                <div className="download-tab-content download-tab-content-enter">
                  <div className="download-contents-header">
                    <h3>Document Contents</h3>
                    <span className="download-contents-count">{tips.length} items</span>
                  </div>

                  <div className="download-contents-list">
                    {tips.map((tip, index) => (
                      <div key={index} className="download-contents-item">
                        <div className="download-contents-item-number">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="download-contents-item-text">
                          <h4>{tip.title || tip}</h4>
                          {tip.description && (
                            <p>{tip.description}</p>
                          )}
                        </div>
                        <FiCheckCircle className="download-contents-item-check" />
                      </div>
                    ))}
                  </div>

                  {/* Download from Contents */}
                  <div className="download-contents-action">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="download-btn download-btn-primary download-btn-full"
                    >
                      <FiDownload className="download-btn-icon" />
                      <span>Download All {tips.length} Items as PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <footer className="download-modal-footer">
              <div className="download-modal-footer-brand">
                <span className="download-modal-footer-logo">ALTUVERA</span>
                <span className="download-modal-footer-divider">|</span>
                <span className="download-modal-footer-tagline">Travel Made Beautiful</span>
              </div>
              <p className="download-modal-footer-note">
                Compatible with all devices • High-quality PDF • Ready to print
              </p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadTips;