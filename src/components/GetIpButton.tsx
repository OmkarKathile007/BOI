import React, { useState } from "react";

const GetIpButton: React.FC = () => {
  const [ip, setIp] = useState<string>("");

  const fetchIp = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
      const data = await res.json();
      setIp(data.ip+' '+geo.city); // e.g., "203.0.113.45"
    } catch (error) {
      console.error("Failed to fetch IP:", error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={fetchIp}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Get My IP
      </button>
      {ip && <p className="mt-2">Your IP: {ip}</p>}
    </div>
  );
};

export default GetIpButton;
