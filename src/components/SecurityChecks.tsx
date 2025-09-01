// 'use client';

// import React, { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { MapPin, User, CheckCircle, AlertCircle } from "lucide-react";

// // ---------------------- Shared types ----------------------
// interface LocationData {
//   latitude: number;
//   longitude: number;
//   accuracy: number;
//   timestamp: number;
// }

// interface KeystrokeEvent {
//   id: number;
//   key: string;
//   type: "hold" | "flight";
//   time: number;
//   timestamp: number;
// }

// type CheckSeverity = "critical" | "soft";

// interface CheckResult {
//   id: string;
//   ok: boolean;
//   severity: CheckSeverity;
//   meta?: any;
// }

// // common constants
// const IGNORE_KEYS = new Set([
//   "Shift",
//   "Control",
//   "Alt",
//   "Meta",
//   "Tab",
//   "CapsLock",
//   "ArrowLeft",
//   "ArrowRight",
//   "ArrowUp",
//   "ArrowDown",
//   "Escape",
// ]);

// // ---------------------- Hook: useSecurityChecks ----------------------
// // This hook encapsulates the whole security checks logic. It returns the
// // runner function and state so any component can call it (e.g. the Login form).
// export function useSecurityChecks() {
//   const [checkingSecurity, setCheckingSecurity] = useState(false);
//   const [secure, setSecure] = useState<boolean | null>(null);
//   const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
//   const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

//   const runSecurityChecks = async (): Promise<CheckResult[]> => {
//     setCheckingSecurity(true);
//     setBlockedMessage(null);
//     const results: CheckResult[] = [];

//     const push = (id: string, ok: boolean, severity: CheckSeverity = "soft", meta?: any) => {
//       results.push({ id, ok, severity, meta });
//     };

//     // 1) navigator.webdriver (automation) - critical
//     try {
//       const isWebDriver = !!(navigator as any).webdriver;
//       push("webdriver", !isWebDriver, isWebDriver ? "critical" : "soft", {
//         navigator_webdriver: (navigator as any).webdriver,
//       });
//     } catch (e) {
//       push("webdriver", true, "soft", { error: String(e) });
//     }

//     // 2) suspicious UA (Tor / privacy browsers / headless) - critical if matched
//     const ua = navigator.userAgent || "";
//     const suspiciousUARegex = /\b(tor browser|torbrowser|tor|tail|whonix|headless|phantom|puppeteer|torsocks|onion)\b/i;
//     const torDetected = suspiciousUARegex.test(ua);
//     push("userAgent", !torDetected, torDetected ? "critical" : "soft", { ua });

//     // 3) Incognito / Private mode heuristics (critical if detected)
//     let incognitoLikely = false;
//     try {
//       if ((navigator as any).storage && (navigator as any).storage.estimate) {
//         const est = await (navigator as any).storage.estimate();
//         const quota = est.quota || 0;
//         if (quota && quota < 120 * 1024 * 1024) incognitoLikely = true; // heuristic threshold
//       }
//     } catch (e) {
//       // ignore errors
//     }

//     // IndexedDB check (Safari private mode often throws)
//     try {
//       await new Promise<void>((resolve, reject) => {
//         const req = indexedDB.open("incognito_test_db_" + Math.random().toString(36).slice(2));
//         let done = false;
//         req.onerror = () => {
//           if (!done) {
//             done = true;
//             reject(new Error("idb error"));
//           }
//         };
//         req.onsuccess = () => {
//           try {
//             req.result.close();
//             indexedDB.deleteDatabase(req.result.name);
//           } catch {}
//           if (!done) {
//             done = true;
//             resolve();
//           }
//         };
//         req.onupgradeneeded = () => {
//           /* ok */
//         };
//         setTimeout(() => {
//           if (!done) {
//             done = true;
//             resolve();
//           }
//         }, 1200);
//       });
//     } catch (e) {
//       incognitoLikely = true;
//     }
//     push("incognito", !incognitoLikely, incognitoLikely ? "critical" : "soft", { incognitoLikely });

