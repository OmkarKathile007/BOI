
import React, { useEffect, useRef, useState } from "react";

export default function DeviceTiltDisplay() {
  const [tilt, setTilt] = useState({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
    timestamp: null,
  });
  const [status, setStatus] = useState("idle"); // idle | requesting | tracking | denied | unsupported | error
  const listenerRef = useRef(null);

  // Handler that receives deviceorientation events
  const handleOrientation = (event) => {
    // event.alpha (Z), event.beta (X - front/back), event.gamma (Y - left/right)
    setTilt({
      alpha: typeof event.alpha === "number" ? Number(event.alpha.toFixed(2)) : null,
      beta: typeof event.beta === "number" ? Number(event.beta.toFixed(2)) : null,
      gamma: typeof event.gamma === "number" ? Number(event.gamma.toFixed(2)) : null,
      absolute: event.absolute ?? null,
      timestamp: Date.now(),
    });
  };

  // Start tracking (must be called from a user gesture for iOS)
  const startTracking = async () => {
    // If listener already attached, do nothing
    if (listenerRef.current) return;

    // Basic feature detection
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");

    try {
      // iOS 13+ requires permission through requestPermission()
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        const resp = await (DeviceOrientationEvent as any).requestPermission();
        if (resp !== "granted") {
          setStatus("denied");
          return;
        }
      }
      // Attach listener
      window.addEventListener("deviceorientation", handleOrientation, true);
      listenerRef.current = handleOrientation;
      setStatus("tracking");
    } catch (err) {
      console.error("Device orientation permission error:", err);
      setStatus("error");
    }
  };

  const stopTracking = () => {
    if (listenerRef.current) {
      window.removeEventListener("deviceorientation", listenerRef.current, true);
      listenerRef.current = null;
    }
    setStatus("idle");
    
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener("deviceorientation", listenerRef.current, true);
        listenerRef.current = null;
      }
    };
  }, []);

  // Derived values for visual tilt box
  const displayAlpha = tilt.alpha ?? "—";
  const displayBeta = tilt.beta ?? "—";
  const displayGamma = tilt.gamma ?? "—";

  // Create a CSS transform for the demo box:
  // rotateX uses beta (front/back), rotateY uses gamma (left/right)
  // rotateZ uses alpha, but we scale down the effect to keep it readable
  const boxTransform =
    tilt.beta != null || tilt.gamma != null || tilt.alpha != null
      ? `perspective(400px) rotateX(${-(tilt.beta ?? 0)}deg) rotateY(${tilt.gamma ?? 0}deg) rotateZ(${(tilt.alpha ?? 0) * 0.5}deg)`
      : "none";

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: 8 }}>Device Tilt Live</h2>

      <div style={styles.controls}>
        <button style={styles.button} onClick={startTracking} disabled={status === "tracking" || status === "requesting"}>
          Start Tracking
        </button>
        <button style={{ ...styles.button, marginLeft: 8 }} onClick={stopTracking} disabled={status !== "tracking"}>
          Stop
        </button>

        <div style={{ marginLeft: 12 }}>
          <small>Status: </small>
          <strong>
            {status === "idle" && "Idle"}
            {status === "requesting" && "Requesting permission... (tap required on iOS)"}
            {status === "tracking" && "Tracking"}
            {status === "denied" && "Permission denied"}
            {status === "unsupported" && "Not supported on this device/browser"}
            {status === "error" && "Error — check console"}
          </strong>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.readouts}>
          <div style={styles.readoutRow}>
            <div style={styles.label}>Alpha (Z)</div>
            <div style={styles.value}>{displayAlpha}</div>
          </div>

          <div style={styles.readoutRow}>
            <div style={styles.label}>Beta (X - front/back)</div>
            <div style={styles.value}>{displayBeta}</div>
          </div>

          <div style={styles.readoutRow}>
            <div style={styles.label}>Gamma (Y - left/right)</div>
            <div style={styles.value}>{displayGamma}</div>
          </div>

          <div style={styles.readoutRow}>
            <div style={styles.label}>Absolute</div>
            <div style={styles.value}>{tilt.absolute == null ? "—" : String(tilt.absolute)}</div>
          </div>

          <div style={styles.readoutRow}>
            <div style={styles.label}>Last update</div>
            <div style={styles.value}>{tilt.timestamp ? new Date(tilt.timestamp).toLocaleTimeString() : "—"}</div>
          </div>
        </div>

        <div style={styles.visualWrap}>
          <div style={{ ...styles.tiltBox, transform: boxTransform }}>
            <div style={styles.tiltBoxInner}>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Tilt Box</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>
                {`β ${displayBeta}° | γ ${displayGamma}°`}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "#666", textAlign: "center" }}>
            Try tilting your phone. On iOS, press <b>Start Tracking</b> then allow motion & orientation.
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline styles to keep example self-contained
const styles = {
  container: {
    maxWidth: 760,
    margin: "18px auto",
    padding: 18,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    borderRadius: 10,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    background: "#fff",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    marginBottom: 14,
  },
  button: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#f8f8f8",
    cursor: "pointer",
    fontSize: 14,
  },
  content: {
    display: "flex",
    gap: 20,
  },
  readouts: {
    flex: 1,
    minWidth: 220,
  },
  readoutRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderRadius: 8,
    background: "#fbfbfb",
    marginBottom: 8,
    alignItems: "center",
  },
  label: { color: "#444", fontSize: 13 },
  value: { fontWeight: 700, fontSize: 14 },
  visualWrap: {
    width: 220,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  tiltBox: {
    width: 160,
    height: 160,
    borderRadius: 12,
    background: "linear-gradient(180deg, #f5f9ff, #eaf2ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(50,60,80,0.08)",
    transition: "transform 120ms linear",
  },
  tiltBoxInner: {
    width: 120,
    height: 120,
    borderRadius: 10,
    border: "1px dashed rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as "column",
    userSelect: "none" as const,
  },
};