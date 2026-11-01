"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, X, Check, ChevronDown } from "lucide-react";
import {
  POPULAR_INDIAN_CITIES,
  detectLocationWithGeolocation,
  saveStoredLocation,
  getStoredLocation,
  StoredLocation,
} from "@/lib/location";

const DISMISS_KEY = "bharat_pulse_loc_dismissed_until";

export default function LocationPrompt({
  onLocationSelected,
}: {
  onLocationSelected?: (loc: StoredLocation) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualSelectOpen, setManualSelectOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    // If user already has a saved location, do not show
    const existing = getStoredLocation();
    if (existing) return;

    // If dismissed recently, respect dismissal for 14 days
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    // Show after 12 seconds or on user action
    const timer = setTimeout(() => {
      setVisible(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const handleUseCurrent = async () => {
    setLoading(true);
    const loc = await detectLocationWithGeolocation();
    setLoading(false);

    if (loc) {
      if (onLocationSelected) onLocationSelected(loc);
      setVisible(false);
    } else {
      // Permission denied: open manual selection
      setManualSelectOpen(true);
    }
  };

  const handleSelectCityManually = (cityName: string) => {
    const matched = POPULAR_INDIAN_CITIES.find((c) => c.name === cityName);
    if (!matched) return;

    const loc: StoredLocation = {
      city: matched.name,
      cityHi: matched.nameHi,
      state: matched.state,
      stateHi: matched.stateHi,
      detectedAt: Date.now(),
    };

    saveStoredLocation(loc);
    if (onLocationSelected) onLocationSelected(loc);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 14 * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="स्थान चयन (Location selection)"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl transition-all"
      >
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/20">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            अपने आसपास की महत्वपूर्ण खबरें पाएं
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
            अपने शहर, जिले और राज्य से जुड़ी ताज़ा और सत्यापित खबरें देखने के लिए स्थान चुनें।
          </p>
        </div>

        {!manualSelectOpen ? (
          <div className="space-y-3">
            <button
              onClick={handleUseCurrent}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#c61d23] py-2.5 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-all cursor-pointer disabled:opacity-50"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>{loading ? "स्थान पहचाना जा रहा है..." : "मेरी वर्तमान स्थिति का उपयोग करें"}</span>
            </button>

            <button
              onClick={() => setManualSelectOpen(true)}
              className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 py-2.5 text-xs font-bold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              शहर स्वयं चुनें (Select City Manually)
            </button>

            <button
              onClick={handleDismiss}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300 pt-1 cursor-pointer"
            >
              अभी नहीं (Not Now)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300">
              अपना शहर चुनें:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {POPULAR_INDIAN_CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSelectCityManually(c.name)}
                  className="rounded-lg border border-gray-200 dark:border-neutral-700 p-2 text-left hover:border-[#c61d23] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {c.nameHi}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">{c.name}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setManualSelectOpen(false)}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300 cursor-pointer"
            >
              ← वापस जाएं
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

