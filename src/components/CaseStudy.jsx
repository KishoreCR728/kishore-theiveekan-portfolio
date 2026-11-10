"use client";
/* A case study opened directly by URL. Uses the same takeover layout as the home page. */
import { useEffect, useRef } from "react";
import { projects as P } from "../content/portfolio";
import { CaseTakeover } from "./Markup";

export default function CaseStudy({ index }) {
  const caseRef = useRef(null);
  const caseImgRef = useRef(null);
  const p = P[index];
  useEffect(() => { if (caseImgRef.current) caseImgRef.current.style.backgroundImage = `url(${p.img})`; }, [p.img]);
  const next = P[(index + 1) % P.length];
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { try { sessionStorage.setItem("skipLoader", "1"); } catch {} window.location.assign("/#work"); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const v = {
    caseRef, caseImgRef,
    cs: { ...p, built: p.built.map((t, i) => ({ n: i + 1, t })), results: p.results.map(([v2, l]) => ({ v: v2, l })), nextName: next.name },
    closeCase: () => { try { sessionStorage.setItem("skipLoader", "1"); } catch {} window.location.assign("/#work"); },
    nextCase: () => window.location.assign(`/work/${next.slug}`),
  };
  return <CaseTakeover v={v} />;
}
