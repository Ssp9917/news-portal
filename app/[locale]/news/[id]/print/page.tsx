import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import News from "@/models/News";
import Logo from "@/assets/Logo-01.png";
import PrintActionButtons from "@/components/PrintActionButtons";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";
import { localeToBcp47 } from "@/lib/date-locale";

interface PrintPageProps {
  params: Promise<{ locale: string; id: string }>;
}

async function getNewsDetail(id: string) {
  try {
    await connectDB();

    let news = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      news = await News.findById(id);
    }

    if (!news) {
      news = await News.findOne({ slug: id });
    }

    if (!news) return null;
    return JSON.parse(JSON.stringify(news));
  } catch {
    return null;
  }
}

export default async function NewsPrintPage({ params }: PrintPageProps) {
  const resolvedParams = await params;
  const { locale: raw, id } = resolvedParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const dict = await getDictionary(locale);
  const news = await getNewsDetail(id);

  if (!news) {
    return notFound();
  }

  const currentDate = new Date().toLocaleDateString(localeToBcp47(locale), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const backHref = withLocale(locale, `/news/${id}`);

  return (
    <div className="min-h-screen bg-gray-100 py-8 font-anek dark:bg-neutral-900">
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-white p-4 shadow-md print:hidden dark:bg-neutral-950">
        <Link
          href={backHref}
          className="rounded bg-gray-200 px-4 py-2 font-bold text-gray-800 transition hover:bg-gray-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        >
          {dict.print.backToNews.toUpperCase()}
        </Link>
        <PrintActionButtons />
      </div>

      <div
        id="newspaper-card"
        className="mx-auto w-[800px] bg-white p-12 shadow-lg print:mx-0 print:w-full print:max-w-none print:p-0 print:shadow-none dark:bg-white"
      >
        <div className="mb-6 border-b-2 border-black pb-4 text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex items-center justify-center gap-2">
              <div className="relative h-12 w-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={Logo.src} alt="Logo" className="h-full w-full object-contain" />
              </div>
              <h1 className="text-4xl font-bold text-[#D32F2F]">{dict.site.brandTitle}</h1>
            </div>
          </div>
          <p className="mb-1 text-sm text-gray-600">{dict.site.brandTagline}</p>
          <div className="mb-2 inline-block rounded-full bg-[#D32F2F] px-4 py-1 text-sm text-white">
            www.dailylatestnews.news
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {dict.print.printedOn} {currentDate} || {dict.print.publishedOn} {news.date}
          </p>
        </div>

        <article>
          <h2 className="mb-6 text-center text-4xl font-bold leading-tight text-gray-900">
            {news.title}
          </h2>

          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={news.image || "https://placehold.co/1200x800/png"}
              alt={news.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none text-justify text-sm leading-relaxed text-gray-800 print:text-sm">
            <div dangerouslySetInnerHTML={{ __html: news.content || "" }} />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-500">
            <div>
              <span className="font-bold text-gray-900">{dict.print.reporter}</span> {news.author}
            </div>
            <div>
              <span className="font-bold text-gray-900">{dict.print.category}</span> {news.category}
            </div>
          </div>
        </article>

        <div className="mt-12 border-t-2 border-black pt-6 text-center text-xs text-gray-500">
          <p>সম্পাদক ও প্রকাশক: মাহবুব আলম | অফিস: তেজকুনি পাড়া, ফার্মগেট</p>
          <p>ইমেইল: info@dailylatestnewsbd.com | ফোন: +8801345160892</p>
        </div>
      </div>
    </div>
  );
}
