"use client";
import type { ReactNode } from "react";

export default function BottomBar({ children }: { children: ReactNode }) {
  return <div className="bottombar">{children}</div>;
}
