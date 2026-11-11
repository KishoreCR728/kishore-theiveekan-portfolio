/*
 * Architecture diagrams for the flagship case studies, drawn as inline SVG.
 * No client names, URLs or screenshots: only the shape of each system.
 * Colours come from pages.css (.dg-* classes) so they match the site.
 */
import type { ReactNode } from "react";

type BoxProps = { x: number; y: number; w: number; h: number; title: string; sub?: string; tone?: "plain" | "dark" | "accent" | "soft" };

function Box({ x, y, w, h, title, sub, tone = "plain" }: BoxProps) {
  const cx = x + w / 2;
  const ty = sub ? y + h / 2 - 7 : y + h / 2 + 6;
  return (
    <g className={`dg-box dg-${tone}`}>
      <rect x={x} y={y} width={w} height={h} rx={14} />
      <text x={cx} y={ty} textAnchor="middle" className="dg-title">{title}</text>
      {sub && <text x={cx} y={ty + 22} textAnchor="middle" className="dg-sub">{sub}</text>}
    </g>
  );
}

const Arrow = ({ d, dashed, stop }: { d: string; dashed?: boolean; stop?: boolean }) => (
  <path d={d} className={`dg-line${dashed ? " dg-dashed" : ""}${stop ? " dg-stopline" : ""}`} markerEnd={stop ? "url(#dg-stop)" : "url(#dg-arrow)"} />
);

const Note = ({ x, y, children, anchor = "start", tone }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; tone?: "accent" | "muted" }) => (
  <text x={x} y={y} textAnchor={anchor} className={`dg-note${tone ? ` dg-note-${tone}` : ""}`}>{children}</text>
);

function Frame({ title, height, children, caption }: { title: string; height: number; children: ReactNode; caption: string }) {
  return (
    <figure className="diagram">
      <p className="diagram-hint" aria-hidden="true">Scroll sideways to see the whole diagram →</p>
      <div className="diagram-scroll" tabIndex={0} role="region" aria-label={`${title} (scrolls sideways on small screens)`}>
        <svg viewBox={`0 0 1200 ${height}`} role="img" aria-label={title}>
          <title>{title}</title>
          <defs>
            <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="dg-head" />
            </marker>
            <marker id="dg-stop" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="10" markerHeight="10">
              <circle cx="5" cy="5" r="4" className="dg-stophead" />
            </marker>
          </defs>
          {children}
        </svg>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function Erp() {
  const steps = ["Fetch blog posts", "Build indexes", "Generate routes", "Generate sitemap", "SEO lint", "Angular build"];
  return (
    <Frame title="ERP platform: JSON content flows through a gated build into prerendered HTML served by Nginx (UAT) and Apache (production)" height={500} caption="Content is data; every build step must pass; the headers that matter live in the server configs, because production never runs Node.">
      <Box x={30} y={170} w={200} h={110} title="138 JSON files" sub="14 sections" tone="soft" />
      <Arrow d="M230 225 H300" />
      <rect x={300} y={40} width={300} height={420} rx={18} className="dg-group" />
      <Note x={450} y={70} anchor="middle" tone="muted">npm run build</Note>
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={330} y={90 + i * 60} w={240} h={44} title={s} tone={s === "SEO lint" ? "accent" : "plain"} />
          {i < steps.length - 1 && <Arrow d={`M450 ${134 + i * 60} V${150 + i * 60}`} />}
        </g>
      ))}
      <Arrow d="M600 250 H680" />
      <Box x={680} y={195} w={210} h={110} title="121 prerendered" sub="HTML routes" tone="dark" />
      <Arrow d="M890 230 C940 230 940 140 980 140" />
      <Arrow d="M890 270 C940 270 940 360 980 360" />
      <Box x={980} y={95} w={190} h={90} title="UAT · Nginx" sub="headers in conf" />
      <Box x={980} y={315} w={190} h={90} title="Production · Apache" sub="headers in vhost" />
      <Box x={680} y={395} w={210} h={70} title="server.ts headers" sub="Node, not running" />
      <path d="M890 430 H1075 V405" className="dg-line dg-dashed" />
      <line x1={972} y1={418} x2={992} y2={442} className="dg-cross" />
      <line x1={992} y1={418} x2={972} y2={442} className="dg-cross" />
      <Note x={982} y={482} anchor="middle" tone="accent">never reached a browser</Note>
    </Frame>
  );
}

