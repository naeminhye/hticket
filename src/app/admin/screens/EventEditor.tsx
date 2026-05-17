"use client";
import { useState, useRef } from "react";
import { Tickie } from "@/components/Tickie";
import { ADMIN_EVENTS, fmtVNDFull, fmtVND } from "@/lib/data";
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
};

const INITIAL_ZONES: Zone[] = [
  { id: "vip", name: "VIP A", type: "seating", color: "#FF8FA8", x: 130, y: 80, w: 280, h: 80, capacity: 200, price: 2500000, rows: 10, cols: 20 },
  { id: "std", name: "Standard B", type: "seating", color: "#C4B5FB", x: 60, y: 180, w: 420, h: 110, capacity: 800, price: 1500000, rows: 16, cols: 20 },
  { id: "bal", name: "Balcony", type: "seating", color: "#B8D9FF", x: 60, y: 310, w: 420, h: 60, capacity: 400, price: 950000, rows: 10, cols: 20 },
  { id: "stand-a", name: "Standing A", type: "standing", color: "#FFD56B", x: 60, y: 390, w: 200, h: 80, capacity: 1000, price: 900000 },
  { id: "stand-b", name: "Standing B", type: "standing", color: "#9EE6CF", x: 280, y: 390, w: 200, h: 80, capacity: 1500, price: 700000 },
  { id: "wc", name: "Wheelchair", type: "wheelchair", color: "#5A8FD8", x: 490, y: 320, w: 80, h: 60, capacity: 20, price: 900000 },
  { id: "fan", name: "Fan Zone", type: "standing", color: "#FFAB91", x: 60, y: 490, w: 420, h: 50, capacity: 600, price: 500000 },
];

const VALIDATIONS = [
  { ok: true, text: "Tên, thời gian, địa điểm đã có" },
  { ok: true, text: "Mở bán hợp lệ (15.06.2026 → 14.08.2026)" },
  { ok: true, text: "7 khu vực đã cấu hình" },
  { ok: true, text: "Tất cả khu có giá vé > 0" },
  { ok: false, warn: true, text: "Còn 2 ghế trùng mã ở khu VIP A — cần xử lý" },
  { ok: false, warn: false, text: "Standing B chưa có queue prefix" },
  { ok: true, text: "Sơ đồ đã lưu nháp" },
];

const ZONE_COLORS = ["#FF8FA8", "#C4B5FB", "#B8D9FF", "#FFD56B", "#9EE6CF", "#FFAB91", "#5A8FD8"];

