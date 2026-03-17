import React, { useState } from 'react';
import { FiDownload, FiCheckCircle, FiPackage } from 'react-icons/fi';
import { generatePackageChecklist, downloadPDF } from '../../utils/pdfGenerator';
import { calculateTourExpenses } from '../../utils/expenseCalculator';
import './PackageChecklist.css';

const PackageChecklist = ({
  tourData = {},
  expenses = {},
  userInfo = {},
  expenses: customExpenses = null,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState(null);

  const handleGenerateChecklist = async () => {
    setIsGenerating(true);
    setGenerateStatus('preparing');

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use provided expenses or calculate AI expenses
      const expensesToUse = customExpenses || expenses || calculateTourExpenses(tourData);

      const pdf = generatePackageChecklist(tourData, expensesToUse, userInfo);

      const tourName = tourData.tourName || 'Safari_Package';
      const filename = `${tourName.replace(/\s+/g, '_')}_Checklist_${new Date().toISOString().split('T')[0]}.pdf`;

      const success = downloadPDF(pdf, filename);

      if (success) {
        setGenerateStatus('success');
        setTimeout(() => setGenerateStatus(null), 3000);
      } else {
        setGenerateStatus('error');
        setTimeout(() => setGenerateStatus(null), 3000);
      }
    } catch (error) {
      console.error('Checklist generation error:', error);
      setGenerateStatus('error');
      setTimeout(() => setGenerateStatus(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`package-checklist ${className}`}>
      <div className="checklist-header">
        <div className="checklist-icon">
          <FiPackage size={24} />
        </div>
        <div>
          <h3>Travel Checklist & Expenses</h3>
          <p>Download your personalized packing checklist and travel expenses breakdown</p>
        </div>
      </div>

      <button
        className={`checklist-btn checklist-btn--${generateStatus || 'default'}`}
        onClick={handleGenerateChecklist}
        disabled={isGenerating}
        aria-label="Download package checklist"
      >
        {isGenerating ? (
          <>
            <span className="checklist-spinner" />
            Generating Checklist...
          </>
        ) : generateStatus === 'success' ? (
          <>
            <FiCheckCircle size={18} />
            Checklist Downloaded!
          </>
        ) : generateStatus === 'error' ? (
          <>
            <FiDownload size={18} />
            Try Again
          </>
        ) : (
          <>
            <FiDownload size={18} />
            Generate & Download Checklist
          </>
        )}
      </button>

      {generateStatus === 'error' && (
        <span className="checklist-error">
          Failed to generate checklist. Please try again.
        </span>
      )}

      <div className="checklist-features">
        <p>✓ Personalized packing list</p>
        <p>✓ Expense breakdown by category</p>
        <p>✓ Tour details and dates</p>
        <p>✓ Professional PDF format</p>
      </div>
    </div>
  );
};

export default PackageChecklist;
