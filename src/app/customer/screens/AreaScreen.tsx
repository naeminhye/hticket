"use client";
import { useState } from "react";
import { Tickie } from "@/components/Tickie";
import { type Event, type Area, fmtVNDFull } from "@/lib/data";
import type { Screen, NavParams } from "@/store/customerStore";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  event: Event;
  areas: Area[];
}

function AreaCard({ a, isSelected, onSelect }: { a: Area; isSelected: boolean; onSelect: () => void }) {
  const left = a.capacity - a.sold - a.held;
  const isSold = a.soldOut || left <= 0;

  return (
    <button
      className={`area-card ${isSelected ? "on" : ""} ${isSold ? "sold" : ""}`}
      disabled={isSold}
      onClick={onSelect}
      style={{ "--a-color": a.color } as React.CSSProperties}
    >
      <div className="ac-stripe" />
      <div className="ac-row1">
        <div className="ac-name">
          <span className="ac-tag" style={{ background: a.color }}>
            {a.type === "seating" ? "🪑" : a.type === "wheelchair" ? "♿" : "🕺"}
          </span>
          <div>
            <div className="ac-title">{a.nameVi}</div>
            <div className="ac-sub">{a.name}</div>
          </div>
        </div>
        <div className="ac-price">
          <div className="acp-amount">{fmtVNDFull(a.price)}</div>
          <div className="acp-unit">/ vé</div>
        </div>
      </div>
      <div className="ac-row2">
        <div className="ac-bar">
          <div className="ac-bar-fill" style={{ width: `${Math.min(100, ((a.sold + a.held) / a.capacity) * 100)}%`, background: a.color }} />
        </div>
        <div className="ac-stats">
          {isSold ? (
            <span className="ac-sold">Sold out 😢</span>
          ) : (
            <>
              <span>{left.toLocaleString("vi-VN")} vé còn</span>
              <span className="ac-dot">·</span>
              <span className="ac-faint">tối đa {a.maxPerOrder} vé / lần</span>
            </>
          )}
        </div>
      </div>
      {a.perks && a.perks.length > 0 && (
        <div className="ac-perks">
          {a.perks.map((p, i) => <span key={i} className="ac-perk">✨ {p}</span>)}
        </div>
      )}
      {a.type === "wheelchair" && a.allowsCompanion && (
        <div className="ac-companion">+ vé người đi kèm (Companion)</div>
      )}
    </button>
  );
}

export default function AreaScreen({ go, event, areas }: Props) {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const selected = areas.find(a => a.id === selectedAreaId);
  const nextScreen = selected?.type === "seating" ? "seats" : "quantity";

  return (
    <div className="screen area-screen">
      <TopBar
        onBack={() => go("event", { eventId: event.id })}
        onHome={() => go("home")}
        title={event.title}
        subtitle="Chọn khu vực · Pick an area"
        step={1}
        totalSteps={4}
      />

      <div className="area-intro">
        <Tickie size={48} color="#FFD56B" />
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>Bạn muốn ngồi đâu? 🎯</h2>
          <div style={{ color: "var(--ink-soft)", fontSize: 14 }}>Where would you like to be tonight?</div>
        </div>
      </div>

      <div className="venue-mini h-card">
        <div className="vm-stage">STAGE · Sân khấu</div>
        <div className="vm-zones">
          {areas.filter(a => a.id !== "wc").map(a => {
            const left = a.capacity - a.sold - a.held;
            const isSold = a.soldOut || left <= 0;
            const isSel = selectedAreaId === a.id;
            return (
              <button
                key={a.id}
                className={`vm-zone ${isSel ? "on" : ""} ${isSold ? "sold" : ""}`}
                style={{ background: a.color, opacity: isSold ? 0.3 : 1 }}
                onClick={() => !isSold && setSelectedAreaId(a.id)}
              >
                {a.name.replace("Standing ", "").replace(" Seating", "").replace(" Front Stage", "")}
                {isSel && <span className="vm-ping" />}
              </button>
            );
          })}
        </div>
        <div className="vm-foot">
          <span>📍 Sơ đồ tham khảo · Schematic only</span>
        </div>
      </div>

      <div className="area-list">
        {areas.map(a => (
          <AreaCard
            key={a.id}
            a={a}
            isSelected={selectedAreaId === a.id}
            onSelect={() => setSelectedAreaId(a.id)}
          />
        ))}
      </div>

      <BottomBar>
        <div className="bb-left">
          {selected ? (
            <>
              <div className="bb-from">Đã chọn: <strong>{selected.nameVi}</strong></div>
              <div className="bb-from-sub">{fmtVNDFull(selected.price)} / vé</div>
            </>
          ) : (
            <>
              <div className="bb-from">Chọn 1 khu vực</div>
              <div className="bb-from-sub">Pick a zone to continue</div>
            </>
          )}
        </div>
        <button
          className="h-btn primary"
          disabled={!selected}
          onClick={() => selected && go(nextScreen as Screen, { eventId: event.id, areaId: selected.id })}
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
