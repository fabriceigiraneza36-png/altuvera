import React, { useState, useEffect, useRef } from 'react';
import { FiDownload, FiCheckCircle, FiX, FiEye, FiAlertCircle } from 'react-icons/fi';
import { generateTravelGuide, generatePackageChecklist, downloadPDF, previewPDF } from '../../utils/pdfGenerator';

const DownloadTips = ({ 
  tips = [], 
  tourName = 'East Africa Safari',
  tourData = {},
  expenses = {},
  userInfo = {},
  type = 'tips', // 'tips', 'checklist', 'booking'
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  // Intersection Observer for scroll-into-view effect
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

    const triggerElement = document.querySelector('[data-download-trigger]');
    if (triggerElement) {
      observer.observe(triggerElement);
    }

    return () => {
      if (triggerElement) observer.unobserve(triggerElement);
    };
  }, []);

  // Close modal on escape key
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

  const generatePDF = () => {
    switch (type) {
      case 'checklist':
        return generatePackageChecklist(tourData, expenses, userInfo);
      case 'tips':
      default:
        return generateTravelGuide(tips, tourName);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStatus('preparing');
    setErrorMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const pdf = generatePDF();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Altuvera_${tourName.replace(/\s+/g, '_')}_${type}_${timestamp}.pdf`;

      const result = downloadPDF(pdf, filename);

      if (result.success) {
        setDownloadStatus('success');
        setTimeout(() => {
          setDownloadStatus(null);
          setShowModal(false);
        }, 2000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setErrorMessage(error.message || 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const pdf = generatePDF();
      const result = previewPDF(pdf);
      
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Preview error:', error);
      setErrorMessage(error.message || 'Failed to preview PDF');
    }
  };

  if (!tips || tips.length === 0) return null;

  return (
    <>
      {/* Floating Download Button - Hidden until scrolled into view */}
      <div
        ref={buttonRef}
        className={`
          fixed bottom-8 right-8 z-40 transition-all duration-500 transform
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
          ${className}
        `}
      >
        <button
          onClick={() => setShowModal(true)}
          className="
            group relative bg-gradient-to-r from-green-600 to-green-700 
            hover:from-green-700 hover:to-green-800
            text-white px-6 py-4 rounded-full shadow-2xl
            transition-all duration-300 ease-out
            hover:scale-105 hover:shadow-green-500/50
            focus:outline-none focus:ring-4 focus:ring-green-300
            flex items-center gap-3
          "
          aria-label="Download travel documents"
        >
          <FiDownload className="w-5 h-5 group-hover:animate-bounce" />
          <span className="font-semibold hidden sm:inline">Download PDF</span>
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-25 group-hover:animate-ping"></span>
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          {/* Modal Content */}
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="
              bg-white rounded-2xl shadow-2xl max-w-2xl w-full
              transform transition-all duration-300 animate-slideUp
              max-h-[90vh] overflow-y-auto
            "
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="
                  absolute top-4 right-4 text-white/80 hover:text-white
                  transition-colors p-2 hover:bg-white/10 rounded-full
                "
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6" />
              </button>

              <div className="pr-12">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Download Your Travel Documents
                </h2>
                <p className="text-green-100 text-sm">
                  {tourName} - Professional PDF Package
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Document Preview */}
              <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FiDownload className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      What's Included:
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Professional travel tips & destination guide
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Comprehensive packing checklist
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Important safety & health information
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Beautifully formatted for printing
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {downloadStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fadeIn">
                  <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm font-medium">
                    PDF downloaded successfully! Check your downloads folder.
                  </p>
                </div>
              )}

              {downloadStatus === 'error' && errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fadeIn">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm font-medium">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handlePreview}
                  disabled={isDownloading}
                  className="
                    flex items-center justify-center gap-2 px-6 py-3 
                    bg-white border-2 border-green-600 text-green-600
                    rounded-lg font-semibold transition-all duration-200
                    hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  <FiEye className="w-5 h-5" />
                  Preview PDF
                </button>

                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="
                    flex items-center justify-center gap-2 px-6 py-3 
                    bg-gradient-to-r from-green-600 to-green-700
                    hover:from-green-700 hover:to-green-800
                    text-white rounded-lg font-semibold 
                    transition-all duration-200 shadow-lg hover:shadow-xl
                    focus:outline-none focus:ring-4 focus:ring-green-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    relative overflow-hidden
                  "
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Preparing...</span>
                    </>
                  ) : downloadStatus === 'success' ? (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-5 h-5" />
                      <span>Download Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Your document will be downloaded as a high-quality PDF file.
                  <br />
                  Compatible with all devices and ready to print.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll Trigger Element (place this where you want the button to appear) */}
      <div data-download-trigger className="h-1 w-1 opacity-0 pointer-events-none"></div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default DownloadTips;