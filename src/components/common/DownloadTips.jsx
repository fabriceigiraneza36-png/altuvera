import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiDownload,
  FiCheckCircle,
  FiX,
  FiEye,
  FiAlertCircle,
  FiFileText,
  FiPrinter,
  FiShield,
  FiRefreshCw
} from 'react-icons/fi';
import {
  generateTravelGuide,
  generatePackageChecklist,
  downloadPDF,
  previewPDF
} from '../../utils/pdfGenerator';
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);
  const previewBlobUrl = useRef(null);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px' }
    );

    const el = triggerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  // Escape key + body lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleCloseModal();
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

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewBlobUrl.current) {
        URL.revokeObjectURL(previewBlobUrl.current);
      }
    };
  }, []);

  // Generate preview when modal opens or tab switches to download
  useEffect(() => {
    if (showModal && activeTab === 'download' && !previewUrl && !previewError) {
      generatePreview();
    }
  }, [showModal, activeTab]);

  const generatePDFDocument = useCallback(() => {
    try {
      switch (type) {
        case 'checklist':
          return generatePackageChecklist(tourData, expenses, userInfo);
        case 'tips':
        default:
          return generateTravelGuide(tips, tourName);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      throw new Error('Failed to generate document. Please try again.');
    }
  }, [type, tourData, expenses, userInfo, tips, tourName]);

  const generatePreview = useCallback(async () => {
    setIsPreviewLoading(true);
    setPreviewError('');

    try {
      // Revoke old blob
      if (previewBlobUrl.current) {
        URL.revokeObjectURL(previewBlobUrl.current);
        previewBlobUrl.current = null;
      }

      await new Promise((r) => setTimeout(r, 300));

      const pdf = generatePDFDocument();
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      previewBlobUrl.current = url;
      setPreviewUrl(url);
    } catch (err) {
      console.error('Preview generation error:', err);
      setPreviewError(err.message || 'Could not generate preview.');
      setPreviewUrl(null);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [generatePDFDocument]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStatus('preparing');
    setErrorMessage('');

    try {
      await new Promise((r) => setTimeout(r, 600));

      const pdf = generatePDFDocument();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Altuvera_${tourName.replace(/\s+/g, '_')}_${type}_${timestamp}.pdf`;

      const result = downloadPDF(pdf, filename);

      if (result.success) {
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus(null), 3000);
      } else {
        throw new Error(result.message || 'Download failed.');
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setErrorMessage(error.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDownloadStatus(null);
    setErrorMessage('');
    setActiveTab('download');
    // Keep preview URL cached for re-open
  };

  const handleRetryPreview = () => {
    setPreviewUrl(null);
    setPreviewError('');
    generatePreview();
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
      <div ref={triggerRef} className="dl-trigger" aria-hidden="true" />

      {/* Floating Action Button */}
      <div
        ref={buttonRef}
        className={`dl-fab-container ${isVisible ? 'dl-fab-show' : 'dl-fab-hide'} ${className}`}
      >
        <button
          onClick={() => setShowModal(true)}
          className="dl-fab-button"
          aria-label={`Download ${getDocumentTitle()}`}
        >
          <span className="dl-fab-ripple" />
          <FiDownload className="dl-fab-icon" />
          <span className="dl-fab-text">Download PDF</span>
          <span className="dl-fab-count">{tips.length}</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="dl-overlay" onClick={handleCloseModal}>
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="dl-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dl-modal-heading"
          >
            {/* Header */}
            <header className="dl-header">
              <div className="dl-header-decor" />
              <div className="dl-header-inner">
                <div className="dl-header-icon-box">
                  <FiFileText />
                </div>
                <div className="dl-header-info">
                  <h2 id="dl-modal-heading" className="dl-header-title">
                    {getDocumentTitle()}
                  </h2>
                  <p className="dl-header-sub">{tourName}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="dl-header-close"
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>

              {/* Tabs */}
              <nav className="dl-tabs">
                <button
                  className={`dl-tab ${activeTab === 'download' ? 'dl-tab-on' : ''}`}
                  onClick={() => setActiveTab('download')}
                >
                  <FiDownload className="dl-tab-ico" />
                  Download
                </button>
                <button
                  className={`dl-tab ${activeTab === 'preview' ? 'dl-tab-on' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  <FiEye className="dl-tab-ico" />
                  Preview
                </button>
                <button
                  className={`dl-tab ${activeTab === 'contents' ? 'dl-tab-on' : ''}`}
                  onClick={() => setActiveTab('contents')}
                >
                  <FiFileText className="dl-tab-ico" />
                  Contents
                </button>
              </nav>
            </header>

            {/* Body */}
            <div className="dl-body">
              {/* ===== DOWNLOAD TAB ===== */}
              {activeTab === 'download' && (
                <div className="dl-panel dl-panel-enter">
                  {/* File Card */}
                  <div className="dl-file-card">
                    <div className="dl-file-thumb">
                      <div className="dl-file-mock">
                        <div className="dl-mock-bar" />
                        <div className="dl-mock-lines">
                          <span style={{ width: '100%' }} />
                          <span style={{ width: '75%' }} />
                          <span style={{ width: '50%' }} />
                          <span style={{ width: '90%' }} />
                          <span style={{ width: '60%' }} />
                        </div>
                        <div className="dl-mock-brand">ALTUVERA</div>
                      </div>
                    </div>
                    <div className="dl-file-info">
                      <h3 className="dl-file-name">
                        Altuvera_{tourName.replace(/\s+/g, '_')}.pdf
                      </h3>
                      <div className="dl-file-meta">
                        <span>
                          <FiFileText /> PDF Document
                        </span>
                        <span className="dl-file-dot">•</span>
                        <span>
                          <FiPrinter /> Print Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="dl-features">
                    <div className="dl-feat">
                      <div className="dl-feat-ico">
                        <FiFileText />
                      </div>
                      <div>
                        <h4>Professional Layout</h4>
                        <p>Clean, structured sections</p>
                      </div>
                    </div>
                    <div className="dl-feat">
                      <div className="dl-feat-ico">
                        <FiPrinter />
                      </div>
                      <div>
                        <h4>Print Optimized</h4>
                        <p>High-quality output</p>
                      </div>
                    </div>
                    <div className="dl-feat">
                      <div className="dl-feat-ico">
                        <FiShield />
                      </div>
                      <div>
                        <h4>Safety Info</h4>
                        <p>Health & safety tips</p>
                      </div>
                    </div>
                    <div className="dl-feat">
                      <div className="dl-feat-ico">
                        <FiCheckCircle />
                      </div>
                      <div>
                        <h4>Complete Guide</h4>
                        <p>{tips.length} items included</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  {downloadStatus === 'success' && (
                    <div className="dl-alert dl-alert-ok dl-panel-enter">
                      <FiCheckCircle className="dl-alert-ico" />
                      <div>
                        <strong>Download Complete!</strong>
                        <p>Saved to your downloads folder.</p>
                      </div>
                    </div>
                  )}

                  {downloadStatus === 'preparing' && (
                    <div className="dl-alert dl-alert-wait dl-panel-enter">
                      <div className="dl-spin" />
                      <div>
                        <strong>Preparing Document...</strong>
                        <p>Generating your travel guide.</p>
                      </div>
                      <div className="dl-progress">
                        <div className="dl-progress-bar" />
                      </div>
                    </div>
                  )}

                  {downloadStatus === 'error' && errorMessage && (
                    <div className="dl-alert dl-alert-err dl-panel-enter">
                      <FiAlertCircle className="dl-alert-ico" />
                      <div>
                        <strong>Download Failed</strong>
                        <p>{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="dl-actions">
                    <button
                      onClick={() => setActiveTab('preview')}
                      disabled={isDownloading}
                      className="dl-btn dl-btn-ghost"
                    >
                      <FiEye />
                      Preview
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="dl-btn dl-btn-solid"
                    >
                      {isDownloading ? (
                        <>
                          <div className="dl-btn-spin" />
                          Generating...
                        </>
                      ) : downloadStatus === 'success' ? (
                        <>
                          <FiCheckCircle />
                          Downloaded!
                        </>
                      ) : (
                        <>
                          <FiDownload />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ===== PREVIEW TAB ===== */}
              {activeTab === 'preview' && (
                <div className="dl-panel dl-panel-enter">
                  <div className="dl-preview-wrapper">
                    {isPreviewLoading && (
                      <div className="dl-preview-loader">
                        <div className="dl-spin dl-spin-lg" />
                        <p>Generating preview...</p>
                      </div>
                    )}

                    {previewError && !isPreviewLoading && (
                      <div className="dl-preview-error">
                        <FiAlertCircle className="dl-preview-error-ico" />
                        <p>{previewError}</p>
                        <button onClick={handleRetryPreview} className="dl-btn dl-btn-ghost dl-btn-sm">
                          <FiRefreshCw />
                          Retry
                        </button>
                      </div>
                    )}

                    {previewUrl && !isPreviewLoading && !previewError && (
                      <iframe
                        src={previewUrl}
                        className="dl-preview-frame"
                        title="PDF Preview"
                      />
                    )}

                    {!previewUrl && !isPreviewLoading && !previewError && (
                      <div className="dl-preview-empty">
                        <FiEye className="dl-preview-empty-ico" />
                        <p>Click below to generate preview</p>
                        <button onClick={generatePreview} className="dl-btn dl-btn-ghost dl-btn-sm">
                          <FiEye />
                          Generate Preview
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Preview Actions */}
                  <div className="dl-actions">
                    <button
                      onClick={handleOpenInNewTab}
                      disabled={!previewUrl}
                      className="dl-btn dl-btn-ghost"
                    >
                      <FiEye />
                      Open in New Tab
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="dl-btn dl-btn-solid"
                    >
                      {isDownloading ? (
                        <>
                          <div className="dl-btn-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ===== CONTENTS TAB ===== */}
              {activeTab === 'contents' && (
                <div className="dl-panel dl-panel-enter">
                  <div className="dl-contents-top">
                    <h3>Document Contents</h3>
                    <span className="dl-contents-badge">{tips.length} items</span>
                  </div>

                  <div className="dl-contents-list">
                    {tips.map((tip, i) => (
                      <div key={i} className="dl-contents-row">
                        <div className="dl-contents-num">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="dl-contents-text">
                          <h4>{tip.title || tip}</h4>
                          {tip.description && <p>{tip.description}</p>}
                        </div>
                        <FiCheckCircle className="dl-contents-check" />
                      </div>
                    ))}
                  </div>

                  <div className="dl-actions dl-actions-single">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="dl-btn dl-btn-solid dl-btn-full"
                    >
                      <FiDownload />
                      Download All {tips.length} Items
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="dl-footer">
              <div className="dl-footer-brand">
                <span className="dl-footer-logo">ALTUVERA</span>
                <span className="dl-footer-sep">|</span>
                <span className="dl-footer-tag">Travel Made Beautiful</span>
              </div>
              <p className="dl-footer-note">
                Compatible with all devices · High-quality PDF · Ready to print
              </p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadTips;