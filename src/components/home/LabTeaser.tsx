const items = [
  ["shaders", "GLSL vertex shader"],
  ["shaders2", "Fragment shader patterns"],
  ["post", "Post-processing pipeline"],
  ["shapes", "Physically based materials"],
];

export default function LabTeaser() {
  return (
    <section id="lab" className="block" aria-labelledby="lab-title">
      <div className="block-head lab-head">
        <div>
          <p className="label">Lab</p>
          <h2 id="lab-title">three.js, <i className="ac">running live.</i></h2>
        </div>
        <a className="pill dark" href="/lab">Open the Lab</a>
      </div>
      <ul className="lab-strip">
        {items.map(([id, t]) => (
          <li key={id}>
            <a href={`/lab/demos/${id}.html`}>
              <img src={`/lab/${id}.webp`} alt="" width={800} height={500} loading="lazy" decoding="async" />
              <span>{t}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
