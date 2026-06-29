'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, doc, deleteDoc, orderBy, query, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PatientCard from '@/components/PatientCard';
import PatientTable from '@/components/PatientTable';
import ConfirmModal from '@/components/ConfirmModal';
import PatientDetailsModal from '@/components/PatientDetailsModal';
import Link from 'next/link';
import { hasMajorIssues } from '@/lib/utils';

// Dummy data for seeding
const DUMMY_PATIENTS = [
  {
    fullName: 'Robert Chen',
    dateOfBirth: '1975-04-12',
    email: 'robert.c@example.com',
    glucose: 145, // High
    hemoglobin: 14.2, // Normal
    cholesterol: 255, // High
  },
  {
    fullName: 'Sarah Jenkins',
    dateOfBirth: '1988-11-23',
    email: 's.jenkins@example.com',
    glucose: 92, // Normal
    hemoglobin: 10.5, // Low
    cholesterol: 185, // Normal
  },
  {
    fullName: 'Michael Torres',
    dateOfBirth: '1992-07-08',
    email: 'mtorres@example.com',
    glucose: 88, // Normal
    hemoglobin: 15.1, // Normal
    cholesterol: 175, // Normal
  },
  {
    fullName: 'Emma Watson',
    dateOfBirth: '1965-02-14',
    email: 'emma.w@example.com',
    glucose: 110, // Borderline
    hemoglobin: 12.5, // Normal
    cholesterol: 215, // Borderline
  }
];

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState(null); // patient object to delete
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null); // patient object to view AI details

  // ── Real-time Firestore listener ──────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPatients(records);
        setLoading(false);
        setError(null); // Clear errors if successful
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError('Failed to load patient records. Please check your Firebase configuration and Firestore rules.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ── Seed Dummy Data ───────────────────────────────────────────
  const handleSeedData = async () => {
    setSeeding(true);
    setError(null);
    try {
      // Create records
      const promises = DUMMY_PATIENTS.map(async (patient) => {
        const docRef = await addDoc(collection(db, 'patients'), {
          ...patient,
          remarks: 'Analyzing...',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // Trigger prediction API for each (fire and forget)
        fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            glucose: patient.glucose,
            hemoglobin: patient.hemoglobin,
            cholesterol: patient.cholesterol,
            dateOfBirth: patient.dateOfBirth,
          }),
        }).then(res => res.json()).then(data => {
          updateDoc(docRef, {
            remarks: data.remarks || 'Demo prediction (not medical advice): Analysis complete.',
            updatedAt: serverTimestamp(),
          });
        }).catch(err => {
          console.error('Prediction API error for dummy data:', err);
          updateDoc(docRef, {
            remarks: 'Demo prediction (not medical advice): Prediction service temporarily unavailable.',
            updatedAt: serverTimestamp(),
          });
        });
      });
      
      await Promise.all(promises);
    } catch (err) {
      console.error('Error seeding data:', err);
      setError('Failed to add dummy data. Please check your Firebase permissions (Firestore rules).');
    } finally {
      setSeeding(false);
    }
  };

  // ── Delete flow ───────────────────────────────────────────────
  const handleDeleteRequest = useCallback((patient) => {
    setDeleteTarget(patient);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'patients', deleteTarget.id));
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete patient. Please check your Firebase permissions.');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleViewDetails = useCallback((patient) => {
    setViewDetailsTarget(patient);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setViewDetailsTarget(null);
  }, []);

  // ── Stats ─────────────────────────────────────────────────────
  const totalPatients = patients.length;
  const majorIssuesCount = patients.filter(hasMajorIssues).length;
  const normalCount = totalPatients - majorIssuesCount;

  // ── Render states ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500">Loading patient records…</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time monitoring and AI prediction analysis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {patients.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-primary bg-white px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-pale focus:outline-none transition-colors duration-150 disabled:opacity-60"
            >
              {seeding ? 'Adding...' : 'Load Demo Data'}
            </button>
          )}
          <Link
            href="/patient/new"
            id="btn-add-patient"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Patient
          </Link>
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">{error}</p>
            <p className="mt-1 text-xs text-red-600">
              This usually happens if your Firebase Database Security Rules deny access. Go to the Firebase Console &rarr; Firestore Database &rarr; Rules, and paste the contents of `firestore.rules` (or temporarily use test mode).
            </p>
          </div>
        </div>
      )}

      {/* ── Stats Overview ───────────────────────────────────────── */}
      {!error && patients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#C4E2F5] p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-deep">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalPatients}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-pale flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Flagged (Major Issue)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{majorIssuesCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Normal / Minor</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{normalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────── */}
      {!error && patients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-pale flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-brand-deep">No patients yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Add your first patient record or load dummy data to see predictions appear here in real time.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
             <button
              onClick={handleSeedData}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-lg border border-[#C4E2F5] bg-white px-5 py-2.5 text-sm font-semibold text-brand-primary hover:bg-brand-pale focus:outline-none transition-colors duration-150 disabled:opacity-60"
            >
              {seeding ? 'Adding...' : 'Load Dummy Data'}
            </button>
            <Link
              href="/patient/new"
              id="btn-empty-add-patient"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Patient
            </Link>
          </div>
        </div>
      )}

      {/* ── Desktop Table (md+) ──────────────────────────────────── */}
      {!error && patients.length > 0 && (
        <>
          <div className="hidden md:block">
            <PatientTable patients={patients} onDelete={handleDeleteRequest} onViewDetails={handleViewDetails} />
          </div>

          {/* ── Mobile Cards (< md) ─────────────────────────────── */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} onDelete={handleDeleteRequest} onViewDetails={handleViewDetails} />
            ))}
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        patientName={deleteTarget?.fullName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* ── Patient Details (AI Review) Modal ────────────────────── */}
      <PatientDetailsModal
        isOpen={!!viewDetailsTarget}
        patient={viewDetailsTarget}
        onClose={handleCloseDetails}
      />
    </>
  );
}
