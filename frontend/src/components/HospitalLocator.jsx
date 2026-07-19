import { useState } from "react";
import { getNearbyFacilities } from "../utils/api.js";

export default function HospitalLocator() {
  const [facilities, setFacilities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findNearby = () => {
    setError(null);
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation isn't supported in this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await getNearbyFacilities(latitude, longitude);
          setFacilities(data.facilities);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied. Enable it to find nearby facilities.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="hospital-locator">
      <h3>📍 Find Nearby Facilities</h3>
      <button onClick={findNearby} disabled={loading}>
        {loading ? "Locating..." : "Use My Location"}
      </button>

      {error && <p className="error">{error}</p>}

      {facilities && facilities.length === 0 && (
        <p>No facilities found nearby — try widening your search radius.</p>
      )}

      {facilities && facilities.length > 0 && (
        <ul className="facility-list">
          {facilities.map((f) => (
            <li key={f.id}>
              <strong>{f.name}</strong>
              <div className="facility-meta">
                <span className="facility-type">{f.type}</span>
                {f.phone && <span className="facility-phone">📞 {f.phone}</span>}
              </div>
              {f.address && <p className="facility-address">📍 {f.address}</p>}
              <div className="facility-actions">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  🗺️ Get Directions
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
