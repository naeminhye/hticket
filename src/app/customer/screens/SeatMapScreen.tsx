"use client";
import { useState, useMemo } from "react";
import { Tickie } from "@/components/Tickie";
import { type Event, type Area, type Seat, generateSeats, fmtVNDFull } from "@/lib/data";
import type { Screen, NavParams } from "@/store/customerStore";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  event: Event;
  area: Area;
}

export default function SeatMapScreen({ go, event, area }: Props) {
  const map = useMemo(() => generateSeats(area), [area.id]);
  const [picked, setPicked] = useState<Seat[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [autoQty, setAutoQty] = useState(2);
  const [zoom, setZoom] = useState(1);

  const toggle = (seat: Seat) => {
    if (seat.type === "aisle") return;
    if (seat.status !== "available") return;
    setPicked(p => {
      const has = p.find(x => x.id === seat.id);
      if (has) return p.filter(x => x.id !== seat.id);
      if (p.length >= area.maxPerOrder) return p;
      return [...p, seat];
    });
  };

  const total = picked.reduce((s, p) => s + (p.price || area.price), 0);
  const limitReached = picked.length >= area.maxPerOrder;

  const pickAuto = () => {
    const available = map.seats.filter(s => s.status === "available" && s.type !== "aisle");
    const byRow: Record<string, Seat[]> = {};
    available.forEach(s => {
      const r = s.row || "A";
      (byRow[r] ||= []).push(s);
    });
    for (const r of Object.values(byRow)) {
      r.sort((a, b) => (a.col || 0) - (b.col || 0));
      for (let i = 0; i <= r.length - autoQty; i++) {
        const run = r.slice(i, i + autoQty);
        if (run.every((s, j) => j === 0 || (s.col || 0) === (run[j - 1].col || 0) + 1)) {
          setPicked(run);
          return;
        }
      }
    }
    setPicked(available.slice(0, autoQty));
  };

  return (
    <div className="screen seatmap-screen">
      <TopBar
        onBack={() => go("areas", { eventId: event.id })}
        onHome={() => go("home")}
        title={area.nameVi}
        subtitle={`Tối đa ${area.maxPerOrder} vé · ${area.name}`}
        step={2}
        totalSteps={4}
      />

      <div className="sm-toggle">
        <button className={`stb ${!autoMode ? "on" : ""}`} onClick={() => setAutoMode(false)}>
          <span>👆</span> Tự chọn ghế
        </button>
        <button className={`stb ${autoMode ? "on" : ""}`} onClick={() => setAutoMode(true)}>
          <span>🎲</span> Hệ thống chọn giúp
        </button>
      </div>

      {autoMode ? (
        <div className="auto-pick h-card">
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>Để Tickie tìm chỗ tốt cho bạn</h3>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 16px", fontSize: 13 }}>
            Hệ thống sẽ ưu tiên ghế liền nhau, càng gần sân khấu càng tốt.
          </p>
          <label className="h-label">Số lượng vé</label>
          <div className="qty-row">
            <button className="qty-btn" onClick={() => setAutoQty(q => Math.max(1, q - 1))}>−</button>
            <div className="qty-num">{autoQty}</div>
            <button className="qty-btn" onClick={() => setAutoQty(q => Math.min(area.maxPerOrder, q + 1))}>+</button>
            <span className="qty-hint">tối đa {area.maxPerOrder}</span>
          </div>
          <button className="h-btn mint" style={{ marginTop: 16, width: "100%" }} onClick={pickAuto}>
            🎯 Tìm ghế cho tôi
          </button>
          {picked.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="h-label">Ghế đề xuất</div>
              <div className="picked-row">
                {picked.map(s => (
                  <span key={s.id} className="picked-chip">
                    🎫 {s.id}
                    <button onClick={() => setPicked(p => p.filter(x => x.id !== s.id))}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="seatmap-frame">
            <div className="stage-curve">
              <svg viewBox="0 0 300 40" preserveAspectRatio="none">
                <path d="M0 40 Q150 0 300 40" fill="var(--ink)" />
              </svg>
              <div className="stage-label">★ SÂN KHẤU · STAGE ★</div>
            </div>
            <div className="zoom-ctrls">
              <button className="iconbtn sm" onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}>−</button>
              <span style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{Math.round(zoom * 100)}%</span>
              <button className="iconbtn sm" onClick={() => setZoom(z => Math.min(1.6, z + 0.15))}>+</button>
            </div>
            <div className="seat-scroll">
              <div className="seat-grid" style={{ "--cols": map.cols, transform: `scale(${zoom})`, transformOrigin: "top center" } as React.CSSProperties}>
                {map.seats.map(s => {
                  if (s.type === "aisle") return <div key={s.id} className="seat-aisle" />;
                  const isPicked = !!picked.find(p => p.id === s.id);
                  const cls = isPicked ? "picked" : s.status;
                  return (
                    <button
                      key={s.id}
                      className={`seat ${cls}`}
                      onClick={() => toggle(s)}
                      title={`${s.id} · ${fmtVNDFull(s.price)}`}
                      disabled={s.status !== "available" && !isPicked}
                    >
                      {isPicked && <span className="seat-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="legend">
            <span><span className="seat available" style={{ width: 14, height: 14, display: "inline-block", borderRadius: 4, background: "var(--mint-soft)", border: "1.5px solid var(--mint)" }} /> Trống</span>
            <span><span className="seat picked" style={{ width: 14, height: 14, display: "inline-block", borderRadius: 4, background: "var(--pink-soft)", border: "1.5px solid var(--pink)" }} /> Đang chọn</span>
            <span><span style={{ width: 14, height: 14, display: "inline-block", borderRadius: 4, background: "var(--butter-soft)", border: "1.5px solid var(--butter)" }} /> Đang giữ</span>
            <span><span style={{ width: 14, height: 14, display: "inline-block", borderRadius: 4, background: "var(--bg-deep)", border: "1.5px solid var(--border-strong)" }} /> Đã bán</span>
          </div>
        </>
      )}

      {limitReached && !autoMode && (
        <div className="toast">
          <Tickie size={36} mood="sad" />
          <div>
            <strong>Bạn đã chọn tối đa {area.maxPerOrder} vé</strong>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Max {area.maxPerOrder} tickets per order for this zone</div>
          </div>
        </div>
      )}

      <BottomBar>
        <div className="bb-left">
          <div className="bb-from">
            <strong>{picked.length}</strong> ghế · <strong>{fmtVNDFull(total)}</strong>
          </div>
          <div className="bb-from-sub">
            {picked.length > 0 ? picked.map(p => p.id).join(", ") : "Chưa chọn ghế nào"}
          </div>
        </div>
        <button
          className="h-btn primary"
          disabled={picked.length === 0}
          onClick={() => go("checkout", {
            eventId: event.id,
            areaId: area.id,
            items: picked.map(p => ({ id: p.id, label: p.id, price: p.price })),
          })}
        >
          Tiếp tục
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </BottomBar>
    </div>
  );
}
