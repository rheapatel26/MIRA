/**
 * POST /api/predict
 *
 * Accepts: { glucose, hemoglobin, cholesterol, dateOfBirth }
 * Returns: { remarks: string }
 *
 * ── How the prediction is built ──────────────────────────────────────────────
 *
 * 1. AI PREDICTION LAYER (Google Gemini):
 *    We pass the lab values to the Gemini API with a strict system prompt to
 *    analyze the values based on standard clinical reference ranges.
 *    The model generates a 2-3 sentence summary of any potential risks.
 *
 * 2. DISCLAIMER:
 *    The output is always prefixed with a demo disclaimer to ensure it is not
 *    mistaken for real medical advice.
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { glucose, hemoglobin, cholesterol, dateOfBirth } = body;

    // Validate inputs exist
    if (glucose == null || hemoglobin == null || cholesterol == null) {
      return NextResponse.json(
        { error: 'Missing required fields: glucose, hemoglobin, cholesterol' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback if no API key is provided
    if (!apiKey) {
      console.warn('[predict] GEMINI_API_KEY not set — using generic fallback');
      return NextResponse.json({
        remarks:
          'Demo prediction (not medical advice): API key not configured. Please consult a licensed healthcare professional for clinical evaluation.',
      });
    }

    const prompt = `
      You are a clinical AI assistant analyzing patient lab values for a demonstration app.
      Patient data:
      - Date of Birth: ${dateOfBirth || 'Unknown'}
      - Fasting Glucose: ${glucose} mg/dL
      - Hemoglobin: ${hemoglobin} g/dL
      - Total Cholesterol: ${cholesterol} mg/dL

      Task: 
      1. Analyze these values against standard clinical reference ranges (e.g., ADA, WHO, AHA).
      2. Write a concise 2 to 3 sentence summary of the findings, pointing out any specific risks (like diabetes, anemia, or cardiovascular risk) if the values are abnormal.
      3. If all values are normal, state that they are within commonly accepted reference ranges.
      4. Answer ONLY with the medical assessment text. DO NOT add any disclaimers, prefixes, or pleasantries.
    `;

    // 15-second timeout for the Gemini API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let aiResponseText = '';

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2, // Keep it factual and deterministic
              maxOutputTokens: 500,
            },
          }),
          signal: controller.signal,
        }
      );

      if (!res.ok) {
        throw new Error(`Gemini API responded with status ${res.status}`);
      }

      const data = await res.json();
      aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } catch (apiError) {
      console.error('[predict] Gemini API error:', apiError.message);
      aiResponseText = 'Analysis service temporarily unavailable due to an API error.';
    } finally {
      clearTimeout(timeoutId);
    }

    // Force the disclaimer prefix
    const remarks = `Demo prediction (not medical advice): ${aiResponseText}`;

    return NextResponse.json({ remarks });
  } catch (error) {
    console.error('[predict] Unexpected error:', error);
    return NextResponse.json(
      {
        remarks:
          'Demo prediction (not medical advice): Unable to process lab values at this time. Please consult a licensed healthcare professional.',
      },
      { status: 200 }
    );
  }
}
