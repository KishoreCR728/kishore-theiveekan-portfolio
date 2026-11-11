import type { Metadata } from "next";
import "../pages.css";
import "./lab.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { site } from "@/content/site";

const repo = `${site.github}/threejs-starter`;
const description = "Live three.js experiments: GLSL shaders, a fragment-shader field, a post-processing pipeline and physically based materials. Each one runs in your browser.";

const demos = [
  { id: "shaders", title: "GLSL vertex shader", text: "Every vertex of a sphere is displaced by animated 3D simplex noise; the fragment shader colours by displacement and adds a fresnel rim. Sliders change intensity, frequency and speed.", tags: "GLSL · simplex noise · fresnel", src: "src/shaders.js" },
  { id: "shaders2", title: "Fragment shader patterns", text: "One full-screen quad where every pixel is computed on the GPU from UV, time and the cursor. Several modes, including fractal Brownian motion.", tags: "GLSL · fbm · full-screen quad", src: "src/shaders2.js" },
  { id: "post", title: "Post-processing pipeline", text: "The scene renders to an offscreen target, then passes through bloom, chromatic aberration, grain, vignette and scanlines. Each pass can be tuned or bypassed.", tags: "EffectComposer · bloom · custom passes", src: "src/post.js" },
  { id: "shapes", title: "Physically based materials", text: "Metal, glass and plastic primitives lit by an environment map and soft shadows, with orbit controls.", tags: "PBR · PMREM · shadows", src: "src/shapes.js" },
];

export const metadata: Metadata = {
  title: "Lab",
  description,
  alternates: { canonical: "/lab" },
  openGraph: { type: "website", siteName: site.name, url: "/lab", title: `Lab | ${site.name}`, description, images: ["/og/lab.png"] },
  twitter: { card: "summary_large_image", title: `Lab | ${site.name}`, description, images: ["/og/lab.png"] },
};

export default function Lab() {
  return (
    <div className="page">
      <SiteHeader current="lab" />
      <main id="main" className="wrap">
        <header className="hero-block">
          <div className="label">Lab</div>
          <h1>three.js, <i className="ac">running live.</i></h1>
          <p className="lede">{description} Drag to orbit; the panels change the parameters. The code is in my <a href={repo} target="_blank" rel="noopener noreferrer">threejs-starter</a> repository.</p>
        </header>
        <ul className="lab-grid">
          {demos.map((d) => (
            <li key={d.id}>
              <a className="lab-shot" href={`/lab/demos/${d.id}.html`} tabIndex={-1} aria-hidden="true">
                <img src={`/lab/${d.id}.webp`} alt={`Screenshot of the ${d.title.toLowerCase()} experiment`} width={800} height={500} loading="lazy" decoding="async" />
              </a>
              <div className="lab-text">
                <h2>{d.title}</h2>
                <p>{d.text}</p>
                <p className="lab-tags">{d.tags}</p>
                <div className="lab-actions">
                  <a className="pill dark" href={`/lab/demos/${d.id}.html`}>Open live<span className="sr-only"> {d.title.toLowerCase()} demo</span></a>
                  <a className="pill" href={`${repo}/blob/main/${d.src}`} target="_blank" rel="noopener noreferrer">Code<span className="sr-only"> for the {d.title.toLowerCase()} demo</span></a>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="lab-note">These open full screen and need WebGL. On phones they run at a lower pixel ratio; they are experiments, so they aren&apos;t tuned like the main site.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
