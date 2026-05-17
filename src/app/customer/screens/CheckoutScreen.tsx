"use client";
import { useState } from "react";
import { Tickie } from "@/components/Tickie";
import { type Event, type Area, type TicketItem, fmtVNDFull } from "@/lib/data";
import type { Screen, NavParams } from "@/store/customerStore";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  event: Event;
  area: Area;
  items: TicketItem[];
}

type Buyer = { name: string; phone: string; email: string; id?: string; vat?: boolean };

export default function CheckoutScreen({ go, event, area, items }: Props) {
  const [buyer, setBuyer] = useState<Buyer>({ name: "", phone: "", email: "" });
  const subtotal = items.reduce((s, x) => s + x.price, 0);
  const fee = 30000;
  const update = (k: keyof Buyer, v: string | boolean) => setBuyer(b => ({ ...b, [k]: v }));
  const valid = buyer.name && buyer.email && buyer.phone;

  return (
    <div className="screen checkout-screen">
      <TopBar
        onBack={() => go(area.type === "seating" ? "seats" : "quantity", { eventId: event.id, areaId: area.id })}
        onHome={() => go("home")}
        title="Thông tin người mua"
        subtitle="Buyer info"
        step={3}
        totalSteps={4}
      />

      <div className="co-grid">
        <div className="co-main">
          {/* Recipient */}
          <div className="h-card co-section">
            <div className="co-h">
              <h3>Người nhận vé · Recipient</h3>
              <span className="h-pill mint">Bắt buộc</span>
            </div>
            <div className="form-grid">
              <div>
                <label className="h-label">Họ và tên</label>
                <input className="h-input" placeholder="Nguyễn Hoàng Mây" value={buyer.name} onChange={e => update("name", e.target.value)} />
              </div>
              <div>
                <label className="h-label">Số điện thoại</label>
                <input className="h-input" placeholder="09xx xxx xxx" value={buyer.phone} onChange={e => update("phone", e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="h-label">Email · để gửi e-ticket</label>
                <input className="h-input" type="email" placeholder="may@example.com" value={buyer.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div>
                <label className="h-label">CCCD / Passport <span style={{ color: "var(--ink-faint)", textTransform: "none" }}>(nếu cần)</span></label>
                <input className="h-input" placeholder="0123 456 789" value={buyer.id || ""} onChange={e => update("id", e.target.value)} />
              </div>
              <div>
                <label className="h-label">Mã giảm giá</label>
                <input className="h-input" placeholder="HTICKETLOVE" />
              </div>
            </div>
          </div>

          {/* VAT */}
          <div className="h-card co-section">
            <div className="co-h">
              <h3>Hoá đơn VAT · VAT invoice</h3>
              <label className="switch">
                <input type="checkbox" checked={!!buyer.vat} onChange={e => update("vat", e.target.checked)} />
                <span />
              </label>
            </div>
            {buyer.vat && (
              <div className="form-grid">
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="h-label">Tên công ty</label>
                  <input className="h-input" placeholder="Công ty TNHH Bánh Mì Vui Vẻ" />
                </div>
                <div>
                  <label className="h-label">Mã số thuế</label>
                  <input className="h-input" placeholder="0123456789" />
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="h-card co-section">
            <div className="co-h">
              <h3>Đồng ý điều khoản · Terms</h3>
            </div>
            <label className="check-row">
              <input type="checkbox" defaultChecked />
              <span>Tôi đã đọc và đồng ý <a href="#">chính sách hoàn vé</a> và <a href="#">điều kiện check-in</a>.</span>
            </label>
            <label className="check-row">
              <input type="checkbox" defaultChecked />
              <span>Nhận thông báo về sự kiện qua email &amp; SMS.</span>
            </label>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="co-side">
          <div className="h-card co-summary">
            <div className="cos-event">
              <div className="cos-cover" style={{ background: `linear-gradient(135deg, ${event.cover}, ${event.cover2})`, position: "relative" }}>
                <div style={{ position: "absolute", right: 6, bottom: 6 }}>
                  <Tickie size={28} color="#fff" />
                </div>
              </div>
              <div>
                <div className="cos-title">{event.title}</div>
                <div className="cos-sub">{event.date}</div>
                <div className="cos-sub">📍 {event.venue}</div>
              </div>
            </div>

            <hr className="h-dashed-divider" />

            <div className="cos-area">
              <span className="cos-tag" style={{ background: area.color }} />
              <div>
                <div style={{ fontWeight: 700 }}>{area.nameVi}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{area.name}</div>
              </div>
            </div>

            <div className="cos-items">
              {items.map((it, i) => (
                <div key={i} className="cos-item">
                  <span>{it.standing ? `Queue ${it.label}` : `Ghế ${it.label}`}</span>
                  <span>{fmtVNDFull(it.price)}</span>
                </div>
              ))}
            </div>

            <hr className="h-dashed-divider" />

            <div className="cos-row"><span>Tạm tính</span><span>{fmtVNDFull(subtotal)}</span></div>
            <div className="cos-row faint"><span>Phí dịch vụ</span><span>{fmtVNDFull(fee)}</span></div>
            <div className="cos-row total"><span>Tổng cộng</span><span>{fmtVNDFull(subtotal + fee)}</span></div>

            <div className="cos-hold">
              <Tickie size={36} mood="happy" />
              <div>
                <strong>Vé được giữ tạm trong 10 phút</strong>
                <div>Tickets are held for 10 min while you check out</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <div className="bb-left">
          <div className="bb-from">Tổng <strong>{fmtVNDFull(subtotal + fee)}</strong></div>
          <div className="bb-from-sub">{items.length} vé · {area.nameVi}</div>
        </div>
        <button
          className="h-btn primary"
          disabled={!valid}
          onClick={() => go("payment", { eventId: event.id, areaId: area.id, items })}
        >
          Đến thanh toán
        </button>
      </BottomBar>
    </div>
  );
}
