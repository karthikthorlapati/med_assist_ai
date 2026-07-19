import { useEffect, useState } from "react";
import { getTriageHistory } from "../utils/api.js";

const TIER_BADGES = {
  "self-care": { label: "Self-care", color: "#2e7d32", emoji: "🟢" },
  "visit-facility": { label: "Visit Facility", color: "#f9a825", emoji: "🟡" },
  emergency: { label: "Emergency", color: "#c62828", emoji: "🔴" },
};

export default function TriageHistory({ refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTriageHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  return (
    <div className="triage-history">
      <div className="history-header">
        <h3>📋 Recent Triage History</h3>
        <button onClick={fetchHistory} className="refresh-btn" disabled={loading} title="Refresh History">
          {loading ? "🔄 Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {!loading && !error && history.length === 0 && (
        <div className="empty-history">
          <p>No triage history found yet.</p>
          <p className="subtext">Completed triage assessments will appear here. (Note: Requires a connected MongoDB database).</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-timeline">
          {history.map((item) => {
            const badge = TIER_BADGES[item.tier] || { label: item.tier, color: "#757575", emoji: "⚪" };
            const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={item._id} className="history-item">
                <div className="history-meta">
                  <span className="history-date">{formattedDate}</span>
                  <span className="history-method" title="Input Method">
                    {item.inputMethod === "voice" ? "🎙️ Voice" : "⌨️ Text"}
                  </span>
                  <span className="history-badge" style={{ color: badge.color }}>
                    {badge.emoji} {badge.label}
                  </span>
                </div>
                <div className="history-body">
                  <p className="history-symptoms">
                    <strong>Symptoms:</strong> "{item.symptomText}"
                  </p>
                  <p className="history-summary">
                    <strong>AI Advice:</strong> {item.aiSummary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
