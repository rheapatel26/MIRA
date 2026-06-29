'use client';

import Link from 'next/link';
import { checkGlucose, checkHemoglobin, checkCholesterol, hasMajorIssues } from '@/lib/utils';

export default function PatientTable({ patients, onDelete, onViewDetails }) {
  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#C4E2F5] shadow-sm">
      <table className="min-w-full divide-y divide-[#C4E2F5] bg-white">
        <thead className="bg-[#F0F8FE]">
          <tr>
            {[
              'Patient',
              'Date of Birth',
              'Glucose (mg/dL)',
              'Hemoglobin (g/dL)',
              'Cholesterol (mg/dL)',
              'AI Remarks',
              'Actions',
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-brand-deep"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8F4FC]">
          {patients.map((patient, idx) => (
            <PatientRow
              key={patient.id}
              patient={patient}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              formatDate={formatDate}
              isEven={idx % 2 === 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientRow({ patient, onDelete, onViewDetails, formatDate, isEven }) {
  const isPending = patient.remarks === 'Analyzing...';
  const hasMajor = hasMajorIssues(patient);

  const glucoseStatus = checkGlucose(patient.glucose);
  const hemoglobinStatus = checkHemoglobin(patient.hemoglobin);
  const cholesterolStatus = checkCholesterol(patient.cholesterol);

  const getStatusColor = (status) => {
    if (status === 'high' || status === 'low') return 'text-red-600 font-bold';
    if (status === 'borderline') return 'text-amber-600 font-semibold';
    return 'text-gray-800 font-medium';
  };

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

  return (
    <tr className={`${isEven ? 'bg-white' : 'bg-[#FAFCFF]'} ${hasMajor ? 'bg-red-50/30' : ''}`}>
      {/* Patient Name + Email */}
      <td className="px-4 py-3 min-w-[160px] relative">
        {hasMajor && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
        <div className="pl-2">
          <p className="text-sm font-semibold text-brand-deep leading-tight flex items-center gap-2">
            {patient.fullName}
            {hasMajor && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800 uppercase tracking-wider">
                Flagged
              </span>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{patient.email}</p>
        </div>
      </td>

      {/* DOB */}
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {formatDate(patient.dateOfBirth)}
      </td>

      {/* Lab Values */}
      <td className={`px-4 py-3 text-sm ${getStatusColor(glucoseStatus)}`}>{patient.glucose ?? '—'}</td>
      <td className={`px-4 py-3 text-sm ${getStatusColor(hemoglobinStatus)}`}>{patient.hemoglobin ?? '—'}</td>
      <td className={`px-4 py-3 text-sm ${getStatusColor(cholesterolStatus)}`}>{patient.cholesterol ?? '—'}</td>

      {/* AI Remarks & Urgency */}
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${urgencyStyles}`}>
            {urgency}
          </span>
          <button
            onClick={() => onViewDetails && onViewDetails(patient)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-deep transition-colors group"
          >
            <svg className="w-4 h-4 p-0.5 rounded bg-brand-pale group-hover:bg-brand-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View AI Review
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Link
            href={`/patient/${patient.id}/edit`}
            id={`btn-table-edit-${patient.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-[#C4E2F5] bg-white px-2.5 py-1 text-xs font-medium text-brand-primary hover:bg-brand-pale transition-colors duration-150"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            id={`btn-table-delete-${patient.id}`}
            onClick={() => onDelete(patient)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
