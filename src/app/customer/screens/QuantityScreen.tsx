"use client";
import { useState } from "react";
import { Tickie } from "@/components/Tickie";
import { type Event, type Area, fmtVND, fmtVNDFull } from "@/lib/data";
import type { Screen, NavParams } from "@/store/customerStore";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  event: Event;
  area: Area;
}

export default function QuantityScreen({ go, event, area }: Props) {
  const [qty, setQty] = useState(2);
  const left = area.capacity - area.sold - area.held;
  const total = qty * area.price;
  const reached = qty >= area.maxPerOrder;

  const quickQtys = [1, 2, 3, area.maxPerOrder].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="screen quantity-screen">
      <TopBar
        onBack={() => go("areas", { eventId: event.id })}
        onHome={() => go("home")}
        title={area.nameVi}
        subtitle="Chọn số lượng vé"
        step={2}
        totalSteps={4}
      />

      <div className="standing-hero h-card" style={{ background: area.color }}>
        <div className="sh-inner">
          <div className="sh-mascot">
            <Tickie size={88} color="#fff" mood="party" />
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 4 }}>{area.nameVi}</h2>
          <div style={{ color: "rgba(43,26,46,0.7)", marginBottom: 12 }}>{area.name}</div>
          <div className="sh-stats">
            <div>
              <div className="shs-k">Còn lại</div>
              <div className="shs-v">{left.toLocaleString("vi-VN")}</div>
            </div>
            <div>
              <div className="shs-k">Giá vé</div>
              <div className="shs-v">{fmtVND(area.price)}₫</div>
            </div>
            <div>
              <div className="shs-k">Max/order</div>
              <div className="shs-v">{area.maxPerOrder}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="qty-block h-card">
        <h3 style={{ fontSize: 18, marginBottom: 6 }}>Bạn cần mấy vé? 🙌</h3>
        <p style={{ color: "var(--ink-soft)", margin: "0 0 18px", fontSize: 13 }}>
          Vì đây là khu đứng, hệ thống sẽ cấp <strong>queue number</strong> sau khi thanh toán thành công.
        </p>
        <div className="qty-bigrow">
          <button className="qty-bigbtn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
          <div className="qty-big">{qty}</div>
          <button className="qty-bigbtn" onClick={() => setQty(q => Math.min(area.maxPerOrder, q + 1))}>+</button>
        </div>
        {reached && (
          <div className="warn-row">
            <Tickie size={28} mood="sad" />
            <span>Bạn chỉ có thể mua tối đa <strong>{area.maxPerOrder} vé</strong> cho khu này.</span>
          </div>
        )}
        <div className="quick-qty">
          {quickQtys.map(v => (
            <button key={v} className={`qq ${qty === v ? "on" : ""}`} onClick={() => setQty(v)}>{v} vé</button>
          ))}
        </div>

        <hr className="h-dashed-divider" />

        <div className="qb-summary">
          <div className="qbs-row"><span>Vé Standing · {qty}x</span><span>{fmtVNDFull(qty * area.price)}</span></div>
          <div className="qbs-row faint"><span>Phí dịch vụ</span><span>{fmtVNDFull(30000)}</span></div>
          <div className="qbs-row total"><span>Tạm tính</span><span>{fmtVNDFull(total + 30000)}</span></div>
        </div>
      </div>

      <div className="info-strip">
        <span className="h-pill butter">⏱ Giữ vé 10 phút sau khi tiếp tục</span>
      </div>

      <BottomBar>
        <div className="bb-left">
          <div className="bb-from"><strong>{qty}</strong> vé · <strong>{fmtVNDFull(total)}</strong></div>
          <div className="bb-from-sub">Chưa bao gồm phí dịch vụ</div>
        </div>
        <button
          className="h-btn primary"
          onClick={() => go("checkout", {
            eventId: event.id,
            areaId: area.id,
            items: Array.from({ length: qty }, (_, i) => ({
              id: `q-${i + 1}`,
              label: `${area.queuePrefix || "Q"}-?????`,
              price: area.price,
              standing: true,
            })),
          })}
        >
          Tiếp tục
        </button>
      </BottomBar>
    </div>
  );
}
