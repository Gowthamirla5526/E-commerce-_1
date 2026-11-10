"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  saveCartToIndexedDB,
  loadCartFromIndexedDB,
  clearCartFromIndexedDB,
} from "@/core/storage/indexeddb-cart";

export interface CartItem {
  skuId: string;
  productId: string;
  title: string;
  slug: string;
  imageUrl: string;
  sellingPricePaise: number;
  mrpPaise: number;
  packageSizeGrams: number;
  unitType: string;
  quantity: number;
  batchReadiness?: string;
  consumptionDate?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (skuId: string, quantity: number) => void;
  removeItem: (skuId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalPaise: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "fresh_harvest_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from IndexedDB (with LocalStorage fallback) on mount
  useEffect(() => {
    async function initializeCart() {
      try {
        // Attempt IndexedDB first
        const idbItems = await loadCartFromIndexedDB();
        if (idbItems && idbItems.length > 0) {
          setItems(idbItems);
        } else {
          // Fallback to LocalStorage
          const stored = localStorage.getItem(CART_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setItems(parsed);
            // Sync forward into IndexedDB
            saveCartToIndexedDB(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to load cart from storage:", e);
      } finally {
        setIsInitialized(true);
      }
    }

    initializeCart();
  }, []);

  // Dual-Persist to LocalStorage and IndexedDB on change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        saveCartToIndexedDB(items);
      } catch (e) {
        console.warn("Failed to persist cart:", e);
      }
    }
  }, [items, isInitialized]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.skuId === item.skuId);
      if (existing) {
        return prev.map((i) =>
          i.skuId === item.skuId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (skuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(skuId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.skuId === skuId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (skuId: string) => {
    setItems((prev) => prev.filter((i) => i.skuId !== skuId));
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      clearCartFromIndexedDB();
    } catch (e) {
      console.warn("Failed to clear local cart stores:", e);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalPaise = items.reduce(
    (sum, item) => sum + item.sellingPricePaise * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotalPaise,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

