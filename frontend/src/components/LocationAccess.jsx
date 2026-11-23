import { useState } from "react";

function readLocation() {
  try { return JSON.parse(localStorage.getItem("jobportal.location") || "null"); }
  catch { return null; }
}

function locationLabel(address = {}) {
  const street = [address.house_number, address.road].filter(Boolean).join(" ");
  const locality = address.city || address.town || address.village || address.municipality || address.suburb || address.county;
  return [...new Set([street, locality, address.state, address.country].filter(Boolean))].join(", ");
}

export default function LocationAccess() {
  const [location, setLocation] = useState(readLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  async function resolveLocation(latitude, longitude) {
    const query = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      zoom: "18",
      addressdetails: "1",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`);
    if (!response.ok) throw new Error("Could not look up the address.");
    const result = await response.json();
    return {
      latitude,
      longitude,
      displayName: result.display_name || "",
      shortName: locationLabel(result.address) || result.display_name || "Current location",
    };
  }

  function requestLocation() {
    setError("");
    setDetailsOpen(false);
    if (!navigator.geolocation) {
      setError("Location access is not available in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const next = await resolveLocation(coords.latitude, coords.longitude);
          localStorage.setItem("jobportal.location", JSON.stringify(next));
          setLocation(next);
          setDetailsOpen(true);
        } catch {
          const next = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            displayName: "",
            shortName: "Coordinates available",
          };
          localStorage.setItem("jobportal.location", JSON.stringify(next));
          setLocation(next);
          setDetailsOpen(true);
          setError("Address lookup failed. Your precise coordinates are shown below.");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setError(geoError.code === 1 ? "Allow location access in your browser settings." : "Could not get your location. Try again.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  const label = loading ? "Finding…" : location?.shortName || "Location";
  const title = location?.displayName || (location ? `${location.latitude}, ${location.longitude}` : "Use your current location");
  const mapUrl = location && `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=18/${location.latitude}/${location.longitude}`;

  return (
    <div className="navbar-location">
      <button type="button" className="navbar-location__button" onClick={requestLocation} disabled={loading} title={title} aria-label={title}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
        <span>{label}</span>
      </button>
      {error && <span className="navbar-location__error" role="status">{error}</span>}
      {location && detailsOpen && (
        <div className="navbar-location__result" role="status">
          <button type="button" className="navbar-location__close" aria-label="Close location details" onClick={() => setDetailsOpen(false)}>×</button>
          <strong>Your current location</strong>
          {location.displayName && <p>{location.displayName}</p>}
          <small>Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</small>
          <a href={mapUrl} target="_blank" rel="noreferrer">Open on map</a>
          <small className="navbar-location__attribution">Address data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></small>
        </div>
      )}
    </div>
  );
}
