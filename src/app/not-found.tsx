import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found", alternates: { canonical: null }, robots: { index: false } };

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <h1 style={{ fontSize: "clamp(56px,10vw,140px)", fontWeight: 400, letterSpacing: "-.04em", margin: 0 }}>Not <i className="ac">here.</i></h1>
        <p style={{ color: "#4a4740", fontSize: 19 }}>This page does not exist.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
          <a href="/" style={{ background: "#0f0e0c", color: "#f0efe9", borderRadius: 999, padding: "13px 22px" }}>Back to the portfolio</a>
          <a href="/#work" style={{ background: "#fff", borderRadius: 999, padding: "13px 22px" }}>Case studies</a>
          <a href="/writing" style={{ background: "#fff", borderRadius: 999, padding: "13px 22px" }}>Writing</a>
        </div>
      </div>
    </main>
  );
}
