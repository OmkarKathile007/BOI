
'use client';

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, User, CheckCircle, AlertCircle } from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface KeystrokeEvent {
  id: number;
  key: string;
  type: "hold" | "flight";
  time: number;
  timestamp: number;
}

type CheckSeverity = "critical" | "soft";

interface CheckResult {
  id: string;
  ok: boolean;
  severity: CheckSeverity;
  meta?: any;
}

const IGNORE_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "Tab",
  "CapsLock",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Escape",
]);

const TOP5_CHECK_IDS = ["webdriver", "userAgent", "incognito", "cookies", "localStorage"];
const STORAGE_KEY = 'bank_admin_settings';

type AdminSettings = {
  passwordlessEnabled: boolean;
  otpFallbackEnabled: boolean;
  deviceBindingEnabled: boolean;
  locationEnabled: boolean;
  behavioralEnabled: boolean;
};

const defaultAdminSettings: AdminSettings = {
  passwordlessEnabled: true,
  otpFallbackEnabled: true,
  deviceBindingEnabled: true,
  locationEnabled: true,
  behavioralEnabled: true,
};

// Built-in security checks function (unchanged)
const runTop5SecurityChecks = async (): Promise<CheckResult[]> => {
  const results: CheckResult[] = [];

  // 1. WebDriver check
  try {
    const isWebDriver = !!(
      (window as any).webdriver ||
      (window.navigator as any).webdriver ||
      (window as any).__webdriver_script_fn ||
      (window as any).__driver_evaluate ||
      (window as any).__webdriver_evaluate ||
      (window as any).__fxdriver_evaluate ||
      (window as any).__webdriver_unwrapped ||
      (window as any).__webdriver_script_func ||
      (window as any).__nightmare ||
      (window as any).phantom ||
      (window as any).domAutomation ||
      (window as any).domAutomationController ||
      (window as any)._phantom ||
      (window as any).__phantom
    );

    results.push({
      id: "webdriver",
      ok: !isWebDriver,
      severity: "critical",
      meta: { detected: isWebDriver }
    });
  } catch (e) {
    results.push({
      id: "webdriver",
      ok: false,
      severity: "critical",
      meta: { error: e }
    });
  }

  // 2. User Agent check
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    const suspiciousPatterns = [
      'phantomjs',
      'selenium',
      'webdriver',
      'bot',
      'crawler',
      'spider',
      'headless',
      'nightmare',
      'puppeteer',
      'playwright'
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => userAgent.includes(pattern));
    const isValidBrowser = /chrome|firefox|safari|edge/i.test(userAgent);

    results.push({
      id: "userAgent",
      ok: !isSuspicious && isValidBrowser,
      severity: "soft",
      meta: { userAgent, suspicious: isSuspicious, validBrowser: isValidBrowser }
    });
  } catch (e) {
    results.push({
      id: "userAgent",
      ok: false,
      severity: "soft",
      meta: { error: e }
    });
  }

  // 3. Incognito/Private mode check
  try {
    let isIncognito = false;

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      isIncognito = (estimate.quota || 0) < 120000000;
    }

    if (!isIncognito) {
      try {
        if ('webkitRequestFileSystem' in window) {
          (window as any).webkitRequestFileSystem(
            (window as any).TEMPORARY,
            1,
            () => {},
            () => { isIncognito = true; }
          );
        }
      } catch (e) {
        isIncognito = true;
      }
    }

    results.push({
      id: "incognito",
      ok: !isIncognito,
      severity: "soft",
      meta: { incognito: isIncognito }
    });
  } catch (e) {
    results.push({
      id: "incognito",
      ok: false,
      severity: "soft",
      meta: { error: e }
    });
  }

  // 4. Cookies check
  try {
    const cookiesEnabled = navigator.cookieEnabled;
    document.cookie = "test=1; SameSite=Strict";
    const testCookieExists = document.cookie.includes("test=1");
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    results.push({
      id: "cookies",
      ok: cookiesEnabled && testCookieExists,
      severity: "critical",
      meta: { enabled: cookiesEnabled, testWorked: testCookieExists }
    });
  } catch (e) {
    results.push({
      id: "cookies",
      ok: false,
      severity: "critical",
      meta: { error: e }
    });
  }

  // 5. LocalStorage check
  try {
    const testKey = '__security_test__';
    localStorage.setItem(testKey, 'test');
    const canRead = localStorage.getItem(testKey) === 'test';
    localStorage.removeItem(testKey);

    results.push({
      id: "localStorage",
      ok: canRead,
      severity: "critical",
      meta: { available: !!window.localStorage, canWrite: canRead }
    });
  } catch (e) {
    results.push({
      id: "localStorage",
      ok: false,
      severity: "critical",
      meta: { error: e }
    });
  }

  return results;
};

const BankingLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [ip, setIp] = useState<string>("");
  const [city, setCity] = useState<string>("");

  // Hidden honeypot field
  const [botTrap, setBotTrap] = useState("");

  // Keystroke tracking state
  const [keystrokeData, setKeystrokeData] = useState<KeystrokeEvent[]>([]);
  const [typingSpeed, setTypingSpeed] = useState(0);

  // Security check states
  const [checkingSecurity, setCheckingSecurity] = useState(false);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [topBlockedMessage, setTopBlockedMessage] = useState<string | null>(null);

  // Admin-driven feature toggles
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultAdminSettings);

  const keyDownTimes = useRef<Map<string, number>>(new Map());
  const lastKeyTime = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const eventCounter = useRef<number>(0);
  const watchId = useRef<number | null>(null);

  // Fetch IP+city helper (tries ipapi.co/json first, falls back to ipify + ipapi)
  const fetchIpAndCity = async (): Promise<{ ip: string; city: string }> => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("ipapi.co failed");
      const data = await res.json();
      return { ip: data.ip || "", city: data.city || data.region || "" };
    } catch (err) {
      try {
        // fallback: get IP first then lookup
        const r = await fetch("https://api.ipify.org?format=json");
        if (!r.ok) throw new Error("ipify failed");
        const d = await r.json();
        const ipAddr = d.ip;
        const geoRes = await fetch(`https://ipapi.co/${ipAddr}/json/`);
        if (!geoRes.ok) return { ip: ipAddr, city: "" };
        const geo = await geoRes.json();
        return { ip: ipAddr || "", city: geo.city || geo.region || "" };
      } catch (e) {
        return { ip: "", city: "" };
      }
    }
  };

  useEffect(() => {
    // load admin settings from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAdminSettings(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to read admin settings', e);
    }

    // react to storage changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : defaultAdminSettings;
          setAdminSettings(parsed);
        } catch (err) {
          console.warn('Invalid admin settings on storage event', err);
        }
      }
    };

    // react to same-tab updates (AdminPanel dispatches this)
    const onAdminUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setAdminSettings(detail);
      else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) setAdminSettings(JSON.parse(raw));
        } catch {}
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('adminSettingsUpdated', onAdminUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('adminSettingsUpdated', onAdminUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (
        watchId.current !== null &&
        navigator.geolocation &&
        (navigator.geolocation as any).clearWatch
      ) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!adminSettings.behavioralEnabled) return; // skip if disabled
    if (IGNORE_KEYS.has(e.key)) return;
    const now = Date.now();
    if (!startTime.current) startTime.current = now;

    if (!keyDownTimes.current.has(e.key)) {
      keyDownTimes.current.set(e.key, now);
    }

    if (lastKeyTime.current !== null) {
      const flightTime = now - lastKeyTime.current;
      const flightEvent: KeystrokeEvent = {
        id: ++eventCounter.current,
        key: e.key,
        type: "flight",
        time: flightTime,
        timestamp: now,
      };
      setKeystrokeData((prev) => [...prev, flightEvent]);
    }
    lastKeyTime.current = now;
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!adminSettings.behavioralEnabled) return; // skip if disabled
    if (IGNORE_KEYS.has(e.key)) return;
    const now = Date.now();
    const downTime = keyDownTimes.current.get(e.key);
    if (downTime) {
      const holdTime = now - downTime;
      const holdEvent: KeystrokeEvent = {
        id: ++eventCounter.current,
        key: e.key,
        type: "hold",
        time: holdTime,
        timestamp: now,
      };
      setKeystrokeData((prev) => [...prev, holdEvent]);
      keyDownTimes.current.delete(e.key);
    }

    if (startTime.current) {
      const elapsedSeconds = (Date.now() - startTime.current) / 1000;
      setTypingSpeed(username.length / Math.max(elapsedSeconds, 0.001));
    }
  };

  // Existing watch-based persistent location request (kept for retry/watch cleanup)
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setLocationPermissionStatus("denied");
      return;
    }

    setIsLoading(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(newLocation);
        setLocationError(null);
        setLocationPermissionStatus("granted");
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services for secure banking.";
            setLocationPermissionStatus("denied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred while retrieving location.";
            break;
        }
        setLocationError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    watchId.current = id;
  };

  // New helper: request location once (used by Sign In button)
  const getLocationOnce = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser");
        setLocationPermissionStatus("denied");
        resolve(null);
        return;
      }

      let settled = false;
      const success = (position: GeolocationPosition) => {
        if (settled) return;
        settled = true;
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(newLocation);
        setLocationError(null);
        setLocationPermissionStatus("granted");
        resolve(newLocation);
      };

      const failure = (error: GeolocationPositionError) => {
        if (settled) return;
        settled = true;
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services for secure banking.";
            setLocationPermissionStatus("denied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred while retrieving location.";
            break;
        }
        setLocationError(errorMessage);
        resolve(null);
      };

      // set a hard timeout to ensure we don't hang
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        setLocationError("Location request timed out. Please try again.");
        setLocationPermissionStatus("denied");
        resolve(null);
      }, 12000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          success(pos);
        },
        (err) => {
          clearTimeout(timer);
          failure(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Helper to evaluate ONLY the top 5 checks from the full results
  const evaluateTop5 = (results: CheckResult[]) => {
    const topResults = results.filter((r) => TOP5_CHECK_IDS.includes(r.id));
    const missing = TOP5_CHECK_IDS.filter((id) => !topResults.some((r) => r.id === id));
    const augmentedTopResults = [...topResults];

    missing.forEach((id) => {
      augmentedTopResults.push({ id, ok: false, severity: "critical" as CheckSeverity, meta: { missing: true } });
    });

    const criticalFail = augmentedTopResults.some((r) => r.severity === "critical" && !r.ok);
    const softFails = augmentedTopResults.filter((r) => r.severity !== "critical" && !r.ok).length;
    const unsecureBySoft = softFails >= 2;
    const failedIds = augmentedTopResults.filter((r) => !r.ok).map((r) => r.id + (r.severity === "critical" ? " (critical)" : ""));

    return { criticalFail, unsecureBySoft, failedIds, augmentedTopResults };
  };

  const handleSignInClick = async () => {
    // If admin disabled passwordless, block sign-in and point to OTP (if otp enabled)
    if (!adminSettings.passwordlessEnabled) {
      if (adminSettings.otpFallbackEnabled) {
        alert('Passwordless is disabled by admin. Use OTP fallback instead.');
        return;
      } else {
        alert('Passwordless sign-in is currently disabled by admin. Contact support.');
        return;
      }
    }

    // Basic validation & bot trap
    if (!username.trim()) {
      alert("Please enter username");
      return;
    }
    if (botTrap.trim() !== "") {
      alert("Bot detected! Submission blocked.");
      console.warn("Bot trap triggered:", botTrap);
      return;
    }

    setTopBlockedMessage(null);
    setIsLoading(true);
    setCheckingSecurity(true);

    try {
      // If admin enabled location, request it *now* (single-shot) and wait for result before continuing.
      if (adminSettings.locationEnabled) {
        setLocationError(null);
        setLocationPermissionStatus("pending");
        // this will set location state and permission status if granted
        await getLocationOnce();
      }

      // attempt to fetch IP and city (non-blocking if fails)
      const geoInfo = await fetchIpAndCity();
      setIp(geoInfo.ip);
      setCity(geoInfo.city);

      // Run the top 5 security checks only (keeps previous logic)
      const results = await runTop5SecurityChecks();
      setCheckResults(results);

      const { criticalFail, unsecureBySoft, failedIds } = evaluateTop5(results);

      if (criticalFail || unsecureBySoft) {
        const reasonText = failedIds.length ? failedIds.join(", ") : "Top checks failed";
        setTopBlockedMessage(`Top security checks failed: ${reasonText}. Try a standard browser with storage & location enabled.`);
        setIsLoading(false);
        setCheckingSecurity(false);
        return; // block sign-in
      }

      // If top5 passed -> proceed
      const loginData = {
        username: username.trim(),
        useremail: useremail.trim(),
        location,
        ip: geoInfo.ip || undefined,
        city: geoInfo.city || undefined,
        keystrokeData: adminSettings.behavioralEnabled ? keystrokeData : undefined,
        typingSpeed: adminSettings.behavioralEnabled ? typingSpeed.toFixed(2) + " chars/sec" : undefined,
        timestamp: new Date().toISOString(),
        securityChecks: results,
      };

      try {
        const response = await fetch("http://localhost:5000/api/store-login-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(loginData),
        });

        console.log("Store login data response:", response.json());

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // redirect to pattern swipe or desired secure flow
        window.location.href = "/PatternSwipe";
      } catch (err) {
        console.error("Error storing login data:", err);
        alert("Failed to store login data. Please try again.");
      }
    } catch (error) {
      console.error("Security check error:", error);
      setTopBlockedMessage("Security validation failed. Please try again with a standard browser.");
    } finally {
      setIsLoading(false);
      setCheckingSecurity(false);
    }
  };

  const handleOtpFallback = () => {
    // Minimal OTP fallback demo: in real app you will start an OTP flow
    if (!adminSettings.otpFallbackEnabled) {
      alert('OTP fallback is disabled by admin.');
      return;
    }
    if (!username.trim()) {
      alert("Enter username to receive OTP");
      return;
    }
    alert(`OTP sent to ${username.trim()} (demo). Proceed with OTP flow.`);
    // implement actual OTP flow here
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getTimeSinceUpdate = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-20 relative">
      {/* Admin button at top right */}
      <div className="absolute top-6 right-6 z-10 w-20 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/20 text-xs"
          onClick={() => (window.location.href = "/admin")}
        >
          Admin
        </Button>
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img src="/images/boi.png" alt="Bank Logo" className="w-44 mx-auto mt-2" />
        </div>

        {locationPermissionStatus === "granted" && location && (
          <Alert className="border-success bg-success-light">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground text-black">
              <div className="space-y-1">
                <div className="font-medium">Location verified</div>
                <div className="text-sm opacity-90">{formatCoordinates(location.latitude, location.longitude)}</div>
                <div className="text-xs opacity-75">Accuracy: ±{Math.round(location.accuracy)}m • Updated {getTimeSinceUpdate(location.timestamp)}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {locationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* Blocked message UI */}
        {topBlockedMessage && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-semibold text-red-700">Unsecure attempt — login blocked</div>
                <div className="text-xs text-red-600 mt-1">{topBlockedMessage}</div>
                <div className="text-xs text-muted-foreground mt-2">Try from a standard browser (Chrome/Edge/Safari) with location & storage enabled.</div>
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <p className="text-sm text-muted-foreground text-center">Enter your username to access your account</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignInClick();
              }}
              className="space-y-4"
            >
              <input type="text" value={botTrap} onChange={(e) => setBotTrap(e.target.value)} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    className="pl-10 border-input-border focus:border-primary mb-4 focus:ring-primary"
                    required
                  />

                  <Input
                    id="useremail"
                    type="email"
                    placeholder="Enter your user email"
                    value={useremail}
                    onChange={(e) => setUseremail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    className="pl-10  border-input-border focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                {adminSettings.behavioralEnabled && typingSpeed > 0 && (
                  <p className="text-xs text-muted-foreground">Typing speed: {typingSpeed.toFixed(2)} chars/sec</p>
                )}
              </div>

              <div className="space-y-3">
                {/* Single Sign In button — it will request location once (if enabled) when clicked */}
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !username.trim() || checkingSecurity || !adminSettings.passwordlessEnabled}
                >
                  {(isLoading || checkingSecurity) ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>{checkingSecurity ? "Checking browser..." : "Signing In..."}</span>
                    </div>
                  ) : (
                    adminSettings.passwordlessEnabled ? "Sign In Securely" : "Passwordless Disabled"
                  )}
                </Button>

                {/* If admin disabled passwordless but enabled OTP fallback, show OTP button */}
                {(!adminSettings.passwordlessEnabled && adminSettings.otpFallbackEnabled) && (
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleOtpFallback}>
                    Use OTP Fallback
                  </Button>
                )}

                {/* Retry location if previously denied */}
                {adminSettings.locationEnabled && locationPermissionStatus === "denied" && (
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={requestLocationPermission}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Try Again - Enable Location Services
                  </Button>
                )}

                {/* Device binding note */}
                {adminSettings.deviceBindingEnabled ? (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Device binding is enforced for this session (admin setting).
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Device binding is <strong>disabled</strong> by admin.
                  </div>
                )}
              </div>
            </form>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
              <p>Your location and typing patterns are tracked for security and fraud prevention.</p>
              {ip && <p className="text-xs mt-1">IP: {ip}{city ? ` • ${city}` : ''}</p>}
            </div>
          </CardContent>
        </Card>

        {isLoading && checkingSecurity && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Requesting location & checking browser...</span>
            </div>
          </div>
        )}

        {/* Debug / details */}
        <details className="text-xs mt-2">
          <summary>Security checks (debug)</summary>
          <pre style={{ maxHeight: 280, overflow: "auto", padding: 8, background: "#fafafa" }}>{JSON.stringify(checkResults, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default BankingLogin;
