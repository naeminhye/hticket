"use client";
import { Tickie, Sparkle, Star } from "@/components/Tickie";
import { type Event, type Area, fmtVNDFull } from "@/lib/data";
import type { Screen, NavParams } from "@/store/customerStore";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  event: Event;
  areas: Area[];
}

export default function EventScreen({ go, event, areas }: Props) {
  const totalSold = areas.reduce((s, a) => s + a.sold, 0);
  const totalCap = areas.reduce((s, a) => s + a.capacity, 0);

  const DOTS: [number, number][] = [[13.7, 19], [27.4, 38], [41.1, 57], [54.8, 76], [68.5, 95], [82.2, 14], [95.9, 33], [9.6, 52], [23.3, 71], [37, 90], [50.7, 9], [64.4, 28], [78.1, 47], [91.8, 66], [5.5, 85], [19.2, 4]];

  return (
    <div className="screen event-screen">
      <TopBar onBack={() => go("home")} onHome={() => go("home")} title="Sự kiện" subtitle="Event detail" />

      <div className="event-hero" style={{ background: `linear-gradient(135deg, ${event.cover}, ${event.cover2})` }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {DOTS.map(([l, t], j) => (
            <span key={j} style={{ position: "absolute", left: `${l}%`, top: `${t}%`, width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
          ))}
          <Sparkle size={32} style={{ position: "absolute", top: 24, left: 30 }} />
          <Star size={28} color="#fff" style={{ position: "absolute", top: 60, right: 40 }} />
          <div style={{ position: "absolute", right: 16, bottom: 16, transform: "rotate(-6deg)" }}>
            <Tickie size={120} mood="party" color="#fff" />
          </div>
        </div>
        <div className="eh-tag">
          <span className="h-pill" style={{ background: "#fff", color: "#2B1A2E", border: "1.5px solid #fff" }}>🎤 Concert</span>
          <span className="h-pill" style={{ background: "rgba(255,255,255,0.3)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)" }}>ON SALE</span>
        </div>
      </div>

      <div className="event-body">
        <div>
          <h1 className="event-title">{event.title}</h1>
          <div className="event-sub">{event.artist}</div>
        </div>

        <div className="event-info-grid">
          {[
            { ico: "📅", k: "Thời gian · Date", v: event.date, vs: event.time },
            { ico: "📍", k: "Địa điểm · Venue", v: event.venue, vs: event.city },
            { ico: "⏰", k: "Mở cửa · Doors", v: "18:00", vs: "90 phút trước giờ diễn" },
            { ico: "🎟", k: "Giới hạn · Per person", v: "4 vé / người", vs: "cho cả sự kiện" },
          ].map(item => (
            <div key={item.k} className="ei">
              <div className="ei-ico">{item.ico}</div>
              <div>
                <div className="ei-k">{item.k}</div>
                <div className="ei-v">{item.v}</div>
                <div className="ei-vsub">{item.vs}</div>
              </div>
            </div>
          ))}
        </div>

        {event.description && (
          <div className="h-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Về sự kiện</h3>
            <p style={{ margin: 0, color: "var(--ink-soft)" }}>{event.description}</p>
            {event.descriptionEn && (
              <p style={{ margin: "8px 0 0", color: "var(--ink-faint)", fontSize: 13, fontStyle: "italic" }}>{event.descriptionEn}</p>
            )}
          </div>
        )}

        <div className="sales-meter h-card">
          <div className="sm-row">
            <div>
              <div className="sm-k">Tổng vé đã bán</div>
              <div className="sm-v">{totalSold.toLocaleString("vi-VN")} <span className="sm-vsub">/ {totalCap.toLocaleString("vi-VN")}</span></div>
            </div>
            <div className="sm-ring" style={{ background: `conic-gradient(var(--pink) 0 ${(totalSold / totalCap) * 360}deg, var(--bg-soft) 0)` }}>
              <div className="sm-ring-inner">{Math.round((totalSold / totalCap) * 100)}%</div>
            </div>
          </div>
          <div className="sm-bar-wrap">
            {areas.map(a => (
              <div key={a.id} title={`${a.name}: ${a.sold}/${a.capacity}`} style={{ flex: a.sold, background: a.color, minWidth: a.sold > 0 ? 4 : 0 }} />
            ))}
            <div style={{ flex: totalCap - totalSold, background: "var(--bg-soft)" }} />
          </div>
          <div className="sm-legend">
            {areas.slice(0, 4).map(a => (
              <span key={a.id}>
                <span className="dot" style={{ background: a.color }} />
                {a.name.replace("Standing ", "St.")}
              </span>
            ))}
          </div>
        </div>

        <div className="event-policies">
          <span className="h-pill mint">↩ Hoàn vé 7 ngày</span>
          <span className="h-pill butter">⏱ Giữ 10 phút</span>
          <span className="h-pill sky">📲 E-ticket QR</span>
          <span className="h-pill grape">♿ Wheelchair OK</span>
        </div>
      </div>

      <BottomBar>
        <div className="bb-left">
          <div className="bb-from">Từ <strong>{fmtVNDFull(event.minPrice)}</strong></div>
          <div className="bb-from-sub">+ phí dịch vụ 30k</div>
        </div>
        <button className="h-btn primary" onClick={() => go("areas", { eventId: event.id })}>
          Chọn khu vực
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </BottomBar>
    </div>
  );
}
