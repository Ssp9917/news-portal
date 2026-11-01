"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, ChevronDown, MapPin, RefreshCw } from "lucide-react";
import { getStoredLocation, POPULAR_INDIAN_CITIES } from "@/lib/location";

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
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize user's stored city
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
    } catch (e) {
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

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setCityDropdownOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="लाइव मार्केट व मौसम पट्टी"
      className="relative z-30 border-b border-gray-200/90 dark:border-neutral-800 bg-[#f9fafb] dark:bg-[#111318] text-gray-800 dark:text-neutral-200 text-xs shadow-xs"
    >
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-1.5 gap-2 sm:gap-4 overflow-hidden">
        {/* ── Left: Weather Widget with City Switcher Dropdown ── */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900 px-2.5 py-1 text-[11px] font-bold shadow-xs hover:border-[#c61d23] dark:hover:border-red-500 transition-all cursor-pointer"
            title="Click to change city weather"
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
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {/* City Selection Dropdown */}
          {cityDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-60 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-2xl z-50 animate-in fade-in max-h-72 overflow-y-auto">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <span>शहर चुनें (Select City)</span>
                <MapPin className="h-3 w-3 text-red-500" />
              </div>

              <div className="divide-y divide-gray-100 dark:divide-neutral-800/60 mt-1">
                {POPULAR_INDIAN_CITIES.slice(0, 15).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCitySelect(c.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-lg text-xs font-semibold transition-colors ${
                      selectedCity.toLowerCase() === c.name.toLowerCase()
                        ? "bg-red-50 dark:bg-red-950/40 text-[#c61d23] dark:text-red-400 font-bold"
                        : "text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>{c.nameHi} ({c.name})</span>
                    <span className="text-[10px] text-gray-400">{c.stateHi}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
  );
}
