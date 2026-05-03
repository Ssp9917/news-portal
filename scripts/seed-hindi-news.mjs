/**
 * Inserts sample Hindi news articles into MongoDB `news_db`.
 *
 * Usage:
 *   node scripts/seed-hindi-news.mjs
 *
 * Loads MONGODB_URI from `.env` in project root when present.
 */

import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadDotenv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotenv();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌  Missing MONGODB_URI. Set it in .env or the environment.");
  process.exit(1);
}

// ─── Schema (mirrors your News model) ────────────────────────────────────────
const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    titleI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    categoryColor: { type: String, default: "bg-blue-500" },
    excerpt: { type: String, required: true },
    excerptI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    content: { type: String, required: true },
    contentI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    author: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, default: "https://placehold.co/600x400/png" },
    isBreaking: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    breakingExpiresAt: { type: Date },
    videoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const News = mongoose.models.News || mongoose.model("News", newsSchema);

// ─── Seed Data (Hindi) ────────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const hindiNews = [
  // ── 1. Politics ──────────────────────────────────────────────────────────
  {
    title: "संसद का शीतकालीन सत्र: विपक्ष ने उठाए महंगाई पर सवाल",
    titleI18n: {
      hi: "संसद का शीतकालीन सत्र: विपक्ष ने उठाए महंगाई पर सवाल",
      en: "Winter Session of Parliament: Opposition Raises Questions on Inflation",
      bn: "সংসদের শীতকালীন অধিবেশন: বিরোধী দল মূল্যবৃদ্ধি নিয়ে প্রশ্ন তুলল",
    },
    slug: "parliament-winter-session-inflation-2025",
    category: "राजनीति",
    categoryColor: "bg-red-600",
    excerpt:
      "संसद के शीतकालीन सत्र में विपक्षी दलों ने बढ़ती महंगाई और बेरोजगारी के मुद्दे पर सरकार को घेरा।",
    excerptI18n: {
      hi: "संसद के शीतकालीन सत्र में विपक्षी दलों ने बढ़ती महंगाई और बेरोजगारी के मुद्दे पर सरकार को घेरा।",
      en: "Opposition parties cornered the government on rising inflation and unemployment in the winter session of Parliament.",
      bn: "সংসদের শীতকালীন অধিবেশনে বিরোধী দলগুলি ক্রমবর্ধমান মূল্যবৃদ্ধি ও বেকারত্বের বিষয়ে সরকারকে কোণঠাসা করল।",
    },
    content: `<p>नई दिल्ली। संसद के शीतकालीन सत्र का पहला दिन हंगामेदार रहा। विपक्षी दलों ने लोकसभा और राज्यसभा दोनों में महंगाई, पेट्रोल-डीजल की कीमतों और बढ़ती बेरोजगारी को लेकर सरकार पर जोरदार हमला बोला।</p>
<p>विपक्ष के नेता ने कहा कि आम जनता की थाली से दाल-सब्जी गायब हो रही है। सरकार को तत्काल राहत पैकेज देना चाहिए।</p>
<p>सत्तारूढ़ दल के प्रवक्ता ने पलटवार करते हुए कहा कि पिछले एक दशक में देश की अर्थव्यवस्था मजबूत हुई है और महंगाई को नियंत्रण में रखा गया है। उन्होंने वैश्विक कारणों को भी जिम्मेदार ठहराया।</p>
<p>सदन में चर्चा अगले सप्ताह भी जारी रहने की संभावना है।</p>`,
    contentI18n: {
      hi: `<p>नई दिल्ली। संसद के शीतकालीन सत्र का पहला दिन हंगामेदार रहा।</p>`,
      en: `<p>New Delhi. The first day of the winter session of Parliament was stormy.</p>`,
      bn: `<p>নতুন দিল্লি। সংসদের শীতকালীন অধিবেশনের প্রথম দিন উত্তাল ছিল।</p>`,
    },
    author: "राजेश शर्मा",
    date: today,
    image: "https://placehold.co/600x400/cc0000/ffffff?text=संसद",
    isBreaking: true,
    published: true,
    tags: ["संसद", "महंगाई", "विपक्ष", "शीतकालीन सत्र"],
    views: 1240,
  },

  // ── 2. Technology ─────────────────────────────────────────────────────────
  {
    title: "भारत में AI स्टार्टअप्स को मिली 5,000 करोड़ की फंडिंग",
    titleI18n: {
      hi: "भारत में AI स्टार्टअप्स को मिली 5,000 करोड़ की फंडिंग",
      en: "AI Startups in India Receive ₹5,000 Crore Funding",
      bn: "ভারতে AI স্টার্টআপগুলি ৫,০০০ কোটি টাকার অর্থায়ন পেল",
    },
    slug: "india-ai-startups-funding-5000-crore-2025",
    category: "तकनीक",
    categoryColor: "bg-blue-500",
    excerpt:
      "भारतीय कृत्रिम बुद्धिमत्ता स्टार्टअप्स ने इस वित्त वर्ष में रिकॉर्ड निवेश हासिल किया है।",
    excerptI18n: {
      hi: "भारतीय AI स्टार्टअप्स ने इस वित्त वर्ष में रिकॉर्ड निवेश हासिल किया है।",
      en: "Indian AI startups have secured record investment in this financial year.",
      bn: "ভারতীয় AI স্টার্টআপগুলি এই অর্থবছরে রেকর্ড বিনিয়োগ পেয়েছে।",
    },
    content: `<p>बेंगलुरु। भारत के टेक इकोसिस्टम के लिए यह एक ऐतिहासिक वर्ष साबित हो रहा है। देश के आर्टिफिशियल इंटेलिजेंस स्टार्टअप्स ने इस वित्त वर्ष में कुल 5,000 करोड़ रुपये से अधिक की फंडिंग जुटाई है।</p>
<p>नेशनल एआई मिशन के तहत सरकार ने स्टार्टअप्स को प्रोत्साहन दिया है। स्वास्थ्य, कृषि और शिक्षा क्षेत्रों में एआई समाधान विकसित करने वाली कंपनियों को सर्वाधिक निवेश मिला।</p>
<p>विशेषज्ञों का मानना है कि 2030 तक भारत वैश्विक एआई हब बन सकता है।</p>`,
    contentI18n: {
      hi: `<p>बेंगलुरु। भारत के टेक इकोसिस्टम के लिए यह एक ऐतिहासिक वर्ष है।</p>`,
      en: `<p>Bengaluru. This is proving to be a historic year for India's tech ecosystem.</p>`,
      bn: `<p>বেঙ্গালুরু। ভারতের প্রযুক্তি ইকোসিস্টেমের জন্য এটি একটি ঐতিহাসিক বছর।</p>`,
    },
    author: "प्रिया मेहता",
    date: today,
    image: "https://placehold.co/600x400/1d4ed8/ffffff?text=AI+India",
    isBreaking: false,
    published: true,
    tags: ["AI", "स्टार्टअप", "फंडिंग", "तकनीक", "बेंगलुरु"],
    views: 892,
  },

  // ── 3. Sports ─────────────────────────────────────────────────────────────
  {
    title: "टीम इंडिया ने ऑस्ट्रेलिया को 6 विकेट से हराया, सीरीज जीती",
    titleI18n: {
      hi: "टीम इंडिया ने ऑस्ट्रेलिया को 6 विकेट से हराया, सीरीज जीती",
      en: "Team India Beat Australia by 6 Wickets, Win Series",
      bn: "টিম ইন্ডিয়া অস্ট্রেলিয়াকে ৬ উইকেটে হারিয়ে সিরিজ জিতল",
    },
    slug: "india-beat-australia-6-wickets-series-win-2025",
    category: "खेल",
    categoryColor: "bg-green-600",
    excerpt:
      "भारतीय क्रिकेट टीम ने शानदार प्रदर्शन करते हुए ऑस्ट्रेलिया को तीसरे और निर्णायक वनडे में 6 विकेट से पराजित कर तीन मैचों की सीरीज 2-1 से अपने नाम की।",
    excerptI18n: {
      hi: "भारत ने ऑस्ट्रेलिया को तीसरे वनडे में 6 विकेट से हराकर सीरीज 2-1 से जीती।",
      en: "India beat Australia in the third ODI by 6 wickets to win the series 2-1.",
      bn: "ভারত তৃতীয় ওডিআইতে অস্ট্রেলিয়াকে ৬ উইকেটে হারিয়ে সিরিজ ২-১ জিতেছে।",
    },
    content: `<p>मुंबई। वानखेड़े स्टेडियम में खेले गए तीसरे और निर्णायक वनडे में भारत ने ऑस्ट्रेलिया को 6 विकेट से हराकर सीरीज 2-1 से अपने नाम कर ली।</p>
<p>रोहित शर्मा ने 94 रन की शानदार पारी खेली। युवा बल्लेबाज शुभमन गिल ने 67 रन बनाकर जीत में अहम भूमिका निभाई।</p>
<p>गेंदबाजी में जसप्रीत बुमराह ने 3 विकेट लिए और ऑस्ट्रेलियाई बल्लेबाजों पर लगाम लगाई। टीम इंडिया ने 241 रन के लक्ष्य को 43वें ओवर में ही हासिल कर लिया।</p>
<p>यह जीत भारत के लिए घरेलू मैदान पर लगातार छठी सीरीज जीत है।</p>`,
    contentI18n: {
      hi: `<p>मुंबई। वानखेड़े स्टेडियम में भारत ने सीरीज जीती।</p>`,
      en: `<p>Mumbai. India won the series at Wankhede Stadium.</p>`,
      bn: `<p>মুম্বাই। ওয়াংখেড়ে স্টেডিয়ামে ভারত সিরিজ জিতল।</p>`,
    },
    author: "अमित कुमार",
    date: today,
    image: "https://placehold.co/600x400/16a34a/ffffff?text=Team+India",
    isBreaking: true,
    published: true,
    tags: ["क्रिकेट", "टीम इंडिया", "ऑस्ट्रेलिया", "वनडे", "सीरीज"],
    views: 5430,
  },

  // ── 4. Business ───────────────────────────────────────────────────────────
  {
    title: "सेंसेक्स 80,000 के पार, निफ्टी ने भी बनाया नया रिकॉर्ड",
    titleI18n: {
      hi: "सेंसेक्स 80,000 के पार, निफ्टी ने भी बनाया नया रिकॉर्ड",
      en: "Sensex Crosses 80,000; Nifty Also Sets New Record",
      bn: "সেনসেক্স ৮০,০০০ পার করল, নিফটিও নতুন রেকর্ড গড়ল",
    },
    slug: "sensex-80000-nifty-record-high-2025",
    category: "व्यापार",
    categoryColor: "bg-yellow-500",
    excerpt:
      "भारतीय शेयर बाजार में जबरदस्त तेजी देखी गई। BSE सेंसेक्स पहली बार 80,000 अंक के पार पहुंचा।",
    excerptI18n: {
      hi: "BSE सेंसेक्स पहली बार 80,000 अंक के पार पहुंचा।",
      en: "BSE Sensex crossed 80,000 points for the first time.",
      bn: "BSE সেনসেক্স প্রথমবারের মতো ৮০,০০০ পয়েন্ট ছাড়িয়ে গেল।",
    },
    content: `<p>मुंबई। भारतीय शेयर बाजार में ऐतिहासिक तेजी के साथ BSE सेंसेक्स पहली बार 80,000 अंक के पार पहुंच गया। NSE निफ्टी भी 24,200 के नए रिकॉर्ड स्तर पर बंद हुआ।</p>
<p>विदेशी संस्थागत निवेशकों (FII) की भारी खरीदारी और मजबूत तिमाही नतीजों के कारण बाजार में यह तेजी देखी गई।</p>
<p>IT, बैंकिंग और ऑटो सेक्टर के शेयरों में सर्वाधिक बढ़त रही। रिलायंस इंडस्ट्रीज का शेयर 3% चढ़कर नई ऊंचाई पर पहुंचा।</p>
<p>विशेषज्ञों का कहना है कि स्थिर सरकार और मजबूत जीडीपी ग्रोथ बाजार को सहारा दे रहे हैं।</p>`,
    contentI18n: {
      hi: `<p>मुंबई। BSE सेंसेक्स 80,000 के पार पहुंचा।</p>`,
      en: `<p>Mumbai. BSE Sensex crossed 80,000 points.</p>`,
      bn: `<p>মুম্বাই। BSE সেনসেক্স ৮০,০০০ পয়েন্ট ছাড়িয়ে গেল।</p>`,
    },
    author: "सुनीता गुप्ता",
    date: today,
    image: "https://placehold.co/600x400/ca8a04/ffffff?text=Sensex+80K",
    isBreaking: false,
    published: true,
    tags: ["सेंसेक्स", "निफ्टी", "शेयर बाजार", "BSE", "निवेश"],
    views: 2100,
  },

  // ── 5. Health ─────────────────────────────────────────────────────────────
  {
    title: "AIIMS ने विकसित की सस्ती कैंसर जांच किट, गांवों तक पहुंचेगी सुविधा",
    titleI18n: {
      hi: "AIIMS ने विकसित की सस्ती कैंसर जांच किट, गांवों तक पहुंचेगी सुविधा",
      en: "AIIMS Develops Affordable Cancer Detection Kit for Rural Areas",
      bn: "AIIMS সাশ্রয়ী ক্যান্সার শনাক্তকরণ কিট তৈরি করল, গ্রামে পৌঁছাবে সুবিধা",
    },
    slug: "aiims-affordable-cancer-kit-rural-india-2025",
    category: "स्वास्थ्य",
    categoryColor: "bg-pink-500",
    excerpt:
      "AIIMS दिल्ली के वैज्ञानिकों ने एक ऐसी कैंसर जांच किट बनाई है जो मात्र 200 रुपये में उपलब्ध होगी।",
    excerptI18n: {
      hi: "AIIMS दिल्ली के वैज्ञानिकों ने 200 रुपये में कैंसर जांच किट बनाई।",
      en: "AIIMS Delhi scientists have created a cancer detection kit available for just ₹200.",
      bn: "AIIMS দিল্লির বিজ্ঞানীরা মাত্র ২০০ টাকায় ক্যান্সার শনাক্তকরণ কিট তৈরি করেছেন।",
    },
    content: `<p>नई दिल्ली। AIIMS दिल्ली के शोधकर्ताओं ने एक बड़ी सफलता हासिल की है। उन्होंने एक किफायती कैंसर जांच किट विकसित की है जो मात्र 200 रुपये में उपलब्ध होगी।</p>
<p>यह किट मुख्य रूप से ओरल, सर्वाइकल और ब्रेस्ट कैंसर का शुरुआती चरण में पता लगा सकती है। किट का उपयोग प्राथमिक स्वास्थ्य केंद्रों पर बिना किसी बड़ी मशीन के किया जा सकता है।</p>
<p>स्वास्थ्य मंत्रालय ने इस किट को राष्ट्रीय स्वास्थ्य मिशन के तहत ग्रामीण क्षेत्रों में वितरित करने की योजना बनाई है।</p>
<p>AIIMS के निदेशक ने कहा कि यह किट भारत में कैंसर से होने वाली मृत्यु दर को कम करने में मील का पत्थर साबित होगी।</p>`,
    contentI18n: {
      hi: `<p>नई दिल्ली। AIIMS ने 200 रुपये में कैंसर जांच किट बनाई।</p>`,
      en: `<p>New Delhi. AIIMS developed a ₹200 cancer detection kit.</p>`,
      bn: `<p>নতুন দিল্লি। AIIMS ২০০ টাকায় ক্যান্সার শনাক্তকরণ কিট তৈরি করল।</p>`,
    },
    author: "डॉ. अनीता सिंह",
    date: today,
    image: "https://placehold.co/600x400/ec4899/ffffff?text=AIIMS+Health",
    isBreaking: false,
    published: true,
    tags: ["AIIMS", "कैंसर", "स्वास्थ्य", "ग्रामीण भारत", "चिकित्सा"],
    views: 3350,
  },

  // ── 6. Education ──────────────────────────────────────────────────────────
  {
    title: "JEE Main 2025 का रिजल्ट जारी, टॉपर ने बताई सफलता की कहानी",
    titleI18n: {
      hi: "JEE Main 2025 का रिजल्ट जारी, टॉपर ने बताई सफलता की कहानी",
      en: "JEE Main 2025 Result Declared; Topper Shares Success Story",
      bn: "JEE Main 2025 ফলাফল প্রকাশিত, টপার সাফল্যের গল্প জানালেন",
    },
    slug: "jee-main-2025-result-topper-success-story",
    category: "शिक्षा",
    categoryColor: "bg-purple-600",
    excerpt:
      "NTA ने JEE Main 2025 का परिणाम घोषित कर दिया है। इस वर्ष 14 छात्रों ने 100 पर्सेंटाइल हासिल किया।",
    excerptI18n: {
      hi: "NTA ने JEE Main 2025 का परिणाम घोषित किया, 14 छात्रों ने 100 पर्सेंटाइल पाया।",
      en: "NTA declared JEE Main 2025 results; 14 students scored 100 percentile.",
      bn: "NTA JEE Main 2025-এর ফলাফল ঘোষণা করল; ১৪ জন শিক্ষার্থী ১০০ পার্সেন্টাইল পেল।",
    },
    content: `<p>नई दिल्ली। राष्ट्रीय परीक्षण एजेंसी (NTA) ने JEE Main 2025 सत्र-1 का परिणाम घोषित कर दिया है। इस वर्ष कुल 14 छात्रों ने 100 पर्सेंटाइल स्कोर हासिल किया है।</p>
<p>राजस्थान के कोटा से पढ़े अर्जुन शर्मा ने ऑल इंडिया टॉप किया। अर्जुन ने बताया कि उन्होंने रोजाना 8 घंटे पढ़ाई की और NCERT को आधार बनाया।</p>
<p>इस वर्ष 13.5 लाख से अधिक छात्रों ने JEE Main में भाग लिया। JEE Advanced के लिए शीर्ष 2.5 लाख छात्रों को अर्हता प्राप्त हुई है।</p>`,
    contentI18n: {
      hi: `<p>नई दिल्ली। JEE Main 2025 का परिणाम जारी हुआ।</p>`,
      en: `<p>New Delhi. JEE Main 2025 results announced.</p>`,
      bn: `<p>নতুন দিল্লি। JEE Main 2025-এর ফলাফল প্রকাশিত হল।</p>`,
    },
    author: "मोनिका वर्मा",
    date: today,
    image: "https://placehold.co/600x400/7c3aed/ffffff?text=JEE+2025",
    isBreaking: false,
    published: true,
    tags: ["JEE", "परीक्षा", "NTA", "शिक्षा", "IIT"],
    views: 4780,
  },

  // ── 7. Weather / Environment ──────────────────────────────────────────────
  {
    title: "मानसून 2025: केरल में समय से पहले आई बारिश, मौसम विभाग अलर्ट",
    titleI18n: {
      hi: "मानसून 2025: केरल में समय से पहले आई बारिश, मौसम विभाग अलर्ट",
      en: "Monsoon 2025: Early Rains in Kerala, Meteorological Department Issues Alert",
      bn: "মৌসুম ২০২৫: কেরালায় সময়ের আগে বৃষ্টি, আবহাওয়া দপ্তরের সতর্কতা",
    },
    slug: "monsoon-2025-kerala-early-rain-imd-alert",
    category: "मौसम",
    categoryColor: "bg-cyan-500",
    excerpt:
      "भारतीय मौसम विभाग के अनुसार इस वर्ष मानसून केरल में 3 दिन पहले दस्तक दे सकता है।",
    excerptI18n: {
      hi: "IMD के अनुसार मानसून केरल में 3 दिन पहले आ सकता है।",
      en: "According to IMD, the monsoon may arrive in Kerala 3 days early.",
      bn: "IMD অনুযায়ী মৌসুম কেরালায় ৩ দিন আগে আসতে পারে।",
    },
    content: `<p>नई दिल्ली। भारतीय मौसम विभाग (IMD) ने बताया है कि इस वर्ष दक्षिण-पश्चिम मानसून केरल तट पर 28 मई तक पहुंच सकता है, जो सामान्य तारीख से 3 दिन पहले है।</p>
<p>अरब सागर में कम दबाव का क्षेत्र बनने के कारण मानसून के समय से पहले आने की संभावना है। केरल, कर्नाटक और गोवा के तटीय इलाकों के लिए येलो अलर्ट जारी किया गया है।</p>
<p>किसानों के लिए यह खुशखबरी है क्योंकि सामान्य मानसून की भविष्यवाणी की गई है जो खरीफ फसलों के लिए फायदेमंद होगा।</p>`,
    contentI18n: {
      hi: `<p>नई दिल्ली। IMD ने मानसून की जल्दी आने की भविष्यवाणी की।</p>`,
      en: `<p>New Delhi. IMD predicted early monsoon arrival.</p>`,
      bn: `<p>নতুন দিল্লি। IMD আগাম মৌসুম আগমনের পূর্বাভাস দিল।</p>`,
    },
    author: "विकास त्रिपाठी",
    date: today,
    image: "https://placehold.co/600x400/0891b2/ffffff?text=Monsoon+2025",
    isBreaking: false,
    published: true,
    tags: ["मानसून", "केरल", "IMD", "मौसम", "बारिश"],
    views: 1680,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(uri, { dbName: "news_db" });
  console.log("✅  Connected to MongoDB (news_db)\n");

  let inserted = 0;
  let skipped = 0;

  for (const article of hindiNews) {
    try {
      await News.findOneAndUpdate(
        { slug: article.slug },
        { $set: article },
        { upsert: true, new: true }
      );
      console.log(`  ✔  ${article.category.padEnd(12)} → ${article.title.slice(0, 55)}…`);
      inserted++;
    } catch (err) {
      if (err.code === 11000) {
        console.warn(`  ⚠  Skipped (duplicate slug): ${article.slug}`);
        skipped++;
      } else {
        throw err;
      }
    }
  }

  console.log(`\n📰  Done — ${inserted} upserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
