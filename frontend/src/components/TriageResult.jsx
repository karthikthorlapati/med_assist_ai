const TIER_INFO = {
  "self-care": { label: "Self-care", color: "#2e7d32", emoji: "🟢" },
  "visit-facility": { label: "Visit a Facility Soon", color: "#f9a825", emoji: "🟡" },
  emergency: { label: "Emergency — Act Now", color: "#c62828", emoji: "🔴" },
};

export default function TriageResult({ result }) {
  if (!result) return null;
  const info = TIER_INFO[result.tier] || TIER_INFO["self-care"];

  return (
    <div className="triage-result" style={{ borderColor: info.color }}>
      <h2 style={{ color: info.color }}>
        {info.emoji} {info.label}
      </h2>
      <p className="summary">{result.summary}</p>

      <h3>What to do now:</h3>
      <ul>
        {result.firstAidSteps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>

      {result.tier !== "self-care" && (
        <p className="locator-hint">
          Scroll down to find the nearest facility based on your location.
        </p>
      )}

      <p className="disclaimer">
        This is AI-generated guidance, not a medical diagnosis. If in doubt, seek professional care.
      </p>
    </div>
  );
}
