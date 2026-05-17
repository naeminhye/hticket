import { create } from "zustand";
import type { Event, Area, AdminEvent } from "@/lib/data";

export type StoredZone = {
  id: string;
  name: string;
  type: "seating" | "standing" | "wheelchair";
  color: string;
  x: number; y: number; w: number; h: number;
  capacity: number;
  price: number;
  rows?: number;
  cols?: number;
  queuePrefix?: string;
};

export type PublishedEvent = {
  id: string;
  status: "open" | "draft" | "soldout" | "closed";
  titleVi: string;
  titleEn: string;
  description: string;
  venue: string;
  startAt: string;
  endAt: string;
  policy: string;
  zones: StoredZone[];
  cover: string;
  cover2: string;
  badge: string;
  sold: number;
  held: number;
  revenue: number;
  createdAt: number;
  publishedAt?: number;
};

type InfoInput = {
  titleVi: string; titleEn: string; description: string;
  venue: string; startAt: string; endAt: string; policy: string;
};

type EventStore = {
  events: PublishedEvent[];
  loading: boolean;
  rehydrate: () => Promise<void>;
  publish: (info: InfoInput, zones: StoredZone[]) => Promise<PublishedEvent>;
  recordPurchase: (eventId: string, items: { price: number }[], buyer: { name: string; email: string; phone: string }, areaName: string) => Promise<void>;
};

// ── localStorage fallback ──────────────────────────────────────────────────
const LS_KEY = "hticket:events";

function lsLoad(): PublishedEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}

function lsSave(events: PublishedEvent[]): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(events)); } catch {}
}

// ── DB row → PublishedEvent ────────────────────────────────────────────────
type DBZone = {
  id: string; event_id: string; name: string; type: string; color: string;
  x: number; y: number; w: number; h: number; capacity: number; price: number;
  rows: number | null; cols: number | null; queue_prefix: string | null;
};

type DBEvent = {
  id: string; title_vi: string; title_en: string; description: string;
  venue: string; start_at: string; end_at: string; policy: string;
  cover: string; cover2: string; badge: string;
  status: "open" | "draft" | "soldout" | "closed";
  sold: number; held: number; revenue: string | number;
  created_at: string; published_at: string | null;
  zones: DBZone[];
};

function fromDB(row: DBEvent): PublishedEvent {
  return {
    id: row.id,
    status: row.status,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    description: row.description,
    venue: row.venue,
    startAt: row.start_at,
    endAt: row.end_at,
    policy: row.policy,
    cover: row.cover,
    cover2: row.cover2,
    badge: row.badge,
    sold: row.sold,
    held: row.held,
    revenue: Number(row.revenue),
    createdAt: new Date(row.created_at).getTime(),
    publishedAt: row.published_at ? new Date(row.published_at).getTime() : undefined,
    zones: (row.zones || []).map(z => ({
      id: z.id,
      name: z.name,
      type: z.type as StoredZone["type"],
      color: z.color,
      x: z.x, y: z.y, w: z.w, h: z.h,
      capacity: z.capacity,
      price: z.price,
      rows: z.rows ?? undefined,
      cols: z.cols ?? undefined,
      queuePrefix: z.queue_prefix ?? undefined,
    })),
  };
}

// ── ID generation ─────────────────────────────────────────────────────────
let _n = 0;
function genId(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "event";
  return `${slug}-${(Date.now() + ++_n).toString(36)}`;
}

// ── Gradient palettes ─────────────────────────────────────────────────────
const PALETTES = [
  { cover: "#FF8FA8", cover2: "#C4B5FB" },
  { cover: "#9EE6CF", cover2: "#B8D9FF" },
  { cover: "#FFD56B", cover2: "#FFAB91" },
  { cover: "#C4B5FB", cover2: "#FF8FA8" },
  { cover: "#FFAB91", cover2: "#9EE6CF" },
];

