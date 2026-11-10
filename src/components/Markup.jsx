/* The page markup, converted from the Claude Design source. Interaction logic lives in Experience.jsx. */
import { Fragment } from "react";
const kb = (fn) => (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn(e);
  }
};
export function CaseTakeover({ v }) {
  return (
    <>
      <div
        ref={v.caseRef}
        data-case={"1"}
        role={"dialog"}
        aria-modal={"true"}
        aria-label={"Case study"}
        style={{
          position: "fixed",
          inset: "0",
          zIndex: "55",
          background: "#f0efe9",
          overflowY: "auto",
          overflowX: "hidden",
          animation: "rise .55s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: "0",
            zIndex: "2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "22px 4.5vw",
            background: "linear-gradient(#f0efe9 60%,rgba(240,239,233,0))",
          }}
        >
          <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>
            {"Case study "}
            {v.cs.num}
            {" / 10"}
          </div>
          <div
            className="hf58d6ba"
            style={{
              background: "#0f0e0c",
              color: "#f0efe9",
              borderRadius: "999px",
              padding: "13px 22px",
              fontSize: "14px",
              letterSpacing: ".04em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            onClick={v.closeCase}
            role="button"
            tabIndex={0}
            onKeyDown={kb(v.closeCase)}
          >
            {"Close ✕"}
          </div>
        </div>
        <div style={{ padding: "20px 4.5vw 0" }}>
          <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62", marginBottom: "18px" }}>
            {v.cs.tags}
          </div>
          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(56px,9vw,140px)",
              lineHeight: ".95",
              letterSpacing: "-.04em",
              fontWeight: "400",
              maxWidth: "12ch",
              textWrap: "balance",
            }}
          >
            {v.cs.name}
          </h1>
          <p style={{ margin: "0 0 40px", fontSize: "clamp(22px,2.4vw,34px)", lineHeight: "1.2", color: "#4a4740", maxWidth: "34ch" }}>
            <i className="ac">{v.cs.short}</i>
          </p>
          <div style={{ borderRadius: "18px", overflow: "hidden", aspectRatio: "21/9", background: "#131211" }}>
            <div
              ref={v.caseImgRef}
              role={"img"}
              aria-label={v.cs.alt}
              style={{ width: "100%", height: "100%", backgroundSize: "cover", backgroundPosition: "center" }}
            ></div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              gap: "24px",
              padding: "34px 0",
              borderBottom: "1px solid #d8d5cc",
              fontSize: "15px",
              lineHeight: "1.5",
            }}
          >
            <div>
              <div style={{ color: "#6e6a62", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "6px" }}>
                {"Role"}
              </div>
              {v.cs.role}
            </div>
            <div>
              <div style={{ color: "#6e6a62", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "6px" }}>
                {"Ownership"}
              </div>
              {v.cs.own}
            </div>
            <div>
              <div style={{ color: "#6e6a62", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "6px" }}>
                {"Timeline"}
              </div>
              {v.cs.when}
            </div>
            <div>
              <div style={{ color: "#6e6a62", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "6px" }}>
                {"Stack"}
              </div>
              {v.cs.stack}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)", gap: "32px", padding: "10vh 0 0" }}>
            <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>{"Overview"}</div>
            <p
              style={{
                margin: "0",
                fontSize: "clamp(24px,2.6vw,38px)",
                lineHeight: "1.25",
                letterSpacing: "-.02em",
                maxWidth: "30ch",
                textWrap: "pretty",
              }}
            >
              {v.cs.overview}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)", gap: "32px", padding: "10vh 0 0" }}>
            <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>{"The problem"}</div>
            <p style={{ margin: "0", fontSize: "19px", lineHeight: "1.55", color: "#4a4740", maxWidth: "62ch", textWrap: "pretty" }}>
              {v.cs.problem}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)", gap: "32px", padding: "10vh 0 0" }}>
            <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>{"What I built"}</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {v.cs.built.map((b, $index) => (
                <Fragment key={$index}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px minmax(0,1fr)",
                      gap: "16px",
                      padding: "22px 0",
                      borderTop: "1px solid #d8d5cc",
                      fontSize: "19px",
                      lineHeight: "1.5",
                      color: "#4a4740",
                    }}
                  >
                    <span style={{ color: "#6e6a62", fontSize: "13px", letterSpacing: ".08em", paddingTop: "6px" }}>
                      {"0"}
                      {b.n}
                    </span>
                    <span>{b.t}</span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)", gap: "32px", padding: "10vh 0 0" }}>
            <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>
              {"Technical detail"}
            </div>
            <pre
              tabIndex={"0"}
              style={{
                margin: "0",
                padding: "28px",
                borderRadius: "18px",
                background: "#0f0e0c",
                color: "#d9d5cc",
                font: "14px/1.6 ui-monospace,Menlo,monospace",
                overflow: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {v.cs.code}
            </pre>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)", gap: "32px", padding: "10vh 0 0" }}>
            <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>{"Result"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "24px" }}>
              {v.cs.results.map((r, $index) => (
                <Fragment key={$index}>
                  <div style={{ borderTop: "1px solid #0f0e0c", paddingTop: "16px" }}>
                    <div style={{ fontSize: "clamp(40px,5vw,72px)", letterSpacing: "-.04em", lineHeight: "1" }}>{r.v}</div>
                    <div style={{ fontSize: "15px", color: "#6e6a62", marginTop: "8px" }}>{r.l}</div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)", gap: "32px", padding: "10vh 0 0" }}>
            <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>
              {"How it was made"}
            </div>
            <p style={{ margin: "0", fontSize: "19px", lineHeight: "1.55", color: "#4a4740", maxWidth: "62ch", textWrap: "pretty" }}>
              {v.cs.how}
            </p>
          </div>
          <div
            style={{
              margin: "14vh 0 0",
              padding: "8vh 0 10vh",
              borderTop: "1px solid #0f0e0c",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "24px",
            }}
            onClick={v.nextCase}
            role="button"
            tabIndex={0}
            onKeyDown={kb(v.nextCase)}
          >
            <div>
              <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62", marginBottom: "14px" }}>
                {"Next case study"}
              </div>
              <div style={{ fontSize: "clamp(40px,6vw,96px)", letterSpacing: "-.04em", lineHeight: "1" }}>{v.cs.nextName}</div>
            </div>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#0f0e0c",
                color: "#f0efe9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                flex: "none",
              }}
            >
              {"→"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export function PageMarkup({ v }) {
  return (
    <>
      <div style={{ position: "relative", overflowX: "clip" }}>
        <div style={{ position: "fixed", inset: "0", zIndex: "0", pointerEvents: "none", overflow: "hidden" }}>
          <div
            ref={v.hazeARef}
            style={{
              position: "absolute",
              width: "60vw",
              height: "60vw",
              left: "-15vw",
              top: "-10vw",
              borderRadius: "50%",
              background: "radial-gradient(circle,rgba(232,213,176,.55),rgba(232,213,176,0) 65%)",
              filter: "blur(40px)",
              animation: "drift 22s ease-in-out infinite",
            }}
          ></div>
          <div
            ref={v.hazeBRef}
            style={{
              position: "absolute",
              width: "50vw",
              height: "50vw",
              right: "-12vw",
              top: "30vh",
              borderRadius: "50%",
              background: "radial-gradient(circle,rgba(224,86,42,.22),rgba(224,86,42,0) 65%)",
              filter: "blur(50px)",
              animation: "drift 28s ease-in-out infinite reverse",
            }}
          ></div>
        </div>
        <div
          style={{
            position: "fixed",
            inset: "0",
            zIndex: "1",
            pointerEvents: "none",
            opacity: ".07",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        ></div>
        <div
          ref={v.barRef}
          style={{
            position: "fixed",
            left: "0",
            top: "0",
            height: "2px",
            width: "100%",
            background: "#e0562a",
            transformOrigin: "0 50%",
            transform: "scaleX(0)",
            zIndex: "51",
          }}
        ></div>
        {v.loaderOn ? (
          <>
            <div data-loader={"1"} style={{ position: "fixed", inset: "0", zIndex: "60", pointerEvents: "none" }}>
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  right: "0",
                  top: "0",
                  height: "50.5%",
                  background: "#0f0e0c",
                  transition: "transform 1.1s cubic-bezier(.76,0,.24,1)",
                  transform: v.topT,
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  height: "50.5%",
                  background: "#0f0e0c",
                  transition: "transform 1.1s cubic-bezier(.76,0,.24,1)",
                  transform: v.botT,
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f0efe9",
                  transition: "opacity .5s",
                  opacity: v.loaderTextO,
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "#9a958b",
                    marginBottom: "28px",
                    animation: "rise 1s .2s both",
                  }}
                >
                  {"Portfolio · 2026"}
                </div>
                <div
                  data-loader-name={"1"}
                  style={{
                    display: "flex",
                    fontSize: "clamp(64px,13vw,190px)",
                    lineHeight: ".9",
                    letterSpacing: "-.05em",
                    overflow: "hidden",
                    padding: ".12em .15em .2em",
                    margin: "-.12em -.15em -.2em",
                  }}
                >
                  <span style={{ display: "inline-block", animation: "lift 1.1s .30s cubic-bezier(.2,.8,.2,1) both" }}>{"K"}</span>
                  <span style={{ display: "inline-block", animation: "lift 1.1s .36s cubic-bezier(.2,.8,.2,1) both" }}>{"i"}</span>
                  <span style={{ display: "inline-block", animation: "lift 1.1s .42s cubic-bezier(.2,.8,.2,1) both" }}>{"s"}</span>
                  <span style={{ display: "inline-block", animation: "lift 1.1s .48s cubic-bezier(.2,.8,.2,1) both" }}>{"h"}</span>
                  <span style={{ display: "inline-block", animation: "lift 1.1s .54s cubic-bezier(.2,.8,.2,1) both" }}>{"o"}</span>
                  <span style={{ display: "inline-block", animation: "lift 1.1s .60s cubic-bezier(.2,.8,.2,1) both" }}>{"r"}</span>
                  <span style={{ display: "inline-block", animation: "lift 1.1s .66s cubic-bezier(.2,.8,.2,1) both" }}>{"e"}</span>
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: ".22em",
                      color: "#e0562a",
                      animation: "lift 1.1s .78s cubic-bezier(.2,.8,.2,1) both",
                    }}
                  >
                    {"Theiveekan."}
                  </span>
                </div>
                <div style={{ marginTop: "34px", fontSize: "clamp(20px,2.2vw,30px)", color: "#9a958b", animation: "rise 1s .9s both" }}>
                  <i data-word={"1"} className="ac">
                    {v.word}
                  </i>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  right: "4.5vw",
                  bottom: "36px",
                  color: "#f0efe9",
                  fontSize: "clamp(48px,7vw,110px)",
                  lineHeight: ".8",
                  letterSpacing: "-.05em",
                  transition: "opacity .5s",
                  opacity: v.loaderTextO,
                }}
              >
                <span data-count={"1"}>{v.count}</span>
                <span style={{ fontSize: ".35em" }}>{"%"}</span>
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "4.5vw",
                  bottom: "44px",
                  color: "#9a958b",
                  fontSize: "12px",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  transition: "opacity .5s",
                  opacity: v.loaderTextO,
                }}
              >
                {"Loading the archive"}
              </div>
            </div>
          </>
        ) : null}
        {v.caseOpen ? <CaseTakeover v={v} /> : null}
        {v.menuOpen ? (
          <>
            <div
              style={{ position: "fixed", inset: "0", zIndex: "45", background: "rgba(15,14,12,.35)", backdropFilter: "blur(6px)" }}
              onClick={v.toggleMenu}
              aria-hidden="true"
            ></div>
            <div
              data-overlay={"1"}
              style={{
                position: "fixed",
                top: "92px",
                right: "4.5vw",
                zIndex: "46",
                width: "min(420px,90vw)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                animation: "rise .5s cubic-bezier(.2,.8,.2,1) both",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  padding: "18px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <a
                  href={"#intro"}
                  className="hc311122"
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", fontSize: "24px" }}
                  onClick={v.toggleMenu}
                >
                  {"About"}
                  <span>{"→"}</span>
                </a>{" "}
                <a
                  href={"#journey"}
                  className="hc311122"
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", fontSize: "24px" }}
                  onClick={v.toggleMenu}
                >
                  {"Journey"}
                  <span>{"→"}</span>
                </a>{" "}
                <a
                  href={"#work"}
                  className="hc311122"
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", fontSize: "24px" }}
                  onClick={v.toggleMenu}
                >
                  {"Work"}
                  <span>{"→"}</span>
                </a>{" "}
                <a
                  href={"#method"}
                  className="hc311122"
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", fontSize: "24px" }}
                  onClick={v.toggleMenu}
                >
                  {"How I work"}
                  <span>{"→"}</span>
                </a>{" "}
                <a
                  href={"#likes"}
                  className="hc311122"
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", fontSize: "24px" }}
                  onClick={v.toggleMenu}
                >
                  {"Off the clock"}
                  <span>{"→"}</span>
                </a>{" "}
                <a
                  href={"#contact"}
                  className="hc311122"
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", fontSize: "24px" }}
                  onClick={v.toggleMenu}
                >
                  {"Contact"}
                  <span>{"→"}</span>
                </a>
              </div>
              <a
                href={"/Kishore-Theiveekan-CV.pdf"}
                download={""}
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  padding: "22px 26px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "15px",
                  color: "#6e6a62",
                }}
              >
                <span>{"Download CV"}</span>
                <span
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#0f0e0c",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {"↓"}
                </span>
              </a>
            </div>
          </>
        ) : null}
        <nav
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            zIndex: "50",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "22px 4.5vw",
          }}
        >
          <div style={{ fontSize: "20px", letterSpacing: "-.02em", fontWeight: "500" }}>
            {"Kishore Theiveekan"}
            <span style={{ color: "#e0562a" }}>{"."}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              style={{
                height: "44px",
                padding: "0 16px",
                borderRadius: "999px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
                color: "#6e6a62",
                letterSpacing: ".06em",
              }}
            >
              {"CHENNAI · "}
              {v.time}
            </div>
            <a
              href={"#contact"}
              className="hcb54c46"
              style={{
                background: "#0f0e0c",
                color: "#f0efe9",
                borderRadius: "999px",
                padding: "13px 22px",
                fontSize: "14px",
                letterSpacing: ".04em",
                textTransform: "uppercase",
              }}
            >
              {"Let's talk"}
            </a>
            <div
              aria-expanded={v.menuOpen}
              aria-label={"Menu"}
              className="he1fcd71"
              style={{
                background: "#fff",
                borderRadius: "999px",
                padding: "13px 22px",
                fontSize: "14px",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
              onClick={v.toggleMenu}
              role="button"
              tabIndex={0}
              onKeyDown={kb(v.toggleMenu)}
            >
              <span>{v.menuLabel}</span>
              <span style={{ display: "inline-flex", flexDirection: "column", gap: "3px" }}>
                <i style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#0f0e0c" }}></i>
                <i style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#0f0e0c" }}></i>
                <i style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#0f0e0c" }}></i>
              </span>
            </div>
          </div>
        </nav>
        <main>
          <section data-screen-label={"Hero"} style={{ position: "relative", zIndex: "2", padding: "150px 4.5vw 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "40px",
                flexWrap: "wrap",
                marginBottom: "38px",
              }}
            >
              <h1
                style={{
                  margin: "0",
                  fontSize: "clamp(34px,4vw,60px)",
                  lineHeight: "1.04",
                  letterSpacing: "-.025em",
                  maxWidth: "20ch",
                  fontWeight: "400",
                  animation: "rise 1s .1s both",
                }}
              >
                {"Frontend engineering for products that need to be "}
                <i className="ac">{"fast, secure"}</i>
                {" and "}
                <i className="ac">{"well made"}</i>
                {"."}
              </h1>
              <div
                style={{
                  fontSize: "13px",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "#6e6a62",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  animation: "rise 1s .3s both",
                }}
              >
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    border: "1.5px solid #6e6a62",
                    display: "inline-block",
                    animation: "spin 6s linear infinite",
                    borderTopColor: "transparent",
                  }}
                ></span>
                {"Scroll to explore"}
              </div>
            </div>
          </section>
          <section
            ref={v.heroSecRef}
            data-screen-label={"3D panel"}
            style={{ position: "relative", zIndex: "2", height: "320vh", padding: "0 4.5vw" }}
          >
            <div
              style={{
                position: "sticky",
                top: "90px",
                height: "calc(100vh - 110px)",
                borderRadius: "18px",
                overflow: "hidden",
                background: "#131211",
              }}
            >
              <canvas ref={v.glRef} style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }}></canvas>
              <canvas
                ref={v.trailRef}
                style={{
                  position: "absolute",
                  inset: "0",
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  filter: "blur(10px) saturate(1.3)",
                  mixBlendMode: "multiply",
                  opacity: ".7",
                }}
              ></canvas>
              <div
                ref={v.heroCapRef}
                style={{
                  position: "absolute",
                  inset: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "#f0efe9",
                  pointerEvents: "none",
                  opacity: "0",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(40px,7vw,120px)",
                    lineHeight: ".95",
                    letterSpacing: "-.04em",
                    maxWidth: "12ch",
                    textWrap: "balance",
                  }}
                >
                  {"Every piece "}
                  <i className="ac">{"finds"}</i>
                  {" its place."}
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "26px",
                  bottom: "24px",
                  fontSize: "12px",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(240,239,233,.7)",
                }}
              >
                {"Move · scroll to push in"}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: "26px",
                  bottom: "24px",
                  fontSize: "12px",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(240,239,233,.7)",
                }}
              >
                {"Frontend engineer"}
              </div>
              <div style={{ position: "absolute", left: "14px", top: "14px", color: "#f0efe9", fontSize: "18px", lineHeight: "1" }}>
                {"+"}
              </div>
              <div style={{ position: "absolute", right: "14px", top: "14px", color: "#f0efe9", fontSize: "18px", lineHeight: "1" }}>
                {"+"}
              </div>
              <div style={{ position: "absolute", left: "14px", bottom: "60px", color: "#f0efe9", fontSize: "18px", lineHeight: "1" }}>
                {"+"}
              </div>
              <div style={{ position: "absolute", right: "14px", bottom: "60px", color: "#f0efe9", fontSize: "18px", lineHeight: "1" }}>
                {"+"}
              </div>
            </div>
          </section>
          <section
            id={"intro"}
            data-screen-label={"Intro"}
            style={{
              position: "relative",
              zIndex: "2",
              padding: "26vh 4.5vw 14vh",
              display: "grid",
              gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)",
              gap: "64px",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62", marginBottom: "34px" }}>
                {"Hello"}
              </div>
              <h2
                data-reveal={"1"}
                style={{
                  margin: "0 0 40px",
                  fontSize: "clamp(52px,7.6vw,124px)",
                  lineHeight: ".98",
                  letterSpacing: "-.04em",
                  fontWeight: "400",
                }}
              >
                {v.wIntro.map((w, $index) => (
                  <Fragment key={$index}>
                    <span
                      style={{
                        display: "inline-block",
                        overflow: "hidden",
                        verticalAlign: "bottom",
                        padding: ".14em .12em .2em",
                        margin: "-.14em -.12em -.2em .1em",
                      }}
                    >
                      <span
                        data-w={"1"}
                        style={{
                          display: "inline-block",
                          transform: "translateY(112%)",
                          transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                        }}
                      >
                        {w.t}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h2>
              <p
                data-fade={"1"}
                style={{
                  margin: "0 0 22px",
                  fontSize: "clamp(19px,1.7vw,24px)",
                  lineHeight: "1.45",
                  color: "#4a4740",
                  maxWidth: "46ch",
                  textWrap: "pretty",
                  opacity: "0",
                  transform: "translateY(30px)",
                  transition: "opacity 1s .2s,transform 1.1s .2s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                {
                  "Kishore Theiveekan is a frontend engineer based in Chennai, open to relocation and remote work worldwide, with more than three and a half years at Finstein building corporate sites, product platforms, a manufacturing execution console and automated testing for banking applications."
                }
              </p>
              <p
                data-fade={"1"}
                style={{
                  margin: "0",
                  fontSize: "clamp(19px,1.7vw,24px)",
                  lineHeight: "1.45",
                  color: "#4a4740",
                  maxWidth: "46ch",
                  textWrap: "pretty",
                  opacity: "0",
                  transform: "translateY(30px)",
                  transition: "opacity 1s .35s,transform 1.1s .35s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                {"The work covers the full path to production: interface, build pipeline, security headers and server configuration."}
              </p>
            </div>
            <div
              ref={v.tiltRef}
              style={{
                borderRadius: "22px",
                aspectRatio: "4/5",
                overflow: "hidden",
                position: "relative",
                background: "#131211",
                transformStyle: "preserve-3d",
                transition: "transform .2s",
                boxShadow: "0 60px 120px -40px rgba(15,14,12,.45)",
              }}
            >
              <div data-par={"1"} style={{ position: "absolute", inset: "-10% 0" }}>
                <img
                  src={"/images/hero-ridge.webp"}
                  alt={"Mountain ridge at first light"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "22px",
                  right: "22px",
                  bottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "#f0efe9",
                  opacity: ".9",
                }}
              >
                <span>{"Based in India"}</span>
                <span>{"Chennai, IN"}</span>
              </div>
            </div>
          </section>
          <section data-screen-label={"Statement"} style={{ position: "relative", zIndex: "2", padding: "10vh 4.5vw 20vh" }}>
            <h2
              data-reveal={"1"}
              style={{
                margin: "0 0 56px",
                fontSize: "clamp(64px,10.5vw,152px)",
                lineHeight: ".98",
                letterSpacing: "-.035em",
                fontWeight: "400",
                maxWidth: "12ch",
              }}
            >
              {v.wStatement.map((w, $index) => (
                <Fragment key={$index}>
                  <span
                    style={{
                      display: "inline-block",
                      overflow: "hidden",
                      verticalAlign: "bottom",
                      padding: ".14em .12em .2em",
                      margin: "-.14em -.12em -.2em .1em",
                    }}
                  >
                    <span
                      data-w={"1"}
                      style={{
                        display: "inline-block",
                        transform: "translateY(112%)",
                        transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                      }}
                    >
                      {w.t}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "48px", alignItems: "start" }}>
              <p
                data-fade={"1"}
                style={{
                  margin: "0",
                  fontSize: "clamp(20px,1.9vw,27px)",
                  lineHeight: "1.35",
                  letterSpacing: "-.01em",
                  maxWidth: "34ch",
                  textWrap: "pretty",
                  opacity: "0",
                  transform: "translateY(30px)",
                  transition: "opacity 1s .2s,transform 1.1s .2s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                {
                  "Angular, React, TypeScript, three.js. Build gates stop a blank page, a missing locale or a weak security header before it reaches production. Three production sites score 96 or higher on mobile Lighthouse, with 100 for accessibility, best practices and SEO (November 2026)."
                }
              </p>
              <div
                data-fade={"1"}
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  opacity: "0",
                  transform: "translateY(30px)",
                  transition: "opacity 1s .35s,transform 1.1s .35s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <a
                  href={"#work"}
                  className="h0b5e78d"
                  style={{
                    border: "1.5px solid #0f0e0c",
                    borderRadius: "999px",
                    padding: "16px 26px",
                    fontSize: "14px",
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                  }}
                >
                  {"See the work"}
                </a>{" "}
                <a
                  href={"#method"}
                  className="he1fcd71"
                  style={{
                    borderRadius: "999px",
                    padding: "16px 26px",
                    fontSize: "14px",
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    background: "#fff",
                  }}
                >
                  {"How I work"}
                </a>
              </div>
            </div>
          </section>
          <section
            id={"journey"}
            ref={v.diveSecRef}
            data-screen-label={"Journey"}
            style={{ position: "relative", zIndex: "2", height: "900vh", color: "#0f0e0c" }}
          >
            <div
              style={{
                position: "sticky",
                top: "0",
                height: "100vh",
                overflow: "hidden",
                background: "linear-gradient(180deg,#ffffff 0%,#f7f6f2 100%)",
              }}
            >
              <canvas
                ref={v.diveGlRef}
                style={{ position: "absolute", inset: "0", width: "100%", height: "100%", touchAction: "none", cursor: "grab" }}
              ></canvas>
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  pointerEvents: "none",
                  background: "linear-gradient(90deg,rgba(255,255,255,.9) 0%,rgba(255,255,255,.55) 34%,rgba(255,255,255,0) 58%)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: "4.5vw",
                  top: "100px",
                  fontSize: "12px",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#8a857c",
                  pointerEvents: "none",
                }}
              >
                {"Chapter two · the journey"}
              </div>
              <div
                data-yr={"open"}
                style={{
                  position: "absolute",
                  left: "4.5vw",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "min(680px,52vw)",
                  pointerEvents: "none",
                  opacity: "0",
                  willChange: "opacity,transform",
                }}
              >
                <div
                  style={{ fontSize: "12px", letterSpacing: ".12em", textTransform: "uppercase", color: "#8a857c", marginBottom: "26px" }}
                >
                  {"Welcome"}
                </div>
                <div style={{ fontSize: "clamp(48px,6.6vw,112px)", lineHeight: ".96", letterSpacing: "-.045em", textWrap: "balance" }}>
                  {"Since 2023"}
                  <br />
                  {"at "}
                  <i className="ac">{"Finstein"}</i>
                </div>
                <p
                  style={{ margin: "30px 0 0", fontSize: "clamp(16px,1.3vw,19px)", lineHeight: "1.55", color: "#4a4740", maxWidth: "46ch" }}
                >
                  {
                    "Each district is one year of work, from the first enterprise screens to product platforms, a manufacturing console and banking application testing."
                  }
                </p>
              </div>
              {v.timeline.map((y, $index) => (
                <Fragment key={$index}>
                  <div
                    data-yr={$index}
                    style={{
                      position: "absolute",
                      left: "4.5vw",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "min(680px,52vw)",
                      pointerEvents: "none",
                      opacity: "0",
                      willChange: "opacity,transform",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        color: "#8a857c",
                        marginBottom: "26px",
                      }}
                    >
                      {y.k}
                      {" · "}
                      {y.y}
                    </div>
                    <div style={{ fontSize: "clamp(44px,6vw,100px)", lineHeight: ".96", letterSpacing: "-.045em", textWrap: "balance" }}>
                      <i className="ac">{y.t}</i>
                    </div>
                    <p
                      style={{
                        margin: "30px 0 0",
                        fontSize: "clamp(16px,1.3vw,19px)",
                        lineHeight: "1.55",
                        color: "#4a4740",
                        maxWidth: "50ch",
                      }}
                    >
                      {y.d}
                    </p>
                    <div
                      style={{
                        marginTop: "22px",
                        fontSize: "clamp(15px,1.15vw,18px)",
                        lineHeight: "1.45",
                        color: "#0f0e0c",
                        maxWidth: "44ch",
                        paddingLeft: "16px",
                        borderLeft: "2px solid #e0562a",
                      }}
                    >
                      <i className="ac">{y.learned}</i>
                    </div>
                    <a
                      href={"#work"}
                      className="h1f9319a"
                      style={{
                        pointerEvents: "auto",
                        display: "inline-flex",
                        marginTop: "34px",
                        border: "1.5px solid #0f0e0c",
                        borderRadius: "999px",
                        padding: "14px 24px",
                        fontSize: "13px",
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {"See the work"}
                    </a>
                  </div>
                </Fragment>
              ))}
              <div
                ref={v.railRef}
                style={{
                  position: "absolute",
                  right: "4.5vw",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  alignItems: "flex-end",
                }}
              >
                <div
                  data-rail={"0"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    letterSpacing: ".06em",
                    color: "#b3aea5",
                    transition: "color .4s",
                  }}
                  onClick={v.goOpen}
                  role="button"
                  tabIndex={0}
                  onKeyDown={kb(v.goOpen)}
                >
                  <span>{"Welcome"}</span>
                  <span
                    data-tick={"1"}
                    style={{ width: "18px", height: "1.5px", background: "currentColor", transition: "width .4s" }}
                  ></span>
                </div>
                {v.timeline.map((y, $index) => (
                  <Fragment key={$index}>
                    <div
                      data-rail={"1"}
                      className="h28e7bec"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        cursor: "pointer",
                        fontSize: "13px",
                        letterSpacing: ".06em",
                        color: "#b3aea5",
                        transition: "color .4s",
                      }}
                      onClick={y.go}
                      role="button"
                      tabIndex={0}
                      onKeyDown={kb(y.go)}
                    >
                      <span>{y.short}</span>
                      <span
                        data-tick={"1"}
                        style={{ width: "18px", height: "1.5px", background: "currentColor", transition: "width .4s" }}
                      ></span>
                    </div>
                  </Fragment>
                ))}
              </div>
              <div style={{ position: "absolute", right: "4.5vw", bottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  ref={v.counterRef}
                  style={{ font: "500 12px/1 ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#8a857c", marginRight: "10px" }}
                >
                  {"01 / 06"}
                </span>
                <div
                  className="h1f9319a"
                  style={{
                    height: "48px",
                    padding: "0 20px",
                    borderRadius: "999px",
                    border: "1.5px solid #0f0e0c",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    background: "rgba(255,255,255,.7)",
                  }}
                  onClick={v.prevChapter}
                  role="button"
                  tabIndex={0}
                  onKeyDown={kb(v.prevChapter)}
                >
                  <span>{"←"}</span>
                  <span>{"Prev."}</span>
                </div>
                <div
                  className="hf58d6ba"
                  style={{
                    height: "48px",
                    padding: "0 20px",
                    borderRadius: "999px",
                    background: "#0f0e0c",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                  onClick={v.nextChapter}
                  role="button"
                  tabIndex={0}
                  onKeyDown={kb(v.nextChapter)}
                >
                  <span>{"Next"}</span>
                  <span>{"→"}</span>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "4.5vw",
                  bottom: "34px",
                  fontSize: "12px",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#8a857c",
                  pointerEvents: "none",
                }}
              >
                {"Scroll or use Next · the drone flies the avenues · drag to look around"}
              </div>
            </div>
          </section>
          <section
            id={"work"}
            data-screen-label={"Work"}
            style={{ position: "relative", zIndex: "2", padding: "20vh 4.5vw 10vh", background: "#f0efe9" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "32px",
                flexWrap: "wrap",
                marginBottom: "64px",
              }}
            >
              <div>
                <div
                  style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62", marginBottom: "22px" }}
                >
                  {"Selected work · 10"}
                </div>
                <h2
                  data-reveal={"1"}
                  style={{
                    margin: "0",
                    fontSize: "clamp(44px,6.4vw,96px)",
                    lineHeight: "1",
                    letterSpacing: "-.035em",
                    fontWeight: "400",
                    maxWidth: "14ch",
                  }}
                >
                  {v.wWork.map((w, $index) => (
                    <Fragment key={$index}>
                      <span
                        style={{
                          display: "inline-block",
                          overflow: "hidden",
                          verticalAlign: "bottom",
                          padding: ".14em .12em .2em",
                          margin: "-.14em -.12em -.2em .1em",
                        }}
                      >
                        <span
                          data-w={"1"}
                          style={{
                            display: "inline-block",
                            transform: "translateY(112%)",
                            transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                          }}
                        >
                          {w.t}
                        </span>
                      </span>
                    </Fragment>
                  ))}
                </h2>
              </div>
              <p
                data-fade={"1"}
                style={{
                  margin: "0",
                  fontSize: "19px",
                  lineHeight: "1.5",
                  color: "#4a4740",
                  maxWidth: "38ch",
                  textWrap: "pretty",
                  opacity: "0",
                  transform: "translateY(30px)",
                  transition: "opacity 1s,transform 1.1s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                {"Ten projects owned or led, each with a full case study, followed by the enterprise systems contributed to."}
              </p>
            </div>
            <div
              ref={v.gridRef}
              style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: "64px 28px", willChange: "transform" }}
            >
              {v.projects.map((p, $index) => (
                <Fragment key={$index}>
                  <a
                    href={p.href}
                    style={{
                      ...{
                        cursor: "pointer",
                        opacity: "0",
                        transform: "translateY(90px)",
                        transition: "opacity 1s cubic-bezier(.2,.8,.2,1),transform 1.2s cubic-bezier(.2,.8,.2,1)",
                        gridColumn: `span ${p.span}`,
                        marginTop: p.offset,
                      },
                      display: "block",
                      color: "inherit",
                    }}
                    onClick={p.open}
                  >
                    <div
                      style={{
                        aspectRatio: p.ratio,
                        borderRadius: "18px",
                        overflow: "hidden",
                        position: "relative",
                        background: "#131211",
                      }}
                    >
                      <div data-par={"1"} style={{ position: "absolute", inset: "-12% 0", willChange: "transform" }}>
                        <img
                          src={p.img}
                          alt={p.alt}
                          loading={"lazy"}
                          className="h6b162d1"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          inset: "0",
                          background: "linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.4) 100%)",
                          pointerEvents: "none",
                        }}
                      ></div>
                      <div
                        style={{
                          position: "absolute",
                          left: "24px",
                          top: "22px",
                          fontSize: "13px",
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          color: "#f0efe9",
                          opacity: ".85",
                        }}
                      >
                        {p.num}
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          right: "22px",
                          top: "20px",
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "rgba(240,239,233,.9)",
                          color: "#0f0e0c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                        }}
                      >
                        {"↗"}
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          left: "24px",
                          right: "24px",
                          bottom: "22px",
                          color: "#f0efe9",
                          fontSize: "clamp(18px,1.6vw,24px)",
                          lineHeight: "1.2",
                          maxWidth: "30ch",
                        }}
                      >
                        <i className="ac">{p.short}</i>
                      </div>
                    </div>
                    <div style={{ padding: "20px 4px 0" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          color: "#6e6a62",
                          marginBottom: "8px",
                        }}
                      >
                        {p.tags}
                      </div>
                      <div style={{ fontSize: "clamp(28px,2.9vw,44px)", letterSpacing: "-.025em", lineHeight: "1.05" }}>{p.name}</div>
                    </div>
                  </a>
                </Fragment>
              ))}
            </div>
          </section>
          <section data-screen-label={"Contributed"} style={{ position: "relative", zIndex: "2", padding: "12vh 4.5vw 18vh" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,300px) minmax(0,1fr)", gap: "32px" }}>
              <div>
                <div
                  style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62", marginBottom: "18px" }}
                >
                  {"Also contributed to"}
                </div>
                <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.5", color: "#4a4740", maxWidth: "26ch" }}>
                  {"Team systems with owned features, screens or tooling."}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {v.contributed.map((c, $index) => (
                  <Fragment key={$index}>
                    <div
                      data-fade={"1"}
                      className="haab7c06"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.8fr) minmax(0,1.6fr)",
                        gap: "28px",
                        padding: "30px 0",
                        borderTop: "1px solid #d8d5cc",
                        opacity: "0",
                        transform: "translateY(24px)",
                        transition: "opacity .9s,transform 1s cubic-bezier(.2,.8,.2,1)",
                      }}
                    >
                      <div style={{ fontSize: "clamp(22px,2.2vw,32px)", letterSpacing: "-.02em", lineHeight: "1.1" }}>{c.name}</div>
                      <div
                        style={{
                          fontSize: "14px",
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          color: "#e0562a",
                          paddingTop: "8px",
                        }}
                      >
                        {c.share}
                      </div>
                      <div style={{ fontSize: "16px", lineHeight: "1.5", color: "#4a4740" }}>{c.desc}</div>
                    </div>
                  </Fragment>
                ))}
                <div style={{ borderTop: "1px solid #d8d5cc" }}></div>
              </div>
            </div>
          </section>
          <section
            data-screen-label={"Stack"}
            style={{
              position: "relative",
              zIndex: "2",
              margin: "0 4.5vw",
              padding: "14vh 5vw",
              borderRadius: "28px",
              background: "#0f0e0c",
              color: "#f0efe9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "32px",
                flexWrap: "wrap",
                marginBottom: "72px",
              }}
            >
              <h2
                data-reveal={"1"}
                style={{
                  margin: "0",
                  fontSize: "clamp(44px,6.4vw,96px)",
                  lineHeight: "1",
                  letterSpacing: "-.035em",
                  fontWeight: "400",
                  maxWidth: "14ch",
                }}
              >
                {v.wStack.map((w, $index) => (
                  <Fragment key={$index}>
                    <span
                      style={{
                        display: "inline-block",
                        overflow: "hidden",
                        verticalAlign: "bottom",
                        padding: ".14em .12em .2em",
                        margin: "-.14em -.12em -.2em .1em",
                      }}
                    >
                      <span
                        data-w={"1"}
                        style={{
                          display: "inline-block",
                          transform: "translateY(112%)",
                          transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                        }}
                      >
                        {w.t}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h2>
              <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#9a958b" }}>{"2023 – 2026"}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "56px 40px" }}>
              {v.stacks.map((s, $index) => (
                <Fragment key={$index}>
                  <div
                    data-fade={"1"}
                    style={{
                      borderTop: "1px solid #34312c",
                      paddingTop: "22px",
                      opacity: "0",
                      transform: "translateY(30px)",
                      transition: "opacity 1s,transform 1.1s cubic-bezier(.2,.8,.2,1)",
                    }}
                  >
                    <div style={{ fontSize: "clamp(24px,2.4vw,34px)", letterSpacing: "-.02em", marginBottom: "18px" }}>
                      <i className="ac">{s.name}</i>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {s.items.map((it, $index) => (
                        <Fragment key={$index}>
                          <span
                            className="hcb02760"
                            style={{
                              border: "1px solid #3a3631",
                              borderRadius: "999px",
                              padding: "8px 14px",
                              fontSize: "14px",
                              color: "#d9d5cc",
                              transition: "background .3s,color .3s",
                            }}
                          >
                            {it.t}
                          </span>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </section>
          <section
            id={"method"}
            ref={v.methSecRef}
            data-screen-label={"How I work"}
            style={{ position: "relative", zIndex: "2", height: "380vh" }}
          >
            <div
              style={{
                position: "sticky",
                top: "0",
                height: "100vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  padding: "0 4.5vw",
                  marginBottom: "min(6vh,32px)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "32px",
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    margin: "0",
                    fontSize: "clamp(28px,min(5.6vw,7vh),84px)",
                    lineHeight: "1",
                    letterSpacing: "-.035em",
                    fontWeight: "400",
                    maxWidth: "16ch",
                  }}
                >
                  {"How I work: "}
                  <i className="ac">{"observe,"}</i>
                  {" then change carefully."}
                </h2>
                <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>
                  {"Scroll · the loop moves sideways"}
                </div>
              </div>
              <div
                ref={v.trackRef}
                style={{ display: "flex", gap: "28px", padding: "0 4.5vw", willChange: "transform", width: "max-content" }}
              >
                <div
                  data-tilt={"1"}
                  data-card={"observe"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#fff",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 40px 80px -50px rgba(15,14,12,.35)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#6e6a62",
                    }}
                  >
                    <span>{"Step 01"}</span>
                    <span>{"observe"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#f0efe9",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      data-v={"eye"}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "190px",
                        height: "104px",
                        margin: "-52px 0 0 -95px",
                        border: "2px solid #0f0e0c",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        data-v={"pupil"}
                        style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#0f0e0c", position: "relative" }}
                      >
                        <i
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "9px",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "#f0efe9",
                          }}
                        ></i>
                      </div>
                    </div>
                    <div
                      data-v={"lid"}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "196px",
                        height: "110px",
                        margin: "-55px 0 0 -98px",
                        borderRadius: "50%",
                        background: "#f0efe9",
                        transform: "scaleY(0)",
                        transformOrigin: "50% 0",
                      }}
                    ></div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(40px,4.6vw,68px)", lineHeight: ".95", letterSpacing: "-.04em", marginBottom: "16px" }}>
                      {"Observe"}
                    </div>
                    <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#4a4740", maxWidth: "34ch" }}>
                      {"What is actually happening, not what the ticket says."}
                    </div>
                  </div>
                </div>
                <div
                  data-tilt={"1"}
                  data-card={"reproduce"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#fff",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 40px 80px -50px rgba(15,14,12,.35)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#6e6a62",
                    }}
                  >
                    <span>{"Step 02"}</span>
                    <span>{"reproduce"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#f0efe9",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      data-v={"a"}
                      style={{
                        position: "absolute",
                        left: "28%",
                        top: "50%",
                        width: "70px",
                        height: "70px",
                        margin: "-35px",
                        borderRadius: "18px",
                        background: "#0f0e0c",
                      }}
                    ></div>
                    <div
                      data-v={"b"}
                      style={{
                        position: "absolute",
                        left: "72%",
                        top: "50%",
                        width: "70px",
                        height: "70px",
                        margin: "-35px",
                        borderRadius: "18px",
                        border: "2px solid #0f0e0c",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "1px",
                        height: "120px",
                        margin: "-60px 0 0",
                        background: "#d8d5cc",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "16px",
                        transform: "translateX(-50%)",
                        fontSize: "11px",
                        letterSpacing: ".1em",
                        color: "#6e6a62",
                      }}
                    >
                      {"ONCE · TWICE"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(40px,4.6vw,68px)", lineHeight: ".95", letterSpacing: "-.04em", marginBottom: "16px" }}>
                      {"Reproduce"}
                    </div>
                    <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#4a4740", maxWidth: "34ch" }}>
                      {"If I cannot make it happen twice, I do not understand it yet."}
                    </div>
                  </div>
                </div>
                <div
                  data-tilt={"1"}
                  data-card={"investigate"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#fff",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 40px 80px -50px rgba(15,14,12,.35)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#6e6a62",
                    }}
                  >
                    <span>{"Step 03"}</span>
                    <span>{"investigate"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#f0efe9",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "24px",
                        right: "24px",
                        bottom: "34px",
                        height: "110px",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "10px",
                      }}
                    >
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "40%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "70%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "55%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "90%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "48%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "78%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "62%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "84%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                      <i
                        data-v={"bar"}
                        style={{
                          flex: "1",
                          height: "50%",
                          background: "#c9c5ba",
                          borderRadius: "6px 6px 0 0",
                          transition: "background .3s,height .3s",
                        }}
                      ></i>
                    </div>
                    <div
                      data-v={"lens"}
                      style={{
                        position: "absolute",
                        left: "24px",
                        top: "22px",
                        width: "92px",
                        height: "92px",
                        border: "2.5px solid #0f0e0c",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,.35)",
                        backdropFilter: "blur(1px)",
                      }}
                    >
                      <i
                        style={{
                          position: "absolute",
                          right: "-26px",
                          bottom: "-14px",
                          width: "40px",
                          height: "6px",
                          background: "#0f0e0c",
                          borderRadius: "3px",
                          transform: "rotate(45deg)",
                        }}
                      ></i>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(40px,4.6vw,68px)", lineHeight: ".95", letterSpacing: "-.04em", marginBottom: "16px" }}>
                      {"Investigate"}
                    </div>
                    <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#4a4740", maxWidth: "34ch" }}>
                      {"Logs, headers, network, the diff between UAT and production."}
                    </div>
                  </div>
                </div>
                <div
                  data-tilt={"1"}
                  data-card={"hypothesise"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#fff",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 40px 80px -50px rgba(15,14,12,.35)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#6e6a62",
                    }}
                  >
                    <span>{"Step 04"}</span>
                    <span>{"hypothesise"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#f0efe9",
                      overflow: "hidden",
                    }}
                  >
                    <i
                      data-v={"dot"}
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#0f0e0c",
                        left: "0",
                        top: "0",
                      }}
                    ></i>
                    <i
                      data-v={"dot"}
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#0f0e0c",
                        left: "0",
                        top: "0",
                      }}
                    ></i>
                    <i
                      data-v={"dot"}
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#0f0e0c",
                        left: "0",
                        top: "0",
                      }}
                    ></i>
                    <i
                      data-v={"dot"}
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#e0562a",
                        left: "0",
                        top: "0",
                      }}
                    ></i>
                    <i
                      data-v={"dot"}
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#0f0e0c",
                        left: "0",
                        top: "0",
                      }}
                    ></i>
                    <i
                      data-v={"dot"}
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#0f0e0c",
                        left: "0",
                        top: "0",
                      }}
                    ></i>
                    <i
                      data-v={"dot"}
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#0f0e0c",
                        left: "0",
                        top: "0",
                      }}
                    ></i>
                    <div
                      data-v={"line"}
                      style={{
                        position: "absolute",
                        left: "36px",
                        right: "36px",
                        top: "50%",
                        height: "2px",
                        background: "#0f0e0c",
                        transform: "scaleX(0)",
                        transformOrigin: "0 50%",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "absolute",
                        left: "24px",
                        bottom: "16px",
                        fontSize: "11px",
                        letterSpacing: ".1em",
                        color: "#6e6a62",
                      }}
                    >
                      {"NOISE → ONE LINE"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(40px,4.6vw,68px)", lineHeight: ".95", letterSpacing: "-.04em", marginBottom: "16px" }}>
                      {"Hypothesise"}
                    </div>
                    <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#4a4740", maxWidth: "34ch" }}>
                      {"One cause, stated plainly, that would explain everything seen."}
                    </div>
                  </div>
                </div>
                <div
                  data-tilt={"1"}
                  data-card={"test"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#fff",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 40px 80px -50px rgba(15,14,12,.35)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#6e6a62",
                    }}
                  >
                    <span>{"Step 05"}</span>
                    <span>{"test"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#f0efe9",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      data-v={"track"}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "190px",
                        height: "84px",
                        margin: "-42px 0 0 -95px",
                        borderRadius: "42px",
                        background: "#0f0e0c",
                        transition: "background .4s",
                      }}
                    >
                      <div
                        data-v={"knob"}
                        style={{
                          position: "absolute",
                          left: "8px",
                          top: "8px",
                          width: "68px",
                          height: "68px",
                          borderRadius: "50%",
                          background: "#f0efe9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "30px",
                          transition: "transform .6s cubic-bezier(.2,.8,.2,1)",
                        }}
                      >
                        {"✕"}
                      </div>
                    </div>
                    <div
                      data-v={"label"}
                      style={{
                        position: "absolute",
                        left: "0",
                        right: "0",
                        bottom: "16px",
                        textAlign: "center",
                        fontSize: "11px",
                        letterSpacing: ".1em",
                        color: "#6e6a62",
                      }}
                    >
                      {"HYPOTHESIS · KILLED"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(40px,4.6vw,68px)", lineHeight: ".95", letterSpacing: "-.04em", marginBottom: "16px" }}>
                      {"Test"}
                    </div>
                    <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#4a4740", maxWidth: "34ch" }}>
                      {"The smallest change that proves or kills the hypothesis."}
                    </div>
                  </div>
                </div>
                <div
                  data-tilt={"1"}
                  data-card={"change"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#fff",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 40px 80px -50px rgba(15,14,12,.35)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#6e6a62",
                    }}
                  >
                    <span>{"Step 06"}</span>
                    <span>{"change"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#f0efe9",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "24px",
                        right: "24px",
                        top: "50%",
                        height: "64px",
                        marginTop: "-32px",
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      <div style={{ flex: "1", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
                        <i data-v={"old"} style={{ position: "absolute", inset: "0", background: "#0f0e0c" }}></i>
                      </div>
                      <div style={{ flex: "1", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
                        <i data-v={"old"} style={{ position: "absolute", inset: "0", background: "#0f0e0c" }}></i>
                      </div>
                      <div style={{ flex: "1", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
                        <i data-v={"old"} style={{ position: "absolute", inset: "0", background: "#c9c5ba" }}></i>
                        <i
                          data-v={"new"}
                          style={{ position: "absolute", inset: "0", background: "#e0562a", transform: "translateY(110%)" }}
                        ></i>
                      </div>
                      <div style={{ flex: "1", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
                        <i data-v={"old"} style={{ position: "absolute", inset: "0", background: "#0f0e0c" }}></i>
                      </div>
                      <div style={{ flex: "1", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
                        <i data-v={"old"} style={{ position: "absolute", inset: "0", background: "#0f0e0c" }}></i>
                      </div>
                      <div style={{ flex: "1", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
                        <i data-v={"old"} style={{ position: "absolute", inset: "0", background: "#0f0e0c" }}></i>
                      </div>
                    </div>
                    <div
                      data-v={"ripple"}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "64px",
                        height: "64px",
                        margin: "-32px",
                        borderRadius: "50%",
                        border: "1.5px solid #e0562a",
                        opacity: "0",
                      }}
                    ></div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(40px,4.6vw,68px)", lineHeight: ".95", letterSpacing: "-.04em", marginBottom: "16px" }}>
                      {"Change"}
                    </div>
                    <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#4a4740", maxWidth: "34ch" }}>
                      {"Carefully. What else could this touch?"}
                    </div>
                  </div>
                </div>
                <div
                  data-tilt={"1"}
                  data-card={"verify"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#fff",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 40px 80px -50px rgba(15,14,12,.35)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#6e6a62",
                    }}
                  >
                    <span>{"Step 07"}</span>
                    <span>{"verify"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#f0efe9",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      data-v={"ring"}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "132px",
                        height: "132px",
                        margin: "-66px",
                        borderRadius: "50%",
                        background: "conic-gradient(#0f0e0c 0%,#dedbd2 0)",
                      }}
                    >
                      <div
                        data-v={"check"}
                        style={{
                          position: "absolute",
                          inset: "12px",
                          borderRadius: "50%",
                          background: "#f0efe9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "40px",
                        }}
                      >
                        {"✓"}
                      </div>
                    </div>
                    <div
                      data-v={"pct"}
                      style={{
                        position: "absolute",
                        left: "0",
                        right: "0",
                        bottom: "16px",
                        textAlign: "center",
                        fontSize: "11px",
                        letterSpacing: ".1em",
                        color: "#6e6a62",
                      }}
                    >
                      {"0%"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(40px,4.6vw,68px)", lineHeight: ".95", letterSpacing: "-.04em", marginBottom: "16px" }}>
                      {"Verify"}
                    </div>
                    <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#4a4740", maxWidth: "34ch" }}>
                      {"In the real environment, then again after retest."}
                    </div>
                  </div>
                </div>
                <div
                  data-tilt={"1"}
                  data-card={"ai"}
                  style={{
                    width: "min(520px,72vw)",
                    flex: "none",
                    borderRadius: "22px",
                    background: "#0f0e0c",
                    color: "#f0efe9",
                    padding: "32px 32px 36px",
                    boxSizing: "border-box",
                    minHeight: "min(56vh,calc(100vh - 230px))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform .25s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "#9a958b",
                    }}
                  >
                    <span>{"With AI in the loop"}</span>
                    <span>{"claude code"}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: "min(200px,24vh)",
                      margin: "18px 0 8px",
                      borderRadius: "16px",
                      background: "#1a1816",
                      padding: "22px",
                      font: "13px/1.9 ui-monospace,Menlo,monospace",
                      color: "#d9d5cc",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                      <i style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#e0562a" }}></i>
                      <i style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#e8d5b0" }}></i>
                      <i style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#8c8880" }}></i>
                    </div>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
                      <span style={{ color: "#9a958b" }}>{"$"}</span>
                      {' claude "scaffold ContactForm + spec"'}
                      <span
                        data-v={"l1"}
                        style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", whiteSpace: "nowrap", width: "0" }}
                      ></span>
                    </div>
                    <div data-v={"l2"} style={{ whiteSpace: "nowrap", overflow: "hidden", width: "0", color: "#e8d5b0" }}>
                      {"✓ contact-form.component.ts · 142 lines"}
                    </div>
                    <div data-v={"l3"} style={{ whiteSpace: "nowrap", overflow: "hidden", width: "0", color: "#e8d5b0" }}>
                      {"✓ contact-form.component.spec.ts · 6 cases"}
                    </div>
                    <div data-v={"l4"} style={{ whiteSpace: "nowrap", overflow: "hidden", width: "0" }}>
                      <span style={{ color: "#e0562a" }}>{"review:"}</span>
                      {" rate limit? CSP nonce? "}
                      <span style={{ color: "#9a958b" }}>{"← me"}</span>
                      <i
                        data-v={"cur"}
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "14px",
                          background: "#f0efe9",
                          verticalAlign: "-2px",
                          marginLeft: "2px",
                        }}
                      ></i>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(28px,3vw,44px)", lineHeight: "1.05", letterSpacing: "-.03em", marginBottom: "16px" }}>
                      {"Claude Code scaffolds. "}
                      <i className="ac">{"I decide."}</i>
                    </div>
                    <div style={{ fontSize: "17px", lineHeight: "1.5", color: "#b8b3a8" }}>
                      {
                        "Components, API wiring and test scaffolds arrive fast. Architecture, security headers, performance budgets and what could break in production stay with me."
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section
            data-screen-label={"Character"}
            style={{
              position: "relative",
              zIndex: "2",
              padding: "10vh 4.5vw 18vh",
              display: "grid",
              gridTemplateColumns: "minmax(0,300px) minmax(0,1fr)",
              gap: "32px",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62", marginBottom: "18px" }}>
                {"Character"}
              </div>
              <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.5", color: "#4a4740", maxWidth: "26ch" }}>
                {"Five traits that describe the way the work gets done."}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {v.traits.map((t, $index) => (
                <Fragment key={$index}>
                  <div
                    data-float={"1"}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)",
                      gap: "28px",
                      alignItems: "baseline",
                      padding: "34px 0",
                      borderTop: "1px solid #d8d5cc",
                      willChange: "transform,opacity",
                    }}
                  >
                    <div style={{ fontSize: "clamp(44px,6vw,92px)", lineHeight: ".95", letterSpacing: "-.04em" }}>
                      <i className="ac">{t.name}</i>
                    </div>
                    <div style={{ fontSize: "19px", lineHeight: "1.5", color: "#4a4740", maxWidth: "40ch" }}>{t.desc}</div>
                  </div>
                </Fragment>
              ))}
              <div style={{ borderTop: "1px solid #d8d5cc" }}></div>
            </div>
          </section>
          <section id={"likes"} data-screen-label={"Off the clock"} style={{ position: "relative", zIndex: "2", padding: "0 4.5vw 20vh" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "32px",
                flexWrap: "wrap",
                marginBottom: "64px",
              }}
            >
              <h2
                data-reveal={"1"}
                style={{
                  margin: "0",
                  fontSize: "clamp(44px,6.4vw,96px)",
                  lineHeight: "1",
                  letterSpacing: "-.035em",
                  fontWeight: "400",
                  maxWidth: "14ch",
                }}
              >
                {v.wLikes.map((w, $index) => (
                  <Fragment key={$index}>
                    <span
                      style={{
                        display: "inline-block",
                        overflow: "hidden",
                        verticalAlign: "bottom",
                        padding: ".14em .12em .2em",
                        margin: "-.14em -.12em -.2em .1em",
                      }}
                    >
                      <span
                        data-w={"1"}
                        style={{
                          display: "inline-block",
                          transform: "translateY(112%)",
                          transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                        }}
                      >
                        {w.t}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h2>
              <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>
                {"Outside of work"}
              </div>
            </div>
            <p
              data-fade={"1"}
              style={{
                margin: "0 0 56px",
                fontSize: "clamp(19px,1.7vw,24px)",
                lineHeight: "1.45",
                color: "#4a4740",
                maxWidth: "62ch",
                textWrap: "pretty",
                opacity: "0",
                transform: "translateY(30px)",
                transition: "opacity 1s .2s,transform 1.1s .2s cubic-bezier(.2,.8,.2,1)",
              }}
            >
              {
                "Beyond engineering, I'm drawn to classic automotive design, motorcycles, scenic roads, music and emerging technology. Whether it's exploring a new idea with AI agents, planning a ride or discovering a quiet mountain lake, I enjoy experiences that combine curiosity, creativity and exploration."
              }
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "28px", alignItems: "start" }}>
              {v.interests.map((k, $index) => (
                <Fragment key={$index}>
                  <div data-float={"1"} style={{ gridColumn: `span ${k.span}`, marginTop: k.offset, willChange: "transform,opacity" }}>
                    <div
                      style={{
                        borderRadius: "18px",
                        overflow: "hidden",
                        aspectRatio: k.ratio,
                        position: "relative",
                        background: "#131211",
                      }}
                    >
                      <div data-par={"1"} style={{ position: "absolute", inset: "-12% 0" }}>
                        <img
                          src={k.img}
                          alt={k.alt}
                          loading={"lazy"}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    </div>
                    <div style={{ padding: "18px 4px 0" }}>
                      <div
                        style={{ fontSize: "clamp(24px,2.4vw,36px)", letterSpacing: "-.025em", lineHeight: "1.05", marginBottom: "8px" }}
                      >
                        {k.t}
                      </div>
                      <div style={{ fontSize: "16px", lineHeight: "1.5", color: "#4a4740", maxWidth: "34ch" }}>{k.d}</div>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </section>
          <section
            id={"contact"}
            data-screen-label={"Contact"}
            style={{ position: "relative", zIndex: "2", padding: "14vh 4.5vw 8vh", textAlign: "center" }}
          >
            <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62", marginBottom: "30px" }}>
              {"Open to conversations"}
            </div>
            <h2
              data-reveal={"1"}
              style={{
                margin: "0 auto 48px",
                fontSize: "clamp(56px,9.5vw,160px)",
                lineHeight: ".92",
                letterSpacing: "-.045em",
                fontWeight: "400",
                maxWidth: "10ch",
              }}
            >
              {v.wContact.map((w, $index) => (
                <Fragment key={$index}>
                  <span
                    style={{
                      display: "inline-block",
                      overflow: "hidden",
                      verticalAlign: "bottom",
                      padding: ".14em .12em .2em",
                      margin: "-.14em -.01em -.2em",
                    }}
                  >
                    <span
                      data-w={"1"}
                      style={{
                        display: "inline-block",
                        transform: "translateY(112%)",
                        transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                      }}
                    >
                      {w.t}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h2>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <a
                href={"mailto:kishore.theiveekan@gmail.com"}
                className="hcb54c46"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "16px",
                  background: "#0f0e0c",
                  color: "#f0efe9",
                  borderRadius: "999px",
                  padding: "22px 34px",
                  fontSize: "16px",
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                }}
              >
                {"kishore.theiveekan@gmail.com "}
                <span>{"→"}</span>
              </a>
              <div
                title={"Back to top"}
                aria-label={"Back to top"}
                className="hc1ec7eb"
                style={{
                  width: "66px",
                  height: "66px",
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  cursor: "pointer",
                  transition: "transform .4s cubic-bezier(.2,.8,.2,1),background .3s",
                }}
                onClick={v.toTop}
                role="button"
                tabIndex={0}
                onKeyDown={kb(v.toTop)}
              >
                {"↑"}
              </div>
            </div>
          </section>
        </main>
        <footer
          style={{
            position: "relative",
            zIndex: "2",
            margin: "0 4.5vw 20px",
            padding: "48px 5vw 32px",
            borderRadius: "24px",
            background: "#fff",
            display: "grid",
            gridTemplateColumns: "repeat(4,minmax(0,1fr))",
            gap: "32px",
            fontSize: "15px",
            lineHeight: "1.6",
            color: "#4a4740",
          }}
        >
          <div>
            <div style={{ fontWeight: "500", color: "#0f0e0c", marginBottom: "6px" }}>{"Kishore Theiveekan"}</div>
            {"Based in Chennai, India"}
            <br />
            {"Open to relocation and remote work worldwide"}
          </div>
          <div>
            <div style={{ fontWeight: "500", color: "#0f0e0c", marginBottom: "6px" }}>{"Elsewhere"}</div>
            <a href={"https://www.linkedin.com/in/kishore-theiveekan-3a39bb23b"} rel={"noopener me"} target={"_blank"}>
              {"LinkedIn"}
            </a>
            <br />
            <a href={"https://github.com/KishoreCR728"} rel={"noopener me"} target={"_blank"}>
              {"GitHub"}
            </a>
            <br />
            <a href={"/Kishore-Theiveekan-CV.pdf"} download={""}>
              {"Download CV"}
            </a>
          </div>
          <div style={{ overflowWrap: "anywhere" }}>
            <div style={{ fontWeight: "500", color: "#0f0e0c", marginBottom: "6px" }}>{"Mail"}</div>
            <a href={"mailto:kishore.theiveekan@gmail.com"}>{"kishore.theiveekan@gmail.com"}</a>
          </div>
          <div style={{ textAlign: "right" }}>
            {"© 2026 Kishore Theiveekan"}
            <br />
            {"No cookies, no trackers"}
            <br />
            <span style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6e6a62" }}>
              {"Photos: Unsplash license"}
              <br />
              <a
                href={"https://commons.wikimedia.org/wiki/File:1969_Ford_Mustang_Mach_1_428CJ_(22605179204).jpg"}
                rel={"noopener"}
                target={"_blank"}
              >
                {"Mustang"}
              </a>
              {": Sicnag, CC BY 2.0"}
              <br />
              <a href={"https://commons.wikimedia.org/wiki/File:Royal_Enfield_Continental_GT_650.jpg"} rel={"noopener"} target={"_blank"}>
                {"Continental GT"}
              </a>
              {": Kiranpawar3210, CC BY-SA 4.0"}
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
