'use client';

import Link from 'next/link';
import { checkGlucose, checkHemoglobin, checkCholesterol, hasMajorIssues } from '@/lib/utils';

export default function PatientCard({ patient, onDelete, onViewDetails }) {
  const isPending = patient.remarks === 'Analyzing...';
  const hasMajor = hasMajorIssues(patient);

  const glucoseStatus = checkGlucose(patient.glucose);
  const hemoglobinStatus = checkHemoglobin(patient.hemoglobin);
  const cholesterolStatus = checkCholesterol(patient.cholesterol);

  // Determine urgency tag
  let urgency = 'Routine';
  let urgencyStyles = 'bg-green-100 text-green-800 border-green-200';
  if (hasMajor) {
    urgency = 'Urgent Review';
    urgencyStyles = 'bg-red-100 text-red-800 border-red-200';
  } else if (glucoseStatus === 'borderline' || hemoglobinStatus === 'borderline' || cholesterolStatus === 'borderline') {
    urgency = 'Monitor';
    urgencyStyles = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <article className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3 relative overflow-hidden ${hasMajor ? 'border-red-300' : 'border-[#C4E2F5]'}`}>
      {/* Visual flag for major issues */}
      {hasMajor && (
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 pl-2">
        <div>
          <h2 className="text-base font-semibold text-brand-deep leading-tight flex items-center gap-2">
            {patient.fullName}
            {hasMajor && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                At Risk
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{patient.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/patient/${patient.id}/edit`}
            id={`btn-edit-${patient.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-[#C4E2F5] bg-white px-2.5 py-1 text-xs font-medium text-brand-primary hover:bg-brand-pale transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            id={`btn-delete-${patient.id}`}
            onClick={() => onDelete(patient)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Lab Values Row */}
      <div className={`grid grid-cols-3 gap-2 rounded-lg p-3 ${hasMajor ? 'bg-red-50' : 'bg-[#F0F8FE]'}`}>
        <LabValue label="Glucose" value={patient.glucose} unit="mg/dL" status={checkGlucose(patient.glucose)} />
        <LabValue label="Hemoglobin" value={patient.hemoglobin} unit="g/dL" status={checkHemoglobin(patient.hemoglobin)} />
        <LabValue label="Cholesterol" value={patient.cholesterol} unit="mg/dL" status={checkCholesterol(patient.cholesterol)} />
      </div>

      {/* DOB */}
      <p className="text-xs text-gray-500 pl-2">
        <span className="font-medium text-gray-600">DOB:</span> {formatDate(patient.dateOfBirth)}
      </p>

      {/* AI Remarks & Urgency */}
      <div className={`border-t pt-3 pl-2 flex items-center justify-between ${hasMajor ? 'border-red-200' : 'border-[#C4E2F5]'}`}>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-deep">AI Remarks</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${urgencyStyles}`}>
            {urgency}
          </span>
        </div>
        <button
          onClick={() => onViewDetails && onViewDetails(patient)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-deep transition-colors group"
        >
          <svg className="w-4 h-4 p-0.5 rounded bg-brand-pale group-hover:bg-brand-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Review
        </button>
      </div>
    </article>
  );
}

function LabValue({ label, value, unit, status }) {
  let textColor = 'text-brand-deep';
  if (status === 'high' || status === 'low') textColor = 'text-red-600';
  else if (status === 'borderline') textColor = 'text-amber-600';

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${textColor}`}>{value ?? '—'}</p>
      <p className="text-xs text-gray-400">{unit}</p>
    </div>
  );
}
