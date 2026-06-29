/**
 * Utility functions for checking lab values against normal ranges.
 * These are used by the UI to highlight abnormal values.
 */

export function checkGlucose(value) {
  const v = parseFloat(value);
  if (isNaN(v)) return 'normal';
  if (v > 125) return 'high'; // Diabetes risk
  if (v > 99) return 'borderline'; // Pre-diabetes
  return 'normal';
}

export function checkHemoglobin(value) {
  const v = parseFloat(value);
  if (isNaN(v)) return 'normal';
  if (v < 12) return 'low'; // Anemia indicator
  if (v < 13.5) return 'borderline'; // Monitor
  return 'normal';
}

export function checkCholesterol(value) {
  const v = parseFloat(value);
  if (isNaN(v)) return 'normal';
  if (v > 240) return 'high'; // Elevated risk
  if (v > 200) return 'borderline'; // Borderline-high
  return 'normal';
}

export function hasMajorIssues(patient) {
  return (
    checkGlucose(patient.glucose) === 'high' ||
    checkHemoglobin(patient.hemoglobin) === 'low' ||
    checkCholesterol(patient.cholesterol) === 'high'
  );
}

export function hasBorderlineIssues(patient) {
  return (
    checkGlucose(patient.glucose) === 'borderline' ||
    checkHemoglobin(patient.hemoglobin) === 'borderline' ||
    checkCholesterol(patient.cholesterol) === 'borderline'
  );
}
