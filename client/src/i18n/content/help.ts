export type HelpSection = {
  title: string;
  items: { q: string; a: string }[];
};

export type HelpContent = {
  quickLinks: { href: string; label: string }[];
  sections: HelpSection[];
};

const quickLinksEn = [
  { href: "/house-listings", label: "Browse Houses" },
  { href: "/car-listings", label: "Browse Cars" },
  { href: "/service-listings", label: "Browse Services" },
  { href: "/dashboard", label: "Dashboard & messages" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

const quickLinksAm = [
  { href: "/house-listings", label: "ቤቶችን ያስሱ" },
  { href: "/car-listings", label: "መኪኖችን ያስሱ" },
  { href: "/service-listings", label: "አገልግሎቶችን ያስሱ" },
  { href: "/dashboard", label: "ዳሽቦርድ እና መልዕክቶች" },
  { href: "/terms", label: "የአገልግሎት ውሎች" },
  { href: "/privacy", label: "የግላዊነት ፖሊሲ" },
];

export const helpContent: Record<"en" | "am", HelpContent> = {
  en: {
    quickLinks: quickLinksEn,
    sections: [
      {
        title: "Getting started",
        items: [
          {
            q: "How do I create an account?",
            a: "Click “Login” in the header, then “Create account.” Enter your email, choose a password, and confirm. You can then login and start browsing or posting listings.",
          },
          {
            q: "What can I list on Digital Broker?",
            a: "You can list houses (for rent or sale), cars (for rent or hire), and other services (plumber, electrician, catering). All listings are for the Ethiopian market, with locations such as Addis Ababa and other cities.",
          },
        ],
      },
      {
        title: "Listings",
        items: [
          {
            q: "How do I post a house, car, or service?",
            a: "Login and go to your Dashboard. Use the sidebar to choose Houses, Cars, or Services, then “Create Listing.” Fill in the title, description, price, location, and any category-specific details. Add photos and submit.",
          },
          {
            q: "How do I edit or remove a listing?",
            a: "In the Dashboard, open the relevant section (e.g. “Manage All” under Houses). Use the edit or delete actions next to each listing to update or remove it.",
          },
          {
            q: "What should I include in a good listing?",
            a: "Use a clear title, an accurate price in Birr, and a specific location (e.g. Addis Ababa, Bole). Add a detailed description and several photos. For cars, include make, model, and year; for services, include your experience and what you offer.",
          },
        ],
      },
      {
        title: "Searching and contacting",
        items: [
          {
            q: "How do I search for listings?",
            a: "Use the search bar on the home page or the filters (location, price range, and type: Houses, Cars, or Services). You can also browse by category from the main navigation.",
          },
          {
            q: "How do I contact a seller or service provider?",
            a: "Open a listing and click “View details” or the contact option. You can send a message through the platform. Always confirm details and payment terms directly with the other party.",
          },
          {
            q: "How do I save listings I like?",
            a: "Click the heart icon on any listing card to add it to your Favorites. You can view all saved listings from the “Favorites” link in the header.",
          },
        ],
      },
      {
        title: "Safety and trust",
        items: [
          {
            q: "How does Digital Broker keep the marketplace safe?",
            a: "We require accounts for listing and messaging, and we may remove content or accounts that violate our Terms of Service or the law. We encourage users to report suspicious or inappropriate behavior.",
          },
          {
            q: "Who handles payments?",
            a: "Payments for rentals, vehicle hire, or other services are agreed and made between users. Digital Broker does not process these payments unless we explicitly offer a payment feature. Always agree on payment method and terms before committing.",
          },
          {
            q: "Where can I read the legal terms?",
            a: "Our Terms of Service and Privacy Policy explain your rights and our practices. You can find them in the footer (Terms, Privacy) or from your account and registration flows.",
          },
        ],
      },
    ],
  },
  am: {
    quickLinks: quickLinksAm,
    sections: [
      {
        title: "መጀመሪያ",
        items: [
          {
            q: "መለያ እንዴት እፈጥራለሁ?",
            a: "በሄደር ውስጥ «ግባ» ከዛ «መለያ ፍጠር» ይጫኑ። ኢሜይልዎን ያስገቡ፣ የይለፍ ቃል ይምረጡ እና ያረጋግጡ። ከዚያ ማሰስ ወይም ዝርዝር ማስቀመጥ ይችላሉ።",
          },
          {
            q: "በዲጂታል ብሮከር ምን ማስቀመጥ እችላለሁ?",
            a: "ቤቶች (ኪራይ ወይም ሽያጭ)፣ መኪኖች (ኪራይ) እና ሌሎች አገልግሎቶች (ቧንቧ፣ ኤሌክትሪሽያን፣ ምግብ) ማስቀመጥ ይችላሉ። ሁሉም ዝርዝሮች ለኢትዮጵያ ገበያ ናቸው።",
          },
        ],
      },
      {
        title: "ዝርዝሮች",
        items: [
          {
            q: "ቤት፣ መኪና ወይም አገልግሎት እንዴት አስቀምጣለሁ?",
            a: "ይግቡ እና ወደ ዳሽቦርድ ይሂዱ። ቤቶች፣ መኪኖች ወይም አገልግሎቶችን ይምረጡ፣ ከዛ «ዝርዝር ፍጠር»። ርዕስ፣ መግለጫ፣ ዋጋ፣ ቦታ እና ምስሎች ይሙሉ።",
          },
          {
            q: "ዝርዝር እንዴት አርትዕ ወይም አስወግድ?",
            a: "በዳሽቦርድ ተዛማጅ ክፍል ይክፈቱ (ለምሳሌ ቤቶች ስር «ሁሉንም አስተዳድር»)። አርትዕ ወይም ሰርዝ ይጠቀሙ።",
          },
          {
            q: "ጥሩ ዝርዝር ምን ይጨምር?",
            a: "ግልጽ ርዕስ፣ ትክክለኛ ዋጋ በብር እና የተወሰነ ቦታ (ለምሳሌ አዲስ አበባ ቦሌ)። ዝርዝር መግለጫ እና ብዙ ምስሎች ይጨምሩ።",
          },
        ],
      },
      {
        title: "ማሰስ እና መገናኘት",
        items: [
          {
            q: "ዝርዝሮችን እንዴት እፈልጋለሁ?",
            a: "በመነሻ ገጽ የፍለጋ አሞሌ ወይም ማጣሪያዎች (ቦታ፣ ዋጋ፣ አይነት) ይጠቀሙ። ከሄደር ምድብ ማሰስ ይችላሉ።",
          },
          {
            q: "ሻጭ ወይም አገልጋይ እንዴት እገናኛለሁ?",
            a: "ዝርዝር ይክፈቱ እና «ዝርዝሮችን ይመልከቱ» ወይም የእውቂያ አማራጭ ይጫኑ። በመድረክ መልዕክት ልክ ይላኩ።",
          },
          {
            q: "የሚወዱትን ዝርዝሮች እንዴት አስቀምጣለሁ?",
            a: "በዝርዝር ካርድ ላይ የልብ አዶ ይጫኑ። ከሄደር «ተወዳጆች» ሁሉንም ያያሉ።",
          },
        ],
      },
      {
        title: "ደህንነት እና እምነት",
        items: [
          {
            q: "ዲጂታል ብሮከር ገበያውን እንዴት ደህን ያደርገዋል?",
            a: "ለዝርዝር እና ለመልዕክት መለያ እንፈልጋለን። ውሎቻችንን የሚጣሱ ይዘቶችን ልናስወግድ እንችላለን።",
          },
          {
            q: "ክፍያዎችን ማን ይይዛል?",
            a: "ክፍያዎች በተጠቃሚዎች መካከል ይስማማሉ። ዲጂታል ብሮከር ክፍያ አያስተናገድም ካልተባለ በስተቀር።",
          },
          {
            q: "ህጋዊ ውሎችን የት ማንበብ እችላለሁ?",
            a: "የአገልግሎት ውሎች እና የግላዊነት ፖሊሲ በግርጌ ወይም ከመለያ ፍሰት ይገኛሉ።",
          },
        ],
      },
    ],
  },
};
