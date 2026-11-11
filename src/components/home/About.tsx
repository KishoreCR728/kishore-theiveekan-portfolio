import { about } from "@/content/home";
import { interests } from "@/content/portfolio";

type Interest = { t: string; d: string; images: { src: string; alt: string }[] };

export default function About() {
  return (
    <section id="about" className="block" aria-labelledby="about-title">
      <div className="block-head">
        <p className="label">About</p>
        <h2 id="about-title">Self-taught, <i className="ac">production-minded.</i></h2>
      </div>
      <p className="body-lg narrow-left">{about}</p>
      <h3 className="sub">Off the clock</h3>
      <ul className="clock">
        {(interests as Interest[]).map((it) => (
          <li key={it.t}>
            <img src={it.images[0].src.replace("/images/", "/images/small/")} alt={it.images[0].alt} loading="lazy" decoding="async" width={720} height={480} />
            <b>{it.t}</b>
            <p>{it.d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
