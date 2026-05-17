"use client";
import { useState, useEffect } from "react";
import { ADMIN_ORDERS, fmtVNDFull } from "@/lib/data";

const STATUS_CONFIG = {
  paid: { label: "Paid", cls: "mint" },
  held: { label: "Held", cls: "butter" },
  expired: { label: "Expired", cls: "" },
  failed: { label: "Failed", cls: "pink" },
  refunded: { label: "Refunded", cls: "grape" },
} as const;

const FILTER_TABS = [
  { k: "all", l: "Tất cả" },
  { k: "paid", l: "Paid" },
  { k: "held", l: "Held" },
  { k: "failed", l: "Failed" },
  { k: "refunded", l: "Refunded" },
];

type DBOrder = {
  id: string;
  event_id: string;
  event_title: string | null;
  buyer: string;
  email: string;
  area_name: string;
  qty: number;
  total: number;
  status: "paid" | "held" | "expired" | "failed" | "refunded";
  created_at: string;
};

function fmtRelative(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "vừa xong";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`;
  if (diff < 86_400_000) return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} hôm nay`;
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type UnifiedOrder = {
  id: string;
  buyer: string;
  email: string;
  event: string;
  area: string;
  qty: number;
  total: number;
  status: "paid" | "held" | "expired" | "failed" | "refunded";
  time: string;
};

export default function OrdersScreen() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [dbOrders, setDbOrders] = useState<UnifiedOrder[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.ok ? r.json() : [])
      .then((rows: DBOrder[]) => {
        setDbOrders(rows.map(o => ({
          id: o.id,
          buyer: o.buyer,
          email: o.email,
          event: o.event_title ?? o.event_id,
          area: o.area_name,
          qty: o.qty,
          total: o.total,
          status: o.status,
          time: fmtRelative(o.created_at),
        })));
      })
      .catch(() => {}); // silently fall back to demo data only
  }, []);

  // DB orders first (newest), then demo data
  const allOrders: UnifiedOrder[] = [
    ...dbOrders,
    ...ADMIN_ORDERS.map(o => ({
      id: o.id,
      buyer: o.buyer,
      email: o.email,
      event: o.event,
      area: o.area,
      qty: o.qty,
      total: o.total,
      status: o.status,
      time: o.time,
    })),
  ];

  const filtered = allOrders.filter(o =>
    (filter === "all" || o.status === filter) &&
    (q === "" || o.id.includes(q) || o.buyer.toLowerCase().includes(q.toLowerCase()) || o.email.toLowerCase().includes(q.toLowerCase()))
  );

  const totalRevenue = dbOrders.filter(o => o.status === "paid").reduce((s, o) => s + o.total, 0);
  const heldCount = allOrders.filter(o => o.status === "held").length;
  const refundCount = allOrders.filter(o => o.status === "refunded").length;

  const KPIs = [
    { tag: "Đơn hôm nay", val: allOrders.length, sub: "đơn", color: "var(--pink-soft)", emoji: "🧾" },
    { tag: "Doanh thu (DB)", val: totalRevenue > 0 ? `${(totalRevenue / 1_000_000).toFixed(1)}tr₫` : "—", sub: "từ đơn thực tế", color: "var(--mint-soft)", emoji: "💰" },
    { tag: "Đang giữ", val: heldCount, sub: "chờ thanh toán", color: "var(--butter-soft)", emoji: "⏳" },
    { tag: "Hoàn tiền", val: refundCount, sub: "đang xử lý", color: "var(--grape-soft)", emoji: "↩" },
  ];

  return (
    <>
      <h1 className="ad-h1">Đơn hàng</h1>
      <div className="ad-h1-sub">
        {dbOrders.length > 0
          ? `${dbOrders.length} đơn từ database · ${ADMIN_ORDERS.length} đơn demo`
          : "Tất cả đơn của bạn · Manage all orders"}
      </div>

      <div className="kpi-grid">
        {KPIs.map((k, i) => (
          <div key={i} className="kpi">
            <div className="k-tag"><span className="k-ico" style={{ background: k.color }}>{k.emoji}</span>{k.tag}</div>
            <div className="k-val">{k.val}</div>
            <div className="k-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="ev-bar">
        <input placeholder="Tìm theo mã đơn, email, tên…" value={q} onChange={e => setQ(e.target.value)} />
        {FILTER_TABS.map(t => (
          <button key={t.k} className={`chip ${filter === t.k ? "on" : ""}`} onClick={() => setFilter(t.k)}>{t.l}</button>
        ))}
        <button className="h-btn sm ghost">⬇ Export CSV</button>
      </div>

      <div className="order-table">
        <div className="order-row header">
          <div>Mã đơn</div>
          <div>Người mua</div>
          <div>Sự kiện · Khu</div>
          <div>SL</div>
          <div>Tổng</div>
          <div>Trạng thái</div>
        </div>
        {filtered.map(o => {
          const sc = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.paid;
          return (
            <div key={o.id} className="order-row body">
              <div className="order-mono" data-label="Mã">{o.id}</div>
              <div data-label="Người mua">
                <div style={{ fontWeight: 700, fontSize: 13 }}>{o.buyer || "—"}</div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{o.email}</div>
              </div>
              <div data-label="Sự kiện">
                <div style={{ fontSize: 13 }}>{o.event}</div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{o.area} · {o.time}</div>
              </div>
              <div data-label="SL" style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{o.qty}</div>
              <div data-label="Tổng" style={{ fontWeight: 700 }}>{fmtVNDFull(o.total)}</div>
              <div data-label="Trạng thái">
                <span className={`h-pill ${sc.cls}`}>● {sc.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
