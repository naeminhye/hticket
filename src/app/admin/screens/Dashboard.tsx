"use client";
import { Tickie } from "@/components/Tickie";
import { ADMIN_EVENTS, fmtVNDFull } from "@/lib/data";
import type { AdminScreen, AdminParams } from "../AdminApp";

interface Props {
  go: (screen: AdminScreen, params?: AdminParams) => void;
}

const KPIs = [
  { tag: "Doanh thu hôm nay", val: "12.4 tr₫", sub: "+18%", trend: "up" as const, color: "var(--mint-soft)", emoji: "💰" },
  { tag: "Vé đã bán", val: "342", sub: "+12% vs hôm qua", trend: "up" as const, color: "var(--pink-soft)", emoji: "🎫" },
  { tag: "Đơn đang giữ", val: "28", sub: "Chờ thanh toán", trend: "" as const, color: "var(--butter-soft)", emoji: "⏳" },
  { tag: "Tỷ lệ chuyển đổi", val: "73%", sub: "+5% tuần này", trend: "up" as const, color: "var(--sky-soft)", emoji: "✨" },
];

export default function Dashboard({ go }: Props) {
  return (
    <>
      <h1 className="ad-h1">Chào buổi chiều, Mây ☀️</h1>
      <div className="ad-h1-sub">Đây là tình hình bán vé của bạn hôm nay · Here&rsquo;s how your events are doing today.</div>

      <div className="kpi-grid">
        {KPIs.map((k, i) => (
          <div key={i} className="kpi">
            <div className="k-tag">
              <span className="k-ico" style={{ background: k.color }}>{k.emoji}</span>
              {k.tag}
            </div>
            <div className="k-val">{k.val}</div>
            <div className="k-sub">
              {k.trend ? (
                <span className={`k-trend ${k.trend}`}>{k.trend === "up" ? "↗" : "↘"} {k.sub}</span>
              ) : (
                <span>{k.sub}</span>
              )}
            </div>
            <svg className="k-spark" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path
                d={i === 2 ? "M0 20 L20 18 L40 22 L60 16 L80 24 L100 18" : "M0 30 L20 25 L40 28 L60 18 L80 12 L100 8"}
                stroke={i === 2 ? "var(--butter-deep)" : "var(--mint-deep)"}
                strokeWidth="2" fill="none"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="cc-h">
            <div>
              <h3>Bán vé 7 ngày qua</h3>
              <div className="cc-h-sub">Tickets sold · last 7 days</div>
            </div>
            <div className="chart-tabs">
              <button className="on">7d</button>
              <button>30d</button>
              <button>YTD</button>
            </div>
          </div>
          <div className="chart-svg-wrap">
            <svg viewBox="0 0 700 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#FF8FA8" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#FF8FA8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#9EE6CF" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#9EE6CF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" x2="700" y1={40 + i * 45} y2={40 + i * 45} stroke="var(--border)" strokeDasharray="2 3" />
              ))}
              <path d="M40 160 L140 130 L240 100 L340 80 L440 90 L540 60 L640 50 L640 200 L40 200 Z" fill="url(#g1)" />
              <path d="M40 160 L140 130 L240 100 L340 80 L440 90 L540 60 L640 50" stroke="#FF8FA8" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M40 180 L140 170 L240 155 L340 145 L440 140 L540 125 L640 110 L640 200 L40 200 Z" fill="url(#g2)" />
              <path d="M40 180 L140 170 L240 155 L340 145 L440 140 L540 125 L640 110" stroke="#4FB594" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {[40, 140, 240, 340, 440, 540, 640].map((x, i) => (
                <circle key={i} cx={x} cy={[160, 130, 100, 80, 90, 60, 50][i]} r="5" fill="#fff" stroke="#FF8FA8" strokeWidth="3" />
              ))}
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                <text key={i} x={[40, 140, 240, 340, 440, 540, 640][i]} y={215} fontSize="11" fill="#9C8A9F" textAnchor="middle" fontFamily="Plus Jakarta Sans">{d}</text>
              ))}
            </svg>
          </div>
          <div className="chart-legend">
            <span><span className="dot" style={{ background: "#FF8FA8" }} />Vé đã bán</span>
            <span><span className="dot" style={{ background: "#9EE6CF" }} />Đơn mới</span>
          </div>
        </div>

        <div className="area-donut-card">
          <div className="cc-h">
            <div>
              <h3>Phân bố khu vực</h3>
              <div className="cc-h-sub">Starlight Bloom · By zone</div>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: "conic-gradient(#FF8FA8 0 60deg, #C4B5FB 60deg 160deg, #B8D9FF 160deg 220deg, #FFD56B 220deg 300deg, #9EE6CF 300deg 360deg)" }}>
              <div className="donut-inner">
                <div className="v">63%</div>
                <div className="l">Sold</div>
              </div>
            </div>
          </div>
          <div className="donut-legend">
            {[
              { c: "#FF8FA8", l: "VIP", v: "142/200" },
              { c: "#C4B5FB", l: "Standard", v: "420/800" },
              { c: "#B8D9FF", l: "Balcony", v: "280/400" },
              { c: "#FFD56B", l: "Standing A", v: "720/1000" },
              { c: "#9EE6CF", l: "Standing B", v: "980/1500" },
            ].map(d => (
              <div key={d.l}>
                <span className="dl-l"><span className="dot" style={{ background: d.c }} />{d.l}</span>
                <span style={{ color: "var(--ink-soft)" }}>{d.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="cc-h">
          <div>
            <h3>Sự kiện sắp tới</h3>
            <div className="cc-h-sub">Upcoming events</div>
          </div>
          <button className="h-btn sm" onClick={() => go("events")}>Xem tất cả →</button>
        </div>
        <div className="ev-table" style={{ border: "none", marginTop: 0 }}>
          <div className="ev-row header">
            <div>Sự kiện</div>
            <div>Tỷ lệ lấp đầy</div>
            <div>Doanh thu</div>
            <div>Trạng thái</div>
            <div></div>
          </div>
          {ADMIN_EVENTS.filter(e => e.status === "open").map(e => {
            const ratio = e.sold / e.capacity;
            return (
              <div key={e.id} className="ev-row body">
                <div className="ev-name-cell">
                  <div className="ev-name-cover" style={{ background: `linear-gradient(135deg, ${e.cover}, ${e.cover2})` }}>
                    <div style={{ position: "absolute", bottom: -2, right: -2 }}><Tickie size={24} color="#fff" /></div>
                  </div>
                  <div className="ev-name-info">
                    <div className="ev-name-title">{e.title}</div>
                    <div className="ev-name-sub">{e.date} · {e.venue}</div>
                  </div>
                </div>
                <div>
                  <div className="ev-progress"><div style={{ width: `${ratio * 100}%`, background: e.cover }} /></div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{e.sold.toLocaleString("vi-VN")} / {e.capacity.toLocaleString("vi-VN")} ({Math.round(ratio * 100)}%)</div>
                </div>
                <div style={{ fontWeight: 700 }}>{(e.revenue / 1000000).toFixed(1)}tr₫</div>
                <div><span className={`ev-status ${e.status}`}>● Open</span></div>
                <button className="h-btn sm ghost" onClick={() => go("editor", { eventId: e.id })}>Mở →</button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