//     // 4) cookies enabled (critical if disabled)
//     const cookiesEnabled = navigator.cookieEnabled;
//     push("cookies", cookiesEnabled, cookiesEnabled ? "soft" : "critical", { cookieEnabled: cookiesEnabled });

//     // 5) localStorage availability (critical if disabled)
//     let lsOk = true;
//     try {
//       localStorage.setItem("__in_test", "1");
//       localStorage.removeItem("__in_test");
//     } catch (e) {
//       lsOk = false;
//     }
//     push("localStorage", lsOk, lsOk ? "soft" : "critical");

//     // 6) plugin/mimeTypes presence (soft)
//     const pluginCount = navigator.plugins ? navigator.plugins.length : 0;
//     push("plugins", pluginCount > 0 || ua.includes("Firefox"), "soft", { pluginCount });

//     // 7) screen size / pixelRatio (soft)
//     try {
//       const { width, height, devicePixelRatio } = window.screen || ({} as any);
//       push("screen", !!width && !!height, "soft", { width, height, devicePixelRatio: (window as any).devicePixelRatio });
//     } catch (e) {
//       push("screen", true, "soft", { error: String(e) });
//     }

//     // 8) hardwareConcurrency (soft)
//     try {
//       const cores = (navigator as any).hardwareConcurrency || 0;
//       push("hardwareConcurrency", cores >= 1, "soft", { cores });
//     } catch (e) {
//       push("hardwareConcurrency", true, "soft", { error: String(e) });
//     }

//     // 9) doNotTrack (soft)
//     try {
//       const dnt = (navigator as any).doNotTrack || (navigator as any).msDoNotTrack || (window as any).doNotTrack;
//       push("doNotTrack", true, "soft", { doNotTrack: dnt });
//     } catch (e) {
//       push("doNotTrack", true, "soft", { error: String(e) });
//     }

//     // 10) connection info (soft)
//     try {
//       const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
//       push("connectionInfo", !!conn, "soft", { connection: conn ? { effectiveType: conn.effectiveType, downlink: conn.downlink } : null });
//     } catch (e) {
//       push("connectionInfo", true, "soft", { error: String(e) });
//     }

//     // 11) timezone vs language (soft)
//     try {
//       const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
//       const language = navigator.language || (navigator as any).languages?.[0] || "unknown";
//       push("tz_locale", true, "soft", { timezone: tz, language });
//     } catch (e) {
//       push("tz_locale", true, "soft", { error: String(e) });
//     }

//     // 12) WebRTC local IP extraction (soft)
//     let rtcOk = true;
//     try {
//       const RTCPeerConnection = (window as any).RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection;
//       if (!RTCPeerConnection) {
//         rtcOk = false;
//       } else {
//         const ipAddrs = new Set<string>();
//         await new Promise<void>((resolve) => {
//           try {
//             const pc = new RTCPeerConnection({ iceServers: [] });
//             pc.createDataChannel("");
//             pc.onicecandidate = (ice: any) => {
//               if (!ice || !ice.candidate) {
//                 setTimeout(() => {
//                   try {
//                     pc.close();
//                   } catch {}
//                   resolve();
//                 }, 300);
//                 return;
//               }
//               const candidate = ice.candidate.candidate || "";
//               const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
//               if (ipMatch) ipAddrs.add(ipMatch[1]);
//             };
//             pc.createOffer()
//               .then((d: any) => pc.setLocalDescription(d))
//               .catch(() => resolve());
//             setTimeout(() => {
//               try {
//                 pc.close();
//               } catch {}
//               resolve();
//             }, 1200);
//           } catch (e) {
//             resolve();
//           }
//         });
//         if (ipAddrs.size === 0) rtcOk = false;
//         else {
//           let hasPublic = false;
//           ipAddrs.forEach((ip) => {
//             if (!ip.startsWith("10.") && !ip.startsWith("192.168.") && !ip.startsWith("127.")) hasPublic = true;
//           });
//           if (!hasPublic) rtcOk = false;
//         }
//       }
//     } catch (e) {
//       rtcOk = false;
//     }
//     push("webrtc_local_ip", rtcOk, "soft", { rtcOk });