function Privacy() {
  const steps: [string, string][] = [["Locale parity", "18 packs vs English"], ["ESLint", ""], ["TypeScript", ""], ["Vite build", ""], ["Prerender", "headless Chromium"], ["SEO validator", "≥ 500 characters"]];
  return (
    <Frame title="Privacy advisory site: a six-step build where every step can stop the deploy" height={430} caption="Every arrow is &&. A missing browser, an empty page or a leaked translation key now stops the deploy instead of shipping.">
      {steps.map(([t, s], i) => {
        const x = 20 + i * 196;
        return (
          <g key={t}>
            <Box x={x} y={90} w={170} h={86} title={t} sub={s || undefined} tone={i >= 4 ? "dark" : "plain"} />
            {i < steps.length - 1 && <Arrow d={`M${x + 170} 133 H${x + 196}`} />}
            <Arrow d={`M${x + 85} 176 V232`} stop />
            <Note x={x + 85} y={262} anchor="middle" tone="accent">exit 1</Note>
          </g>
        );
      })}
      <Note x={20} y={50} tone="muted">npm run build (on the server that deploys, not only in CI)</Note>
      <Arrow d="M1170 150 H1188 V350 H820" />
      <Box x={560} y={310} w={260} h={80} title="Static files → Nginx" sub="about 516 pages" tone="soft" />
      <Note x={30} y={340} tone="muted">Before: Chromium missing → head-only pages → exit 0</Note>
      <line x1={30} y1={335} x2={455} y2={335} className="dg-cross" />
      <Note x={30} y={372}>Now: Chromium missing or any empty page → exit 1</Note>
    </Frame>
  );
}

function Mes() {
  const flow = ["Wheel / touch", "Lenis", "ScrollTrigger", "Progress 0–1", "Damp", "Camera on curve"];
  return (
    <Frame title="MES site: a thin Angular layer starts and disposes a plain TypeScript 3D world driven by scroll" height={470} caption="Angular never re-renders 60 times a second; the world owns the render loop, and leaving the page frees GPU memory.">
      <rect x={20} y={20} width={1160} height={110} rx={18} className="dg-group" />
      <Note x={44} y={52} tone="muted">Angular page (browser only)</Note>
      <Box x={44} y={64} w={250} h={50} title="isPlatformBrowser" />
      <Box x={314} y={64} w={250} h={50} title="runOutsideAngular" />
      <Box x={584} y={64} w={300} h={50} title="onDestroy: dispose everything" tone="accent" />
      <Arrow d="M600 130 V170" />
      <rect x={20} y={170} width={1160} height={280} rx={18} className="dg-group dg-group-dark" />
      <Note x={44} y={204} tone="muted">FactoryWorld (plain TypeScript)</Note>
      {flow.map((t, i) => {
        const x = 44 + i * 188;
        return (
          <g key={t}>
            <Box x={x} y={222} w={164} h={56} title={t} tone={i === 5 ? "accent" : "plain"} />
            {i < flow.length - 1 && <Arrow d={`M${x + 164} 250 H${x + 188}`} />}
          </g>
        );
      })}
      <Box x={44} y={310} w={340} h={110} title="Robot rig in code" sub="named joints · walk cycle · poses" />
      <Box x={410} y={310} w={340} h={110} title="Catmull-Rom path" sub="1,024-step arc-length table" />
      <Box x={776} y={310} w={380} h={110} title="Performance" sub="instancing · fixed lights · DPR cap" />
    </Frame>
  );
}

function Jarvis() {
  return (
    <Frame title="Jarvis: text, voice and gestures reach a local core that answers instantly or through a model, then runs tools behind a confirm gate" height={500} caption="Everything runs on localhost. Risky tools stop at the confirm gate; a local model answers when the network is down.">
      <Box x={20} y={40} w={220} h={70} title="Text" sub="console, hotkey" />
      <Box x={20} y={140} w={220} h={70} title="Voice" sub="wake word → VAD → Whisper" />
      <Box x={20} y={240} w={220} h={70} title="Gestures" sub="camera → MediaPipe" />
      <Arrow d="M240 75 C290 75 290 170 330 170" />
      <Arrow d="M240 175 H330" />
      <Arrow d="M240 275 C290 275 290 180 330 180" />
      <rect x={330} y={30} width={420} height={300} rx={18} className="dg-group dg-group-dark" />
      <Note x={354} y={62} tone="muted">Core on 127.0.0.1 (FastAPI + WebSockets)</Note>
      <Box x={354} y={80} w={372} h={60} title="Instant path" sub="patterns in three languages, no model" tone="accent" />
      <Box x={354} y={160} w={372} h={70} title="Model turn" sub="Claude · Gemini · local Ollama" />
      <Note x={540} y={262} anchor="middle" tone="muted">network down → local model answers</Note>
      <Arrow d="M750 175 H800" />
      <Box x={800} y={130} w={170} h={90} title="Tool registry" sub="103 tools" />
      <Arrow d="M970 175 H1010" />
      <Box x={1010} y={120} w={170} h={110} title="Confirm gate" sub="click · voice · thumbs" tone="accent" />
      <Arrow d="M1095 230 V280" />
      <Box x={1000} y={280} w={190} h={70} title="OS adapters" sub="Linux · Windows · macOS" tone="dark" />
      <Box x={330} y={380} w={200} h={80} title="Memory" tone="soft" />
      <Box x={550} y={380} w={200} h={80} title="Second brain" tone="soft" />
      <Box x={770} y={380} w={200} h={80} title="Reminders, routines" tone="soft" />
      <Arrow d="M540 330 V380" />
    </Frame>
  );
}

const diagrams: Record<string, () => ReactNode> = {
  "erp-product-platform": Erp,
  "privacy-advisory-site": Privacy,
  "mes-product-site": Mes,
  "jarvis-assistant": Jarvis,
};

export function CaseDiagram({ slug }: { slug: string }) {
  const D = diagrams[slug];
  return D ? <D /> : null;
}
