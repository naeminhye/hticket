"use client";
import { useState, useEffect, useMemo } from "react";
import { Tickie, Sparkle, Star, Confetti } from "@/components/Tickie";
import { type Event, type Area, type TicketItem, fmtVNDFull } from "@/lib/data";
import type { Screen, NavParams } from "@/store/customerStore";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  event: Event;
  area: Area;
  items: TicketItem[];
}

type Ticket = TicketItem & {
  code: string;
  queue?: string;
  seatLabel?: string | null;
};

function QRGrid({ seed }: { seed: string }) {
  const cells = Array.from({ length: 196 }, (_, i) =>
    ((i * 7 + seed.charCodeAt(Math.min(3, seed.length - 1))) % 17) > 8
  );
  return (
    <div className="qr-grid sm">
      {cells.map((filled, i) => (
        <span key={i} style={{ background: filled ? "#2B1A2E" : "transparent", borderRadius: 1 }} />
      ))}
    </div>
  );
}

export default function TicketScreen({ go, event, area, items }: Props) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const tickets = useMemo<Ticket[]>(() => items.map((it, i) => {
    if (it.standing) {
      const num = String(100 + i + Math.floor((event.id.charCodeAt(0) * 7 + i * 31) % 700)).padStart(5, "0");
      return {
        ...it,
        code: `HT-${event.id.slice(0, 3).toUpperCase()}-${area.queuePrefix || "Q"}${num}`,
        queue: `${area.queuePrefix || "Q"}-${num}`,
        seatLabel: null,
      };
    }
    return {
      ...it,
      code: `HT-${event.id.slice(0, 3).toUpperCase()}-${it.id}`,
      seatLabel: it.id,
    };
  }), [items, area, event]);

  const current = tickets[selectedIdx];
  const accentStyle = { "--accent": area.color } as React.CSSProperties;

  return (
    <div className="screen ticket-screen">
      {showConfetti && (
        <div className="confetti-burst">
          <Confetti count={60} />
        </div>
      )}

      <div className="ticket-success">
        <div className="ts-mascot float">
          <Tickie size={120} mood="party" color="#9EE6CF" />
          <Sparkle size={28} style={{ position: "absolute", top: 0, right: -8 }} />
          <Star size={20} color="#FF8FA8" style={{ position: "absolute", bottom: 10, left: -10, transform: "rotate(-20deg)" }} />
        </div>
        <h1 style={{ fontSize: 36, textAlign: "center", marginBottom: 6 }}>Thanh toán thành công 🎉</h1>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", margin: 0 }}>
          Vé đã gửi vào email của bạn · Tickets sent to your inbox
        </p>
      </div>

      {tickets.length > 1 && (
        <div className="ticket-tabs">
          {tickets.map((_, i) => (
            <button key={i} className={`tt ${selectedIdx === i ? "on" : ""}`} onClick={() => setSelectedIdx(i)}>
              Vé {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="eticket-wrap">
        <div className="eticket" style={accentStyle}>
          {/* Top strip */}
          <div className="et-top">
            <div className="et-brand">
              <div className="et-brand-mark">
                <Tickie size={28} color="#fff" />
              </div>
              <div>
                <div className="et-brand-name">HTicket</div>
                <div className="et-brand-sub">E-TICKET · 2026</div>
              </div>
            </div>
            <div className="et-status">
              <span className="et-dot" /> VALID
            </div>
          </div>

          {/* Hero */}
          <div className="et-hero">
            <div className="et-eyebrow">{area.nameVi.toUpperCase()}</div>
            <h2 className="et-title">{event.title}</h2>
            <div className="et-artist">{event.artist}</div>
          </div>

          {/* Meta */}
          <div className="et-meta">
            <div className="etm">
              <div className="etm-k">DATE</div>
              <div className="etm-v">{event.dateEn.toUpperCase()}</div>
              <div className="etm-vs">{event.time}</div>
            </div>
            <div className="etm">
              <div className="etm-k">VENUE</div>
              <div className="etm-v">{event.venue}</div>
              <div className="etm-vs">{event.city}</div>
            </div>
            <div className="etm">
              <div className="etm-k">DOORS</div>
              <div className="etm-v">18:00</div>
              <div className="etm-vs">Gate B</div>
            </div>
          </div>

          {/* Perforation */}
          <div className="et-perf" />

          {/* Bottom */}
          <div className="et-bottom">
            <div className="et-info">
              {current.standing ? (
                <>
                  <div className="et-info-row">
                    <div className="eti">
                      <div className="eti-k">ZONE</div>
                      <div className="eti-v">{area.name}</div>
                    </div>
                    <div className="eti">
                      <div className="eti-k">QUEUE NO.</div>
                      <div className="eti-v big">{current.queue}</div>
                    </div>
                  </div>
                  <div className="et-info-row">
                    <div className="eti">
                      <div className="eti-k">ORDER</div>
                      <div className="eti-v" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{current.code}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="et-info-row">
                    <div className="eti">
                      <div className="eti-k">ZONE</div>
                      <div className="eti-v">{area.name}</div>
                    </div>
                    <div className="eti">
                      <div className="eti-k">ROW · SEAT</div>
                      <div className="eti-v big">{current.seatLabel}</div>
                    </div>
                  </div>
                  <div className="et-info-row">
                    <div className="eti">
                      <div className="eti-k">PRICE</div>
                      <div className="eti-v">{fmtVNDFull(current.price)}</div>
                    </div>
                    <div className="eti">
                      <div className="eti-k">ORDER</div>
                      <div className="eti-v" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{current.code}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="et-qr">
              <div className="et-qr-frame">
                <QRGrid seed={current.code} />
                <div className="et-qr-center">
                  <Tickie size={28} color="#fff" />
                </div>
              </div>
              <div className="et-qr-label">Quét tại cổng vào</div>
            </div>
          </div>

          <div className="et-stripe" />
        </div>
      </div>

      <div className="ticket-actions">
        <button className="h-btn ghost"><span>⬇</span> Tải PDF</button>
        <button className="h-btn ghost"><span>📧</span> Gửi lại email</button>
        <button className="h-btn ghost"><span>📲</span> Thêm vào ví</button>
        <button className="h-btn ghost"><span>📤</span> Chia sẻ</button>
      </div>

      <div className="ticket-tips h-card">
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>Lưu ý nhỏ từ Tickie 🌸</h3>
        <ul>
          <li>Mở mã QR khi đến cổng — không cần in ra giấy.</li>
          <li>Mang theo CCCD/Passport để đối chiếu nếu được yêu cầu.</li>
          {current.standing
            ? <li>Queue <strong>{current.queue}</strong> là thứ tự vào khu đứng — giữ kỹ nhé!</li>
            : <li>Đến sớm 30 phút để vào chỗ <strong>{current.seatLabel}</strong> thoải mái.</li>}
          <li>Cần hỗ trợ? Nhắn HTicket bất cứ lúc nào.</li>
        </ul>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", padding: "8px 0 32px" }}>
        <button className="h-btn" onClick={() => go("home")}>Về trang chủ</button>
        <button className="h-btn primary" onClick={() => go("event", { eventId: event.id })}>Mua thêm vé</button>
      </div>
    </div>
  );
}
