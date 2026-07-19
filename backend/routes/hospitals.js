import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Uses OpenStreetMap's free Overpass API — no API key required.
// Finds hospitals/clinics within a radius (meters) of the given lat/lng.
router.get("/", async (req, res) => {
  try {
    const { lat, lng, radius = 8000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng query params are required" });
    }

    const query = `
      [out:json][timeout:25];
      (
        nwr["amenity"="hospital"](around:${radius},${lat},${lng});
        nwr["amenity"="clinic"](around:${radius},${lat},${lng});
        nwr["healthcare"="hospital"](around:${radius},${lat},${lng});
      );
      out center 15;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`);
    }

    const data = await response.json();

    const facilities = (data.elements || []).map((el) => ({
      id: el.id,
      name: el.tags?.name || "Unnamed facility",
      lat: el.lat || el.center?.lat,
      lng: el.lon || el.center?.lon,
      type: el.tags?.amenity || el.tags?.healthcare || "facility",
      phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
      address: el.tags?.["addr:street"]
        ? `${el.tags?.["addr:housenumber"] || ""} ${el.tags["addr:street"]}${el.tags?.["addr:city"] ? `, ${el.tags["addr:city"]}` : ""}`.trim()
        : el.tags?.["addr:full"] || null,
    }));

    res.json({ count: facilities.length, facilities });
  } catch (err) {
    console.error("Hospital locator error:", err);
    res.status(500).json({ error: "Could not fetch nearby facilities" });
  }
});

export default router;
