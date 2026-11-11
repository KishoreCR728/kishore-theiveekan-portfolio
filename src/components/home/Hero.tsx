import { hero } from "@/content/home";
import { site } from "@/content/site";
import HeroScene from "./HeroScene";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-text">
        <p className="label">{hero.location}</p>
        <h1 id="hero-title">
          {site.name}
          <span className="hero-role"><i className="ac">{hero.role}</i></span>
        </h1>
        <p className="hero-line">{hero.line}</p>
        <div className="hero-actions">
          <a className="pill dark" href="#work">See the work</a>
          <a className="pill" href="/Kishore-Theiveekan-CV.pdf">Download CV</a>
          <a className="pill" href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="pill" href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
      <div className="hero-panel">
        <div className="hero-backdrop" aria-hidden="true"><span /><span /><span /></div>
        <HeroScene />
        <ul className="hero-proof">
          {hero.proof.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <a className="hero-journey" href="/journey">Explore the journey in 3D <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
