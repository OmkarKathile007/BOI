import React, { useState } from "react";

const LocationFinder: React.FC = () => {
  const [city, setCity] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });

        // Call reverse geocoding API (OpenStreetMap)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();

        const cityName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Unknown";

        setCity(cityName);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={getLocation}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Get My City
      </button>

      {coords && (
        <p className="mt-2">
          Lat: {coords.lat.toFixed(4)}, Lon: {coords.lon.toFixed(4)}
        </p>
      )}

      {city && <p className="mt-2">City: {city}</p>}
    </div>
  );
};

export default LocationFinder;
