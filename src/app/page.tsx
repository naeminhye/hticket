import Link from "next/link";
import { Tickie, Squiggle, Sparkle, Star } from "@/components/Tickie";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,143,168,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(158,230,207,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "30%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,213,107,0.14) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ink)" }}>
              <Tickie size={38} mood="happy" color="#FF8FA8" />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
              HTicket<span style={{ color: "var(--ink-faint)" }}>•</span>
            </div>
          </div>
          <span className="h-pill">Prototype demo</span>
        </div>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 48, alignItems: "center", padding: "64px 0 48px", minHeight: "60vh" }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(40px, 6vw, 72px)",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              marginBottom: 24,
              color: "var(--ink)",
            }}>
              Vé sự kiện,{" "}
              <span style={{ display: "inline-block", background: "var(--butter)", padding: "2px 12px", borderRadius: 10, transform: "rotate(-2deg)", transformOrigin: "center" }}>
                đơn giản
              </span>{" "}
              hơn bao giờ hết.
            </h1>
            <p style={{ fontSize: 18, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
              HTicket giúp bạn mua và quản lý vé concert, festival, workshop — nhanh chóng, an toàn, và thật đáng yêu.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <span className="h-pill mint">🎤 Concert & Festival</span>
              <span className="h-pill butter">🧋 Workshop</span>
              <span className="h-pill sky">🎫 E-Ticket QR</span>
              <span className="h-pill grape">♿ Accessible</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: 320 }}>
            {/* Spinning ring */}
            <div style={{
              position: "absolute", width: 260, height: 260,
              borderRadius: "50%",
              border: "2px dashed var(--border-strong)",
              animation: "spin-slow 20s linear infinite",
            }} />
            <div className="float">
              <Tickie size={200} mood="party" color="#FF8FA8" />
            </div>
            <Sparkle size={28} color="#FFD56B" style={{ position: "absolute", top: 20, right: 40 }} />
            <Star size={22} color="#9EE6CF" style={{ position: "absolute", top: 60, left: 10, transform: "rotate(-15deg)" }} />
            <Squiggle color="#C4B5FB" style={{ position: "absolute", bottom: 40, right: 20 }} />
            <Sparkle size={16} color="#FF8FA8" style={{ position: "absolute", bottom: 20, left: 40 }} />
          </div>
        </div>

        {/* Path cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 48 }}>
          {/* Customer card */}
          <Link
            href="/customer"
            style={{
              display: "block",
              background: "var(--pink-soft)",
              border: "2px solid var(--ink)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              textDecoration: "none",
              boxShadow: "6px 6px 0 var(--ink)",
              transition: "transform 0.15s, box-shadow 0.15s",
              position: "relative",
              overflow: "hidden",
            }}
            className="path-card"
          >
            <div style={{ position: "absolute", bottom: -20, right: -20, transform: "rotate(12deg)" }}>
              <Tickie size={120} mood="happy" color="#FF8FA8" />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-soft)", marginBottom: 10 }}>
              FOR FANS · CHO KHÁN GIẢ
            </div>
            <h3 style={{ fontSize: "clamp(22px, 3vw, 32px)", marginBottom: 16, color: "var(--ink)" }}>
              Mua vé ngay hôm nay 🎟
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--ink-soft)" }}>
              <li>✓ Tìm kiếm &amp; khám phá sự kiện</li>
              <li>✓ Chọn ghế hoặc khu đứng</li>
              <li>✓ Thanh toán MoMo / VNPay / Visa</li>
              <li>✓ E-ticket QR gửi qua email</li>
            </ul>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>
              Vào mua vé
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>→</span>
            </div>
          </Link>

          {/* Admin card */}
          <Link
            href="/admin"
            style={{
              display: "block",
              background: "var(--mint-soft)",
              border: "2px solid var(--ink)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              textDecoration: "none",
              boxShadow: "6px 6px 0 var(--ink)",
              transition: "transform 0.15s, box-shadow 0.15s",
              position: "relative",
              overflow: "hidden",
            }}
            className="path-card"
          >
            <div style={{ position: "absolute", bottom: -20, right: -20, transform: "rotate(-12deg) scaleX(-1)" }}>
              <Tickie size={120} mood="wink" color="#9EE6CF" />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-soft)", marginBottom: 10 }}>
              FOR ORGANIZERS · BAN TỔ CHỨC
            </div>
            <h3 style={{ fontSize: "clamp(22px, 3vw, 32px)", marginBottom: 16, color: "var(--ink)" }}>
              Quản lý sự kiện 🎛
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--ink-soft)" }}>
              <li>✓ Thiết kế sơ đồ ghế trực quan</li>
              <li>✓ Theo dõi doanh thu real-time</li>
              <li>✓ Quản lý đơn hàng &amp; hoàn vé</li>
              <li>✓ Publish sự kiện chỉ vài click</li>
            </ul>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>
              Vào dashboard
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>→</span>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "0 0 40px", color: "var(--ink-faint)", fontSize: 12 }}>
          <p style={{ margin: 0 }}>
            🎪 Prototype demo · Không xử lý thanh toán thực · No real payments processed
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <span className="h-pill">Next.js App Router</span>
            <span className="h-pill">Tailwind CSS</span>
            <span className="h-pill">Zustand</span>
            <span className="h-pill">TypeScript</span>
          </div>
        </div>
      </div>

      <style>{`
        .path-card:hover { transform: translateY(-3px); box-shadow: 8px 8px 0 var(--ink) !important; }
        .path-card:active { transform: translateY(3px); box-shadow: 3px 3px 0 var(--ink) !important; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 760px) {
          .path-card { padding: 24px !important; }
        }
      `}</style>
    </div>
  );
}
