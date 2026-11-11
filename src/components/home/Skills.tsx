import { aiNote, method, skills } from "@/content/home";

export default function Skills() {
  return (
    <section id="skills" className="block" aria-labelledby="skills-title">
      <div className="block-head">
        <p className="label">Skills and method</p>
        <h2 id="skills-title">Tools I've used <i className="ac">in real work.</i></h2>
      </div>
      <div className="skills-grid">
        {skills.map(([group, items]) => (
          <div key={group}>
            <h3 className="sub">{group}</h3>
            <ul className="chips">{items.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
          </div>
        ))}
      </div>
      <ol className="method">
        {method.map(([t, d], i) => (
          <li key={t}><span>{String(i + 1).padStart(2, "0")}</span><b>{t}</b><p>{d}</p></li>
        ))}
      </ol>
      <aside className="ai-note"><b>Working with AI.</b> {aiNote}</aside>
    </section>
  );
}
