"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";

export const NetworkStatusIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [reconnectedMessage, setReconnectedMessage] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      setReconnectedMessage(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setReconnectedMessage(true);
      const timer = setTimeout(() => {
        setReconnectedMessage(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    // Check initial status
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (reconnectedMessage) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center transition-all flex items-center justify-center gap-2 shadow-md sticky top-0 z-50">
        <CheckCircle2 className="w-4 h-4 text-white" />
        <span>Internet connection restored! Live darkstore stock synchronized.</span>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 text-center transition-all flex items-center justify-center gap-2 shadow-md sticky top-0 z-50">
        <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>
          You are currently offline. Browsing cached produce catalogue — live batch reservations will sync when reconnected.
        </span>
      </div>
    );
  }

  return null;
};

