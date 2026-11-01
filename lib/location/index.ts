/**
 * Location Engine & Indian Cities Dictionary
 * Provides geolocation, reverse geocoding fallback, and local news matching.
 */

export interface CityInfo {
  name: string;
  nameHi: string;
  state: string;
  stateHi: string;
  popular?: boolean;
}

export const POPULAR_INDIAN_CITIES: CityInfo[] = [
  { name: "Jaipur", nameHi: "जयपुर", state: "Rajasthan", stateHi: "राजस्थान", popular: true },
  { name: "Delhi", nameHi: "दिल्ली", state: "Delhi", stateHi: "दिल्ली", popular: true },
  { name: "Lucknow", nameHi: "लखनऊ", state: "Uttar Pradesh", stateHi: "उत्तर प्रदेश", popular: true },
  { name: "Mumbai", nameHi: "मुंबई", state: "Maharashtra", stateHi: "महाराष्ट्र", popular: true },
  { name: "Patna", nameHi: "पटना", state: "Bihar", stateHi: "बिहार", popular: true },
  { name: "Bhopal", nameHi: "भोपाल", state: "Madhya Pradesh", stateHi: "मध्य प्रदेश", popular: true },
  { name: "Varanasi", nameHi: "वाराणसी", state: "Uttar Pradesh", stateHi: "उत्तर प्रदेश", popular: true },
  { name: "Indore", nameHi: "इंदौर", state: "Madhya Pradesh", stateHi: "मध्य प्रदेश", popular: true },
  { name: "Chandigarh", nameHi: "चंडीगढ़", state: "Punjab/Haryana", stateHi: "पंजाब/हरियाणा", popular: true },
  { name: "Kolkata", nameHi: "कोलकाता", state: "West Bengal", stateHi: "पश्चिम बंगाल", popular: true },
  { name: "Bengaluru", nameHi: "बेंगलुरु", state: "Karnataka", stateHi: "कर्नाटक", popular: true },
  { name: "Ahmedabad", nameHi: "अहमदाबाद", state: "Gujarat", stateHi: "गुजरात", popular: true },
  { name: "Pune", nameHi: "पुणे", state: "Maharashtra", stateHi: "महाराष्ट्र", popular: true },
  { name: "Hyderabad", nameHi: "हैदराबाद", state: "Telangana", stateHi: "तेलंगाना", popular: true },
  { name: "Ranchi", nameHi: "रांची", state: "Jharkhand", stateHi: "झारखंड", popular: true },
  { name: "Dehradun", nameHi: "देहरादून", state: "Uttarakhand", stateHi: "उत्तराखंड", popular: true },
  { name: "Shimla", nameHi: "शिमला", state: "Himachal Pradesh", stateHi: "हिमाचल प्रदेश", popular: true },
  { name: "Raipur", nameHi: "रायपुर", state: "Chhattisgarh", stateHi: "छत्तीसगढ़", popular: true },
  { name: "Agra", nameHi: "आगरा", state: "Uttar Pradesh", stateHi: "उत्तर प्रदेश" },
  { name: "Kanpur", nameHi: "कानपुर", state: "Uttar Pradesh", stateHi: "उत्तर प्रदेश" },
  { name: "Prayagraj", nameHi: "प्रयागराज", state: "Uttar Pradesh", stateHi: "उत्तर प्रदेश" },
  { name: "Jodhpur", nameHi: "जोधपुर", state: "Rajasthan", stateHi: "राजस्थान" },
  { name: "Udaipur", nameHi: "उदयपुर", state: "Rajasthan", stateHi: "राजस्थान" },
  { name: "Kota", nameHi: "कोटा", state: "Rajasthan", stateHi: "राजस्थान" },
  { name: "Gwalior", nameHi: "ग्वालियर", state: "Madhya Pradesh", stateHi: "मध्य प्रदेश" },
  { name: "Jabalpur", nameHi: "जबलपुर", state: "Madhya Pradesh", stateHi: "मध्य प्रदेश" },
  { name: "Muzaffarpur", nameHi: "मुजफ्फरपुर", state: "Bihar", stateHi: "बिहार" },
  { name: "Gaya", nameHi: "गया", state: "Bihar", stateHi: "बिहार" },
  { name: "Noida", nameHi: "नोएडा", state: "Uttar Pradesh", stateHi: "उत्तर प्रदेश" },
  { name: "Gurugram", nameHi: "गुरुग्राम", state: "Haryana", stateHi: "हरियाणा" },
];

const LOCATION_STORAGE_KEY = "bharat_pulse_user_location";

export interface StoredLocation {
  city: string;
  cityHi: string;
  state: string;
  stateHi: string;
  lat?: number;
  lng?: number;
  detectedAt: number;
}

export function getStoredLocation(): StoredLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredLocation(loc: StoredLocation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    // Also save in cookie for SSR hydration
    document.cookie = `user_city=${encodeURIComponent(loc.city)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {}
}

export function clearStoredLocation(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    document.cookie = "user_city=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  } catch {}
}

/**
 * Detects location using browser Geolocation API + Nominatim reverse geocode
 */
export async function detectLocationWithGeolocation(): Promise<StoredLocation | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          // Reverse geocode with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const city = address.city || address.town || address.county || address.state_district || "Jaipur";
            const state = address.state || "Rajasthan";

            // Find Hindi translation if available
            const matched = POPULAR_INDIAN_CITIES.find(
              (c) => c.name.toLowerCase() === city.toLowerCase()
            );

            const result: StoredLocation = {
              city,
              cityHi: matched?.nameHi || city,
              state,
              stateHi: matched?.stateHi || state,
              lat: latitude,
              lng: longitude,
              detectedAt: Date.now(),
            };

            saveStoredLocation(result);
            return resolve(result);
          }
        } catch (err) {
          console.warn("Reverse geocode timeout or error, using default nearby city:", err);
        }

        // Fallback default city (Jaipur)
        const fallback: StoredLocation = {
          city: "Jaipur",
          cityHi: "जयपुर",
          state: "Rajasthan",
          stateHi: "राजस्थान",
          lat: latitude,
          lng: longitude,
          detectedAt: Date.now(),
        };
        saveStoredLocation(fallback);
        resolve(fallback);
      },
      () => {
        // Geolocation denied or unavailable
        resolve(null);
      },
      { timeout: 8000, maximumAge: 3600000 }
    );
  });
}

