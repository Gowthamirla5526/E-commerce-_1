"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { SupportedLanguage } from "@/core/i18n/translations";

export const LanguageSelector: React.FC<{ variant?: "header" | "mobile" }> = ({
  variant = "header",
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLanguage; label: string; native: string; flag: string }[] = [
    { code: "en", label: "English", native: "English", flag: "🇬🇧" },
    { code: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              language === l.code
                ? "bg-[#2d6a4f] text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>{l.native}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:border-[#2d6a4f] hover:text-[#2d6a4f] rounded-lg transition-colors cursor-pointer shadow-2xs"
        aria-label="Select Language"
        title="Change Language / भाषा बदलें / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
      >
        <Globe className="w-3.5 h-3.5 text-[#2d6a4f]" />
        <span className="hidden sm:inline">{currentLang.native}</span>
        <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-stone-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Select Language / ಭಾಷೆ
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors hover:bg-[#fbf9f5] cursor-pointer ${
                language === l.code ? "text-[#2d6a4f] font-bold bg-[#d8f3dc]/30" : "text-stone-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.native}</span>
                <span className="text-[10px] text-stone-400 font-normal">({l.label})</span>
              </div>
              {language === l.code && <Check className="w-3.5 h-3.5 text-[#2d6a4f]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

