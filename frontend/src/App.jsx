import { useState } from "react";
import SymptomForm from "./components/SymptomForm.jsx";
import TriageResult from "./components/TriageResult.jsx";
import HospitalLocator from "./components/HospitalLocator.jsx";
import TriageHistory from "./components/TriageHistory.jsx";
import { getTriage } from "./utils/api.js";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  const handleSubmit = async (text, inputMethod) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getTriage(text, inputMethod);
      setResult(data);
      setHistoryTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🩺 MedAssist AI</h1>
        <p className="tagline">
          Describe your symptoms. Get instant AI triage, first-aid guidance, and the nearest facility — all in one place.
        </p>
      </header>

      <main className="dashboard-grid">
        <div className="main-panel">
          <SymptomForm onSubmit={handleSubmit} loading={loading} />

          {error && <p className="error">{error}</p>}

          <TriageResult result={result} />

          {result && result.tier !== "self-care" && <HospitalLocator />}
        </div>

        <div className="side-panel">
          <TriageHistory refreshTrigger={historyTrigger} />
        </div>
      </main>

      <footer>
        <p>Built for Idea2Impact Online Hackathon 2026 · Not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}
