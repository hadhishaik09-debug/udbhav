import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  pharmacy: string;
  unit: string;
}

export interface Reminder {
  id: string;
  medicineName: string;
  time: string;
  dosageType: "half_tablet" | "full_tablet" | "syrup";
  dosageAmount: string;
  status: "pending" | "taken" | "snoozed" | "skipped";
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  address: string;
  deliveryType: "home" | "takeaway";
  pharmacy: string;
  status: "confirmed" | "preparing" | "picked_up" | "delivered";
  estimatedTime: string;
}

interface AppContextValue {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  reminders: Reminder[];
  addReminder: (r: Reminder) => void;
  updateReminderStatus: (id: string, status: Reminder["status"]) => void;
  deleteReminder: (id: string) => void;
  orders: Order[];
  addOrder: (o: Order) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "r1",
      medicineName: "Metformin 500mg",
      time: "08:00 AM",
      dosageType: "full_tablet",
      dosageAmount: "1",
      status: "pending",
    },
    {
      id: "r2",
      medicineName: "Atorvastatin 10mg",
      time: "09:00 PM",
      dosageType: "half_tablet",
      dosageAmount: "0.5",
      status: "pending",
    },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  const addReminder = (r: Reminder) => {
    setReminders((prev) => [r, ...prev]);
  };

  const updateReminderStatus = (id: string, status: Reminder["status"]) => {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const addOrder = (o: Order) => {
    setOrders((prev) => [o, ...prev]);
  };

  const value = useMemo(() => ({
    cart, addToCart, removeFromCart, updateQuantity, clearCart,
    reminders, addReminder, updateReminderStatus, deleteReminder,
    orders, addOrder,
  }), [cart, reminders, orders]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
