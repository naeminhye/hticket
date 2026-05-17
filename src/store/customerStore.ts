"use client";
import { create } from "zustand";
import type { Event, Area, Seat, TicketItem } from "@/lib/data";

export type Screen =
  | "home"
  | "event"
  | "areas"
  | "seats"
  | "quantity"
  | "checkout"
  | "payment"
  | "ticket";

export type NavParams = {
  eventId?: string;
  areaId?: string;
  items?: TicketItem[];
};

type Buyer = {
  name: string;
  phone: string;
  email: string;
  id?: string;
  vat?: boolean;
};

type CustomerState = {
  screen: Screen;
  params: NavParams;
  currentEvent: Event | null;
  currentArea: Area | null;
  pickedSeats: Seat[];
  standingQty: number;
  buyer: Buyer;
  holdId: string | null;
  holdExpiresAt: number | null;
  paymentMethod: "momo" | "vnpay" | "visa" | "zalo";
  processing: boolean;
  tickets: TicketItem[];
  // actions
  go: (screen: Screen, params?: NavParams) => void;
  setCurrentEvent: (event: Event | null) => void;
  setCurrentArea: (area: Area | null) => void;
  setPickedSeats: (seats: Seat[]) => void;
  setStandingQty: (qty: number) => void;
  setBuyer: (updater: (b: Buyer) => Buyer) => void;
  setPaymentMethod: (method: "momo" | "vnpay" | "visa" | "zalo") => void;
  setProcessing: (v: boolean) => void;
  setTickets: (items: TicketItem[]) => void;
};

export const useCustomerStore = create<CustomerState>((set) => ({
  screen: "home",
  params: {},
  currentEvent: null,
  currentArea: null,
  pickedSeats: [],
  standingQty: 2,
  buyer: { name: "", phone: "", email: "" },
  holdId: null,
  holdExpiresAt: null,
  paymentMethod: "momo",
  processing: false,
  tickets: [],
  go: (screen, params = {}) => set({ screen, params }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setCurrentArea: (area) => set({ currentArea: area }),
  setPickedSeats: (seats) => set({ pickedSeats: seats }),
  setStandingQty: (qty) => set({ standingQty: qty }),
  setBuyer: (updater) => set((s) => ({ buyer: updater(s.buyer) })),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setProcessing: (v) => set({ processing: v }),
  setTickets: (items) => set({ tickets: items }),
}));
