export type SupportedLanguage = "en" | "hi" | "kn";

export interface Translations {
  brandName: string;
  tagline: string;
  home: string;
  shop: string;
  fruits: string;
  vegetables: string;
  leafy: string;
  deals: string;
  trackOrders: string;
  settings: string;
  cart: string;
  signIn: string;
  signOut: string;
  searchPlaceholder: string;
  deliveryTo: string;
  slot: string;
  morningVerified: string;
  produceOnly: string;
  bestseller: string;
  add: string;
  readyToEat: string;
  kg: string;
  g: string;
  off: string;
  freshPass: string;
  heroTitle: string;
  heroSubtitle: string;
  shopNow: string;
  exploreProduce: string;
  welcomeBenefit: string;
  welcomeTitle: string;
  welcomeDesc: string;
  morningExpressBadge: string;
  morningExpressTitle: string;
  morningExpressDesc: string;
  verifiedFamilyBadge: string;
  verifiedFamilyTitle: string;
  verifiedFamilyDesc: string;
  popularCategories: string;
  popularCategoriesSub: string;
  viewAllCategories: string;
  todaysPicks: string;
  todaysPicksSub: string;
  weeklyBestsellers: string;
  weeklyBestsellersSub: string;
  totalItems: string;
  cashOnDelivery: string;
  produceTools: string;
  fridgeTracker: string;
  freshPlan: string;
  crates: string;
  matchmaker: string;
  languageLabel: string;
  all: string;
  viewDetails: string;
  nextCutoff: string;
  activeDarkstore: string;
  guaranteedSlot: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    brandName: "Fresh Harvest",
    tagline: "Verified Perishable Produce",
    home: "Home",
    shop: "Shop All",
    fruits: "Fresh Fruits",
    vegetables: "Daily Vegetables",
    leafy: "Leafy Greens",
    deals: "Today's Deals",
    trackOrders: "Track Orders",
    settings: "Settings & Profile",
    cart: "Cart",
    signIn: "Sign In",
    signOut: "Sign Out",
    searchPlaceholder: "Search tomatoes, bananas, spinach, mangoes...",
    deliveryTo: "Delivering to",
    slot: "Slot: 06:30 - 09:30 AM",
    morningVerified: "Morning Inward Verified: All Batches Inspected at Indiranagar Darkstore",
    produceOnly: "100% Produce Only",
    bestseller: "BESTSELLER",
    add: "ADD",
    readyToEat: "Ready to Eat",
    kg: "kg",
    g: "g",
    off: "OFF",
    freshPass: "with FreshPass",
    heroTitle: "Fresh Harvest – Freshness Delivered Daily.",
    heroSubtitle: "Shop handpicked fruits and vegetables, sourced with care and delivered fresh to your doorstep.",
    shopNow: "Shop Now",
    exploreProduce: "Explore Fresh Produce",
    welcomeBenefit: "Welcome Benefit",
    welcomeTitle: "New Here? Enjoy Your First Order.",
    welcomeDesc: "Discover fresh produce and exclusive welcome offers on our farm-direct harvests.",
    morningExpressBadge: "Morning Express",
    morningExpressTitle: "Freshness Delivered to Your Door.",
    morningExpressDesc: "Convenient 06:30 AM morning delivery slots timed right before your daily cooking starts.",
    verifiedFamilyBadge: "Verified Batches",
    verifiedFamilyTitle: "Better Choices for Your Family.",
    verifiedFamilyDesc: "Explore carefully selected fruits and vegetables tagged with verified physical ripeness stages.",
    popularCategories: "Popular Categories",
    popularCategoriesSub: "Strict 100% perishable produce exclusivity — zero general groceries",
    viewAllCategories: "View All Categories",
    todaysPicks: "Today's Fresh Picks",
    todaysPicksSub: "Hand-inspected morning batches directly from regional darkstore inventory",
    weeklyBestsellers: "Weekly Bestselling Items",
    weeklyBestsellersSub: "Top ordered fruits and vegetables sorted by customer demand",
    totalItems: "items",
    cashOnDelivery: "Cash on Delivery",
    produceTools: "Produce Tools",
    fridgeTracker: "My Fridge Tracker",
    freshPlan: "7-Day Fresh Plan",
    crates: "Reusable Crates",
    matchmaker: "Freshness Matchmaker",
    languageLabel: "Language",
    all: "All",
    viewDetails: "View Details",
    nextCutoff: "Next Cutoff: 04:30 AM",
    activeDarkstore: "Indiranagar Darkstore Hub",
    guaranteedSlot: "Early Bird Fresh (06:30 - 09:30 AM)",
  },

  hi: {
    brandName: "फ्रेश हार्वेस्ट",
    tagline: "सत्यापित ताजे फल और सब्जियां",
    home: "होम",
    shop: "सभी देखें",
    fruits: "ताजे फल",
    vegetables: "दैनिक सब्जियां",
    leafy: "पत्तेदार सब्जियां",
    deals: "आज के ऑफर्स",
    trackOrders: "ऑर्डर ट्रैक करें",
    settings: "प्रोफ़ाइल और सेटिंग्स",
    cart: "टोकरी",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    searchPlaceholder: "टमाटर, केले, पालक, आम खोजें...",
    deliveryTo: "डिलीवरी स्थान",
    slot: "स्लॉट: सुबह 06:30 - 09:30",
    morningVerified: "सुबह का स्टॉक सत्यापित: सभी फल-सब्जियों का इंदिरा नगर डार्कस्टोर पर निरीक्षण पूर्ण",
    produceOnly: "100% केवल ताजे फल और सब्जियां",
    bestseller: "बेस्टसेलर",
    add: "जोड़ें",
    readyToEat: "खाने के लिए तैयार",
    kg: "कि.ग्रा.",
    g: "ग्राम",
    off: "छूट",
    freshPass: "फ्रेशपास के साथ",
    heroTitle: "फ्रेश हार्वेस्ट – हर दिन ताज़गी आपके घर।",
    heroSubtitle: "खेतों से ताजे चुने गए फल और सब्जियां, सीधे आपके दरवाजे पर सुबह-सुबह डिलीवर।",
    shopNow: "अभी खरीदें",
    exploreProduce: "ताजे उत्पाद देखें",
    welcomeBenefit: "स्वागत ऑफर",
    welcomeTitle: "पहली बार आए हैं? अपने पहले ऑर्डर पर विशेष छूट पाएं।",
    welcomeDesc: "खेतों से सीधे आने वाले ताजे फलों और सब्जियों पर विशेष स्वागत ऑफ़र का लाभ उठाएं।",
    morningExpressBadge: "मॉर्निंग एक्सप्रेस",
    morningExpressTitle: "सुबह 06:30 बजे ताज़ा डिलीवरी।",
    morningExpressDesc: "आपके खाना पकाने से ठीक पहले घर तक ताज़ी फल-सब्जियां पहुंचाने की सुविधा।",
    verifiedFamilyBadge: "सत्यापित गुणवत्ता",
    verifiedFamilyTitle: "आपके परिवार के लिए बेहतरीन विकल्प।",
    verifiedFamilyDesc: "भौतिक गुणवत्ता और ताज़गी के प्रमाणित स्तर के साथ स्वास्थ्यवर्धक फल-सब्जियां।",
    popularCategories: "लोकप्रिय श्रेणियां",
    popularCategoriesSub: "100% ताजे फल और सब्जियां — कोई सूखा या पुराना राशन नहीं",
    viewAllCategories: "सभी श्रेणियां देखें",
    todaysPicks: "आज के ताजे फल और सब्जियां",
    todaysPicksSub: "सुबह के ताजे चुने हुए फल-सब्जी बैच सीधे आपके घर के लिए",
    weeklyBestsellers: "इस सप्ताह के सबसे लोकप्रिय उत्पाद",
    weeklyBestsellersSub: "ग्राहकों द्वारा सबसे ज्यादा ऑर्डर किए गए ताजे उत्पाद",
    totalItems: "वस्तुएं",
    cashOnDelivery: "कैश ऑन डिलीवरी (दरवाजे पर भुगतान)",
    produceTools: "उपयोगी टूल्स",
    fridgeTracker: "फ्रिज फ्रेशनेस ट्रैकर",
    freshPlan: "7-दिवसीय भोजन योजना",
    crates: "पुन: प्रयोज्य क्रेट",
    matchmaker: "फ्रेशनेस मैचमेकर",
    languageLabel: "भाषा",
    all: "सभी",
    viewDetails: "विवरण देखें",
    nextCutoff: "अगला कटऑफ: सुबह 04:30",
    activeDarkstore: "इंदिरा नगर डार्कस्टोर हब",
    guaranteedSlot: "मॉर्निंग फ्रेश (06:30 - 09:30 AM)",
  },

  kn: {
    brandName: "ಫ್ರೆಶ್ ಹಾರ್ವೆಸ್ಟ್",
    tagline: "ಪರಿಶೀಲಿಸಿದ ತಾಜಾ ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿಗಳು",
    home: "ಮುಖಪುಟ",
    shop: "ಎಲ್ಲಾ ತರಕಾರಿಗಳು",
    fruits: "ತಾಜಾ ಹಣ್ಣುಗಳು",
    vegetables: "ದೈನಂದಿನ ತರಕಾರಿಗಳು",
    leafy: "ಸೊಪ್ಪು ಮತ್ತು ಗಿಡಮೂಲಿಕೆಗಳು",
    deals: "ಇಂದಿನ ಆಫರ್‌ಗಳು",
    trackOrders: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    settings: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್ಸ್",
    cart: "ಕಾರ್ಟ್",
    signIn: "ಸೈನ್ ಇನ್",
    signOut: "ಸೈನ್ ಔಟ್",
    searchPlaceholder: "ಟೊಮ್ಯಾಟೊ, ಬಾಳೆಹಣ್ಣು, ಪಾಲಕ್ ಸೊಪ್ಪು, ಮಾವು ಹುಡುಕಿ...",
    deliveryTo: "ಡೆಲಿವರಿ ಸ್ಥಳ",
    slot: "ಸ್ಲಾಟ್: ಬೆಳಿಗ್ಗೆ 06:30 - 09:30",
    morningVerified: "ಮುಂಜಾನೆಯ ದಾಸ್ತಾನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ಇಂದಿರಾನಗರ ಹಬ್‌ನಲ್ಲಿ ಗುಣಮಟ್ಟ ತಪಾಸಣೆ ಪೂರ್ಣ",
    produceOnly: "100% ಕೇವಲ ತಾಜಾ ತೋಟದ ಉತ್ಪನ್ನಗಳು",
    bestseller: "ಬೆಸ್ಟ್‌ಸೆಲ್ಲರ್",
    add: "ಸೇರಿಸಿ",
    readyToEat: "ತಿನ್ನಲು ಸಿದ್ಧ",
    kg: "ಕೆ.ಜಿ",
    g: "ಗ್ರಾಂ",
    off: "ರಿಯಾಯಿತಿ",
    freshPass: "ಫ್ರೆಶ್‌ಪಾಸ್‌ನೊಂದಿಗೆ",
    heroTitle: "ಫ್ರೆಶ್ ಹಾರ್ವೆಸ್ಟ್ – ಪ್ರತಿದಿನ ತಾಜಾತನ ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ.",
    heroSubtitle: "ಸ್ಥಳೀಯ ತೋಟಗಳಿಂದ ಮುಂಜಾನೆ ಆಯ್ದ ತಾಜಾ ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿಗಳು, ಅಡುಗೆ ಮಾಡುವ ಮುನ್ನ ನಿಮ್ಮ ಮನೆಗೆ.",
    shopNow: "ಈಗಲೇ ಖರೀದಿಸಿ",
    exploreProduce: "ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    welcomeBenefit: "ಸ್ವಾಗತ ಕೊಡುಗೆ",
    welcomeTitle: "ಹೊಸಬರೇ? ನಿಮ್ಮ ಮೊದಲ ಆರ್ಡರ್‌ನಲ್ಲಿ ವಿಶೇಷ ಆಫರ್ ಪಡೆಯಿರಿ.",
    welcomeDesc: "ನೇರವಾಗಿ ರೈತರ ತೋಟದಿಂದ ಬರುವ ನೈಸರ್ಗಿಕ ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿಗಳ ಮೇಲೆ ವಿಶೇಷ ರಿಯಾಯಿತಿ.",
    morningExpressBadge: "ಮಾರ್ನಿಂಗ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್",
    morningExpressTitle: "ಬೆಳಿಗ್ಗೆ 06:30 ಕ್ಕೆ ಮನೆ ಬಾಗಿಲಿಗೆ ತಾಜಾ ಡೆಲಿವರಿ.",
    morningExpressDesc: "ದೈನಂದಿನ ಅಡುಗೆ ಪ್ರಾರಂಭವಾಗುವ ಮೊದಲೇ ನೇರವಾಗಿ ನಿಮ್ಮ ಮನೆಗೆ ತಲುಪಿಸುವ ವ್ಯವಸ್ಥೆ.",
    verifiedFamilyBadge: "ಪರಿಶೀಲಿಸಿದ ಗುಣಮಟ್ಟ",
    verifiedFamilyTitle: "ನಿಮ್ಮ ಕುಟುಂಬದ ಆರೋಗ್ಯಕ್ಕೆ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆ.",
    verifiedFamilyDesc: "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಶೀತಲ ಸಂಗ್ರಹವಿಲ್ಲದೆ ನೈಸರ್ಗಿಕವಾಗಿ ಮಾಗಿದ ಆರೋಗ್ಯಕರ ತರಕಾರಿಗಳು.",
    popularCategories: "ಜನಪ್ರಿಯ ವಿಭಾಗಗಳು",
    popularCategoriesSub: "100% ಕೇವಲ ತಾಜಾ ತೋಟದ ಉತ್ಪನ್ನಗಳು — ಯಾವುದೇ ಕಿರಾಣಿ ಅಥವಾ ಧಾನ್ಯಗಳಿಲ್ಲ",
    viewAllCategories: "ಎಲ್ಲಾ ವಿಭಾಗಗಳನ್ನು ನೋಡಿ",
    todaysPicks: "ಇಂದಿನ ತಾಜಾ ಆಯ್ಕೆಗಳು",
    todaysPicksSub: "ಮುಂಜಾನೆ ಬಂದ ತಾಜಾ ಬ್ಯಾಚ್‌ಗಳಿಂದ ಪರಿಶೀಲಿಸಿದ ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿಗಳು",
    weeklyBestsellers: "ಈ ವಾರದ ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಉತ್ಪನ್ನಗಳು",
    weeklyBestsellersSub: "ಗ್ರಾಹಕರು ಅತಿ ಹೆಚ್ಚು ಮೆಚ್ಚಿ ಖರೀದಿಸಿದ ಜನಪ್ರಿಯ ಉತ್ಪನ್ನಗಳು",
    totalItems: "ವಸ್ತುಗಳು",
    cashOnDelivery: "ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ (ಮನೆ ಬಾಗಿಲಲ್ಲೇ ಪಾವತಿಸಿ)",
    produceTools: "ಉಪಯುಕ್ತ ಪರಿಕರಗಳು",
    fridgeTracker: "ಫ್ರಿಡ್ಜ್ ತಾಜಾತನ ಟ್ರ್ಯಾಕರ್",
    freshPlan: "7-ದಿನಗಳ ಊಟದ ಯೋಜನೆ",
    crates: "ಮರುಬಳಕೆಯ ಕ್ರೇಟ್‌ಗಳು",
    matchmaker: "ಫ್ರೆಶ್‌ನೆಸ್ ಮ್ಯಾಚ್‌ಮೇಕರ್",
    languageLabel: "ಭಾಷೆ",
    all: "ಎಲ್ಲಾ",
    viewDetails: "ವಿವರ ನೋಡಿ",
    nextCutoff: "ಮುಂದಿನ ಕಟ್‌ಆಫ್: ಬೆಳಿಗ್ಗೆ 04:30",
    activeDarkstore: "ಇಂದಿರಾನಗರ ತಾಜಾ ಹಬ್",
    guaranteedSlot: "ಮುಂಜಾನೆ ಸ್ಲಾಟ್ (06:30 - 09:30 AM)",
  },
};

