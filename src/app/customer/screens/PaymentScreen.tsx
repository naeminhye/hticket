"use client";
import { useState, useEffect } from "react";
import { Tickie } from "@/components/Tickie";
import { type Event, type Area, type TicketItem, fmtVNDFull } from "@/lib/data";
import { useEventStore } from "@/store/eventStore";
import type { Screen, NavParams } from "@/store/customerStore";
import TopBar from "../components/TopBar";

interface Props {
  go: (screen: Screen, params?: NavParams) => void;
  event: Event;
  area: Area;
  items: TicketItem[];
}

const METHODS = [
  { id: "momo", name: "Ví MoMo", desc: "Quét QR · Trừ trực tiếp", color: "#A50064", emoji: "💖" },
  { id: "vnpay", name: "VNPay QR", desc: "Hỗ trợ mọi ngân hàng", color: "#005BAA", emoji: "🏦" },
  { id: "visa", name: "Visa / Mastercard", desc: "Quốc tế · 3D Secure", color: "#1A1F71", emoji: "💳" },
  { id: "zalo", name: "ZaloPay", desc: "Cashback 10k đơn đầu", color: "#0068FF", emoji: "💙" },
] as const;

function QRGrid({ color }: { color: string }) {
  const cells = Array.from({ length: 144 }, (_, i) => (i * 7 + 13) % 17 > 7);
  return (
    <div className="qr-art" style={{ background: color }}>
      <div className="qr-grid">
        {cells.map((filled, i) => (
          <span key={i} style={{ background: filled ? "#fff" : "transparent" }} />
        ))}
      </div>
      <div className="qr-center">
        <Tickie size={36} color={color} />
      </div>
    </div>
  );
}

export default function PaymentScreen({ go, event, area, items }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [method, setMethod] = useState<"momo" | "vnpay" | "visa" | "zalo">("momo");
  const [processing, setProcessing] = useState(false);
  const { recordPurchase } = useEventStore();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const ratio = secondsLeft / (10 * 60);
  const danger = secondsLeft < 60;
  const subtotal = items.reduce((s, x) => s + x.price, 0);
  const fee = 30000;
  const total = subtotal + fee;

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      recordPurchase(event.id, items);
      setProcessing(false);
      go("ticket", { eventId: event.id, areaId: area.id, items });
    }, 1800);
  };

  const ringColor = danger ? "var(--pink-deep)" : "var(--mint-deep)";

  return (
    <div className="screen payment-screen">
      <TopBar
        onBack={() => go("checkout", { eventId: event.id, areaId: area.id, items })}
        onHome={() => go("home")}
        title="Thanh toán"
        subtitle="Payment"
        step={4}
        totalSteps={4}
      />

      {/* Hold timer */}
      <div className={`hold-timer ${danger ? "danger" : ""}`}>
        <div className="ht-mascot">
          <Tickie size={56} mood={danger ? "sad" : "happy"} color={danger ? "#FFAB91" : "#FFD56B"} />
        </div>
        <div className="ht-body">
          <div className="ht-label">Vé của bạn được giữ trong</div>
          <div className="ht-time">
            <span>{mm}</span><span className="colon">:</span><span>{ss}</span>
          </div>
          <div className="ht-sub">{danger ? "Nhanh lên nào! · Hurry!" : "We're holding your seats — pay before time runs out"}</div>
        </div>
        <div className="ht-ring" style={{ background: `conic-gradient(${ringColor} 0 ${ratio * 360}deg, var(--bg-soft) 0)` }}>
          <div className="ht-ring-inner">{Math.ceil(ratio * 100)}%</div>
        </div>
      </div>

      <div className="pay-grid">
        <div className="pay-main">
          <h3 style={{ marginBottom: 12, fontSize: 18 }}>Chọn phương thức thanh toán</h3>
          <div className="method-list">
            {METHODS.map(m => (
              <button key={m.id} className={`method ${method === m.id ? "on" : ""}`} onClick={() => setMethod(m.id)}>
                <div className="m-emoji" style={{ background: m.color, color: "#fff" }}>{m.emoji}</div>
                <div className="m-body">
                  <div className="m-name">{m.name}</div>
                  <div className="m-desc">{m.desc}</div>
                </div>
                <div className={`radio ${method === m.id ? "on" : ""}`}>
                  {method === m.id && <div />}
                </div>
              </button>
            ))}
          </div>

          {(method === "momo" || method === "vnpay" || method === "zalo") && (
            <div className="qr-frame">
              <QRGrid color={method === "momo" ? "#A50064" : method === "vnpay" ? "#005BAA" : "#0068FF"} />
              <div className="qr-instr">
                <strong>
                  {method === "momo" ? "Mở app MoMo để quét QR" :
                    method === "vnpay" ? "Quét QR bằng app ngân hàng" :
                      "Quét QR bằng app ZaloPay"}
                </strong>
                {method === "momo" && (
                  <ol>
                    <li>Mở app MoMo trên điện thoại</li>
                    <li>Chọn &ldquo;Quét mã QR&rdquo;</li>
                    <li>Xác nhận thanh toán {fmtVNDFull(total)}</li>
                  </ol>
                )}
                {(method === "vnpay" || method === "zalo") && (
                  <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>Quét mã trên rồi xác nhận trên app.</p>
                )}
              </div>
            </div>
          )}

          {method === "visa" && (
            <div className="card-form h-card">
              <div className="cf-row">
                <label className="h-label">Số thẻ</label>
                <input className="h-input" placeholder="4242 4242 4242 4242" />
              </div>
              <div className="cf-row2">
                <div>
                  <label className="h-label">Hết hạn</label>
                  <input className="h-input" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="h-label">CVV</label>
                  <input className="h-input" placeholder="123" />
                </div>
              </div>
              <div>
                <label className="h-label">Chủ thẻ</label>
                <input className="h-input" placeholder="NGUYEN HOANG MAY" />
              </div>
            </div>
          )}
        </div>

        <div className="pay-side">
          <div className="h-card pay-summary">
            <div className="ps-event-row">
              <div className="ps-cover" style={{ background: `linear-gradient(135deg, ${event.cover}, ${event.cover2})` }} />
              <div>
                <div className="ps-title">{event.title}</div>
                <div className="ps-sub">{event.date}</div>
              </div>
            </div>
            <hr className="h-dashed-divider" />
            <div className="ps-row"><span>{area.nameVi} × {items.length}</span><span>{fmtVNDFull(subtotal)}</span></div>
            <div className="ps-row faint"><span>Phí dịch vụ</span><span>{fmtVNDFull(fee)}</span></div>
            <div className="ps-row total"><span>Cần thanh toán</span><span>{fmtVNDFull(total)}</span></div>

            <button
              className="h-btn primary"
              style={{ width: "100%", marginTop: 16, padding: "14px 20px", fontSize: 16 }}
              onClick={pay}
              disabled={processing || secondsLeft <= 0}
            >
              {processing ? (
                <><span className="spinner" /> Đang xử lý…</>
              ) : (
                <>🔒 Thanh toán {fmtVNDFull(total)}</>
              )}
            </button>
            <div className="ps-secure">🔐 Thanh toán an toàn · 256-bit SSL · PCI-DSS</div>
          </div>
          <div className="trust-row">
            <span className="h-pill">↩ Hoàn 100% nếu sự kiện huỷ</span>
            <span className="h-pill">📞 Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