//     // 13) Battery API (soft)
//     try {
//       const batterySupported = !!(navigator as any).getBattery;
//       push("batteryAPI", batterySupported, "soft", { batterySupported });
//     } catch (e) {
//       push("batteryAPI", true, "soft", { error: String(e) });
//     }

//     // 14) navigator.permissions for notifications / geolocation (soft)
//     try {
//       if ((navigator as any).permissions && (navigator as any).permissions.query) {
//         const [notif, geo] = await Promise.allSettled([
//           (navigator as any).permissions.query({ name: "notifications" } as any),
//           (navigator as any).permissions.query({ name: "geolocation" } as any),
//         ]);
//         push("permissions", true, "soft", { notifications: notif.status, geolocation: geo.status });
//       } else {
//         push("permissions", true, "soft", { supported: false });
//       }
//     } catch (e) {
//       push("permissions", true, "soft", { error: String(e) });
//     }

//     // 15) deviceMemory
//     try {
//       const deviceMemory = (navigator as any).deviceMemory || null;
//       push("deviceMemory", deviceMemory !== null, "soft", { deviceMemory });
//     } catch (e) {
//       push("deviceMemory", true, "soft", { error: String(e) });
//     }

//     // 16) maxTouchPoints
//     try {
//       const maxTouchPoints = (navigator as any).maxTouchPoints || 0;
//       push("maxTouchPoints", typeof maxTouchPoints === "number", "soft", { maxTouchPoints });
//     } catch (e) {
//       push("maxTouchPoints", true, "soft", { error: String(e) });
//     }

//     // 17) navigator.platform
//     try {
//       const platform = (navigator as any).platform || "unknown";
//       push("platform", !!platform, "soft", { platform });
//     } catch (e) {
//       push("platform", true, "soft", { error: String(e) });
//     }

//     // 18) userAgentData
//     try {
//       const uaData = (navigator as any).userAgentData || null;
//       push("userAgentData", !!uaData, "soft", { uaData });
//     } catch (e) {
//       push("userAgentData", true, "soft", { error: String(e) });
//     }

//     // 19) languages
//     try {
//       const languages = (navigator as any).languages || [];
//       push("languages", Array.isArray(languages) && languages.length > 0, "soft", { languages });
//     } catch (e) {
//       push("languages", true, "soft", { error: String(e) });
//     }

//     // 20) prefers-reduced-motion
//     try {
//       const prm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
//       push("prefersReducedMotion", prm ? true : true, "soft", { matches: prm ? prm.matches : false });
//     } catch (e) {
//       push("prefersReducedMotion", true, "soft", { error: String(e) });
//     }

//     // 21) canvas / webgl renderer check
//     try {
//       let webglVendor: string | null = null;
//       try {
//         const canvas = document.createElement("canvas");
//         const gl = (canvas.getContext("webgl") as WebGLRenderingContext | null) || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
//         if (gl) {
//           const dbg = gl.getExtension("WEBGL_debug_renderer_info");
//           if (dbg) {
//             webglVendor = String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || null);
//           }
//         }
//       } catch (e) {
//         webglVendor = null;
//       }
//       const hasWebGL = !!webglVendor;
//       push("webgl_vendor", hasWebGL, hasWebGL ? "soft" : "soft", { webglVendor });
//     } catch (e) {
//       push("webgl_vendor", true, "soft", { error: String(e) });
//     }

//     // 22) pointer / touch support
//     try {
//       const pointerSupported = typeof window.PointerEvent !== "undefined";
//       push("pointerEvent", pointerSupported, "soft", { pointerSupported });
//     } catch (e) {
//       push("pointerEvent", true, "soft", { error: String(e) });
//     }

