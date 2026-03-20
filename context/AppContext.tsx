import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://localhost:8080/api";

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
  alarmSound?: string;
  alarmSoundUri?: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
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
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; status?: number; message?: string; intimation?: string }>;
  loginWithOtp: (email: string, otpCode: string) => Promise<{ success: boolean; message?: string }>;
  requestLoginOtp: (email: string) => Promise<{ success: boolean; status?: number; message?: string; intimation?: string }>;
  requestForgotOtp: (email: string) => Promise<{ success: boolean; status?: number; message?: string; intimation?: string }>;
  resetPassword: (email: string, otpCode: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  sendOtp: (email: string) => Promise<{ success: boolean; status?: number; message?: string; intimation?: string }>;
  register: (name: string, email: string, password: string, otpCode: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.patient);
        setToken(data.token);
        await AsyncStorage.setItem("token", data.token);
        return { success: true };
      }
      return { success: false, status: res.status, message: data.message, intimation: data.intimation };
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const requestLoginOtp = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login-otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) return { success: true, intimation: data.intimation };
      return { success: false, status: res.status, message: data.message, intimation: data.intimation };
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const loginWithOtp = async (email: string, otpCode: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login-otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.patient);
        setToken(data.token);
        await AsyncStorage.setItem("token", data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const requestForgotOtp = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) return { success: true, intimation: data.intimation };
      return { success: false, status: res.status, message: data.message, intimation: data.intimation };
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const resetPassword = async (email: string, otpCode: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode, password }),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) return { success: true, intimation: data.intimation };
      return { success: false, status: res.status, message: data.message, intimation: data.intimation };
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const register = async (name: string, email: string, password: string, otpCode: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otpCode }),
      });
      const data = await res.json();
      if (res.ok) return { success: true, message: data.message };
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("token");
  };

  const value = useMemo(() => ({
    cart, addToCart: (i: CartItem) => setCart(p=>[...p, i]), 
    removeFromCart: (id: string) => setCart(p=>p.filter(i=>i.id!==id)),
    updateQuantity: (id: string, q: number) => setCart(p=>p.map(i=>i.id===id?{...i, quantity:q}:i)),
    clearCart: () => setCart([]),
    reminders, addReminder: (r: Reminder) => setReminders(p=>[r,...p]),
    updateReminderStatus: (id: string, s: any) => setReminders(p=>p.map(r=>r.id===id?{...r, status:s}:r)),
    deleteReminder: (id: string) => setReminders(p=>p.filter(r=>r.id!==id)),
    orders, addOrder: (o: Order) => setOrders(p=>[o,...p]),
    user, token, login, loginWithOtp, requestLoginOtp, requestForgotOtp, resetPassword, sendOtp, register, logout
  }), [cart, reminders, orders, user, token]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