export default function EventEditor({ go, eventId }: Props) {
  const ev = ADMIN_EVENTS.find(e => e.id === eventId) || ADMIN_EVENTS[0];
  const [tab, setTab] = useState<"info" | "layout" | "pricing" | "rules" | "publish">("layout");
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("vip");
  const [tool, setTool] = useState<"select" | "rect" | "row">("select");
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null);

  const selected = zones.find(z => z.id === selectedZoneId);
  const errs = VALIDATIONS.filter(v => !v.ok && !v.warn).length;

  const startDrag = (zone: Zone, e: React.PointerEvent) => {
    e.preventDefault();
    setSelectedZoneId(zone.id);
    if (tool !== "select") return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const offX = e.clientX - rect.left - zone.x;
    const offY = e.clientY - rect.top - zone.y;
    dragRef.current = { id: zone.id, offX, offY };

    const move = (mv: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      const x = mv.clientX - r.left - dragRef.current.offX;
      const y = mv.clientY - r.top - dragRef.current.offY;
      setZones(prev => prev.map(z => z.id === dragRef.current!.id ? { ...z, x: Math.max(0, x), y: Math.max(0, y) } : z));
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const updateZone = (id: string, updates: Partial<Zone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

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
            <span className="cur">{ev.title}</span>
          </div>
          <h1 className="ad-h1" style={{ marginTop: 6 }}>{ev.title}</h1>
          <div className="ad-h1-sub">
            {ev.date} · {ev.venue} · <span className={`ev-status ${ev.status}`} style={{ verticalAlign: "middle" }}>● {ev.status}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="h-btn sm ghost">👁 Preview</button>
          <button className="h-btn sm">💾 Lưu nháp</button>
          <button className="h-btn sm primary">🚀 Publish</button>
        </div>
      </div>

      <div className="chart-tabs" style={{ marginBottom: 16, display: "inline-flex" }}>
        {TABS.map(t => (
          <button key={t.k} className={tab === t.k ? "on" : ""} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {/* Layout tab */}
      {tab === "layout" && (
        <div className="editor-grid">
          {/* Left palette */}
          <div className="ed-side">
            <div className="ed-h">Khu vực</div>
            <p style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 12, marginTop: -6 }}>Kéo từ đây vào sơ đồ · Drag onto canvas</p>
            <div className="tool-list">
              {[
                { color: "#FF8FA8", name: "Seating", emoji: "🪑" },
                { color: "#FFD56B", name: "Standing", emoji: "🕺" },
                { color: "#5A8FD8", name: "Wheelchair", emoji: "♿" },
                { color: "var(--ink)", name: "Stage", emoji: "★" },
                { color: "var(--bg-soft)", name: "Aisle / lối đi", emoji: "↕" },
              ].map(t => (
                <div key={t.name} className="tool">
                  <span className="tool-color" style={{ background: t.color }} />
                  <span className="tool-name">{t.name}</span>
                  <span className="tool-emoji">{t.emoji}</span>
                </div>
              ))}
            </div>

            <div className="ed-h">Đã có trên sơ đồ</div>
            <div className="ed-zone-list">
              {zones.map(z => (
                <div key={z.id} className={`ed-zone ${selectedZoneId === z.id ? "on" : ""}`} onClick={() => setSelectedZoneId(z.id)}>
                  <div className="ez-color" style={{ background: z.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ez-name">{z.name}</div>
                    <div className="ez-sub">{z.capacity} · {fmtVNDFull(z.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="ed-canvas">
            <div className="canvas-toolbar">
              {[
                { id: "select" as const, icon: "⤧", title: "Select" },
                { id: "rect" as const, icon: "▭", title: "Rectangle" },
                { id: "row" as const, icon: "═", title: "Row" },
              ].map(t => (
                <button key={t.id} className={`tb-btn ${tool === t.id ? "on" : ""}`} onClick={() => setTool(t.id)} title={t.title}>{t.icon}</button>
              ))}
              <div className="tb-sep" />
              <button className="tb-btn" title="Undo">↶</button>
              <button className="tb-btn" title="Redo">↷</button>
              <div className="tb-sep" />
              <button className="tb-btn" title="Lock">🔒</button>
              <button className="tb-btn" title="Duplicate">⎘</button>
              <button className="tb-btn" title="Delete">🗑</button>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-faint)" }}>
                <span>📐 Auto-grid</span>
                <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
              </div>
            </div>
            <div className="ed-canvas-inner" ref={canvasRef}>
              <div className="canvas-stage">★ STAGE · SÂN KHẤU ★</div>
              {zones.map(z => (
                <div
                  key={z.id}
                  className={`canvas-zone ${selectedZoneId === z.id ? "selected" : ""}`}
                  style={{ left: z.x, top: z.y, width: z.w, height: z.h, background: z.color }}
                  onPointerDown={e => startDrag(z, e)}
                >
                  <div>
                    <div className="cz-name">{z.name}</div>
                    <div className="cz-stats">
                      {z.type === "seating" ? `${z.rows}r × ${z.cols}` : z.capacity}
                      {" · "}{fmtVND(z.price)}₫
                    </div>
                  </div>
                  {selectedZoneId === z.id && (
                    <>
                      <span className="cz-handle tl" />
                      <span className="cz-handle tr" />
                      <span className="cz-handle bl" />
                      <span className="cz-handle br" />
                    </>
                  )}
                </div>
              ))}
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, color: "var(--ink-faint)", background: "rgba(255,255,255,0.7)", padding: "4px 8px", borderRadius: 6 }}>
                📐 600 × 600 grid · zoom 100%
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
                    <label className="insp-label">Giá vé (₫)</label>
                    <input type="number" value={selected.price} onChange={e => updateZone(selected.id, { price: +e.target.value })} />
                  </div>
                </div>

                {selected.type === "seating" && (
                  <div className="insp-section">
                    <div className="ed-h" style={{ fontSize: 13 }}>Sơ đồ ghế</div>
                    <div className="insp-row2">
                      <div className="insp-field">
                        <label className="insp-label">Số hàng</label>
                        <input type="number" value={selected.rows || 10} onChange={e => updateZone(selected.id, { rows: +e.target.value })} />
                      </div>
                      <div className="insp-field">
                        <label className="insp-label">Ghế / hàng</label>
                        <input type="number" value={selected.cols || 20} onChange={e => updateZone(selected.id, { cols: +e.target.value })} />
                      </div>
                    </div>
                    <div className="insp-row2">
                      <div className="insp-field">
                        <label className="insp-label">Prefix hàng</label>
                        <input placeholder="A, B, C" defaultValue="A" />
                      </div>
                      <div className="insp-field">
                        <label className="insp-label">Bắt đầu từ</label>
                        <input type="number" defaultValue={1} />
                      </div>
                    </div>
                  </div>
                )}

                {selected.type === "standing" && (
                  <div className="insp-section">
                    <div className="ed-h" style={{ fontSize: 13 }}>Queue</div>
                    <div className="insp-row2">
                      <div className="insp-field">
                        <label className="insp-label">Prefix</label>
                        <input placeholder="A, FAN, ST-A" defaultValue={selected.id.toUpperCase().slice(-1)} />
                      </div>
                      <div className="insp-field">
                        <label className="insp-label">Bắt đầu</label>
                        <input type="number" defaultValue={1} />
                      </div>
                    </div>
                    <div className="insp-field">
                      <label className="insp-label">Quy tắc cấp queue</label>
                      <select defaultValue="paid">
                        <option value="paid">Sau khi thanh toán thành công (khuyến nghị)</option>
                        <option value="held">Khi giữ vé</option>
                        <option value="random">Ngẫu nhiên</option>
                      </select>
                    </div>
                  </div>
                )}

                {selected.type === "wheelchair" && (
                  <div className="insp-section">
                    <div className="ed-h" style={{ fontSize: 13 }}>Wheelchair</div>
                    <div className="insp-field">
                      <label className="insp-label">Cho phép vé Companion</label>
                      <label className="switch" style={{ marginTop: 4 }}>
                        <input type="checkbox" defaultChecked /><span />
                      </label>
                    </div>
                    <div className="insp-field">
                      <label className="insp-label">Yêu cầu xác minh</label>
                      <select defaultValue="optional">
                        <option value="off">Không</option>
                        <option value="optional">Tùy chọn</option>
                        <option value="required">Bắt buộc</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="insp-section">
                  <div className="ed-h" style={{ fontSize: 13 }}>Giới hạn</div>
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
                  <label className="insp-label">Màu hiển thị</label>
                  <div className="zone-color-picker">
                    {ZONE_COLORS.map(c => (
                      <button
                        key={c}
                        className={`zcp-swatch ${selected.color === c ? "on" : ""}`}
                        style={{ background: c }}
                        onClick={() => updateZone(selected.id, { color: c })}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "var(--ink-faint)" }}>
                <Tickie size={64} mood="sleep" />
                <div style={{ marginTop: 8 }}>Chọn 1 khu để chỉnh</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div className="chart-card">
            <div className="ed-h">Thông tin cơ bản</div>
            <div className="insp-field"><label className="insp-label">Tên sự kiện · VN</label><input className="h-input" defaultValue={ev.title} /></div>
            <div className="insp-field"><label className="insp-label">Tên sự kiện · EN</label><input className="h-input" defaultValue="Starlight Bloom Festival" /></div>
            <div className="insp-field"><label className="insp-label">Mô tả</label><textarea className="h-input" rows={4} defaultValue="Một đêm hè dưới những bóng đèn pastel, nơi bạn được hát to cùng những bản nhạc indie yêu thích nhất." /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div><label className="insp-label">Bắt đầu</label><input className="h-input" type="datetime-local" defaultValue="2026-08-15T19:00" /></div>
              <div><label className="insp-label">Kết thúc</label><input className="h-input" type="datetime-local" defaultValue="2026-08-15T23:00" /></div>
            </div>
            <div style={{ marginTop: 12 }}><label className="insp-label">Địa điểm</label><input className="h-input" defaultValue="SVĐ Hoa Lư, TP.HCM" /></div>
            <div style={{ marginTop: 12 }}><label className="insp-label">Chính sách vé</label><textarea className="h-input" rows={3} defaultValue="Hoàn vé trong vòng 7 ngày trước sự kiện · Không đổi vé khác sự kiện" /></div>
          </div>
          <div className="chart-card">
            <div className="ed-h">Banner / Poster</div>
            <div style={{ aspectRatio: "1/1", borderRadius: 14, background: `linear-gradient(135deg, ${ev.cover}, ${ev.cover2})`, border: "2px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 12, right: 12, transform: "rotate(-6deg)" }}>
                <Tickie size={80} color="#fff" mood="party" />
              </div>
              <div style={{ position: "absolute", top: 12, left: 12, color: "#fff", fontWeight: 800, fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1, textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}>
                STARLIGHT<br />BLOOM ✦
              </div>
            </div>
            <button className="h-btn ghost sm" style={{ width: "100%", marginTop: 10 }}>📤 Đổi banner</button>
          </div>
        </div>
      )}

      {tab === "pricing" && (
        <div className="chart-card">
          <div className="ed-h">Bảng giá theo khu</div>
          <div className="ev-table" style={{ border: "none", marginTop: 0 }}>
            <div className="ev-row header" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
              <div>Khu</div><div>Loại</div><div>Sức chứa</div><div>Giá thường</div><div>Early bird (-15%)</div>
            </div>
            {zones.map(z => (
              <div key={z.id} className="ev-row body" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: z.color, borderRadius: 3, border: "1px solid var(--ink)", flexShrink: 0 }} />
                  {z.name}
                </div>
                <div>{z.type}</div>
                <div style={{ fontFamily: "var(--font-mono)" }}>{z.capacity}</div>
                <div><input className="h-input" style={{ padding: "6px 10px", fontSize: 13 }} defaultValue={fmtVNDFull(z.price)} /></div>
                <div><input className="h-input" style={{ padding: "6px 10px", fontSize: 13 }} defaultValue={fmtVNDFull(Math.floor(z.price * 0.85))} /></div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <span className="h-pill">Early bird: 15.06 → 30.06</span>
            <span className="h-pill mint">Normal: 01.07 → 14.08</span>
            <span className="h-pill butter">Last minute: 15.08</span>
          </div>
        </div>
      )}

      {tab === "rules" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="chart-card">
            <div className="ed-h">Giới hạn mua vé</div>
            <div className="insp-field"><label className="insp-label">Tối đa mỗi người (cả sự kiện)</label><input className="h-input" type="number" defaultValue={4} /></div>
            <div className="insp-field"><label className="insp-label">Tối đa mỗi đơn hàng</label><input className="h-input" type="number" defaultValue={6} /></div>
            <div className="insp-field">
              <label className="insp-label">Cách xác định &ldquo;một người&rdquo;</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {["Tài khoản người dùng", "Số điện thoại", "Email", "CCCD/Passport", "Phương thức thanh toán"].map(l => (
                  <label key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <input type="checkbox" defaultChecked={l !== "CCCD/Passport"} style={{ accentColor: "var(--pink)" }} /> {l}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-card">
            <div className="ed-h">Giữ vé tạm thời</div>
            <div className="insp-field"><label className="insp-label">Thời gian giữ vé (phút)</label><input className="h-input" type="number" defaultValue={10} /></div>
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
          </div>
        </div>
      )}

      {tab === "publish" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div className="chart-card">
            <div className="ed-h">Kiểm tra trước khi publish</div>
            <div className="val-list">
              {VALIDATIONS.map((v, i) => (
                <div key={i} className="val-row">
                  <div className={`val-ico ${v.ok ? "ok" : v.warn ? "warn" : "err"}`}>{v.ok ? "✓" : v.warn ? "!" : "✕"}</div>
                  <div className="val-text">{v.text}</div>
                </div>
              ))}
            </div>
            {errs > 0 && (
              <div className="val-help" style={{ background: "var(--pink-soft)", borderColor: "var(--pink)", color: "var(--pink-deep)" }}>
                ❌ {errs} lỗi cần xử lý trước khi publish
              </div>
            )}
          </div>
          <div className="chart-card" style={{ textAlign: "center" }}>
            <Tickie size={120} mood={errs > 0 ? "sad" : "party"} color={errs > 0 ? "#FFAB91" : "#9EE6CF"} />
            <h3 style={{ fontSize: 24, marginTop: 10 }}>{errs > 0 ? "Chưa sẵn sàng" : "Gần xong rồi!"}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "6px 0 16px" }}>
              {errs > 0 ? `${errs} lỗi nghiêm trọng cần xử lý` : "Sửa cảnh báo (nếu có) và publish khi sẵn sàng"}
            </p>
            <button className="h-btn primary" style={{ width: "100%" }} disabled={errs > 0}>
              🚀 Publish sự kiện
            </button>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 8 }}>Vé sẽ mở bán theo lịch đã cấu hình</div>
          </div>
        </div>
      )}
    </>
  );
}
