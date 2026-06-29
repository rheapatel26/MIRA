'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PatientForm from '@/components/PatientForm';

export default function NewPatientPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(values) {
    setSubmitError(null);

    // Wrap everything in a 20-second timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Check your Firebase configuration in .env.local.')), 20000)
    );

    async function doSave() {
      // Step 1: Save record to Firestore with "Analyzing..." placeholder
      const docRef = await addDoc(collection(db, 'patients'), {
        ...values,
        remarks: 'Analyzing...',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Step 2: Call the server-side prediction API
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

        // Step 3: Update Firestore record with actual remarks
        await updateDoc(doc(db, 'patients', docRef.id), {
          remarks: data.remarks || 'Demo prediction (not medical advice): Analysis complete.',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Prediction API error:', err);
        // Graceful fallback — save a rule-based-only remark
        await updateDoc(doc(db, 'patients', docRef.id), {
          remarks:
            'Demo prediction (not medical advice): Prediction service temporarily unavailable. Please consult a healthcare professional.',
          updatedAt: serverTimestamp(),
        });
      }
    }

    try {
      await Promise.race([doSave(), timeoutPromise]);
      router.push('/');
    } catch (err) {
      console.error('Patient save error:', err);
      setSubmitError(
        err.message ||
          'Failed to save patient. Please ensure your Firebase credentials are set in .env.local and Firestore is enabled.'
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <a href="/" className="hover:text-brand-primary transition-colors">Dashboard</a>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">New Patient</span>
        </nav>

        <h1 className="text-2xl font-bold text-brand-deep">Add New Patient</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the patient details. An AI prediction will be generated automatically after saving.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-[#C4E2F5] shadow-sm p-6 sm:p-8">
        <PatientForm onSubmit={handleSubmit} isEdit={false} externalError={submitError} />
      </div>
    </div>
  );
}
