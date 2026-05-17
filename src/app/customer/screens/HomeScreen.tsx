"use client";
import { useState, useMemo } from "react";
import { Tickie } from "@/components/Tickie";
import { type Event, fmtVNDFull } from "@/lib/data";
import type { Screen, NavParams } from "@/store/customerStore";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  events: Event[];
}

export default function HomeScreen({ go, events }: Props) {
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    if (tab === "all") return events;
    return events.filter(e => e.badges.includes(tab));
  }, [tab, events]);

  const DOTS_POS = [[13.7, 23], [27.4, 46], [41.1, 69], [54.8, 92], [68.5, 15], [82.2, 38], [95.9, 61], [9.6, 84]];

  return (
    <div className="screen home-screen">
      <header className="home-header">
        <div className="hh-row">
          <div>
            <div className="hh-hello">Xin chào, Mây 👋</div>
            <div className="hh-sub">Hôm nay đi sự kiện gì nhỉ?</div>
          </div>
          <div className="avatar">
            <Tickie size={36} mood="wink" />
          </div>
        </div>
        <div className="searchbar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <input placeholder="Tìm concert, workshop, festival…" />
          <span className="kbd">⌘K</span>
        </div>
      </header>

      <div className="tab-strip">
        {[
          { k: "all", label: "Tất cả", emoji: "✨" },
          { k: "concert", label: "Concert", emoji: "🎤" },
          { k: "festival", label: "Festival", emoji: "🎉" },
          { k: "workshop", label: "Workshop", emoji: "🧋" },
        ].map(t => (
          <button key={t.k} className={`chip ${tab === t.k ? "on" : ""}`} onClick={() => setTab(t.k)}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      <section className="featured">
        <div className="section-h">
          <h3>Đang được yêu thích <span className="en">· Trending</span></h3>
          <button className="link-btn">Xem tất cả →</button>
        </div>

        <div className="event-grid">
          {filtered.map((e, i) => {
            const day = e.date.match(/(\d{2})\.\d{2}\.\d{4}/)?.[1] || "";
            const month = e.date.match(/\d{2}\.(\d{2})\.\d{4}/)?.[1] || "";
            return (
              <button key={e.id} className="event-card" onClick={() => go("event", { eventId: e.id })}>
                <div className="ec-cover" style={{ background: `linear-gradient(135deg, ${e.cover}, ${e.cover2})` }}>
                  <div className="ec-dots">
                    {DOTS_POS.map(([left, top], j) => (
                      <span key={j} style={{ left: `${left}%`, top: `${top}%` }} />
                    ))}
                  </div>
                  <div className="ec-date-stamp">
                    <div className="d-month">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(month) - 1] || month}</div>
                    <div className="d-day">{day}</div>
                  </div>
                  {e.soldRatio > 0.8 && <span className="hot-pill">🔥 Hot</span>}
                  {i === 0 && (
                    <div style={{ position: "absolute", right: 12, bottom: 12, transform: "rotate(8deg)" }}>
                      <Tickie size={56} mood="party" color="#fff" />
                    </div>
                  )}
                </div>
                <div className="ec-body">
                  <div className="ec-title">{e.title}</div>
                  <div className="ec-sub">{e.artist}</div>
                  <div className="ec-meta">
                    <span>📅 {e.dateEn}</span>
                    <span>📍 {e.city}</span>
                  </div>
                  <div className="ec-foot">
                    <span className="price-tag">
                      <span className="from">từ</span>
                      <span className="amount">{fmtVNDFull(e.minPrice)}</span>
                    </span>
                    <div className="sold-bar">
                      <div className="sold-track">
                        <div className="sold-fill" style={{ width: `${Math.round(e.soldRatio * 100)}%` }} />
                      </div>
                      <span className="sold-label">{Math.round(e.soldRatio * 100)}% đã bán</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-quick">
        <div className="qcard pink">
          <div className="qc-content">
            <div className="qc-eyebrow">VÉ CỦA BẠN</div>
            <div className="qc-title">Quản lý vé đã mua</div>
            <div className="qc-sub">Xem QR &amp; queue number</div>
          </div>
          <Tickie size={64} color="#fff" mood="happy" />
        </div>
        <div className="qcard mint">
          <div className="qc-content">
            <div className="qc-eyebrow">CHÍNH SÁCH</div>
            <div className="qc-title">Hoàn vé &amp; đổi vé</div>
            <div className="qc-sub">Quy định check-in</div>
          </div>
          <div style={{ fontSize: 48 }}>📜</div>
        </div>
      </section>
    </div>
  );
}