//     // 23) small heuristic for headless chrome / suspicious tokens in UA
//     try {
//       const headlessRegex = /HeadlessChrome|PhantomJS|Nightmare|Electron|wv\)/i;
//       const headlessDetected = headlessRegex.test(ua);
//       push("headless", !headlessDetected, headlessDetected ? "critical" : "soft", { headlessDetected });
//     } catch (e) {
//       push("headless", true, "soft", { error: String(e) });
//     }

//     // finalize
//     setCheckResults(results);

//     // Decision logic:
//     const criticalFail = results.some((r) => r.severity === "critical" && !r.ok);
//     const softFails = results.filter((r) => r.severity !== "critical" && !r.ok).length;
//     const unsecureBySoft = softFails >= 3; // tuneable threshold
//     const isFinalSecure = !criticalFail && !unsecureBySoft;

//     setSecure(isFinalSecure);
//     setCheckingSecurity(false);

//     if (!isFinalSecure) {
//       const reasons = results
//         .filter((r) => !r.ok)
//         .map((r) => `${r.id}${r.severity === "critical" ? " (critical)" : ""}`);
//       setBlockedMessage(
//         `Unsecure attempt — login blocked. Try to login from a standard browser (Chrome/Edge/Safari) with location & storage enabled. Reasons: ${reasons.join(", ")}`
//       );
//     } else {
//       setBlockedMessage(null);
//     }

//     return results;
//   };

//   return {
//     runSecurityChecks,
//     checkingSecurity,
//     secure,
//     checkResults,
//     blockedMessage,
//   };
// }

// // ---------------------- Component: SecurityChecks ----------------------
// // A small presentational component that shows the current state of checks
// // and exposes a button to re-run checks. You can use this in debug UIs or
// // show it on the login page for transparency.
// export const SecurityChecks: React.FC<{
//   onRun?: (results: CheckResult[]) => void;
// }> = ({ onRun }) => {
//   const { runSecurityChecks, checkingSecurity, checkResults, blockedMessage, secure } = useSecurityChecks();

//   const handleRun = async () => {
//     const res = await runSecurityChecks();
//     onRun?.(res);
//   };

//   return (
//     <div className="p-3 border rounded-md shadow-sm">
//       <div className="flex items-center justify-between">
//         <div className="text-sm font-medium">Security checks</div>
//         <Button size="sm" variant="outline" onClick={handleRun} disabled={checkingSecurity}>
//           {checkingSecurity ? "Checking..." : "Run checks"}
//         </Button>
//       </div>

//       {blockedMessage && (
//         <div className="mt-2 text-xs text-red-600">{blockedMessage}</div>
//       )}

//       <details className="text-xs mt-2">
//         <summary>Show results</summary>
//         <pre style={{ maxHeight: 220, overflow: "auto", padding: 8, background: "#fafafa" }}>
//           {JSON.stringify(checkResults, null, 2)}
//         </pre>
//       </details>

//       {secure !== null && (
//         <div className="mt-2 text-xs">Final verdict: {secure ? "secure" : "unsecure"}</div>
//       )}
//     </div>
//   );
// };

// // ---------------------- Component: BankingLogin ----------------------
// // The original login form, simplified to use the useSecurityChecks hook.





import React, { useEffect, useRef, useState } from 'react';

export type Point = {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
};

export type Metrics = {
  speed: number;
  pressure: number;
  complexity: number;
};

export type Pattern = {
  points: Point[];
  metrics: Metrics;
  timestamp: number;
};

export type UserProfile = {
  avgSpeed: number;
  avgPressure: number;
  patternComplexity: number;
  swipeAccuracy: number;
};

// Security check types (kept minimal for incognito only)
type CheckSeverity = "critical" | "soft";

interface CheckResult {
  id: string;
  ok: boolean;
  severity: CheckSeverity;
  meta?: any;
}

