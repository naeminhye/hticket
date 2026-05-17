"use client";
import { useState, useRef, useEffect } from "react";
import { Tickie } from "@/components/Tickie";
import { ADMIN_EVENTS, fmtVNDFull, fmtVND } from "@/lib/data";
import { useEventStore } from "@/store/eventStore";
import type { AdminScreen, AdminParams } from "../AdminApp";

interface Props {
  go: (screen: AdminScreen, params?: AdminParams) => void;
  eventId: string;
}

type ZoneType = "seating" | "standing" | "wheelchair";
type Zone = {
  id: string; name: string; type: ZoneType; color: string;
  x: number; y: number; w: number; h: number;
  capacity: number; price: number;
  rows?: number; cols?: number;
  queuePrefix?: string;
};

type InfoState = {
  titleVi: string;
  titleEn: string;
  description: string;
  venue: string;
  startAt: string;
  endAt: string;
  policy: string;
};

const EDIT_ZONES: Zone[] = [
  { id: "vip", name: "VIP A", type: "seating", color: "#FF8FA8", x: 130, y: 80, w: 280, h: 80, capacity: 200, price: 2500000, rows: 10, cols: 20 },
  { id: "std", name: "Standard B", type: "seating", color: "#C4B5FB", x: 60, y: 180, w: 420, h: 110, capacity: 800, price: 1500000, rows: 16, cols: 20 },
  { id: "bal", name: "Balcony", type: "seating", color: "#B8D9FF", x: 60, y: 310, w: 420, h: 60, capacity: 400, price: 950000, rows: 10, cols: 20 },
  { id: "stand-a", name: "Standing A", type: "standing", color: "#FFD56B", x: 60, y: 390, w: 200, h: 80, capacity: 1000, price: 900000, queuePrefix: "A" },
  { id: "stand-b", name: "Standing B", type: "standing", color: "#9EE6CF", x: 280, y: 390, w: 200, h: 80, capacity: 1500, price: 700000, queuePrefix: "B" },
  { id: "wc", name: "Wheelchair", type: "wheelchair", color: "#5A8FD8", x: 490, y: 320, w: 80, h: 60, capacity: 20, price: 900000 },
  { id: "fan", name: "Fan Zone", type: "standing", color: "#FFAB91", x: 60, y: 490, w: 420, h: 50, capacity: 600, price: 500000, queuePrefix: "F" },
];

const ZONE_COLORS = ["#FF8FA8", "#C4B5FB", "#B8D9FF", "#FFD56B", "#9EE6CF", "#FFAB91", "#5A8FD8"];

const PALETTE = [
  { type: "seating" as ZoneType, color: "#FF8FA8", name: "Seating", emoji: "🪑" },
  { type: "standing" as ZoneType, color: "#FFD56B", name: "Standing", emoji: "🕺" },
  { type: "wheelchair" as ZoneType, color: "#5A8FD8", name: "Wheelchair", emoji: "♿" },
];

let zoneCounter = 0;
function newZoneId() { return `zone-${++zoneCounter}`; }

function lsGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(key) ?? "null") as T; } catch { return null; }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function lsDel(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

export default function EventEditor({ go, eventId }: Props) {
  const existing = ADMIN_EVENTS.find(e => e.id === eventId);
  const isNew = !existing;
  const storageKey = isNew ? "hticket:draft:new" : `hticket:draft:${eventId}`;

  const [tab, setTab] = useState<"info" | "layout" | "pricing" | "rules" | "publish">(
    isNew ? "info" : "layout"
  );
  const [info, setInfo] = useState<InfoState>(() => {
    const persisted = lsGet<{ info?: InfoState }>(storageKey);
    if (persisted?.info) return persisted.info;
    return {
      titleVi: existing?.title ?? "",
      titleEn: "",
      description: "",
      venue: existing?.venue ?? "",
      startAt: "",
      endAt: "",
      policy: "Hoàn vé trong vòng 7 ngày trước sự kiện · Không đổi vé khác sự kiện",
    };
  });
  const [zones, setZones] = useState<Zone[]>(() => {
    const persisted = lsGet<{ zones?: Zone[] }>(storageKey);
    if (persisted?.zones) return persisted.zones;
    return isNew ? [] : EDIT_ZONES;
  });
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(isNew ? null : "vip");
  const [tool, setTool] = useState<"select" | "rect">("select");
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const { publish: publishToStore } = useEventStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null);

  const selected = zones.find(z => z.id === selectedZoneId) ?? null;

  const setInfoField = <K extends keyof InfoState>(k: K, v: InfoState[K]) =>
    setInfo(prev => ({ ...prev, [k]: v }));

  const updateZone = (id: string, updates: Partial<Zone>) =>
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));

  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
    if (selectedZoneId === id) setSelectedZoneId(null);
  };

  const addZone = (type: ZoneType, color: string, name: string) => {
    const id = newZoneId();
    const offset = zones.length * 16;
    setZones(prev => [...prev, {
      id, name: `${name} ${prev.filter(z => z.type === type).length + 1}`,
      type, color, x: 60 + offset, y: 80 + offset, w: 240, h: 80,
      capacity: 200, price: 0,
      ...(type === "seating" ? { rows: 8, cols: 20 } : {}),
    }]);
    setSelectedZoneId(id);
  };

  const startDrag = (zone: Zone, e: React.PointerEvent) => {
    e.preventDefault();
    setSelectedZoneId(zone.id);
    if (tool !== "select") return;
    const rect = canvasRef.current!.getBoundingClientRect();
    dragRef.current = { id: zone.id, offX: e.clientX - rect.left - zone.x, offY: e.clientY - rect.top - zone.y };
    const move = (mv: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      setZones(prev => prev.map(z => z.id === dragRef.current!.id
        ? { ...z, x: Math.max(0, mv.clientX - r.left - dragRef.current!.offX), y: Math.max(0, mv.clientY - r.top - dragRef.current!.offY) }
        : z));
    };
    const up = () => { dragRef.current = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const saveDraft = () => {
    lsSet(storageKey, { info, zones });
    setSaved(true);
  };
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  // Dynamic validation from actual state
  const validations = [
    { ok: !!info.titleVi.trim(), warn: false, text: "Tên sự kiện (tiếng Việt)" },
    { ok: !!info.venue.trim(), warn: false, text: "Địa điểm tổ chức" },
    { ok: !!info.startAt, warn: false, text: "Thời gian bắt đầu" },
    { ok: !!info.endAt, warn: false, text: "Thời gian kết thúc" },
    { ok: zones.length > 0, warn: false, text: "Ít nhất 1 khu vực trên sơ đồ" },
    { ok: zones.length === 0 || zones.every(z => z.price > 0), warn: false, text: "Tất cả khu có giá vé > 0" },
    { ok: zones.length === 0 || zones.filter(z => z.type === "standing").every(z => !!z.queuePrefix), warn: true, text: "Khu đứng nên có queue prefix" },
  ];
  const errs = validations.filter(v => !v.ok && !v.warn).length;

  const TABS = [
    { k: "info" as const, l: "Thông tin" },
    { k: "layout" as const, l: "Sơ đồ & khu vực" },
    { k: "pricing" as const, l: "Giá vé" },
    { k: "rules" as const, l: "Giới hạn" },
    { k: "publish" as const, l: "Sẵn sàng?" },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div className="ad-bread">
            <span onClick={() => go("events")} style={{ cursor: "pointer" }}>Sự kiện</span>
            <span className="sep">/</span>
            <span className="cur">{isNew ? "Tạo sự kiện mới" : (existing?.title ?? "")}</span>
          </div>
          <h1 className="ad-h1" style={{ marginTop: 6 }}>
            {isNew ? (info.titleVi || "Sự kiện mới") : (existing?.title ?? "")}
          </h1>
          {!isNew && existing && (
            <div className="ad-h1-sub">
              {existing.date} · {existing.venue} · <span className={`ev-status ${existing.status}`} style={{ verticalAlign: "middle" }}>● {existing.status}</span>
            </div>
          )}
          {isNew && (
            <div className="ad-h1-sub">Điền thông tin theo từng bước · Fill in the details step by step</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {saved && <span className="h-pill mint">✓ Đã lưu</span>}
          <button className="h-btn sm ghost">👁 Preview</button>
          <button className="h-btn sm" onClick={saveDraft}>💾 Lưu nháp</button>
          <button className="h-btn sm primary" disabled={errs > 0} onClick={() => setTab("publish")}>🚀 Publish</button>
        </div>
      </div>

      {/* Step progress for new events */}
      {isNew && (
        <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {TABS.map((t, i) => {
            const done = TABS.indexOf(TABS.find(x => x.k === tab)!) > i;
            const active = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                style={{
                  flex: 1, padding: "10px 8px", fontSize: 13, fontWeight: 600,
                  background: active ? "var(--ink)" : done ? "var(--mint-soft)" : "transparent",
                  color: active ? "var(--bg)" : done ? "var(--mint-deep)" : "var(--ink-soft)",
                  borderRight: i < TABS.length - 1 ? "1.5px solid var(--border)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 12, opacity: 0.7 }}>{i + 1}.</span> {t.l}
                {done && <span style={{ fontSize: 14 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {!isNew && (
        <div className="chart-tabs" style={{ marginBottom: 16, display: "inline-flex" }}>
          {TABS.map(t => (
            <button key={t.k} className={tab === t.k ? "on" : ""} onClick={() => setTab(t.k)}>{t.l}</button>
          ))}
        </div>
      )}

      {/* ── Info Tab ── */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div className="chart-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="ed-h" style={{ marginTop: 0 }}>Thông tin cơ bản</div>

            <div>
              <label className="h-label">Tên sự kiện · Tiếng Việt <span style={{ color: "var(--pink-deep)" }}>*</span></label>
              <input className="h-input" placeholder="Ví dụ: Đêm nhạc Starlight Bloom" value={info.titleVi} onChange={e => setInfoField("titleVi", e.target.value)} />
            </div>
            <div>
              <label className="h-label">Tên sự kiện · English</label>
              <input className="h-input" placeholder="E.g. Starlight Bloom Festival" value={info.titleEn} onChange={e => setInfoField("titleEn", e.target.value)} />
            </div>
            <div>
              <label className="h-label">Mô tả</label>
              <textarea className="h-input" rows={4} placeholder="Giới thiệu ngắn về sự kiện…" value={info.description} onChange={e => setInfoField("description", e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="h-label">Bắt đầu <span style={{ color: "var(--pink-deep)" }}>*</span></label>
                <input className="h-input" type="datetime-local" value={info.startAt} onChange={e => setInfoField("startAt", e.target.value)} />
              </div>
              <div>
                <label className="h-label">Kết thúc</label>
                <input className="h-input" type="datetime-local" value={info.endAt} onChange={e => setInfoField("endAt", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="h-label">Địa điểm <span style={{ color: "var(--pink-deep)" }}>*</span></label>
              <input className="h-input" placeholder="Ví dụ: SVĐ Hoa Lư, TP.HCM" value={info.venue} onChange={e => setInfoField("venue", e.target.value)} />
            </div>

            <div>
              <label className="h-label">Chính sách vé</label>
              <textarea className="h-input" rows={3} value={info.policy} onChange={e => setInfoField("policy", e.target.value)} />
            </div>

            {isNew && (
              <button
                className="h-btn primary"
                disabled={!info.titleVi.trim() || !info.venue.trim() || !info.startAt}
                onClick={() => setTab("layout")}
                style={{ alignSelf: "flex-end" }}
              >
                Tiếp theo: Sơ đồ →
              </button>
            )}
          </div>

          <div className="chart-card">
            <div className="ed-h">Banner / Poster</div>
            <div style={{
              aspectRatio: "1/1", borderRadius: 14,
              background: info.titleVi ? "linear-gradient(135deg, #FF8FA8, #C4B5FB)" : "var(--bg-soft)",
              border: "2px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)",
              position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {info.titleVi ? (
                <>
                  <div style={{ position: "absolute", bottom: 12, right: 12, transform: "rotate(-6deg)" }}>
                    <Tickie size={80} color="#fff" mood="party" />
                  </div>
                  <div style={{ position: "absolute", top: 12, left: 12, color: "#fff", fontWeight: 800, fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.2, textShadow: "0 2px 0 rgba(0,0,0,0.2)", maxWidth: "70%" }}>
                    {info.titleVi}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "var(--ink-faint)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🖼</div>
                  <div style={{ fontSize: 12 }}>Preview xuất hiện khi<br />bạn nhập tên sự kiện</div>
                </div>
              )}
            </div>
            <button className="h-btn ghost sm" style={{ width: "100%", marginTop: 10 }}>📤 Đổi banner</button>
          </div>
        </div>
      )}

      {/* ── Layout Tab ── */}
      {tab === "layout" && (
        <div className="editor-grid">
          {/* Palette */}
          <div className="ed-side">
            <div className="ed-h">Thêm khu vực mới</div>
            <p style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 10, marginTop: -6 }}>Click để thêm vào sơ đồ</p>
            <div className="tool-list">
              {PALETTE.map(p => (
                <button key={p.type} className="tool" style={{ cursor: "pointer", width: "100%", textAlign: "left" }} onClick={() => addZone(p.type, p.color, p.name)}>
                  <span className="tool-color" style={{ background: p.color }} />
                  <span className="tool-name">{p.name}</span>
                  <span className="tool-emoji">{p.emoji}</span>
                </button>
              ))}
            </div>

            <div className="ed-h">Trên sơ đồ ({zones.length})</div>
            {zones.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink-faint)", fontSize: 13 }}>
                <Tickie size={48} mood="sleep" color="var(--ink-faint)" />
                <div style={{ marginTop: 8 }}>Chưa có khu vực nào.<br />Click bên trên để thêm.</div>
              </div>
            ) : (
              <div className="ed-zone-list">
                {zones.map(z => (
                  <div key={z.id} className={`ed-zone ${selectedZoneId === z.id ? "on" : ""}`} onClick={() => setSelectedZoneId(z.id)}>
                    <div className="ez-color" style={{ background: z.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ez-name">{z.name}</div>
                      <div className="ez-sub">{z.capacity.toLocaleString("vi-VN")} chỗ · {z.price > 0 ? fmtVNDFull(z.price) : <span style={{ color: "var(--pink-deep)" }}>Chưa có giá</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isNew && zones.length > 0 && (
              <button className="h-btn primary sm" style={{ width: "100%", marginTop: 14 }} onClick={() => setTab("pricing")}>
                Tiếp theo: Giá vé →
              </button>
            )}
          </div>

          {/* Canvas */}
          <div className="ed-canvas">
            <div className="canvas-toolbar">
              {([
                { id: "select" as const, icon: "⤧", title: "Di chuyển" },
                { id: "rect" as const, icon: "▭", title: "Vẽ vùng" },
              ]).map(t => (
                <button key={t.id} className={`tb-btn ${tool === t.id ? "on" : ""}`} onClick={() => setTool(t.id)} title={t.title}>{t.icon}</button>
              ))}
              <div className="tb-sep" />
              <button className="tb-btn" title="Xóa khu đang chọn" onClick={() => selectedZoneId && deleteZone(selectedZoneId)}>🗑</button>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-faint)" }}>
                <span>📐 Auto-grid</span>
                <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
              </div>
            </div>
            <div className="ed-canvas-inner" ref={canvasRef}>
              <div className="canvas-stage">★ STAGE · SÂN KHẤU ★</div>
              {zones.length === 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)", gap: 12, pointerEvents: "none" }}>
                  <Tickie size={72} mood="wink" color="var(--border-strong)" />
                  <div style={{ fontSize: 13, textAlign: "center" }}>Thêm khu vực từ danh sách bên trái<br />để bắt đầu thiết kế sơ đồ</div>
                </div>
              )}
              {zones.map(z => (
                <div
                  key={z.id}
                  className={`canvas-zone ${selectedZoneId === z.id ? "selected" : ""}`}
                  style={{ left: z.x, top: z.y, width: z.w, height: z.h, background: z.color }}
                  onPointerDown={e => startDrag(z, e)}
                >
                  <div className="cz-name">{z.name}</div>
                  <div className="cz-stats">
                    {z.type === "seating" ? `${z.rows ?? 8}r × ${z.cols ?? 20}` : z.capacity.toLocaleString("vi-VN")}
                    {z.price > 0 ? ` · ${fmtVND(z.price)}₫` : <span style={{ color: "var(--pink-deep)" }}> · giá?</span>}
                  </div>
                  {selectedZoneId === z.id && (
                    <>
                      <span className="cz-handle tl" /><span className="cz-handle tr" />
                      <span className="cz-handle bl" /><span className="cz-handle br" />
                    </>
                  )}
                </div>
              ))}
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, color: "var(--ink-faint)", background: "rgba(255,255,255,0.7)", padding: "4px 8px", borderRadius: 6 }}>
                📐 600 × 600 · kéo để di chuyển · click để chọn
              </div>
            </div>
          </div>

          {/* Inspector */}
          <div className="ed-side inspector">
            {selected ? (
              <>
                <div className="ed-h">
                  Chi tiết khu
                  <span style={{ fontSize: 10, padding: "2px 6px", background: selected.color, color: "var(--ink)", borderRadius: 6, fontFamily: "var(--font-mono)" }}>
                    {selected.type.toUpperCase()}
                  </span>
                </div>

                <div className="insp-field">
                  <label className="insp-label">Tên khu</label>
                  <input value={selected.name} onChange={e => updateZone(selected.id, { name: e.target.value })} />
                </div>
                <div className="insp-field">
                  <label className="insp-label">Loại khu</label>
                  <select value={selected.type} onChange={e => updateZone(selected.id, { type: e.target.value as ZoneType })}>
                    <option value="seating">Seating · ghế cụ thể</option>
                    <option value="standing">Standing · khu đứng</option>
                    <option value="wheelchair">Wheelchair</option>
                  </select>
                </div>

                <div className="insp-row2">
                  <div className="insp-field">
                    <label className="insp-label">Sức chứa</label>
                    <input type="number" value={selected.capacity} onChange={e => updateZone(selected.id, { capacity: +e.target.value })} />
                  </div>
                  <div className="insp-field">
                    <label className="insp-label">Giá vé (₫) <span style={{ color: "var(--pink-deep)" }}>*</span></label>
                    <input type="number" value={selected.price || ""} placeholder="0" onChange={e => updateZone(selected.id, { price: +e.target.value })} style={{ borderColor: selected.price === 0 ? "var(--pink)" : undefined }} />
                  </div>
                </div>

                {selected.type === "seating" && (
                  <div className="insp-section">
                    <div className="ed-h" style={{ fontSize: 12 }}>Sơ đồ ghế</div>
                    <div className="insp-row2">
                      <div className="insp-field">
                        <label className="insp-label">Số hàng</label>
                        <input type="number" value={selected.rows ?? 8} onChange={e => updateZone(selected.id, { rows: +e.target.value })} />
                      </div>
                      <div className="insp-field">
                        <label className="insp-label">Ghế / hàng</label>
                        <input type="number" value={selected.cols ?? 20} onChange={e => updateZone(selected.id, { cols: +e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {selected.type === "standing" && (
                  <div className="insp-section">
                    <div className="ed-h" style={{ fontSize: 12 }}>Queue</div>
                    <div className="insp-field">
                      <label className="insp-label">Prefix <span style={{ color: "var(--ink-faint)", textTransform: "none" }}>(A, FAN, ST-A…)</span></label>
                      <input value={selected.queuePrefix ?? ""} placeholder="A" onChange={e => updateZone(selected.id, { queuePrefix: e.target.value })} style={{ borderColor: !selected.queuePrefix ? "var(--butter)" : undefined }} />
                    </div>
                  </div>
                )}

                {selected.type === "wheelchair" && (
                  <div className="insp-section">
                    <div className="ed-h" style={{ fontSize: 12 }}>Wheelchair</div>
                    <div className="insp-field">
                      <label className="insp-label">Cho phép vé Companion</label>
                      <label className="switch" style={{ marginTop: 4 }}>
                        <input type="checkbox" defaultChecked /><span />
                      </label>
                    </div>
                  </div>
                )}

                <div className="insp-section">
                  <div className="ed-h" style={{ fontSize: 12 }}>Giới hạn</div>
                  <div className="insp-row2">
                    <div className="insp-field">
                      <label className="insp-label">Max / lần mua</label>
                      <input type="number" defaultValue={4} />
                    </div>
                    <div className="insp-field">
                      <label className="insp-label">Max / người</label>
                      <input type="number" defaultValue={4} />
                    </div>
                  </div>
                </div>

                <div className="insp-section">
                  <label className="insp-label">Màu</label>
                  <div className="zone-color-picker">
                    {ZONE_COLORS.map(c => (
                      <button key={c} className={`zcp-swatch ${selected.color === c ? "on" : ""}`}
                        style={{ background: c }} onClick={() => updateZone(selected.id, { color: c })} />
                    ))}
                  </div>
                </div>

                <div className="insp-section">
                  <button className="h-btn ghost sm" style={{ width: "100%", color: "var(--pink-deep)", borderColor: "var(--pink)" }}
                    onClick={() => deleteZone(selected.id)}>
                    🗑 Xóa khu này
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "var(--ink-faint)" }}>
                <Tickie size={64} mood="sleep" />
                <div style={{ marginTop: 8, fontSize: 13 }}>Chọn 1 khu để chỉnh sửa<br />hoặc thêm khu mới từ bên trái</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Pricing Tab ── */}
      {tab === "pricing" && (
        <div className="chart-card">
          <div className="ed-h">Bảng giá theo khu</div>
          {zones.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--ink-faint)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💸</div>
              <div>Chưa có khu vực nào — hãy thêm khu ở tab Sơ đồ trước.</div>
              <button className="h-btn sm" style={{ marginTop: 12 }} onClick={() => setTab("layout")}>← Về sơ đồ</button>
            </div>
          ) : (
            <>
              <div className="ev-table" style={{ border: "none", marginTop: 0 }}>
                <div className="ev-row header" style={{ gridTemplateColumns: "1.2fr 0.8fr 0.8fr 1fr 1fr" }}>
                  <div>Khu</div><div>Loại</div><div>Sức chứa</div><div>Giá thường (₫)</div><div>Early bird -15%</div>
                </div>
                {zones.map(z => (
                  <div key={z.id} className="ev-row body" style={{ gridTemplateColumns: "1.2fr 0.8fr 0.8fr 1fr 1fr" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, background: z.color, borderRadius: 3, border: "1px solid var(--ink)", flexShrink: 0 }} />
                      {z.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{z.type}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{z.capacity.toLocaleString("vi-VN")}</div>
                    <div>
                      <input
                        className="h-input"
                        style={{ padding: "6px 10px", fontSize: 13, borderColor: z.price === 0 ? "var(--pink)" : undefined }}
                        type="number"
                        placeholder="Nhập giá"
                        value={z.price || ""}
                        onChange={e => updateZone(z.id, { price: +e.target.value })}
                      />
                    </div>
                    <div>
                      <input className="h-input" style={{ padding: "6px 10px", fontSize: 13, color: "var(--ink-soft)" }}
                        type="number" readOnly value={z.price > 0 ? Math.floor(z.price * 0.85) : ""} placeholder="Tự tính" />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span className="h-pill">Early bird: mở bán sớm → 30 ngày trước</span>
                <span className="h-pill mint">Normal: còn lại</span>
                {isNew && (
                  <button className="h-btn primary sm" style={{ marginLeft: "auto" }} onClick={() => setTab("rules")}>Tiếp theo: Giới hạn →</button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Rules Tab ── */}
      {tab === "rules" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="chart-card">
            <div className="ed-h">Giới hạn mua vé</div>
            <div className="insp-field">
              <label className="insp-label">Tối đa mỗi người (cả sự kiện)</label>
              <input className="h-input" type="number" defaultValue={4} />
            </div>
            <div className="insp-field">
              <label className="insp-label">Tối đa mỗi đơn hàng</label>
              <input className="h-input" type="number" defaultValue={6} />
            </div>
            <div className="insp-field">
              <label className="insp-label">Cách xác định &ldquo;một người&rdquo;</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {["Tài khoản người dùng", "Số điện thoại", "Email", "CCCD/Passport"].map(l => (
                  <label key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <input type="checkbox" defaultChecked={l !== "CCCD/Passport"} style={{ accentColor: "var(--pink)" }} /> {l}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-card">
            <div className="ed-h">Giữ vé tạm thời</div>
            <div className="insp-field">
              <label className="insp-label">Thời gian giữ vé (phút)</label>
              <input className="h-input" type="number" defaultValue={10} />
            </div>
            <div className="insp-field">
              <label className="insp-label">Hành động khi hết hạn</label>
              <select className="h-input">
                <option>Tự động hủy đơn &amp; giải phóng ghế</option>
                <option>Thông báo người dùng + gia hạn 1 lần</option>
              </select>
            </div>
            <div className="val-help" style={{ marginTop: 12 }}>
              🌸 Lời khuyên từ Tickie: Giữ vé 8—12 phút là cân bằng tốt giữa UX và tránh giữ chỗ ảo.
            </div>
            {isNew && (
              <button className="h-btn primary sm" style={{ marginTop: 16, width: "100%" }} onClick={() => setTab("publish")}>Tiếp theo: Kiểm tra →</button>
            )}
          </div>
        </div>
      )}

      {/* ── Publish Tab ── */}
      {tab === "publish" && !published && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div className="chart-card">
            <div className="ed-h">Kiểm tra trước khi publish</div>
            <div className="val-list">
              {validations.map((v, i) => (
                <div key={i} className="val-row">
                  <div className={`val-ico ${v.ok ? "ok" : v.warn ? "warn" : "err"}`}>{v.ok ? "✓" : v.warn ? "!" : "✕"}</div>
                  <div className="val-text">
                    {v.text}
                    {!v.ok && !v.warn && (
                      <span
                        style={{ marginLeft: 8, fontSize: 12, color: "var(--pink-deep)", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => {
                          if (i <= 1) setTab("info");
                          else if (i <= 4) setTab("layout");
                          else setTab("pricing");
                        }}
                      >
                        → Sửa
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errs > 0 && (
              <div className="val-help" style={{ background: "var(--pink-soft)", borderColor: "var(--pink)", color: "var(--pink-deep)" }}>
                ❌ {errs} mục bắt buộc chưa hoàn thành
              </div>
            )}
            {errs === 0 && (
              <div className="val-help" style={{ background: "var(--mint-soft)", borderColor: "var(--mint)", color: "var(--mint-deep)" }}>
                ✅ Sẵn sàng publish! Lưu nháp trước nếu cần kiểm tra lại.
              </div>
            )}
          </div>

          <div className="chart-card" style={{ textAlign: "center" }}>
            <Tickie size={120} mood={errs > 0 ? "sad" : "party"} color={errs > 0 ? "#FFAB91" : "#9EE6CF"} />
            <h3 style={{ fontSize: 24, marginTop: 10 }}>
              {errs > 0 ? "Chưa sẵn sàng" : "Gần xong rồi! 🎉"}
            </h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "6px 0 16px" }}>
              {errs > 0
                ? `${errs} mục bắt buộc cần điền đầy đủ`
                : "Tất cả ổn! Nhấn Publish để mở bán vé."}
            </p>
            <button className="h-btn" style={{ width: "100%", marginBottom: 8 }} onClick={saveDraft}>
              💾 Lưu nháp {saved && "✓"}
            </button>
            <button
              className="h-btn primary"
              style={{ width: "100%" }}
              disabled={errs > 0}
              onClick={() => {
                publishToStore(info, zones);
                lsDel(storageKey);
                setSaved(false);
                setPublished(true);
              }}
            >
              🚀 Publish sự kiện
            </button>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 8 }}>
              Vé sẽ mở bán ngay sau khi publish
            </div>
          </div>
        </div>
      )}

      {/* ── Published Success Screen ── */}
      {tab === "publish" && published && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "24px 0" }}>
          {/* Confetti banner */}
          <div style={{
            width: "100%", maxWidth: 600, borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, #9EE6CF 0%, #C4B5FB 50%, #FF8FA8 100%)",
            border: "2px solid var(--ink)", boxShadow: "4px 4px 0 var(--ink)",
            padding: "36px 24px", textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -8, right: 16, transform: "rotate(12deg)" }}>
              <Tickie size={96} mood="party" color="#fff" />
            </div>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontFamily: "var(--font-display)", color: "var(--ink)", marginBottom: 4 }}>
              Sự kiện đã được publish!
            </h2>
            <div style={{ fontSize: 15, color: "var(--ink-soft)", fontWeight: 600 }}>
              {info.titleVi || "Sự kiện của bạn"}
            </div>
          </div>

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", maxWidth: 600 }}>
            {[
              { label: "Địa điểm", value: info.venue || "—" },
              { label: "Khu vực", value: `${zones.length} khu` },
              { label: "Tổng sức chứa", value: zones.reduce((s, z) => s + z.capacity, 0).toLocaleString("vi-VN") + " chỗ" },
            ].map(s => (
              <div key={s.label} className="chart-card" style={{ textAlign: "center", padding: "14px 10px" }}>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Zone price summary */}
          {zones.length > 0 && (
            <div className="chart-card" style={{ width: "100%", maxWidth: 600 }}>
              <div className="ed-h" style={{ marginTop: 0 }}>Vé đang mở bán</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {zones.map(z => (
                  <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 12, height: 12, background: z.color, border: "1px solid var(--ink)", borderRadius: 3, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 14 }}>{z.name}</span>
                    <span className="h-pill">{z.capacity.toLocaleString("vi-VN")} chỗ</span>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 100, textAlign: "right" }}>
                      {fmtVNDFull(z.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="h-btn primary" onClick={() => go("events")}>
              ← Về danh sách sự kiện
            </button>
            <button className="h-btn ghost" onClick={() => { setPublished(false); setTab("info"); }}>
              Chỉnh sửa tiếp
            </button>
          </div>
        </div>
      )}
    </>
  );
}
