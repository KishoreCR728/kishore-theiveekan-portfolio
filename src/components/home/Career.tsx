import { career } from "@/content/home";

export default function Career() {
  return (
    <section id="experience" className="block" aria-labelledby="exp-title">
      <div className="block-head">
        <p className="label">Experience</p>
        <h2 id="exp-title">{career.company}</h2>
        <p className="block-lede">{career.title} · {career.place} · {career.dates}</p>
      </div>
      <div className="career">
        <p className="body-lg">{career.summary}</p>
        <div className="career-phases">
          {career.phases.map((ph) => (
            <div key={ph.name} className="phase">
              <h3>{ph.name} <span>{ph.when}</span></h3>
              <ul>{ph.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="edu">{career.education}</p>
      </div>
    </section>
  );
}
