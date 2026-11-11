import { moreWork } from "@/content/home";

export default function MoreWork() {
  return (
    <section id="more" className="block" aria-labelledby="more-title">
      <div className="block-head">
        <p className="label">More work</p>
        <h2 id="more-title">Smaller projects <i className="ac">and open source.</i></h2>
      </div>
      <ul className="more-grid">
        {moreWork.map((m) => {
          const ext = m.href?.startsWith("http");
          return (
            <li key={m.name}>
              <a href={m.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <h3>{m.name} <span aria-hidden="true">{ext ? "↗" : "→"}</span></h3>
                <p>{m.line}</p>
                <span className="proof">{m.proof}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
