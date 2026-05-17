"use client";
import { Tickie } from "@/components/Tickie";

interface Props {
  title: string;
  sub: string;
  mascot?: "happy" | "wink" | "sleep" | "party" | "sad";
}

export default function PlaceholderScreen({ title, sub, mascot = "happy" }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 24, textAlign: "center" }}>
      <Tickie size={80} mood={mascot} color="var(--pink)" style={{ animation: "float 3s ease-in-out infinite" }} />
      <div>
        <h1 className="ad-h1" style={{ marginBottom: 6 }}>{title}</h1>
        <div className="ad-h1-sub">{sub}</div>
      </div>
      <div style={{ background: "var(--surface)", border: "2px dashed var(--border)", borderRadius: 16, padding: "20px 32px", color: "var(--ink-faint)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
        // TODO: implement this screen
      </div>
    </div>
  );
}
