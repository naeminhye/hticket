"use client";
import { useState } from "react";
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

export default function OrdersScreen() {
  const [filter, setFilter] = useState("all");
  const filtered = ADMIN_ORDERS.filter(o => filter === "all" || o.status === filter);

  const KPIs = [
    { tag: "Hôm nay", val: ADMIN_ORDERS.length, sub: "đơn", color: "var(--pink-soft)", emoji: "🧾" },
    { tag: "Doanh thu", val: "23.5tr₫", sub: "+12%", color: "var(--mint-soft)", emoji: "💰" },
    { tag: "Đang giữ", val: ADMIN_ORDERS.filter(o => o.status === "held").length, sub: "chờ thanh toán", color: "var(--butter-soft)", emoji: "⏳" },
    { tag: "Hoàn tiền", val: ADMIN_ORDERS.filter(o => o.status === "refunded").length, sub: "đang xử lý", color: "var(--grape-soft)", emoji: "↩" },
  ];

  return (
    <>
      <h1 className="ad-h1">Đơn hàng</h1>
      <div className="ad-h1-sub">Tất cả đơn của bạn · Manage all orders</div>

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
        <input placeholder="Tìm theo mã đơn, email, tên…" />
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
          const sc = STATUS_CONFIG[o.status];
          return (
            <div key={o.id} className="order-row body">
              <div className="order-mono" data-label="Mã">{o.id}</div>
              <div data-label="Người mua">
                <div style={{ fontWeight: 700, fontSize: 13 }}>{o.buyer}</div>
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