// Incognito-only check
const runIncognitoCheck = async (): Promise<CheckResult[]> => {
  const results: CheckResult[] = [];
  try {
    let isIncognito = false;

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        isIncognito = (estimate.quota || 0) < 120000000; // heuristic
      } catch (e) {
        isIncognito = true;
      }
    }

    if (!isIncognito) {
      try {
        if ('webkitRequestFileSystem' in window) {
          await new Promise((resolve, reject) => {
            (window as any).webkitRequestFileSystem(
              (window as any).TEMPORARY,
              1,
              resolve,
              reject
            );
          });
        }
      } catch (e) {
        isIncognito = true;
      }
    }

    results.push({ id: 'incognito', ok: !isIncognito, severity: 'soft', meta: { incognito: isIncognito } });
  } catch (e) {
    results.push({ id: 'incognito', ok: false, severity: 'soft', meta: { error: e } });
  }

  return results;
};

export default function SecureSwipe(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasSizeRef = useRef<{ cssWidth: number; cssHeight: number; dpr: number }>({
    cssWidth: 600,
    cssHeight: 420,
    dpr: 1,
  });

  // Mutable collections kept in refs to avoid heavy re-renders during drawing
  const patternsRef = useRef<Pattern[]>([]);
  const biometricRef = useRef<Metrics[]>([]);

  // Use a ref for the currentPath during drawing to avoid missed updates from async state
  const currentPathRef = useRef<Point[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const isDrawingRef = useRef(false);

  // Security check states (incognito only)
  const [checkingSecurity, setCheckingSecurity] = useState(false);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [securityBlocked, setSecurityBlocked] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  // Display states
  const [userProfile, setUserProfile] = useState<UserProfile>({
    avgSpeed: 0,
    avgPressure: 0,
    patternComplexity: 0,
    swipeAccuracy: 0,
  });

  const [fraudScore, setFraudScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  // Derived UI states
  const [consistencyText, setConsistencyText] = useState<string>('Learning...');
  const [behavioralMatchText, setBehavioralMatchText] = useState<string>('Baseline');

  // Run incognito check on component mount
  useEffect(() => {
    const runSecurityValidation = async () => {
      setCheckingSecurity(true);
      try {
        const results = await runIncognitoCheck();
        setCheckResults(results);

        const incognitoResult = results.find(r => r.id === 'incognito');
        if (incognitoResult && !incognitoResult.ok) {
          setSecurityMessage('Incognito/private mode detected. Please use a normal browsing session with storage enabled.');
          setSecurityBlocked(true);
        } else {
          setSecurityBlocked(false);
          setSecurityMessage(null);
        }
      } catch (error) {
        console.error('Security check error:', error);
        setSecurityMessage('Security validation failed. Please refresh and try again.');
        setSecurityBlocked(true);
      } finally {
        setCheckingSecurity(false);
      }
    };

    runSecurityValidation();
  }, []);

  // On mount: get canvas context and set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cssWidth = canvas.clientWidth || 600;
    const cssHeight = canvas.clientHeight || 420;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;

    canvasSizeRef.current = { cssWidth, cssHeight, dpr };

    const start = (e: Event) => startDrawing(e as any);
    const move = (e: Event) => draw(e as any);
    const up = (e: Event) => stopDrawing(e as any);

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('mouseleave', up);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', up);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', up);
      canvas.removeEventListener('mouseleave', up);

      canvas.removeEventListener('touchstart', start as any);
      canvas.removeEventListener('touchmove', move as any);
      canvas.removeEventListener('touchend', up as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (patternsRef.current.length > 2) {
      setConsistencyText((95 - fraudScore * 0.5).toFixed(1) + '%');
      setBehavioralMatchText((90 - fraudScore * 0.3).toFixed(1) + '%');
    } else {
      setConsistencyText('Learning...');
      setBehavioralMatchText('Baseline');
    }
  }, [fraudScore, attempts]);

  function getCoordinates(e: any): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      return {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
        pressure: t.force ?? 0.5,
        timestamp: Date.now(),
      };
    } else if (e.clientX !== undefined) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pressure: 0.5,
        timestamp: Date.now(),
      };
    }

    return { x: 0, y: 0, pressure: 0.5, timestamp: Date.now() };
  }

  function startDrawing(e: Event) {
    if (securityBlocked) return;
    e.preventDefault?.();
    isDrawingRef.current = true;
    const coords = getCoordinates(e as any);
    currentPathRef.current = [coords];
    setCurrentPath([coords]);
    setPlaceholderVisible(false);

    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(e: Event) {
    if (!isDrawingRef.current || securityBlocked) return;
    e.preventDefault?.();

    const coords = getCoordinates(e as any);

    const next = [...currentPathRef.current, coords];
    currentPathRef.current = next;
    setCurrentPath(next);

    const ctx = ctxRef.current!;
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2196F3';

    if (next.length > 1) {
      const prevPoint = next[next.length - 2];
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function stopDrawing(e: Event) {
    if (!isDrawingRef.current || securityBlocked) return;
    e.preventDefault?.();
    isDrawingRef.current = false;

    if (currentPathRef.current.length > 5) {
      analyzePattern(currentPathRef.current);
    }

    currentPathRef.current = [];
    setCurrentPath([]);
    setAttempts(prev => prev + 1);
  }

  function calculateSpeed(points: Point[]): number {
    if (points.length < 2) return 0;
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeDiff = points[i].timestamp - points[i - 1].timestamp;

      totalDistance += distance;
      totalTime += timeDiff;
    }

    return totalTime > 0 ? totalDistance / totalTime : 0;
  }

  function calculatePressure(points: Point[]): number {
    const pressures = points.filter(p => p.pressure !== undefined).map(p => p.pressure);
    return pressures.length > 0 ? pressures.reduce((a, b) => a + b) / pressures.length : 0.5;
  }

  function calculateComplexity(points: Point[]): number {
    if (points.length < 3) return 0;
    let directionChanges = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const dir1 = Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x);
      const dir2 = Math.atan2(points[i + 1].y - points[i].y, points[i + 1].x - points[i].x);

      const angleDiff = Math.abs(dir2 - dir1);
      if (angleDiff > Math.PI / 4) directionChanges++;
    }

    return directionChanges / points.length;
  }

  function calculateMetrics(points: Point[]): Metrics {
    return {
      speed: calculateSpeed(points),
      pressure: calculatePressure(points),
      complexity: calculateComplexity(points),
    };
  }

  function detectFraud(currentMetrics: Metrics): number {
    if (patternsRef.current.length === 0) return 0;

    let riskScore = 0;

    const speedDeviation = Math.abs(currentMetrics.speed - userProfile.avgSpeed) / (userProfile.avgSpeed || 1);
    if (speedDeviation > 0.4) riskScore += 25;

    const pressureDeviation = Math.abs(currentMetrics.pressure - userProfile.avgPressure);
    if (pressureDeviation > 0.3) riskScore += 20;

    const complexityDeviation = Math.abs(currentMetrics.complexity - userProfile.patternComplexity);
    if (complexityDeviation > 0.2) riskScore += 30;

    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 23) riskScore += 15;

    if (attempts > 3) riskScore += 20;

    return Math.min(riskScore, 100);
  }

  function analyzePattern(points: Point[]) {
    const metrics = calculateMetrics(points);

    const patternCount = patternsRef.current.length;
    if (patternCount === 0) {
      setUserProfile(prev => ({
        ...prev,
        avgSpeed: metrics.speed,
        avgPressure: metrics.pressure,
        patternComplexity: metrics.complexity,
      }));
    } else {
      setUserProfile(prev => ({
        avgSpeed: (prev.avgSpeed * patternCount + metrics.speed) / (patternCount + 1),
        avgPressure: (prev.avgPressure * patternCount + metrics.pressure) / (patternCount + 1),
        patternComplexity: (prev.patternComplexity * patternCount + metrics.complexity) / (patternCount + 1),
        swipeAccuracy: Math.random() * 0.3 + 0.7,
      }));
    }

    const newFraudScore = detectFraud(metrics);
    setFraudScore(newFraudScore);

    patternsRef.current.push({ points: [...points], metrics, timestamp: Date.now() });
    biometricRef.current.push(metrics);
  }

  function clearCanvas() {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const { cssWidth, cssHeight } = canvasSizeRef.current;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    currentPathRef.current = [];
    setCurrentPath([]);
    setPlaceholderVisible(true);
  }

  function resetProfile() {
    patternsRef.current = [];
    biometricRef.current = [];
    setUserProfile({ avgSpeed: 0, avgPressure: 0, patternComplexity: 0, swipeAccuracy: 0 });
    setAttempts(0);
    setFraudScore(0);
    clearCanvas();
    setConsistencyText('Learning...');
    setBehavioralMatchText('Baseline');
  }

  const recentBiometric = biometricRef.current.slice(-5);

  let riskLevelText = 'Low (0%)';
  let riskFillClass = 'bg-gradient-to-r from-green-500 to-lime-400';
  if (fraudScore < 30) {
    riskLevelText = `Low (${fraudScore.toFixed(0)}%)`;
    riskFillClass = 'bg-gradient-to-r from-green-500 to-lime-400';
  } else if (fraudScore < 60) {
    riskLevelText = `Medium (${fraudScore.toFixed(0)}%)`;
    riskFillClass = 'bg-gradient-to-r from-orange-400 to-yellow-400';
  } else {
    riskLevelText = `High (${fraudScore.toFixed(0)}%)`;
    riskFillClass = 'bg-gradient-to-r from-red-500 to-pink-600';
  }

  let authStatusClass = 'bg-blue-50 text-blue-700';
  let authText = '🔒 Ready for Authentication';
  let alertHtml: string | null = null;

  if (securityBlocked) {
    authStatusClass = 'bg-red-100 text-red-800';
    authText = '🚨 Security Check Failed';
    alertHtml = '⚠️ Browser security validation failed. Please use a standard browser.';
  } else if (fraudScore > 60) {
    authStatusClass = 'bg-red-100 text-red-800';
    authText = '🚨 Fraud Detected';
    alertHtml = '⚠️ Authentication blocked. Contact security team immediately.';
  } else if (fraudScore > 30) {
    authStatusClass = 'bg-yellow-100 text-yellow-800';
    authText = '⚠️ Suspicious Activity';
    alertHtml = 'Additional verification required.';
  } else if (patternsRef.current.length > 0) {
    authStatusClass = 'bg-green-100 text-green-800';
    authText = '✅ Authenticated';
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Biometric Pattern Authentication</h1>
              <p className="text-blue-100 mt-1">Draw your unique swipe pattern for secure access</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${authStatusClass}`}>
              {authText}
            </div>
          </div>
        </div>

        {/* Security Alert */}
        {securityMessage && (
          <div className="bg-red-50 border-b border-red-200 p-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600">🔒</div>
              <div>
                <div className="font-semibold text-red-700">Security Validation Failed</div>
                <div className="text-sm text-red-600 mt-1">{securityMessage}</div>
                <div className="text-xs text-gray-600 mt-2">
                  Ensure you're using a normal browsing session with storage enabled (not private/incognito).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {checkingSecurity && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-blue-700 font-medium">Running incognito validation...</div>
            </div>
          </div>
        )}

        {/* Alert section */}
        {alertHtml && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="text-yellow-800 text-sm">{alertHtml}</div>
          </div>
        )}

        {/* Canvas area - prominent */}
        <main className="p-6">
          <div className="flex justify-center">
            <div className={`bg-gray-50 rounded-lg p-2 relative ${securityBlocked ? 'opacity-50 pointer-events-none' : ''}`} style={{ width: 600 }}>
              <canvas
                ref={canvasRef}
                id="drawingCanvas"
                className="border-2 border-gray-200 rounded-md bg-white touch-none w-[600px] h-[420px]"
              />

              {placeholderVisible && !securityBlocked && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm text-center">
                  Draw your unique swipe pattern here<br />
                  <span className="text-xs">Mouse or touch supported</span>
                </div>
              )}

              {securityBlocked && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 pointer-events-none text-sm text-center font-medium">
                  🔒 Pattern drawing disabled<br />
                  <span className="text-xs">Security validation required</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex justify-center gap-2 text-xs">
            <button
              className={`px-3 py-1 rounded-md font-semibold ${securityBlocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
              onClick={clearCanvas}
              disabled={securityBlocked}
            >
              Clear
            </button>
            <button
              className={`px-3 py-1 rounded-md font-semibold ${securityBlocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              onClick={resetProfile}
              disabled={securityBlocked}
            >
              Reset
            </button>
          </div>

          <div className="mt-6">
            <div className="flex gap-2 overflow-x-auto py-2 px-1">
              <div className="min-w-[180px] flex-shrink-0 bg-white border rounded-md p-2 text-xs shadow-sm">
                <div className="font-semibold">📊 Risk</div>
                <div className="mt-1 text-[11px] text-gray-600">{riskLevelText}</div>
                <div className="w-full bg-gray-200 h-3 rounded-full mt-2 overflow-hidden">
                  <div className={`${riskFillClass} h-3`} style={{ width: `${fraudScore}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-gray-500">A:{attempts} P:{patternsRef.current.length}</div>
              </div>

              <div className="min-w-[220px] flex-shrink-0 bg-white border rounded-md p-2 text-xs shadow-sm">
                <div className="font-semibold">👤 Profile</div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-[11px] text-gray-600">
                  <div>
                    Speed
                    <br />
                    <span className="font-semibold text-black text-sm">{userProfile.avgSpeed.toFixed(1)}</span>
                  </div>
                  <div>
                    Pressure
                    <br />
                    <span className="font-semibold text-black text-sm">{(userProfile.avgPressure * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    Complexity
                    <br />
                    <span className="font-semibold text-black text-sm">{(userProfile.patternComplexity * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    Accuracy
                    <br />
                    <span className="font-semibold text-black text-sm">{(userProfile.swipeAccuracy * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="min-w-[200px] flex-shrink-0 bg-white border rounded-md p-2 text-xs shadow-sm">
                <div className="font-semibold">🔍 Security</div>
                <div className="mt-1 text-[11px] text-gray-600">
                  Consistency: <span className="font-semibold text-black text-sm">{consistencyText}</span>
                </div>
                <div className="mt-1 text-[11px] text-gray-600">
                  Behavioral: <span className="font-semibold text-black text-sm">{behavioralMatchText}</span>
                </div>
                <div className="mt-1 text-[11px] text-gray-600">
                  Device: <span className={securityBlocked ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                    {securityBlocked ? "❌" : "✅"}
                  </span>
                </div>
              </div>

              <div className="min-w-[260px] flex-shrink-0 bg-white border rounded-md p-2 text-xs shadow-sm">
                <div className="font-semibold">📋 Recent</div>
                <div className="mt-1 max-h-20 overflow-y-auto text-[11px]">
                  {recentBiometric.length === 0 ? (
                    <div className="text-gray-400">No patterns</div>
                  ) : (
                    recentBiometric.map((data, index) => {
                      const patternNum = biometricRef.current.length - recentBiometric.length + index + 1;
                      return (
                        <div key={index} className="flex justify-between py-0.5 border-b last:border-b-0">
                          <span># {patternNum}</span>
                          <span className={`${data.speed > (userProfile.avgSpeed * 1.5 || 0) ? 'text-red-600' : 'text-green-600'}`}>
                            S:{data.speed.toFixed(1)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">Security Check Results (Debug)</summary>
            <div className="mt-2 p-3 bg-gray-50 rounded border max-h-60 overflow-auto">
              <pre>{JSON.stringify(checkResults, null, 2)}</pre>
            </div>
          </details>
        </main>
      </div>
    </div>
  );
}
