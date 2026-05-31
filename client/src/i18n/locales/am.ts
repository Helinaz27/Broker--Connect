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
    copyright: "© 2026 ዲጂታል ብሮከር ኮኔክት። ሁሉም መብቶች የተጠበቁ ናቸው።",
  },
  home: {
    heroTitle: "ፍጹም ምርጫዎን ያግኙ",
    heroSubtitle:
      "ከአካባቢዎ የታመኑ ሻጮች በሺዎች የሚቆጠሩ ቤቶች፣ መኪኖች እና ሌሎች አገልግሎቶችን ያስሱ።",
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
