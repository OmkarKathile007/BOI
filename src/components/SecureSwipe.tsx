

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

export default function SecureSwipe(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasSizeRef = useRef<{ cssWidth: number; cssHeight: number; dpr: number }>({
    cssWidth: 600,
    cssHeight: 420,
    dpr: 1,
  });

  // Mutable collections kept in refs to avoid heavy re-renders during drawing
  const patternsRef = useRef<Pattern[]>([]); // stores up to 3 patterns locally
  const biometricRef = useRef<Metrics[]>([]);

  // Use a ref for the currentPath during drawing to avoid missed updates from async state
  const currentPathRef = useRef<Point[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const isDrawingRef = useRef(false);

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

  // Send state for Next button
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sentOnce, setSentOnce] = useState(false);

  // On mount: get canvas context and set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cssWidth = canvas.clientWidth || 600;
    const cssHeight = canvas.clientHeight || 420;
    const dpr = window.devicePixelRatio || 1;

    // Set backing store to dpr pixels, but scale ctx so we can draw in CSS pixels
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr); // now drawing coordinates should be in CSS pixels
    ctxRef.current = ctx;

    // store sizes for later clear / math
    canvasSizeRef.current = { cssWidth, cssHeight, dpr };

    // attach events (mouse + touch)
    const start = (e: Event) => startDrawing(e as any);
    const move = (e: Event) => draw(e as any);
    const up = (e: Event) => stopDrawing(e as any);

    // use mouse + touch to keep compatibility
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
    // Update derived security texts when fraudScore or patterns change
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
        // use CSS pixel coordinates (no scaling with dpr here)
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

    // Fallback
    return { x: 0, y: 0, pressure: 0.5, timestamp: Date.now() };
  }

  function startDrawing(e: Event) {
    e.preventDefault?.();
    isDrawingRef.current = true;
    const coords = getCoordinates(e as any);
    currentPathRef.current = [coords]; // keep ref up-to-date
    setCurrentPath([coords]);
    setPlaceholderVisible(false);

    // small visual dot for the start so user sees immediate contact
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(e: Event) {
    if (!isDrawingRef.current) return;
    e.preventDefault?.();

    const coords = getCoordinates(e as any);

    // Use and update the ref first to ensure the latest data is available in stopDrawing
    const next = [...currentPathRef.current, coords];
    currentPathRef.current = next;
    setCurrentPath(next);

    // draw on canvas
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
      // single dot
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function stopDrawing(e: Event) {
    if (!isDrawingRef.current) return;
    e.preventDefault?.();
    isDrawingRef.current = false;

    // Use the ref (guaranteed up-to-date) instead of state
    // NOTE: changed threshold from >5 to >3 points to allow shorter gestures to be recorded
    if (currentPathRef.current.length > 3) {
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

    // Speed deviation
    const speedDeviation = Math.abs(currentMetrics.speed - userProfile.avgSpeed) / (userProfile.avgSpeed || 1);
    if (speedDeviation > 0.4) riskScore += 25;

    // Pressure deviation
    const pressureDeviation = Math.abs(currentMetrics.pressure - userProfile.avgPressure);
    if (pressureDeviation > 0.3) riskScore += 20;

    // Complexity deviation
    const complexityDeviation = Math.abs(currentMetrics.complexity - userProfile.patternComplexity);
    if (complexityDeviation > 0.2) riskScore += 30;

    // Time-based analysis
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 23) riskScore += 15;

    // Multiple attempts penalty
    // changed threshold to >2 (3 attempts) to match new 3-attempts policy
    if (attempts > 2) riskScore += 20;

    return Math.min(riskScore, 100);
  }

  // Analyze pattern and store only first 3 patterns (no immediate network send)
  function analyzePattern(points: Point[]) {
    const metrics = calculateMetrics(points);

    // If we've already stored 3 patterns, do not store more
    if (patternsRef.current.length >= 3) {
      // Optionally, compute fraud score but do not push nor send
      const newFraudScore = detectFraud(metrics);
      setFraudScore(newFraudScore);
      return;
    }

    // Update user profile
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

    // Detect fraud (based on current metrics vs profile)
    const newFraudScore = detectFraud(metrics);
    setFraudScore(newFraudScore);

    // Construct pattern payload
    const pattern: Pattern = { points: [...points], metrics, timestamp: Date.now() };

    // Store pattern locally (but only up to 3)
    patternsRef.current.push(pattern);
    biometricRef.current.push(metrics);
  }

  // Sends all locally-stored patterns (up to 3) to backend when user clicks Next
  async function sendStoredPatterns() {
    if (patternsRef.current.length === 0) {
      setSendResult('No patterns to send');
      return;
    }
    if (isSending) return;

    setIsSending(true);
    setSendResult(null);

    try {
      // POST body contains an array `patterns`. Adjust endpoint to your server.
      const res = await fetch('/api/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patterns: patternsRef.current.slice(0, 3) }),
      });

      if (!res.ok) {
        const text = await res.text();
        setSendResult(`Server error: ${text}`);
      } else {
        setSendResult('Patterns sent successfully');
        setSentOnce(true);
      }
    } catch (err: any) {
      setSendResult(`Network error: ${err?.message ?? String(err)}`);
    } finally {
      setIsSending(false);
    }
  }

  // UI helpers
  function clearCanvas() {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const { cssWidth, cssHeight } = canvasSizeRef.current;
    // Because ctx has been scaled to dpr, clear using CSS pixels
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
    setSendResult(null);
    setSentOnce(false);
  }

  // Activity log rendering data (derived from ref)
  // limit recent list to last 3 instead of 5
  const recentBiometric = biometricRef.current.slice(-3);

  // Risk level derivation (same logic as original)
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

  // Auth status class and text
  let authStatusClass = 'bg-blue-50 text-blue-700';
  let authText = '🔒 Ready for Authentication';
  let alertHtml: string | null = null;

  if (fraudScore > 60) {
    authStatusClass = 'bg-red-100 text-red-800';
    authText = '🚨 Fraud Detected';
    alertHtml = '⚠️ Authentication blocked. Contact security team immediately.';
  } else if (fraudScore > 30) {
    authStatusClass = 'bg-yellow-100 text-yellow-800';
    authText = '⚠️ Suspicious Activity';
    alertHtml = 'Additional verification required.';
  } else if (patternsRef.current.length > 0) {
    authStatusClass = 'bg-green-100 text-green-800';
    authText = ' Authenticated';
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Canvas area - prominent */}
        <main className="p-6">
          <div className="flex justify-center">
            <div className="bg-gray-50 rounded-lg p-2 relative" style={{ width: 600 }}>
              {/* NOTE: don't set width/height attributes here; we compute sizes in useEffect based on client size */}
              <canvas
                ref={canvasRef}
                id="drawingCanvas"
                className="border-2 border-gray-200 rounded-md bg-white touch-none w-[600px] h-[420px]"
              />

              {placeholderVisible && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-8 text-gray-400 pointer-events-none text-sm">
                  Draw your unique swipe pattern here — mouse or touch supported
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex justify-center gap-2 text-xs">
            <button
              className="px-3 py-1 rounded-md font-semibold bg-gray-600 text-white hover:bg-gray-700"
              onClick={clearCanvas}
            >
              Clear
            </button>
            <button
              className="px-3 py-1 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700"
              onClick={resetProfile}
            >
              Reset
            </button>
          </div>

          <div className="mt-6">
            <div className="flex gap-2 overflow-x-auto py-2 px-1">
              {/* Risk (tiny) */}
              <div className="min-w-[180px] flex-shrink-0 bg-white border rounded-md p-2 text-xs shadow-sm">
                <div className="font-semibold">📊 Risk</div>
                <div className="mt-1 text-[11px] text-gray-600">{riskLevelText}</div>
                <div className="w-full bg-gray-200 h-3 rounded-full mt-2 overflow-hidden">
                  <div className={`${riskFillClass} h-3`} style={{ width: `${fraudScore}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-gray-500">A:{attempts} P:{patternsRef.current.length}</div>
              </div>

              {/* Profile (tiny) */}
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
                  Device: <span className="text-green-600 font-semibold">✅</span>
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

          {/* Bottom area: Next button + send status */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              onClick={sendStoredPatterns}
              disabled={isSending || patternsRef.current.length === 0 || sentOnce}
              className={`px-4 py-2 rounded-md font-semibold text-white ${
                isSending || patternsRef.current.length === 0 || sentOnce
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSending ? 'Sending...' : sentOnce ? 'Sent' : `Next — send ${patternsRef.current.length} pattern(s)`}
            </button>

            {sendResult && <div className="text-sm text-gray-600">{sendResult}</div>}

            <div className="text-xs text-gray-500 mt-2">Server endpoint: <code>/api/patterns</code> (POST)</div>
          </div>
        </main>
      </div>
    </div>
  );
}
