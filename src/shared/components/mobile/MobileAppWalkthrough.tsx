"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  Home,
  Briefcase,
  Building,
  Lock,
  Phone,
  User,
  X,
  ChevronRight,
  RefreshCw,
  Heart,
  Package,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStep?: number;
}

export function MobileAppWalkthrough({ isOpen, onClose, defaultStep = 1 }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(defaultStep);

  // Step 1: Splash animation timer
  const [splashProgress, setSplashProgress] = useState(0);

  // Step 2: Onboarding slide
  const [onboardSlide, setOnboardSlide] = useState(0);
  const onboardFeatures = [
    {
      emoji: "🚜",
      title: "Harvested at Dawn",
      desc: "Produce picked from local farms before 04:00 AM and delivered crisp to your door by 09:30 AM.",
    },
    {
      emoji: "❄️",
      title: "Zero Cold-Storage Shock",
      desc: "Traditional supermarkets keep produce in cold vaults for weeks. We deliver within 12 hours of harvest.",
    },
    {
      emoji: "📦",
      title: "Zero-Plastic Circular Crates",
      desc: "Delivered in sanitized, reusable food-grade crates. Return on next delivery for ₹50 instant deposit refund.",
    },
  ];

  // Step 3: Location
  const [pincode, setPincode] = useState("560038");
  const [locationName, setLocationName] = useState("Indiranagar, Bengaluru");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Step 4: Serviceability
  const [isServiceable, setIsServiceable] = useState(true);

  // Step 5: Login / Signup
  const [mobileNumber, setMobileNumber] = useState("9876543220");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["1", "2", "3", "4"]);
  const [otpTimer, setOtpTimer] = useState(30);

  // Step 6: Profile Setup
  const [profileName, setProfileName] = useState("Ananya Sharma");
  const [dietPreference, setDietPreference] = useState("Vegetarian");
  const [familySize, setFamilySize] = useState("Family of 3-4");

  // Step 7: Address Setup
  const [flatNo, setFlatNo] = useState("Flat 402, Green Glen Apartments");
  const [street, setStreet] = useState("12th Main Road, HAL 2nd Stage");
  const [landmark, setLandmark] = useState("Near Indiranagar Metro");
  const [addressTag, setAddressTag] = useState<"Home" | "Work" | "Other">("Home");

  useEffect(() => {
    if (!isOpen) return;

    if (step === 1) {
      setSplashProgress(0);
      const interval = setInterval(() => {
        setSplashProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(2), 400);
            return 100;
          }
          return prev + 25;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [step, isOpen]);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setTimeout(() => {
      setPincode("560038");
      setLocationName("Indiranagar 100ft Road, Bengaluru");
      setDetectingLocation(false);
      setStep(4);
    }, 1200);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.startsWith("560")) {
      setIsServiceable(true);
      setLocationName(`Bengaluru - ${pincode}`);
    } else {
      setIsServiceable(false);
    }
    setStep(4);
  };

  const handleSendOtp = () => {
    if (mobileNumber.length >= 10) {
      setOtpSent(true);
      setOtp(["1", "2", "3", "4"]);
    }
  };

  const handleVerifyOtp = () => {
    setStep(6);
  };

  const handleFinishAddress = async () => {
    // Optionally save address to backend
    try {
      await fetch("/api/v1/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: profileName,
          phone: "+91 " + mobileNumber,
          streetLine1: flatNo,
          streetLine2: street + (landmark ? ` (Landmark: ${landmark})` : ""),
          locality: locationName.split(",")[0] || "Indiranagar",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: pincode,
          label: addressTag,
          isDefault: true,
        }),
      });
    } catch (e) {
      // Continue smoothly even if offline demo
    }
    setStep(8);
  };

  const handleStartShopping = () => {
    onClose();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Mobile Device Mockup Frame */}
      <div className="relative w-full max-w-[400px] h-[780px] max-h-[92vh] bg-stone-900 rounded-[48px] p-3 shadow-2xl border-4 border-stone-800 flex flex-col overflow-hidden">
        {/* Device Notch & Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-4 bg-black rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-stone-700 rounded-full mb-1"></div>
        </div>

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-40 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          title="Exit Mobile Simulation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Phone Screen Canvas */}
        <div className="relative w-full h-full bg-[#fbf9f5] rounded-[38px] overflow-hidden flex flex-col">
          {/* Mobile Status Bar */}
          <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold text-stone-800 z-20">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-stone-600">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-stone-700 rounded-sm p-0.5 flex items-center">
                <div className="w-3 h-full bg-stone-800 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Step Progress Dots */}
          <div className="px-6 py-2 flex items-center justify-between gap-1 z-20">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all flex-1 ${
                  s === step
                    ? "bg-[#2d6a4f]"
                    : s < step
                    ? "bg-[#52b788]"
                    : "bg-stone-200"
                }`}
              />
            ))}
          </div>

          {/* SCREEN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between">
            {/* ===============================================================
                SCREEN 1: SPLASH (Brand logo and animation)
                =============================================================== */}
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1b4332] via-[#2d6a4f] to-[#40916c] text-white flex items-center justify-center text-5xl shadow-xl shadow-[#2d6a4f]/20 animate-bounce">
                    🥬
                  </div>
                  <div className="absolute -inset-2 rounded-3xl border-2 border-[#52b788]/30 animate-ping"></div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-[#1c2421]">
                    Fresh Harvest
                  </h1>
                  <p className="text-[11px] uppercase tracking-widest font-extrabold text-[#2d6a4f]">
                    Verified Perishable Produce
                  </p>
                  <p className="text-xs text-stone-500 pt-1">
                    Morning Harvest • Direct to Doorstep
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-48 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2d6a4f] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${splashProgress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">Initialising produce supply link...</span>
              </div>
            )}

            {/* ===============================================================
                SCREEN 2: ONBOARDING (Introduce app benefits)
                =============================================================== */}
            {step === 2 && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="pt-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] bg-[#d8f3dc] px-2.5 py-0.5 rounded-full">
                    Welcome to Pure Freshness
                  </span>
                  <h2 className="text-xl font-black text-[#1c2421] mt-2">
                    Commercial Produce Done Right
                  </h2>
                </div>

                <div className="py-6 text-center space-y-4">
                  <div className="w-28 h-28 mx-auto rounded-3xl bg-[#d8f3dc] flex items-center justify-center text-6xl shadow-inner">
                    {onboardFeatures[onboardSlide].emoji}
                  </div>
                  <h3 className="text-lg font-bold text-[#1c2421]">
                    {onboardFeatures[onboardSlide].title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed px-4">
                    {onboardFeatures[onboardSlide].desc}
                  </p>

                  <div className="flex items-center justify-center gap-1.5 pt-2">
                    {onboardFeatures.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setOnboardSlide(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          onboardSlide === i ? "w-6 bg-[#2d6a4f]" : "bg-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (onboardSlide < onboardFeatures.length - 1) {
                        setOnboardSlide(onboardSlide + 1);
                      } else {
                        setStep(3);
                      }
                    }}
                    className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>{onboardSlide === onboardFeatures.length - 1 ? "Check My Location" : "Next Benefit"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="w-full text-stone-400 hover:text-stone-600 text-[11px] font-semibold py-1"
                  >
                    Skip to Location
                  </button>
                </div>
              </div>
            )}

            {/* ===============================================================
                SCREEN 3: LOCATION (Enter PIN code or detect location)
                =============================================================== */}
            {step === 3 && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center mx-auto text-xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-center text-[#1c2421]">
                    Where should we deliver?
                  </h2>
                  <p className="text-xs text-center text-stone-500">
                    We harvest only what is serviceable for next-morning delivery slots.
                  </p>
                </div>

                <div className="space-y-4 py-4">
                  {/* GPS Auto Detect */}
                  <button
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="w-full bg-white border-2 border-[#2d6a4f] text-[#2d6a4f] hover:bg-[#d8f3dc]/30 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    {detectingLocation ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{detectingLocation ? "Detecting GPS coordinates..." : "Detect Current Location (GPS)"}</span>
                  </button>

                  <div className="flex items-center gap-2 text-stone-300 text-xs">
                    <div className="h-px bg-stone-200 flex-1"></div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Or enter PIN Code</span>
                    <div className="h-px bg-stone-200 flex-1"></div>
                  </div>

                  {/* Manual Pincode Input */}
                  <form onSubmit={handlePincodeSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700">6-Digit Bengaluru PIN Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 560038"
                        className="w-full bg-white border border-stone-300 rounded-xl p-3 text-center text-lg font-black tracking-widest text-[#1c2421] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Check Serviceability</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                <div className="text-center text-[10px] text-stone-400">
                  Currently serving Bengaluru urban districts: Indiranagar, Koramangala, Whitefield, HSR & CBD.
                </div>
              </div>
            )}

            {/* ===============================================================
                SCREEN 4: SERVICEABILITY (Check whether delivery is available)
                =============================================================== */}
            {step === 4 && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="pt-2 text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#2d6a4f] flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-[#2d6a4f]" />
                  </div>
                  <h2 className="text-xl font-black text-[#1c2421]">
                    {isServiceable ? "Service Available! 🎉" : "Coming Soon to Your Area"}
                  </h2>
                  <p className="text-xs text-stone-600">
                    {isServiceable
                      ? `Great news! ${locationName} is within our active darkstore radius.`
                      : "We are currently setting up darkstore hubs in your locality."}
                  </p>
                </div>

                {isServiceable && (
                  <div className="space-y-3 py-4">
                    <div className="bg-white p-4 rounded-2xl border border-[#e8e3d9] space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                        <span className="flex items-center gap-1.5 text-[#2d6a4f]">
                          <ShieldCheck className="w-4 h-4" /> Indiranagar Fresh Hub
                        </span>
                        <span className="text-[11px] text-emerald-600 font-extrabold">1.4 km away</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Inward verification active: 6 farm batches inspected today.
                      </p>
                    </div>

                    <div className="bg-[#d8f3dc]/50 p-4 rounded-2xl border border-[#52b788]/40 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1b4332]">
                        <Clock className="w-4 h-4 text-[#2d6a4f]" />
                        <span>Next Slot: Early Bird Fresh (06:30 - 09:30 AM)</span>
                      </div>
                      <p className="text-[11px] text-stone-600 pl-6">
                        Order before 04:30 AM cutoff for guaranteed morning delivery.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => setStep(5)}
                    className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Proceed to Instant Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="w-full text-stone-400 hover:text-stone-600 text-[11px] font-semibold py-1"
                  >
                    Change Delivery Location
                  </button>
                </div>
              </div>
            )}

            {/* ===============================================================
                SCREEN 5: LOGIN / SIGNUP (Mobile number and OTP)
                =============================================================== */}
            {step === 5 && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center mx-auto text-xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-center text-[#1c2421]">
                    {otpSent ? "Verify with 4-Digit OTP" : "Enter Mobile Number"}
                  </h2>
                  <p className="text-xs text-center text-stone-500">
                    {otpSent
                      ? `We sent a one-time passcode to +91 ${mobileNumber}`
                      : "Login or create your customer account with instant OTP"}
                  </p>
                </div>

                {!otpSent ? (
                  <div className="space-y-4 py-6">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700">Mobile Phone Number</label>
                      <div className="flex items-center gap-2">
                        <span className="bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-700">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="98765 43220"
                          className="flex-1 bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 rounded-xl text-xs shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Send 4-Digit OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 py-6">
                    <div className="flex items-center justify-center gap-3">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          type="text"
                          maxLength={1}
                          value={digit}
                          readOnly
                          className="w-12 h-12 bg-white border-2 border-[#2d6a4f] rounded-2xl text-center text-lg font-black text-[#1c2421] shadow-xs"
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <span className="text-[11px] text-[#2d6a4f] font-bold bg-[#d8f3dc] px-2.5 py-1 rounded-full">
                        ✓ Auto-filled demo verification: 1234
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 rounded-xl text-xs shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="text-center text-[10px] text-stone-400">
                  By continuing, you agree to Fresh Harvest Terms of Service and Produce Guarantee.
                </div>
              </div>
            )}

            {/* ===============================================================
                SCREEN 6: PROFILE SETUP (Name and basic details)
                =============================================================== */}
            {step === 6 && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center mx-auto text-xl">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-center text-[#1c2421]">
                    Complete Your Profile
                  </h2>
                  <p className="text-xs text-center text-stone-500">
                    Personalize your morning produce selections.
                  </p>
                </div>

                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">What should we call you? *</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Household Dietary Preference</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Vegetarian", "Vegan", "Organic Only"].map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => setDietPreference(pref)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                            dietPreference === pref
                              ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                              : "bg-white text-stone-600 border-stone-300"
                          }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Household Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["1-2 People", "Family of 3-4", "5+ Members"].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFamilySize(size)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                            familySize === size
                              ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                              : "bg-white text-stone-600 border-stone-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 rounded-2xl text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Continue to Address Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ===============================================================
                SCREEN 7: ADDRESS SETUP (Save home or office address)
                =============================================================== */}
            {step === 7 && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-1 pt-1">
                  <h2 className="text-xl font-black text-[#1c2421]">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-stone-500">
                    Where our produce crates should be dropped off.
                  </p>
                </div>

                <div className="space-y-3 py-2 text-xs">
                  {/* Address Tag Selector */}
                  <div className="flex items-center gap-2">
                    {[
                      { tag: "Home", icon: Home },
                      { tag: "Work", icon: Briefcase },
                      { tag: "Other", icon: Building },
                    ].map(({ tag, icon: Icon }) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAddressTag(tag as any)}
                        className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          addressTag === tag
                            ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                            : "bg-white text-stone-600 border-stone-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">House / Flat / Block No. *</label>
                    <input
                      type="text"
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      placeholder="e.g. Flat 402, Tower B"
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Street & Area *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 12th Main Road, HAL 2nd Stage"
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Metro Station"
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                    <span>City & PIN:</span>
                    <strong>{locationName} ({pincode})</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishAddress}
                  className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 rounded-2xl text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Save Address & Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ===============================================================
                SCREEN 8: DASHBOARD (Start shopping)
                =============================================================== */}
            {step === 8 && (
              <div className="flex-1 flex flex-col justify-between text-center">
                <div className="space-y-3 pt-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2d6a4f] to-[#52b788] text-white flex items-center justify-center mx-auto text-3xl shadow-lg">
                    ✨
                  </div>
                  <h2 className="text-2xl font-black text-[#1c2421]">
                    You&apos;re All Set, {profileName.split(" ")[0]}!
                  </h2>
                  <p className="text-xs text-stone-600 px-2 leading-relaxed">
                    Your {addressTag} address is saved. Fresh produce batches inspected this morning are ready for checkout.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-[#e8e3d9] space-y-3 shadow-xs text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-[11px] font-bold text-stone-400 uppercase">Produce Perks</span>
                    <span className="text-xs font-bold text-[#2d6a4f]">COD Doorstep Only</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      🍎
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1c2421] block">21+ Fresh Orchard Fruits</span>
                      <span className="text-[10px] text-stone-500">Apples, Mangoes, Bananas, Melons</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">
                      🥕
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1c2421] block">26+ Daily Farm Veggies</span>
                      <span className="text-[10px] text-stone-500">Tomatoes, Potatoes, Onions, Gourds</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-sm">
                      🌿
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1c2421] block">13+ Crisp Leafy Greens</span>
                      <span className="text-[10px] text-stone-500">Palak, Methi, Coriander, Lettuces</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleStartShopping}
                    className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Start Shopping Fresh Produce</span>
                  </button>
                  <p className="text-[10px] text-stone-400">
                    Guaranteed 06:30 - 09:30 AM doorstep delivery in reusable crates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

