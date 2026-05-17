"use client";
import { Tickie } from "@/components/Tickie";
import type { AdminScreen } from "../AdminApp";

interface Props {
  current: AdminScreen;
  go: (screen: AdminScreen) => void;
}

const NAV_SECTIONS = [
  {
    sec: "Workspace",
    items: [
      { id: "dashboard" as const, label: "Dashboard", emoji: "📊" },
      { id: "events" as const, label: "Sự kiện", emoji: "🎤" },
    ],
  },
  {
    sec: "Bán vé",
    items: [
      { id: "orders" as const, label: "Đơn hàng", emoji: "🧾" },
      { id: "attendees" as const, label: "Khán giả", emoji: "👥" },
      { id: "checkin" as const, label: "Check-in", emoji: "📲" },
    ],
  },
  {
    sec: "Hệ thống",
    items: [
      { id: "promo" as const, label: "Khuyến mãi", emoji: "💝" },
      { id: "report" as const, label: "Báo cáo", emoji: "📈" },
      { id: "team" as const, label: "Phân quyền", emoji: "🔐" },
      { id: "settings" as const, label: "Cài đặt", emoji: "⚙️" },
    ],
  },
];

export default function Sidebar({ current, go }: Props) {
  return (
    <aside className="ad-side">
      <a className="ad-brand" href="/">
        <div className="ad-brand-mark">
          <Tickie size={28} mood="wink" color="#FF8FA8" />
        </div>
        <div className="ad-brand-text">
          <div className="ad-brand-name">HTicket•</div>
          <div className="ad-brand-role">ADMIN</div>
        </div>
      </a>

      {NAV_SECTIONS.map(section => (
        <div key={section.sec}>
          <div className="ad-nav-section">{section.sec}</div>
          {section.items.map(item => (
            <button
              key={item.id}
              className={`ad-nav-item ${current === item.id ? "on" : ""}`}
              onClick={() => go(item.id)}
            >
              <span className="ad-nav-ico">{item.emoji}</span>
              <span className="ad-nav-label-text">{item.label}</span>
            </button>
          ))}
        </div>
      ))}

      <div className="ad-side-foot">
        <div className="ad-user-avatar">MH</div>
        <div style={{ minWidth: 0 }}>
          <div className="ad-user-name">Mây Hoàng</div>
          <div className="ad-user-role">Event Admin · HTicket</div>
        </div>
      </div>
    </aside>
  );
}
