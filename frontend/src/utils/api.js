// Update this to your deployed backend URL when you deploy the frontend.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getTriage(symptomText, inputMethod = "text") {
  const res = await fetch(`${API_URL}/api/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptomText, inputMethod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Triage request failed");
  }
  return res.json();
}

export async function getNearbyFacilities(lat, lng) {
  const res = await fetch(`${API_URL}/api/hospitals?lat=${lat}&lng=${lng}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Facility lookup failed");
  }
  return res.json();
}

export async function getTriageHistory() {
  const res = await fetch(`${API_URL}/api/triage/history`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not fetch triage history");
  }
  return res.json();
}
