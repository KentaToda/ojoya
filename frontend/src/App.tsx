/* ═══════════════════════════════════════════════════════════════════════════
   APP COMPONENT
   Root component with routing configuration
   ═══════════════════════════════════════════════════════════════════════════ */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { AppraisalPage } from '@/pages/AppraisalPage';
import { HistoryPage } from '@/pages/HistoryPage';

// ─────────────────────────────────────────────────────────────────────────
// APP COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/appraisal" element={<AppraisalPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
