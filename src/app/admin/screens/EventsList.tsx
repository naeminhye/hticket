"use client";
import { useState } from "react";
import { Tickie } from "@/components/Tickie";
import { ADMIN_EVENTS } from "@/lib/data";
import type { AdminScreen, AdminParams } from "../AdminApp";

interface Props {
  go: (screen: AdminScreen, params?: AdminParams) => void;
}

const FILTERS = [
  { k: "all", l: "Tất cả" },
  { k: "open", l: "Đang mở" },
  { k: "draft", l: "Nháp" },
  { k: "soldout", l: "Sold out" },
  { k: "closed", l: "Đã đóng" },
];

export default function EventsList({ go }: Props) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const filtered = ADMIN_EVENTS.filter(e =>
    (filter === "all" || e.status === filter) &&
    (q === "" || e.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
        <div>
          <h1 className="ad-h1">Sự kiện</h1>
          <div className="ad-h1-sub">{ADMIN_EVENTS.length} sự kiện · {ADMIN_EVENTS.filter(e => e.status === "open").length} đang mở bán</div>
        </div>
        <button className="h-btn primary" onClick={() => go("editor", { eventId: "indie-night" })}>
          <span>＋</span> Tạo sự kiện
        </button>
      </div>

      <div className="ev-bar" style={{ marginTop: 18 }}>
        <input placeholder="Tìm sự kiện…" value={q} onChange={e => setQ(e.target.value)} />
        {FILTERS.map(t => (
          <button key={t.k} className={`chip ${filter === t.k ? "on" : ""}`} onClick={() => setFilter(t.k)}>{t.l}</button>
        ))}
      </div>

      <div className="ev-table">
        <div className="ev-row header">
          <div>Sự kiện</div>
          <div>Lấp đầy</div>
          <div>Đã bán / Tổng</div>
          <div>Trạng thái</div>
          <div></div>
        </div>
        {filtered.map(e => {
          const ratio = e.capacity ? e.sold / e.capacity : 0;
          const statusLabel = { open: "Open", draft: "Draft", soldout: "Sold out", closed: "Closed" }[e.status];
          return (
            <div key={e.id} className="ev-row body">
              <div className="ev-name-cell" data-label="Sự kiện">
                <div className="ev-name-cover" style={{ background: `linear-gradient(135deg, ${e.cover}, ${e.cover2})` }}>
                  <div style={{ position: "absolute", bottom: -2, right: -2 }}><Tickie size={24} color="#fff" /></div>
                </div>
                <div className="ev-name-info">
                  <div className="ev-name-title">{e.title}</div>
                  <div className="ev-name-sub">{e.date} · {e.venue}</div>
                </div>
              </div>
              <div data-label="Lấp đầy">
                <div className="ev-progress"><div style={{ width: `${ratio * 100}%`, background: e.cover }} /></div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{Math.round(ratio * 100)}% · {(e.revenue / 1000000).toFixed(1)}tr₫</div>
              </div>
              <div data-label="Vé" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {e.sold.toLocaleString("vi-VN")} <span style={{ color: "var(--ink-faint)" }}>/ {e.capacity.toLocaleString("vi-VN")}</span>
              </div>
              <div data-label="Trạng thái">
                <span className={`ev-status ${e.status}`}>● {statusLabel}</span>
              </div>
              <button className="h-btn sm ghost" onClick={() => go("editor", { eventId: e.id })}>Mở →</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
