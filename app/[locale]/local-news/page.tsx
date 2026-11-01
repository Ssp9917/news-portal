import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Navigation, Compass, Filter } from "lucide-react";
import TopBar from "@/components/TopBar";
import PremiumHeader from "@/components/PremiumHeader";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db";
import News from "@/models/News";
import { POPULAR_INDIAN_CITIES } from "@/lib/location";
import { withLocale } from "@/lib/i18n/paths";
import { isLocale, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const { city } = await searchParams;
  const currentCity = city || "जयपुर (Jaipur)";

  return {
    title: `${currentCity} लोकल न्यूज़ | शहर और आसपास की ताज़ा ख़बरें - Bharat Pulse`,
    description: `${currentCity} और आसपास के क्षेत्रों से संबंधित राजनीति, अपराध, प्रशासन, विकास और स्थानीय घटनाक्रम की सत्यापित खबरें।`,
  };
}

async function getLocalNews(cityName?: string) {
  await connectDB();
  const query: Record<string, unknown> = { published: true };

  if (cityName && cityName.trim()) {
    query.$or = [
      { "location.city": { $regex: new RegExp(cityName, "i") } },
      { title: { $regex: new RegExp(cityName, "i") } },
      { content: { $regex: new RegExp(cityName, "i") } },
      { tags: { $in: [new RegExp(cityName, "i")] } },
    ];
  }

  let articles = await News.find(query).sort({ createdAt: -1 }).limit(24).lean();

  if (articles.length === 0) {
    // Fallback to recent national/state news if city has no specific article yet
    articles = await News.find({ published: true }).sort({ createdAt: -1 }).limit(12).lean();
  }

  return JSON.parse(JSON.stringify(articles));
}

export default async function LocalNewsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { city: rawCity } = await searchParams;
  const locale = (isLocale(raw) ? raw : "hi") as Locale;

  const currentCity = rawCity || "Jaipur";
  const matchedCity = POPULAR_INDIAN_CITIES.find(
    (c) => c.name.toLowerCase() === currentCity.toLowerCase()
  ) || { name: currentCity, nameHi: currentCity, state: "Rajasthan", stateHi: "राजस्थान" };

  const articles = await getLocalNews(currentCity);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 transition-colors">
      <TopBar />
      <PremiumHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Local News Hero Banner */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-950/80 p-6 sm:p-8 text-white shadow-xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  लोकल न्यूज़ डेस्क (City & Regional Edition)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {matchedCity.nameHi} ({matchedCity.name}) की ताज़ा ख़बरें
              </h1>
              <p className="mt-1 text-xs text-gray-300 max-w-xl leading-relaxed">
                {matchedCity.nameHi}, {matchedCity.stateHi} और आसपास के प्रमुख कस्बों से ज़मीनी रिपोर्टिंग और सत्यापित स्थानीय समाचार।
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white backdrop-blur-md">
              <Compass className="h-4 w-4 text-emerald-400 animate-spin" />
              <span>कवरेज: {matchedCity.stateHi} व पड़ोसी जिले</span>
            </div>
          </div>

          {/* Quick City Filter Chips */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-emerald-400" />
              <span>अन्य प्रमुख शहर चुनें (Select Another City):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_INDIAN_CITIES.slice(0, 14).map((c) => {
                const isActive = c.name.toLowerCase() === currentCity.toLowerCase();
                return (
                  <Link
                    key={c.name}
                    href={withLocale(locale, `/local-news?city=${encodeURIComponent(c.name)}`)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                      isActive
                        ? "bg-emerald-500 text-black shadow-emerald-500/30"
                        : "border border-white/10 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {c.nameHi} ({c.name})
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Local News Grid */}
        <section aria-label={`${matchedCity.nameHi} समाचार सूची`}>
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[#c61d23]" />
              <span>{matchedCity.nameHi} मुख्य बुलेटिन</span>
              <span className="text-xs font-normal text-gray-500">({articles.length} लेख)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map((item: any) => {
              const headline = item.title;
              const excerpt = item.excerpt;
              const href = withLocale(locale, `/news/${item.slug || item._id}`);
              const cityLabel = item.location?.city || matchedCity.nameHi;

              return (
                <Link
                  key={item._id}
                  href={href}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800 mb-2.5">
                      <img
                        src={item.image || "https://placehold.co/400x250"}
                        alt={`${headline} - ${cityLabel} समाचार`}
                        width={400}
                        height={250}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Location Badge */}
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                        <MapPin className="h-2.5 w-2.5" />
                        <span>{cityLabel}</span>
                      </span>
                    </div>

                    <h3 className="text-xs font-bold leading-snug text-gray-900 dark:text-neutral-100 line-clamp-2 group-hover:text-[#c61d23] transition-colors">
                      {headline}
                    </h3>

                    <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600 dark:text-neutral-300 line-clamp-2">
                      {excerpt}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2 text-[10px] text-gray-500 font-medium">
                    <span>{item.author || "संवाददाता"}</span>
                    <span>{item.date}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

