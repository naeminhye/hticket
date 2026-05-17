"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./screens/Dashboard";
import EventsList from "./screens/EventsList";
import EventEditor from "./screens/EventEditor";
import OrdersScreen from "./screens/OrdersScreen";
import PlaceholderScreen from "./screens/PlaceholderScreen";

export type AdminScreen = "dashboard" | "events" | "editor" | "orders" | "attendees" | "checkin" | "promo" | "report" | "team" | "settings";
export type AdminParams = { eventId?: string };

export default function AdminApp() {
  const [screen, setScreen] = useState<AdminScreen>("dashboard");
  const [params, setParams] = useState<AdminParams>({});

  const go = (s: AdminScreen, p: AdminParams = {}) => {
    setScreen(s);
    setParams(p);
  };

  return (
    <div className="admin-layout">
      <Sidebar current={screen} go={go} />
      <main className="ad-main">
        {screen === "dashboard" && <Dashboard go={go} />}
        {screen === "events" && <EventsList go={go} />}
        {screen === "editor" && <EventEditor go={go} eventId={params.eventId || "starlight-2026"} />}
        {screen === "orders" && <OrdersScreen />}
        {screen === "attendees" && <PlaceholderScreen title="Khán giả · Attendees" sub="Quản lý danh sách khán giả" mascot="wink" />}
        {screen === "checkin" && <PlaceholderScreen title="Check-in" sub="Quét QR tại cổng vào" mascot="happy" />}
        {screen === "promo" && <PlaceholderScreen title="Khuyến mãi · Promo" sub="Tạo mã giảm giá và chương trình ưu đãi" mascot="party" />}
        {screen === "report" && <PlaceholderScreen title="Báo cáo · Reports" sub="Thống kê chi tiết và xuất dữ liệu" mascot="sleep" />}
        {screen === "team" && <PlaceholderScreen title="Phân quyền · Team" sub="Quản lý thành viên và quyền hạn" mascot="wink" />}
        {screen === "settings" && <PlaceholderScreen title="Cài đặt · Settings" sub="Cấu hình hệ thống và tài khoản" mascot="happy" />}
      </main>
    </div>
  );
}
