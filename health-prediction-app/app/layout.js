import './globals.css';

export const metadata = {
  title: 'MIRA Health — Patient Prediction Dashboard',
  description:
    'A demo health prediction web app using Firebase Firestore and Infermedica for lab value analysis. ' +
    'Built with Next.js 14 and Tailwind CSS. For assessment purposes only — not a medical tool.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        {/* ── Top Navigation Bar ─────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#C4E2F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              {/* Simple logo mark */}
              <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-base font-bold text-brand-deep tracking-tight">MIRA Health</span>
            </a>

            <nav aria-label="Main navigation">
              <a
                href="/patient/new"
                id="nav-add-patient"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-deep transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Patient
              </a>
            </nav>
          </div>
        </header>

        {/* ── Demo Disclaimer Banner ─────────────────────────────── */}
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs text-amber-700">
              <strong>Demo Project:</strong> All predictions are for assessment purposes only and are{' '}
              <strong>not medical advice</strong>. This is not a real medical tool. Consult a licensed
              healthcare professional for any health concerns.
            </p>
          </div>
        </div>

        {/* ── Page Content ──────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