// ── Converters (public) ───────────────────────────────────────────────────

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function fmtTime(startAt: string, endAt: string): string {
  if (!startAt) return "";
  const t = (s: string) => {
    const d = new Date(s);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  return endAt ? `${t(startAt)} — ${t(endAt)}` : t(startAt);
}

export function toCustomerEvent(pe: PublishedEvent): Event {
  const prices = pe.zones.map(z => z.price).filter(p => p > 0);
  const totalCap = pe.zones.reduce((s, z) => s + z.capacity, 0);
  return {
    id: pe.id,
    title: pe.titleVi || pe.titleEn,
    titleVi: pe.titleVi,
    artist: "",
    date: fmtDate(pe.startAt),
    dateEn: pe.startAt
      ? new Date(pe.startAt).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
      : "",
    time: fmtTime(pe.startAt, pe.endAt),
    venue: pe.venue,
    venueEn: pe.venue,
    city: "Việt Nam",
    cover: pe.cover,
    cover2: pe.cover2,
    badges: [pe.badge],
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    soldRatio: totalCap > 0 ? pe.sold / totalCap : 0,
    description: pe.description,
  };
}

export function toAreas(pe: PublishedEvent): Area[] {
  const totalCap = pe.zones.reduce((s, z) => s + z.capacity, 0);
  return pe.zones.map(z => {
    const soldInZone = totalCap > 0 ? Math.floor((pe.sold / totalCap) * z.capacity) : 0;
    return {
      id: z.id,
      name: z.name,
      nameVi: z.name,
      type: z.type,
      price: z.price,
      capacity: z.capacity,
      sold: soldInZone,
      held: 0,
      color: z.color,
      maxPerOrder: 4,
      queuePrefix: z.queuePrefix,
      rows: z.rows,
      cols: z.cols,
      soldOut: soldInZone >= z.capacity,
      allowsCompanion: z.type === "wheelchair",
    };
  });
}

export function toAdminEvent(pe: PublishedEvent): AdminEvent {
  return {
    id: pe.id,
    title: pe.titleVi,
    date: fmtDate(pe.startAt),
    venue: pe.venue + " · Việt Nam",
    cover: pe.cover,
    cover2: pe.cover2,
    status: pe.status,
    capacity: pe.zones.reduce((s, z) => s + z.capacity, 0),
    sold: pe.sold,
    held: pe.held,
    revenue: pe.revenue,
  };
}

// ── Zustand store ─────────────────────────────────────────────────────────
export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  loading: false,

  rehydrate: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("API error");
      const rows = (await res.json()) as DBEvent[];
      const events = rows.map(fromDB);
      lsSave(events); // keep localStorage in sync
      set({ events, loading: false });
    } catch {
      // Offline / DB unreachable — fall back to localStorage
      set({ events: lsLoad(), loading: false });
    }
  },

  publish: async (info, zones) => {
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const id = genId(info.titleVi);
    const newEvent: PublishedEvent = {
      id,
      status: "open",
      ...info,
      zones,
      ...palette,
      badge: "concert",
      sold: 0,
      held: 0,
      revenue: 0,
      createdAt: Date.now(),
      publishedAt: Date.now(),
    };

    // Optimistic update
    const events = [newEvent, ...get().events];
    set({ events });
    lsSave(events);

    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...info, ...palette, badge: "concert", zones }),
      });
    } catch (err) {
      console.warn("[eventStore] publish: DB write failed, localStorage only", err);
    }

    return newEvent;
  },

  recordPurchase: async (eventId, items, buyer, areaName) => {
    const qty = items.length;
    const total = items.reduce((s, i) => s + i.price, 0);

    // Optimistic update
    const events = get().events.map(e =>
      e.id === eventId ? { ...e, sold: e.sold + qty, revenue: e.revenue + total } : e
    );
    set({ events });
    lsSave(events);

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId, buyer: buyer.name, email: buyer.email, phone: buyer.phone,
          areaName, qty, total, items,
        }),
      });
    } catch (err) {
      console.warn("[eventStore] recordPurchase: DB write failed, localStorage only", err);
    }
  },
}));
