'use client';

import { checkGlucose, checkHemoglobin, checkCholesterol, hasMajorIssues } from '@/lib/utils';
import { Fragment } from 'react';

export default function PatientDetailsModal({ isOpen, patient, onClose }) {
  if (!isOpen || !patient) return null;

  const hasMajor = hasMajorIssues(patient);
  
  // Determine Urgency
  let urgency = 'Routine';
  let urgencyColor = 'bg-green-100 text-green-800 border-green-200';
  let urgencyIcon = (
    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (hasMajor) {
    urgency = 'Urgent Review';
    urgencyColor = 'bg-red-100 text-red-800 border-red-200';
    urgencyIcon = (
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    );
  } else if (
    checkGlucose(patient.glucose) === 'borderline' ||
    checkHemoglobin(patient.hemoglobin) === 'borderline' ||
    checkCholesterol(patient.cholesterol) === 'borderline'
  ) {
    urgency = 'Monitor';
    urgencyColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    urgencyIcon = (
      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#C4E2F5] transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${hasMajor ? 'bg-red-50 border-red-100' : 'bg-[#F0F8FE]'}`}>
          <h3 className="text-lg font-bold text-brand-deep flex items-center gap-2">
            AI Clinical Review
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors rounded-full p-1 hover:bg-white/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Profile Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{patient.fullName}</h4>
              <p className="text-sm text-gray-500 mt-1">{patient.email} • DOB: {formatDate(patient.dateOfBirth)}</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${urgencyColor} text-xs font-bold uppercase tracking-wider`}>
              {urgencyIcon}
              {urgency}
            </div>
          </div>

          {/* Lab Values Grid */}
          <div className="mb-6">
            <h5 className="text-xs font-semibold uppercase tracking-widest text-brand-deep mb-3">Lab Results</h5>
            <div className="grid grid-cols-3 gap-3">
              <LabStat label="Glucose" value={patient.glucose} unit="mg/dL" status={checkGlucose(patient.glucose)} />
              <LabStat label="Hemoglobin" value={patient.hemoglobin} unit="g/dL" status={checkHemoglobin(patient.hemoglobin)} />
              <LabStat label="Cholesterol" value={patient.cholesterol} unit="mg/dL" status={checkCholesterol(patient.cholesterol)} />
            </div>
          </div>

          {/* AI Remarks */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-brand-deep mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Gemini AI Assessment
            </h5>
            <div className={`p-4 rounded-xl text-sm leading-relaxed ${hasMajor ? 'bg-red-50 text-red-900 border border-red-100' : 'bg-gray-50 text-gray-700 border border-gray-100'}`}>
              {patient.remarks === 'Analyzing...' ? (
                <div className="flex items-center gap-2 text-brand-primary font-medium">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analysis in progress...
                </div>
              ) : (
                patient.remarks || 'No remarks available.'
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LabStat({ label, value, unit, status }) {
  let textColor = 'text-gray-900';
  let bgColor = 'bg-gray-50 border-gray-200';
  
  if (status === 'high' || status === 'low') {
    textColor = 'text-red-700';
    bgColor = 'bg-red-50 border-red-200';
  } else if (status === 'borderline') {
    textColor = 'text-yellow-700';
    bgColor = 'bg-yellow-50 border-yellow-200';
  }

  return (
    <div className={`p-3 rounded-lg border ${bgColor} text-center flex flex-col justify-center`}>
      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-black ${textColor} leading-none`}>{value ?? '—'}</p>
      <p className="text-xs text-gray-400 mt-1">{unit}</p>
    </div>
  );
}
