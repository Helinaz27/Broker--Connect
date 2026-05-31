export type LegalSection = { title: string; body: string };

export const termsContent: Record<"en" | "am", { title: string; updated: string; sections: LegalSection[]; contactEmail: string }> = {
  en: {
    title: "Terms of Service",
    updated: "Last updated: March 2026. Please read these terms before using the Digital Broker marketplace.",
    contactEmail: "legal@digitalbroker.example.com",
    sections: [
      {
        title: "1. Acceptance and use of the platform",
        body: "By creating an account or using Digital Broker, you agree to these Terms of Service. Digital Broker is a marketplace that connects people who want to list or find properties (rent/sale), vehicles (rent/hire), and professional services in Ethiopia. You must be at least 18 years old and able to enter into a binding contract to use the service.",
      },
      {
        title: "2. Accounts and listings",
        body: "You are responsible for keeping your account credentials secure and for all activity under your account. When you post a listing (property, vehicle, or service), you represent that you have the right to offer it and that your description, price, and location are accurate. Listings must comply with applicable laws in Ethiopia. We may remove or suspend listings that violate our policies or the law.",
      },
      {
        title: "3. Transactions and conduct",
        body: "Digital Broker facilitates discovery and contact between users; we are not a party to any rental, sale, or service agreement between you and another user. You are responsible for your own due diligence, negotiations, and any contracts you enter into. You agree not to post false or misleading content, harass other users, or use the platform for illegal or fraudulent purposes. Users must deal fairly and in good faith.",
      },
      {
        title: "4. Fees and payments",
        body: "Our current fee structure for listing or premium features (if any) is described on the platform. We may change fees with reasonable notice. Any payment between users (e.g. rent, vehicle hire, service fees) is solely between those users; Digital Broker is not responsible for payment disputes unless we explicitly facilitate the payment.",
      },
      {
        title: "5. Intellectual property and content",
        body: "You retain ownership of content you post, but you grant Digital Broker a license to display, distribute, and promote your listings on the platform. You must not post content that infringes others' rights. We may use aggregated, anonymized data to improve our services.",
      },
      {
        title: "6. Disclaimers and limitation of liability",
        body: "Digital Broker is provided \"as is.\" We do not guarantee the accuracy of listings or the conduct of users. To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the platform or dealings with other users.",
      },
      {
        title: "7. Termination and changes",
        body: "We may suspend or terminate your account if you breach these terms or for other legitimate reasons. We may update these terms from time to time; continued use after changes constitutes acceptance. Material changes will be communicated via the platform or email where appropriate.",
      },
      {
        title: "8. Contact",
        body: "For questions about these Terms of Service, contact us at the email below.",
      },
    ],
  },
  am: {
    title: "የአገልግሎት ውሎች",
    updated: "የመጨረሻ ዝመና፡ መርስ 2026። ዲጂታል ብሮከር ገበያን ከመጠቀምዎ በፊት እባክዎ እነዚህን ውሎች ያንብቡ።",
    contactEmail: "legal@digitalbroker.example.com",
    sections: [
      {
        title: "1. መድረኩን መቀበል እና መጠቀም",
        body: "መለያ በመፍጠር ወይም ዲጂታል ብሮከርን በመጠቀም እነዚህን የአገልግሎት ውሎች ይቀበላሉ። ዲጂታል ብሮከር ንብረት፣ ተሽከርካሪዎች እና ሙያዊ አገልግሎቶችን ለማግኘት ወይም ለመዘርዘር የሚያገናኝ ገበያ ነው። ቢያንስ 18 ዓመት መሆን አለብዎት።",
      },
      {
        title: "2. መለያዎች እና ዝርዝሮች",
        body: "የመለያዎ ምስጢር መረጃ እና በመለያዎ ስር ያለ እንቅስቃሴ ሙሉ ኃላፊነትዎ ነው። ዝርዝር ሲለጥፉ ትክክለኛ መሆኑን ይመሰክራሉ። በኢትዮጵያ ህጎች መሠረት መሆን አለበት።",
      },
      {
        title: "3. ግብይቶች እና ባህሪ",
        body: "ዲጂታል ብሮከር ግኝት እና መገናኘትን ያመቻችላል፤ በእርስዎ እና በሌላ ተጠቃሚ መካከል ያለ ስምምነት ወገን አይደለም። ሐሰት ወይም አሳሳች ይዘት አያስቀምጡ።",
      },
      {
        title: "4. ክፍያዎች",
        body: "የክፍያ መዋቅር በመድረኩ ላይ ይገለጻል። በተጠቃሚዎች መካከል ያለ ክፍያ በተጠቃሚዎች ብቻ ነው።",
      },
      {
        title: "5. የባለቤትነት መብት",
        body: "የሚለጥፉት ይዘት ባለቤትነትዎ ይቆያል፣ ነገር ግን በመድረኩ ላይ ለማሳየት ፍቃድ ትሰጡናል።",
      },
      {
        title: "6. ማስተባበያዎች",
        body: "ዲጂታል ብሮከር «እንደሆነ» ይቀርባል። የዝርዝሮች ትክክለኛነትን ወይም የተጠቃሚዎችን ባህሪ አንጠብቅም።",
      },
      {
        title: "7. ማቋረጥ እና ለውጦች",
        body: "ውሎች ካልተከበሩ መለያዎን ልናቆም እንችላለን። ውሎች ሊቀየሩ ይችላሉ፤ መጠቀም መቀበል ማለት ነው።",
      },
      {
        title: "8. አግኙን",
        body: "ስለ እነዚህ ውሎች በታች ያለውን ኢሜይል ይጠቀሙ።",
      },
    ],
  },
};

