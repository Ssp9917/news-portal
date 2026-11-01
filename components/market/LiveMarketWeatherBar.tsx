"use client";

import { useEffect, useState, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  MapPin,
  RefreshCw,
  Search,
  Navigation,
  X,
  Check,
} from "lucide-react";
import {
  getStoredLocation,
  saveStoredLocation,
  detectLocationWithGeolocation,
  POPULAR_INDIAN_CITIES,
} from "@/lib/location";

interface MarketItem {
  id: string;
  name: string;
  symbol: string;
  value: string;
  change: string;
  percent: string;
  isPositive: boolean;
}

interface WeatherData {
  city: string;
  cityHi: string;
  temp: number;
  condition: string;
  conditionHi: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

interface MarketStatus {
  isOpen: boolean;
  statusLabel: string;
  statusLabelHi: string;
}

export default function LiveMarketWeatherBar() {
  const [markets, setMarkets] = useState<MarketItem[]>([
    { id: "sensex", name: "BSE SENSEX", symbol: "SENSEX", value: "80,436.84", change: "+312.40", percent: "+0.39%", isPositive: true },
    { id: "nifty", name: "NIFTY 50", symbol: "NIFTY", value: "24,480.10", change: "+94.20", percent: "+0.38%", isPositive: true },
    { id: "gold", name: "GOLD 24K", symbol: "GOLD", value: "₹78,450/10g", change: "+120.00", percent: "+0.15%", isPositive: true },
    { id: "silver", name: "SILVER", symbol: "SILVER", value: "₹92,800/kg", change: "-250.00", percent: "-0.27%", isPositive: false },
    { id: "usdinr", name: "USD/INR", symbol: "USDINR", value: "₹84.12", change: "-0.04", percent: "-0.05%", isPositive: false },
  ]);

  const [weather, setWeather] = useState<WeatherData>({
    city: "Delhi",
    cityHi: "नई दिल्ली",
    temp: 28,
    condition: "Mainly Clear",
    conditionHi: "धूप खिली",
    icon: "🌤️",
  });

  const [marketStatus, setMarketStatus] = useState<MarketStatus>({
    isOpen: true,
    statusLabel: "Market Open",
    statusLabelHi: "बाज़ार खुला है",
  });

  const [selectedCity, setSelectedCity] = useState<string>("Delhi");
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize user's stored city from local storage
  useEffect(() => {
    const loc = getStoredLocation();
    if (loc && loc.city) {
      setSelectedCity(loc.city);
    }
  }, []);

  // Fetch live market and weather
  const fetchMarketAndWeather = async (city: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/market-weather?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.markets) setMarkets(data.markets);
        if (data.weather) setWeather(data.weather);
        if (data.marketStatus) setMarketStatus(data.marketStatus);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketAndWeather(selectedCity);
    const interval = setInterval(() => {
      fetchMarketAndWeather(selectedCity);
    }, 180000); // 3 mins auto-refresh
    return () => clearInterval(interval);
  }, [selectedCity]);

  // Select city from list or search
  const handleSelectCity = (cityName: string, cityNameHi?: string, stateName?: string, stateNameHi?: string) => {
    setSelectedCity(cityName);
    saveStoredLocation({
      city: cityName,
      cityHi: cityNameHi || cityName,
      state: stateName || "",
      stateHi: stateNameHi || "",
      detectedAt: Date.now(),
    });
    setCityModalOpen(false);
    setCitySearch("");

    // Dispatch event to inform other components (like local news feed)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bp_location_changed", { detail: { city: cityName } }));
    }
  };

  // GPS Auto-detect
  const handleAutoDetectGPS = async () => {
    setGpsLoading(true);
    try {
      const loc = await detectLocationWithGeolocation();
      if (loc && loc.city) {
        setSelectedCity(loc.city);
        saveStoredLocation(loc);
        setCityModalOpen(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("bp_location_changed", { detail: { city: loc.city } }));
        }
      } else {
        alert("लोकेशन डिटेक्ट नहीं हो पाई। कृपया सूची में से अपना शहर चुनें।");
      }
    } catch {
      alert("GPS परमिशन उपलब्ध नहीं है। कृपया अपना शहर मैन्युअली चुनें।");
    } finally {
      setGpsLoading(false);
    }
  };

  // Filter cities by search
  const filteredCities = POPULAR_INDIAN_CITIES.filter((c) => {
    const q = citySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameHi.includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.stateHi.includes(q)
    );
  });

  const popularPills = [
    { name: "Delhi", nameHi: "नई दिल्ली" },
    { name: "Jaipur", nameHi: "जयपुर" },
    { name: "Lucknow", nameHi: "लखनऊ" },
    { name: "Mumbai", nameHi: "मुंबई" },
    { name: "Patna", nameHi: "पटना" },
    { name: "Bhopal", nameHi: "भोपाल" },
    { name: "Kolkata", nameHi: "कोलकाता" },
    { name: "Bengaluru", nameHi: "बेंगलुरु" },
    { name: "Indore", nameHi: "इंदौर" },
    { name: "Varanasi", nameHi: "वाराणसी" },
  ];

  return (
    <>
      <div
        role="region"
        aria-label="लाइव मार्केट व मौसम पट्टी"
        className="relative z-30 border-b border-gray-200/90 dark:border-neutral-800 bg-[#f9fafb] dark:bg-[#111318] text-gray-800 dark:text-neutral-200 text-xs shadow-xs"
      >
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-1.5 gap-2 sm:gap-4 overflow-hidden">
          {/* ── Left: Interactive Weather Button ── */}
          <div className="shrink-0 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCityModalOpen(true)}
              className="group flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900 px-2.5 py-1 text-[11px] font-bold shadow-xs hover:border-[#c61d23] dark:hover:border-red-500 hover:shadow-sm transition-all cursor-pointer"
              title="मौसम का स्थान बदलने के लिए क्लिक करें"
              aria-label={`मौसम: ${weather.cityHi || weather.city}, ${weather.temp}°C`}
            >
              <span className="text-sm select-none" aria-hidden="true">{weather.icon}</span>
              <span className="font-extrabold text-gray-900 dark:text-white">
                {weather.cityHi || weather.city}
              </span>
              <span className="font-mono text-[#c61d23] dark:text-red-400 font-extrabold">
                {weather.temp}°C
              </span>
              <span className="hidden md:inline text-[10px] text-gray-500 dark:text-neutral-400 font-medium truncate max-w-[80px]">
                • {weather.conditionHi}
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 rounded bg-red-50 dark:bg-red-950/50 text-[#c61d23] dark:text-red-400 px-1.5 py-0.2 text-[9px] font-bold border border-red-200 dark:border-red-900/50 group-hover:bg-[#c61d23] group-hover:text-white transition-colors">
                <MapPin className="h-2.5 w-2.5" />
                <span>स्थान बदलें</span>
              </span>
              <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-[#c61d23] transition-colors" />
            </button>
          </div>

          {/* ── Middle: Continuous Scrolling Financial Market Ticker ── */}
          <div className="relative flex-1 overflow-hidden min-w-0" role="marquee" aria-live="off">
            <div className="marquee-track flex items-center gap-5 sm:gap-7 select-none">
              {markets.concat(markets).map((m, idx) => (
                <div
                  key={`${m.id}-${idx}`}
                  className="flex items-center gap-1.5 whitespace-nowrap text-[11px]"
                >
                  <span className="font-bold text-gray-900 dark:text-neutral-100">
                    {m.name}
                  </span>
                  <span className="font-mono font-semibold text-gray-700 dark:text-neutral-300">
                    {m.value}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                      m.isPositive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {m.isPositive ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5" />
                    )}
                    <span>{m.percent}</span>
                  </span>
                  <span className="text-gray-300 dark:text-neutral-700 ml-2" aria-hidden="true">
                    |
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Market Status Pill ── */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0 pl-2">
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  marketStatus.isOpen ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  marketStatus.isOpen ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                marketStatus.isOpen
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {marketStatus.statusLabelHi}
            </span>
          </div>
        </div>
      </div>

      {/* ── Weather Location Selection Modal ── */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600/10 text-[#c61d23] dark:text-red-400 font-bold">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    मौसम का शहर चुनें (Select Weather City)
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    अपने शहर का लाइव तापमान, मौसम और लोकल खबरें देखें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCityModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* GPS Auto Detect Button */}
            <button
              type="button"
              disabled={gpsLoading}
              onClick={handleAutoDetectGPS}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9a1418] via-[#c61d23] to-red-500 text-white py-2.5 px-4 text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>वर्तमान स्थान पता किया जा रहा है...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  <span>📍 मेरा वर्तमान स्थान पता करें (Auto-Detect Live Location)</span>
                </>
              )}
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="शहर या राज्य का नाम खोजें (उदा. जयपुर, पटना, दिल्ली...)"
                className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] dark:focus:border-red-500 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Popular City Pills */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                प्रमुख शहर (Popular Cities)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularPills.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCity(c.name, c.nameHi)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      selectedCity.toLowerCase() === c.name.toLowerCase()
                        ? "bg-[#c61d23] text-white shadow-xs"
                        : "border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:border-[#c61d23] hover:text-[#c61d23]"
                    }`}
                  >
                    {c.nameHi}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800/80 pr-1 max-h-56">
              {filteredCities.length > 0 ? (
                filteredCities.map((c) => {
                  const isCurrent = selectedCity.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleSelectCity(c.name, c.nameHi, c.state, c.stateHi)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-colors cursor-pointer text-xs ${
                        isCurrent
                          ? "bg-red-50 dark:bg-red-950/40 text-[#c61d23] dark:text-red-400 font-bold"
                          : "text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-3.5 w-3.5 ${isCurrent ? "text-red-600" : "text-gray-400"}`} />
                        <div>
                          <span className="font-bold">{c.nameHi}</span>
                          <span className="text-gray-400 text-[11px] ml-1.5 font-normal">({c.name})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">{c.stateHi}</span>
                        {isCurrent && <Check className="h-4 w-4 text-[#c61d23] dark:text-red-400" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="py-6 text-center text-xs text-gray-400 italic">
                  कोई शहर नहीं मिला। कृपया दूसरा नाम खोजें।
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
