"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedLanguage, Translations, translations } from "./translations";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof Translations) => string;
  translateProduceTitle: (title: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations.en[key] || String(key),
  translateProduceTitle: (title) => title,
});

// Common regional produce names in Hindi and Kannada
const produceTranslations: Record<string, { hi: string; kn: string }> = {
  "tomatoes": { hi: "टमाटर (Tomato)", kn: "ಟೊಮ್ಯಾಟೊ (Tomato)" },
  "tomato": { hi: "टमाटर (Tomato)", kn: "ಟೊಮ್ಯಾಟೊ (Tomato)" },
  "banana": { hi: "केला (Banana)", kn: "ಬಾಳೆಹಣ್ಣು (Banana)" },
  "apple": { hi: "सेब (Apple)", kn: "ಸೇಬು (Apple)" },
  "apples": { hi: "सेब (Apples)", kn: "ಸೇಬುಗಳು (Apples)" },
  "mango": { hi: "आम (Mango)", kn: "ಮಾವಿನಹಣ್ಣು (Mango)" },
  "mangoes": { hi: "आम (Mangoes)", kn: "ಮಾವಿನಹಣ್ಣುಗಳು (Mangoes)" },
  "palak": { hi: "पालक (Spinach)", kn: "ಪಾಲಕ್ ಸೊಪ್ಪು (Palak)" },
  "spinach": { hi: "पालक (Spinach)", kn: "ಪಾಲಕ್ ಸೊಪ್ಪು (Palak)" },
  "methi": { hi: "मेथी (Fenugreek)", kn: "ಮೆಂತ್ಯ ಸೊಪ್ಪು (Methi)" },
  "coriander": { hi: "धनिया (Coriander)", kn: "ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು (Dhania)" },
  "mint": { hi: "पुदीना (Mint)", kn: "ಪುದೀನಾ ಸೊಪ್ಪು (Pudina)" },
  "curry leaves": { hi: "कढ़ी पत्ता (Curry Leaves)", kn: "ಕರಿಬೇವು (Karivepaku)" },
  "onion": { hi: "प्याज (Onion)", kn: "ಈರುಳ್ಳಿ (Onion)" },
  "onions": { hi: "प्याज (Onions)", kn: "ಈರುಳ್ಳಿ (Onions)" },
  "potato": { hi: "आलू (Potato)", kn: "ಆಲೂಗಡ್ಡೆ (Potato)" },
  "potatoes": { hi: "आलू (Potatoes)", kn: "ಆಲೂಗಡ್ಡೆ (Potatoes)" },
  "carrot": { hi: "गाजर (Carrot)", kn: "ಕ್ಯಾರೆಟ್ (Carrot)" },
  "carrots": { hi: "गाजर (Carrots)", kn: "ಕ್ಯಾರೆಟ್ (Carrots)" },
  "beans": { hi: "बीन्स (French Beans)", kn: "ಹುರುಳಿಕಾಯಿ (Beans)" },
  "cauliflower": { hi: "फूलगोभी (Cauliflower)", kn: "ಹೂಕೋಸು (Cauliflower)" },
  "cabbage": { hi: "पत्तागोभी (Cabbage)", kn: "ಎಲೆಕೋಸು (Cabbage)" },
  "capsicum": { hi: "शिमला मिर्च (Capsicum)", kn: "ದಪ್ಪಮೆಣಸಿನಕಾಯಿ (Capsicum)" },
  "green chillies": { hi: "हरी मिर्च (Green Chillies)", kn: "ಹಸಿಮೆಣಸಿನಕಾಯಿ (Green Chillies)" },
  "ginger": { hi: "अदरक (Ginger)", kn: "ಶುಂಠಿ (Ginger)" },
  "garlic": { hi: "लहसुन (Garlic)", kn: "ಬೆಳ್ಳುಳ್ಳಿ (Garlic)" },
  "cucumber": { hi: "खीरा (Cucumber)", kn: "ಸೌತೆಕಾಯಿ (Cucumber)" },
  "watermelon": { hi: "तरबूज (Watermelon)", kn: "ಕಲ್ಲಂಗಡಿ (Watermelon)" },
  "papaya": { hi: "पपीता (Papaya)", kn: "ಪಪ್ಪಾಯಿ (Papaya)" },
  "pomegranate": { hi: "अनार (Pomegranate)", kn: "ದಾಳಿಂಬೆ (Pomegranate)" },
  "orange": { hi: "संतरा (Orange)", kn: "ಕಿತ್ತಳೆ (Orange)" },
  "oranges": { hi: "संतरे (Oranges)", kn: "ಕಿತ್ತಳೆ (Oranges)" },
  "grapes": { hi: "अंगूर (Grapes)", kn: "ದ್ರಾಕ್ಷಿ (Grapes)" },
  "guava": { hi: "अमरूद (Guava)", kn: "ಸೀಬೆಹಣ್ಣು (Guava)" },
  "sweet corn": { hi: "स्वीट कॉर्न (Sweet Corn)", kn: "ಸಿಹಿ ಜೋಳ (Sweet Corn)" },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check saved preference in localStorage
    const saved = localStorage.getItem("fresh_harvest_lang") as SupportedLanguage;
    if (saved && (saved === "en" || saved === "hi" || saved === "kn")) {
      setLanguageState(saved);
      document.documentElement.lang = saved === "kn" ? "kn-IN" : saved === "hi" ? "hi-IN" : "en-IN";
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("fresh_harvest_lang", lang);
      document.cookie = `fresh_harvest_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    }
  };

  const t = (key: keyof Translations): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  const translateProduceTitle = (title: string): string => {
    if (language === "en") return title;
    const lower = title.toLowerCase();
    for (const [term, trans] of Object.entries(produceTranslations)) {
      if (lower.includes(term)) {
        return `${title} • ${trans[language]}`;
      }
    }
    return title;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateProduceTitle }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