export const privacyContent: Record<"en" | "am", { title: string; intro: string; sections: LegalSection[]; contactEmail: string }> = {
  en: {
    title: "Privacy Policy",
    intro: "This Privacy Policy describes how Digital Broker collects, uses, and protects your personal information when you use our marketplace in Ethiopia.",
    contactEmail: "privacy@digitalbroker.example.com",
    sections: [
      {
        title: "1. Information we collect",
        body: "We collect information you provide when you register (name, email, phone), post listings, complete KYC verification, or contact support. We also collect usage data such as pages visited and device information to improve our services.",
      },
      {
        title: "2. How we use your information",
        body: "We use your information to operate the platform, verify identity, process coin purchases, facilitate messaging, send notifications, and comply with legal obligations. We do not sell your personal data to third parties for marketing.",
      },
      {
        title: "3. Sharing of information",
        body: "We may share information with payment providers (e.g. Chapa), cloud hosting services, and when required by law. Listing contact details are shared only when you unlock access or choose to message another user.",
      },
      {
        title: "4. Data security",
        body: "We implement reasonable technical and organizational measures to protect your data. No method of transmission over the internet is 100% secure; we encourage you to use a strong password and keep your credentials confidential.",
      },
      {
        title: "5. Your rights",
        body: "You may access, update, or delete certain information through your profile and settings. You may request account deletion by contacting us. We will respond to lawful requests in accordance with applicable Ethiopian law.",
      },
      {
        title: "6. Contact",
        body: "For privacy-related questions or requests, contact us at the email below.",
      },
    ],
  },
  am: {
    title: "የግላዊነት ፖሊሲ",
    intro: "ይህ የግላዊነት ፖሊሲ ዲጂታል ብሮከር በኢትዮጵያ ገበያ ሲጠቀሙ የግል መረጃዎን እንዴት እንሰበስብ፣ እንጠቀም እና እንጠብቅ እንደሆነ ይገልጻል።",
    contactEmail: "privacy@digitalbroker.example.com",
    sections: [
      {
        title: "1. የምንሰበስበው መረጃ",
        body: "በምዝገባ፣ ዝርዝር ማስቀመጥ፣ KYC ማረጋገጫ ወይም ድጋፍ ሲጠይቁ የሚሰጡትን መረጃ እንሰበስባለን። አገልግሎታችንን ለማሻሻል የአጠቃቀም መረጃም እንሰበስባለን።",
      },
      {
        title: "2. መረጃዎን እንዴት እንጠቀማለን",
        body: "መድረኩን ለማስኬድ፣ ማንነት ለማረጋገጥ፣ ኮይን ግዢ ለማስተናገድ፣ ማሳወቂያ ለመላክ እንጠቀማለን። የግል መረጃዎን ለማስታወቂያ አንሸጥም።",
      },
      {
        title: "3. መረጃ ማጋራት",
        body: "ከክፍያ አቅራቢዎች (ለምሳሌ ቻፓ)፣ ከክላውድ አገልጋዮች እና በህግ ሲጠየቅ ልናጋራ እንችላለን። የእውቂያ ዝርዝር ተደራሹ ብቻ ይጋራል።",
      },
      {
        title: "4. የውሂብ ደህንነት",
        body: "መረጃዎን ለመጠበቅ ምክንያታዊ እርምጃዎች እንወስዳለን። ጠንካራ የይለፍ ቃል እንዲጠቀሙ እንመክራለን።",
      },
      {
        title: "5. መብቶችዎ",
        body: "በመገለጫ እና ቅንብሮች መረጃ ማዘመን ይችላሉ። መለያ ማጥፋት ሊጠይቁ ይችላሉ።",
      },
      {
        title: "6. አግኙን",
        body: "ስለ ግላዊነት ጥያቄዎች ከታች ያለውን ኢሜይል ይጠቀሙ።",
      },
    ],
  },
};
