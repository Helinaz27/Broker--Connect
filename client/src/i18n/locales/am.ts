import type { TranslationDictionary } from "./en";
import { commonAm } from "../messages/common";
import { authAm } from "../messages/auth";
import { listingsAm } from "../messages/listings";
import { pagesAm } from "../messages/pages";
import { dashboardAm } from "../messages/dashboard";
import { contactAm } from "../messages/contact";
import { chatAm } from "../messages/chat";
import { profileAm } from "../messages/profile";
import { filtersAm } from "../messages/filters";

export const am = {
  language: {
    label: "ቋንቋ",
    en: "English",
    am: "አማርኛ",
  },
  header: {
    home: "መነሻ",
    houses: "ቤቶች",
    cars: "መኪኖች",
    otherServices: "ሌሎች አገልግሎቶች",
    aboutUs: "ስለ እኛ",
    dashboard: "ዳሽቦርድ",
    myProfile: "መገለጫዬ",
    settings: "ቅንብሮች",
    signIn: "ግባ",
    logout: "ውጣ",
    loggingOut: "በመውጣት ላይ...",
    coins: "ኮይኖች",
    user: "ተጠቃሚ",
  },
  footer: {
    tagline:
      "ለከፍተኛ ንብረት፣ ፕሪሚየም ተሽከርካሪዎች እና የተረጋገጡ ሙያዊ አገልግሎቶች የኢትዮጵያ ዋና ዲጂታል ድልድይ። ለዘመናዊ ስኬት የተሰራ።",
    marketplace: "ገበያ",
    platform: "መድረክ",
    support: "ድጋፍ",
    houses: "ቤቶች",
    cars: "መኪኖች",
    otherServices: "ሌሎች አገልግሎቶች",
    dashboard: "ዳሽቦርድ",
    myProfile: "መገለጫዬ",
    favorites: "ተወዳጆች",
    settings: "ቅንብሮች",
    helpCenter: "የእገዛ ማእከል",
    terms: "የአገልግሎት ውሎች",
    privacy: "የግላዊነት ፖሊሲ",
    contactUs: "ያግኙን",
    copyright: "© 2026 ዲጂታል ብሮከር። ሁሉም መብቶች የተጠበቁ ናቸው።",
  },
  home: {
    heroEyebrow: "ዲጂታል ብሮከር",
    heroTitle: "የኢትዮጵያ ገበያ ለ",
    heroTitleHighlight: "ቤቶች፣ መኪኖች እና አገልግሎቶች",
    heroSubtitle:
      "በኢትዮጵያ ውስጥ የታመኑ ሻጮችን እና ብሮከሮችን ይዘርዝሩ፣ ይፈልጉ እና ይገናኙ — ለንብረት፣ ተሽከርካሪዎች እና ሙያዊ አገልግሎቶች አንድ የታመነ መድረክ።",
    heroImageAlt:
      "የዲጂታል ብሮከር ዝርዝሮችን የሚወክል ዘመናዊ ቤት እና የከተማ እይታ",
    heroBrowseListings: "ዝርዝሮችን ይመልከቱ",
    heroLearnMore: "ስለ እኛ",
    category: "ምድብ",
    search: "ፍለጋ",
    city: "ከተማ",
    minPrice: "ዝቅተኛ ዋጋ",
    maxPrice: "ከፍተኛ ዋጋ",
    all: "ሁሉም",
    searchPlaceholder: "ፈልግ…",
    cityPlaceholder: "ለምሳሌ አዲስ አበባ",
    maxPricePlaceholder: "ማንኛውም",
    applyFilters: "ማጣሪያዎችን ይተግብሩ",
    reset: "እንደገና አስጀምር",
    houses: "ቤቶች",
    cars: "መኪኖች",
    otherServices: "ሌሎች አገልግሎቶች",
    viewAll: "ሁሉንም ይመልከቱ",
    propertiesAvailable: "{count} ቤቶች ይገኛሉ",
    propertyAvailable: "{count} ቤት ይገኛል",
    vehiclesAvailable: "{count} መኪኖች ይገኛሉ",
    vehicleAvailable: "{count} መኪና ይገኛል",
    servicesAvailable: "{count} አገልግሎቶች ይገኛሉ",
    serviceAvailable: "{count} አገልግሎት ይገኛል",
    loadingHouses: "ቤቶችን በመጫን ላይ...",
    loadingCars: "መኪኖችን በመጫን ላይ...",
    loadingServices: "አገልግሎቶችን በመጫን ላይ...",
    failedHouses: "ቤቶችን መጫን አልተሳካም።",
    failedCars: "መኪኖችን መጫን አልተሳካም።",
    failedServices: "አገልግሎቶችን መጫን አልተሳካም።",
    noHouses: "ከማጣሪያዎ ጋር የሚዛመዱ ቤቶች የሉም።",
    noCars: "ከማጣሪያዎ ጋር የሚዛመዱ መኪኖች የሉም።",
    noServices: "ከማጣሪያዎ ጋር የሚዛመዱ አገልግሎቶች የሉም።",
    noListingsTitle: "ምንም ዝርዝሮች አልተገኙም",
    noListingsBody: "የሚፈልጉትን ለማግኘት ማጣሪያዎችን ይለውጡ።",
    testimonials: {
      eyebrow: "ግምገማዎች",
      title: "ደንበኞቻችን ምን ይላሉ",
      subtitle:
        "ዲጂታል ብሮከርን በየቀኑ ከሚጠቀሙ ገዢዎች፣ ሻጮች እና ብሮከሮች እውነተኛ ታሪኮች።",
      "1": {
        quote:
          "በአንድ ሳምንት ውስጥ በቦሌ ያለውን አፓርትመንት አገኘሁ። ማጣሪያዎቹ እና ከባለቤቱ ጋር ቀጥተኛ ውይይት ሁሉንም ቀላልና ግልጽ አድርገውልኛል።",
        name: "ሳራ በቀለ",
        role: "የቤት ገዢ፣ አዲስ አበባ",
      },
      "2": {
        quote:
          "መኪናዬን ለመዝገብ ደቂቃዎች ብቻ ወስዷል፣ በዚያው ቀን ለቀውሚያዊ ጥያቄዎች መጀመር ቻልኩ። በኢትዮጵያ ያለው ምርጥ የገበያ ልምድ ነው።",
        name: "ዳንኤል ተስፋዬ",
        role: "የመኪና ሻጭ፣ ሐዋሳ",
      },
      "3": {
        quote:
          "እንደ አገልግሎት ሰጪ፣ የተረጋገጡ መገለጫዎች እና በመተግበሪያ ውስጥ ያለ መልዕክት ከደንበኞች ጋር ከመገናኘታችን በፊት እምነት እንገንባለን።",
        name: "ሐና ግርማ",
        role: "የሙያ አገልግሎት ብሮከር",
      },
    },
  },
  common: commonAm,
  auth: authAm,
  listings: listingsAm,
  pages: pagesAm,
  dashboard: dashboardAm,
  contact: contactAm,
  chat: chatAm,
  profile: profileAm,
  filters: filtersAm,
} satisfies TranslationDictionary;
