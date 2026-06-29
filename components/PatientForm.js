'use client';

import { useState } from 'react';

const FIELD_LABELS = {
  fullName: 'Full Name',
  dateOfBirth: 'Date of Birth',
  email: 'Email Address',
  glucose: 'Glucose (mg/dL)',
  hemoglobin: 'Hemoglobin (g/dL)',
  cholesterol: 'Cholesterol (mg/dL)',
};

const EMPTY_FORM = {
  fullName: '',
  dateOfBirth: '',
  email: '',
  glucose: '',
  hemoglobin: '',
  cholesterol: '',
};

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (!/^[a-zA-Z\s\-']+$/.test(values.fullName.trim())) {
    errors.fullName = 'Name may only contain letters, spaces, and hyphens.';
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else {
    const dob = new Date(values.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(dob.getTime())) {
      errors.dateOfBirth = 'Please enter a valid date.';
    } else if (dob > today) {
      errors.dateOfBirth = 'Date of birth cannot be in the future.';
    }
  }

  if (!values.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  const glucose = parseFloat(values.glucose);
  if (values.glucose === '' || values.glucose === undefined) {
    errors.glucose = 'Glucose value is required.';
  } else if (isNaN(glucose) || !isFinite(glucose)) {
    errors.glucose = 'Glucose must be a valid number.';
  } else if (glucose < 0 || glucose > 600) {
    errors.glucose = 'Glucose must be between 0 and 600 mg/dL.';
  }

  const hemoglobin = parseFloat(values.hemoglobin);
  if (values.hemoglobin === '' || values.hemoglobin === undefined) {
    errors.hemoglobin = 'Hemoglobin value is required.';
  } else if (isNaN(hemoglobin) || !isFinite(hemoglobin)) {
    errors.hemoglobin = 'Hemoglobin must be a valid number.';
  } else if (hemoglobin < 0 || hemoglobin > 25) {
    errors.hemoglobin = 'Hemoglobin must be between 0 and 25 g/dL.';
  }

  const cholesterol = parseFloat(values.cholesterol);
  if (values.cholesterol === '' || values.cholesterol === undefined) {
    errors.cholesterol = 'Cholesterol value is required.';
  } else if (isNaN(cholesterol) || !isFinite(cholesterol)) {
    errors.cholesterol = 'Cholesterol must be a valid number.';
  } else if (cholesterol < 0 || cholesterol > 600) {
    errors.cholesterol = 'Cholesterol must be between 0 and 600 mg/dL.';
  }

  return errors;
}

/**
 * Shared patient form used by both /patient/new and /patient/[id]/edit.
 *
 * Props:
 *   initialData    — pre-filled values for edit mode (optional)
 *   onSubmit       — async function(values) called with validated form data
 *   isEdit         — boolean, shows "Save Changes" vs "Add Patient"
 *   externalError  — string error message from parent (e.g. Firebase failure)
 */
export default function PatientForm({
  initialData = EMPTY_FORM,
  onSubmit,
  isEdit = false,
  externalError = null,
}) {
  const [values, setValues] = useState({ ...EMPTY_FORM, ...initialData });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorKey = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstErrorKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth,
        email: values.email.trim().toLowerCase(),
        glucose: parseFloat(values.glucose),
        hemoglobin: parseFloat(values.hemoglobin),
        cholesterol: parseFloat(values.cholesterol),
      });
    } catch (err) {
      console.error('Form submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary ' +
    'transition-colors duration-150';
  const inputNormal = `${inputBase} border-[#C4E2F5] bg-white`;
  const inputError = `${inputBase} border-red-400 bg-red-50`;

  function fieldClass(name) {
    return errors[name] ? inputError : inputNormal;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* External error banner (e.g. Firebase not configured) */}
      {externalError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2" role="alert">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-red-700">{externalError}</p>
        </div>
      )}

      {/* ── Personal Information ─────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-brand-deep mb-3">
          Personal Information
        </legend>

        <div>
          <label htmlFor="field-fullName" className="block text-sm font-medium text-gray-700 mb-1">
            {FIELD_LABELS.fullName}
          </label>
          <input
            id="field-fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={values.fullName}
            onChange={handleChange}
            className={fieldClass('fullName')}
            aria-describedby={errors.fullName ? 'err-fullName' : undefined}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p id="err-fullName" className="mt-1 text-xs text-red-600" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="field-dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            {FIELD_LABELS.dateOfBirth}
          </label>
          <input
            id="field-dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={fieldClass('dateOfBirth')}
            aria-describedby={errors.dateOfBirth ? 'err-dateOfBirth' : undefined}
            aria-invalid={!!errors.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <p id="err-dateOfBirth" className="mt-1 text-xs text-red-600" role="alert">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="field-email" className="block text-sm font-medium text-gray-700 mb-1">
            {FIELD_LABELS.email}
          </label>
          <input
            id="field-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            value={values.email}
            onChange={handleChange}
            className={fieldClass('email')}
            aria-describedby={errors.email ? 'err-email' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="err-email" className="mt-1 text-xs text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </fieldset>

      {/* ── Lab Values ───────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-brand-deep mb-3">
          Lab Values
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="field-glucose" className="block text-sm font-medium text-gray-700 mb-1">
              {FIELD_LABELS.glucose}
            </label>
            <input
              id="field-glucose"
              name="glucose"
              type="number"
              step="0.1"
              min="0"
              max="600"
              placeholder="90"
              value={values.glucose}
              onChange={handleChange}
              className={fieldClass('glucose')}
              aria-describedby={errors.glucose ? 'err-glucose' : undefined}
              aria-invalid={!!errors.glucose}
            />
            <p className="mt-0.5 text-xs text-gray-400">Normal: 70–99 mg/dL</p>
            {errors.glucose && (
              <p id="err-glucose" className="mt-1 text-xs text-red-600" role="alert">
                {errors.glucose}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="field-hemoglobin" className="block text-sm font-medium text-gray-700 mb-1">
              {FIELD_LABELS.hemoglobin}
            </label>
            <input
              id="field-hemoglobin"
              name="hemoglobin"
              type="number"
              step="0.1"
              min="0"
              max="25"
              placeholder="13.5"
              value={values.hemoglobin}
              onChange={handleChange}
              className={fieldClass('hemoglobin')}
              aria-describedby={errors.hemoglobin ? 'err-hemoglobin' : undefined}
              aria-invalid={!!errors.hemoglobin}
            />
            <p className="mt-0.5 text-xs text-gray-400">Normal: 12–17 g/dL</p>
            {errors.hemoglobin && (
              <p id="err-hemoglobin" className="mt-1 text-xs text-red-600" role="alert">
                {errors.hemoglobin}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="field-cholesterol" className="block text-sm font-medium text-gray-700 mb-1">
              {FIELD_LABELS.cholesterol}
            </label>
            <input
              id="field-cholesterol"
              name="cholesterol"
              type="number"
              step="0.1"
              min="0"
              max="600"
              placeholder="180"
              value={values.cholesterol}
              onChange={handleChange}
              className={fieldClass('cholesterol')}
              aria-describedby={errors.cholesterol ? 'err-cholesterol' : undefined}
              aria-invalid={!!errors.cholesterol}
            />
            <p className="mt-0.5 text-xs text-gray-400">Normal: &lt;200 mg/dL</p>
            {errors.cholesterol && (
              <p id="err-cholesterol" className="mt-1 text-xs text-red-600" role="alert">
                {errors.cholesterol}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ── Submit ───────────────────────────────────────────────── */}
      <div className="pt-2 flex items-center gap-4">
        <button
          id="btn-submit-patient"
          type="submit"
          disabled={submitting}
          className={
            'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white ' +
            'bg-brand-primary hover:bg-brand-deep focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ' +
            'transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed'
          }
        >
          {submitting && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {submitting ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save Changes' : 'Add Patient'}
        </button>

        <a
          href="/"
          className="text-sm text-gray-500 hover:text-brand-primary transition-colors duration-150"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
