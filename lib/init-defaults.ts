import connectDB from "./db";
import Category from "@/models/Category";
import ThemeConfig from "@/models/ThemeConfig";
import HomepageConfig from "@/models/HomepageConfig";
import GlobalSeo from "@/models/GlobalSeo";
import NavigationConfig from "@/models/NavigationConfig";
import News from "@/models/News";

export async function ensureDefaultData() {
  await connectDB();

  // 1. Ensure Categories
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    const defaultCategories = [
      {
        name: "देश",
        nameI18n: { hi: "देश", bn: "দেশের খবর", en: "National" },
        slug: "national",
        description: "भारत और राज्यों की प्रमुख राष्ट्रीय खबरें",
        color: "from-blue-600 to-indigo-700",
        icon: "Flag",
        order: 1,
        isVisible: true,
        isNav: true,
      },
      {
        name: "राजनीति",
        nameI18n: { hi: "राजनीति", bn: "রাজনীতি", en: "Politics" },
        slug: "politics",
        description: "संसद, चुनाव, राजनीतिक दल और नीतियां",
        color: "from-red-600 to-rose-700",
        icon: "Landmark",
        order: 2,
        isVisible: true,
        isNav: true,
      },
      {
        name: "व्यापार",
        nameI18n: { hi: "व्यापार", bn: "বাণিজ্য", en: "Business" },
        slug: "business",
        description: "शेयर बाजार, अर्थव्यवस्था, उद्योग और बैंकिंग",
        color: "from-emerald-600 to-teal-700",
        icon: "TrendingUp",
        order: 3,
        isVisible: true,
        isNav: true,
      },
      {
        name: "तकनीक",
        nameI18n: { hi: "तकनीक", bn: "প্রযুক্তি", en: "Technology" },
        slug: "technology",
        description: "आर्टिफिशियल इंटेलिजेंस, मोबाइल, गैजेट्स और साइंस",
        color: "from-cyan-600 to-blue-700",
        icon: "Cpu",
        order: 4,
        isVisible: true,
        isNav: true,
      },
      {
        name: "खेल",
        nameI18n: { hi: "खेल", bn: "খেলাধুলা", en: "Sports" },
        slug: "sports",
        description: "क्रिकेट, फुटबॉल, बैडमिंटन और खेल जगत की हलचल",
        color: "from-amber-500 to-orange-600",
        icon: "Trophy",
        order: 5,
        isVisible: true,
        isNav: true,
      },
      {
        name: "विश्व",
        nameI18n: { hi: "विश्व", bn: "বিশ্ব", en: "World" },
        slug: "world",
        description: "अंतरराष्ट्रीय कूटनीति और वैश्विक घटनाक्रम",
        color: "from-purple-600 to-indigo-800",
        icon: "Globe",
        order: 6,
        isVisible: true,
        isNav: true,
      },
      {
        name: "स्वास्थ्य",
        nameI18n: { hi: "स्वास्थ्य", bn: "স্বাস্থ্য", en: "Health" },
        slug: "health",
        description: "चिकित्सा, फिटनेस, आयुर्वेद और स्वास्थ्य शोध",
        color: "from-rose-500 to-pink-600",
        icon: "HeartPulse",
        order: 7,
        isVisible: true,
        isNav: true,
      },
      {
        name: "शिक्षा",
        nameI18n: { hi: "शिक्षा", bn: "শিক্ষা", en: "Education" },
        slug: "education",
        description: "विश्वविद्यालय, प्रतियोगी परीक्षाएं और करियर",
        color: "from-yellow-500 to-amber-600",
        icon: "GraduationCap",
        order: 8,
        isVisible: true,
        isNav: true,
      },
      {
        name: "मनोरंजन",
        nameI18n: { hi: "मनोरंजन", bn: "বিনোদন", en: "Entertainment" },
        slug: "entertainment",
        description: "सिनेमा, ओटीटी, संगीत और बॉलीवुड समाचार",
        color: "from-fuchsia-600 to-pink-600",
        icon: "Film",
        order: 9,
        isVisible: true,
        isNav: true,
      },
      {
        name: "सरकारी योजनाएं",
        nameI18n: { hi: "सरकारी योजनाएं", bn: "সরকারি প্রকল্প", en: "Govt Schemes" },
        slug: "schemes",
        description: "केंद्र और राज्य सरकार की जनकल्याणकारी योजनाएं",
        color: "from-emerald-700 to-green-800",
        icon: "FileCheck2",
        order: 10,
        isVisible: true,
        isNav: true,
      },
      {
        name: "ऑटोमोबाइल",
        nameI18n: { hi: "ऑटोमोबाइल", bn: "অটোমোবাইল", en: "Automobile" },
        slug: "automobile",
        description: "नई कारें, इलेक्ट्रिक व्हीकल, बाइक्स और लॉन्च",
        color: "from-sky-600 to-blue-700",
        icon: "Car",
        order: 11,
        isVisible: true,
        isNav: true,
      },
      {
        name: "मौसम",
        nameI18n: { hi: "मौसम", bn: "আবহাওয়া", en: "Weather" },
        slug: "weather",
        description: "मानसून, चक्रवात और मौसम पूर्वानुमान",
        color: "from-cyan-500 to-teal-600",
        icon: "CloudRain",
        order: 12,
        isVisible: true,
        isNav: true,
      },
    ];
    await Category.insertMany(defaultCategories);
  }

  // 2. Ensure Theme Configuration
  const themeCount = await ThemeConfig.countDocuments();
  if (themeCount === 0) {
    await ThemeConfig.create({
      preset: "electric-midnight",
      mode: "dark",
      primaryColor: "#2563EB",
      secondaryColor: "#7C3AED",
      accentColor: "#06B6D4",
      darkBg: "#030712",
      lightBg: "#F8FAFC",
      cardStyle: "glass",
      borderRadius: "1rem",
      glassBlur: "16px",
      glassOpacity: 0.65,
      headingFont: "serif",
      bodyFont: "sans",
      baseFontSize: "16px",
      containerWidth: "1280px",
      sectionSpacing: "3.5rem",
      enableAnimations: true,
      isPublished: true,
    });
  }

  // 3. Ensure Homepage Configuration
  const homepageCount = await HomepageConfig.countDocuments();
  if (homepageCount === 0) {
    await HomepageConfig.create({
      isPublished: true,
      sections: [
        {
          id: "sec-ticker",
          type: "breaking-ticker",
          title: "ब्रेकिंग न्यूज़",
          layout: "compact",
          articleCount: 10,
          background: "transparent",
          isEnabled: true,
          order: 1,
        },
        {
          id: "sec-hero",
          type: "hero-spotlight",
          title: "प्रमुख समाचार (Top Briefing)",
          subtitle: "आज की सबसे बड़ी और महत्वपूर्ण राष्ट्रीय व वैश्विक सुर्खियां",
          layout: "split",
          articleCount: 5,
          background: "transparent",
          isEnabled: true,
          order: 2,
        },
        {
          id: "sec-trending",
          type: "trending-rank",
          title: "ट्रेंडिंग न्यूज़",
          subtitle: "पाठकों द्वारा सबसे ज्यादा पढ़े और साझा किए जा रहे समाचार",
          layout: "compact",
          articleCount: 5,
          background: "glass",
          isEnabled: true,
          order: 3,
        },
        {
          id: "sec-politics",
          type: "category-magazine",
          title: "राजनीति व संसद",
          subtitle: "संसद के ताजा घटनाक्रम और देश की सियासी हलचल",
          categorySlug: "politics",
          layout: "magazine",
          articleCount: 4,
          background: "transparent",
          accentColor: "from-red-600 to-rose-700",
          isEnabled: true,
          order: 4,
        },
        {
          id: "sec-tech-biz",
          type: "category-magazine",
          title: "व्यापार एवं प्रौद्योगिकी",
          subtitle: "अर्थव्यवस्था, स्टार्टअप, शेयर बाजार व नवीनतम तकनीक",
          categorySlug: "business",
          layout: "grid",
          articleCount: 4,
          background: "glass",
          accentColor: "from-blue-600 to-cyan-600",
          isEnabled: true,
          order: 5,
        },
        {
          id: "sec-videos",
          type: "video-hub",
          title: "वीडियो न्यूज़ व विशेष रिपोर्ट",
          subtitle: "घटनास्थल से लाइव कवरेज और विशेषज्ञों के विशेष साक्षात्कार",
          layout: "carousel",
          articleCount: 4,
          background: "solid-dark",
          isEnabled: true,
          order: 6,
        },
        {
          id: "sec-special",
          type: "special-editorial",
          title: "विशेष विश्लेषण व फैक्ट चेक",
          subtitle: "गहन पड़ताल, व्याख्या और तथ्यात्मक विश्लेषण",
          layout: "split",
          articleCount: 3,
          background: "glass",
          isEnabled: true,
          order: 7,
        },
        {
          id: "sec-latest-feed",
          type: "latest-feed",
          title: "ताज़ा अपडेट्स (Latest News Feed)",
          subtitle: "हर मिनट की ताजातरीन जानकारी और घटनाक्रम",
          layout: "masonry",
          articleCount: 8,
          background: "transparent",
          isEnabled: true,
          order: 8,
        },
        {
          id: "sec-newsletter",
          type: "newsletter",
          title: "डेली ब्रीफिंग न्यूज़लेटर",
          subtitle: "हर सुबह महत्वपूर्ण समाचारों का सार सीधे अपने ईमेल में प्राप्त करें",
          layout: "compact",
          articleCount: 0,
          background: "glass",
          isEnabled: true,
          order: 9,
        },
      ],
    });
  }

  // 4. Ensure Global SEO
  const seoCount = await GlobalSeo.countDocuments();
  if (seoCount === 0) {
    await GlobalSeo.create({
      siteTitle: "Daily Latest News | राष्ट्र की आवाज़",
      siteTagline: "राष्ट्र की निष्पक्ष, निर्भीक और सटीक आवाज़",
      metaDescription:
        "भारत और विश्व की ताज़ा ख़बरें, राजनीति, खेल, तकनीक, व्यापार और विश्लेषण। निष्पक्ष पत्रकारिता का विश्वसनीय मंच।",
      defaultOgImage: "/og-default.png",
      faviconUrl: "/favicon.svg",
      canonicalBaseUrl: "http://localhost:3000",
      googleAnalyticsId: "G-LDC5ZD9S53",
      googleTagManagerId: "GTM-WDNCFQS5",
      organizationName: "Daily Latest News Network",
      organizationLogo: "/favicon.svg",
      enableGoogleNewsSitemap: true,
    });
  }

  // 5. Ensure Navigation Config
  const navCount = await NavigationConfig.countDocuments();
  if (navCount === 0) {
    await NavigationConfig.create({
      headerLinks: [
        { id: "nav-home", label: "Home", labelHi: "मुखपृष्ठ", href: "/", order: 1, isEnabled: true },
        { id: "nav-national", label: "National", labelHi: "देश", href: "/category/national", order: 2, isEnabled: true },
        { id: "nav-politics", label: "Politics", labelHi: "राजनीति", href: "/category/politics", order: 3, isEnabled: true },
        { id: "nav-business", label: "Business", labelHi: "व्यापार", href: "/category/business", order: 4, isEnabled: true },
        { id: "nav-tech", label: "Tech", labelHi: "तकनीक", href: "/category/technology", order: 5, isEnabled: true },
        { id: "nav-sports", label: "Sports", labelHi: "खेल", href: "/category/sports", order: 6, isEnabled: true },
        { id: "nav-world", label: "World", labelHi: "विश्व", href: "/category/world", order: 7, isEnabled: true },
        { id: "nav-health", label: "Health", labelHi: "स्वास्थ्य", href: "/category/health", order: 8, isEnabled: true },
        { id: "nav-education", label: "Education", labelHi: "शिक्षा", href: "/category/education", order: 9, isEnabled: true },
        { id: "nav-schemes", label: "Schemes", labelHi: "योजनाएं", href: "/category/schemes", order: 10, isEnabled: true },
      ],
      footerGroups: [
        {
          title: "समाचार श्रेणियां",
          links: [
            { label: "राष्ट्रीय समाचार", href: "/category/national" },
            { label: "राजनीति", href: "/category/politics" },
            { label: "व्यापार व शेयर बाजार", href: "/category/business" },
            { label: "खेल जगत", href: "/category/sports" },
            { label: "प्रौद्योगिकी", href: "/category/technology" },
          ],
        },
        {
          title: "विशेष कवरेज",
          links: [
            { label: "विशेष रिपोर्ट", href: "/category/special" },
            { label: "वीडियो बुलेटिन", href: "/#sec-videos" },
            { label: "फैक्ट चेक", href: "/category/fact-check" },
            { label: "सरकारी योजनाएं", href: "/category/schemes" },
          ],
        },
        {
          title: "संस्थान व नीतियां",
          links: [
            { label: "हमारे बारे में", href: "/about" },
            { label: "संपादकीय नीति", href: "/editorial-policy" },
            { label: "गोपनीयता नीति", href: "/privacy-policy" },
            { label: "संपर्क करें", href: "/contact" },
          ],
        },
      ],
    });
  }

  // Also make sure existing news articles have isFeatured / isTrending set if null
  const sampleNews = await News.find({}).limit(5);
  if (sampleNews.length > 0 && !sampleNews[0].isFeatured) {
    await News.updateOne({ _id: sampleNews[0]._id }, { $set: { isFeatured: true, isBreaking: true } });
    if (sampleNews[1]) {
      await News.updateOne({ _id: sampleNews[1]._id }, { $set: { isTrending: true } });
    }
    if (sampleNews[2]) {
      await News.updateOne({ _id: sampleNews[2]._id }, { $set: { isEditorPick: true } });
    }
  }
}
