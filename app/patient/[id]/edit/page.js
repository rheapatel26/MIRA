'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PatientForm from '@/components/PatientForm';

const LAB_FIELDS = ['glucose', 'hemoglobin', 'cholesterol'];

export default function EditPatientPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function fetchPatient() {
      try {
        const snap = await getDoc(doc(db, 'patients', id));
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          const data = snap.data();
          setInitialData({
            fullName: data.fullName || '',
            dateOfBirth: data.dateOfBirth || '',
            email: data.email || '',
            glucose: data.glucose?.toString() || '',
            hemoglobin: data.hemoglobin?.toString() || '',
            cholesterol: data.cholesterol?.toString() || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch patient:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  async function handleSubmit(values) {
    setSubmitError(null);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Check your Firebase configuration in .env.local.')), 20000)
    );

    async function doUpdate() {
      const labValuesChanged = LAB_FIELDS.some(
        (field) => parseFloat(values[field]) !== parseFloat(initialData[field])
      );

      const updatedData = { ...values, updatedAt: serverTimestamp() };
      if (labValuesChanged) updatedData.remarks = 'Analyzing...';

      await updateDoc(doc(db, 'patients', id), updatedData);

      if (labValuesChanged) {
        try {
          const res = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              glucose: values.glucose,
              hemoglobin: values.hemoglobin,
              cholesterol: values.cholesterol,
              dateOfBirth: values.dateOfBirth,
            }),
          });
          const data = await res.json();
          await updateDoc(doc(db, 'patients', id), {
            remarks: data.remarks || 'Demo prediction (not medical advice): Analysis complete.',
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error('Prediction API error on edit:', err);
          await updateDoc(doc(db, 'patients', id), {
            remarks:
              'Demo prediction (not medical advice): Prediction service temporarily unavailable. Please consult a healthcare professional.',
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    try {
      await Promise.race([doUpdate(), timeoutPromise]);
      router.push('/');
    } catch (err) {
      console.error('Patient update error:', err);
      setSubmitError(
        err.message ||
          'Failed to update patient. Please ensure your Firebase credentials are set in .env.local and Firestore is enabled.'
      );
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading patient">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500">Loading patient record…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-brand-deep mb-2">Patient Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">This patient record does not exist or may have been deleted.</p>
        <a href="/" className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep transition-colors duration-150">
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <a href="/" className="hover:text-brand-primary transition-colors">Dashboard</a>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Edit Patient</span>
        </nav>
        <h1 className="text-2xl font-bold text-brand-deep">Edit Patient Record</h1>
        <p className="mt-1 text-sm text-gray-500">
          Updating glucose, hemoglobin, or cholesterol will automatically regenerate the AI prediction.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#C4E2F5] shadow-sm p-6 sm:p-8">
        <PatientForm initialData={initialData} onSubmit={handleSubmit} isEdit={true} externalError={submitError} />
      </div>
    </div>
  );
}
