import type { Doc } from "@/lib/content";
import { readingMinutes } from "@/lib/content";

export default function Writing({ posts }: { posts: Doc[] }) {
  return (
    <section id="writing" className="block" aria-labelledby="writing-title">
      <div className="block-head">
        <p className="label">Writing</p>
        <h2 id="writing-title">Hard problems, <i className="ac">written up.</i></h2>
        <p className="block-lede">Real production bugs: how they were found and fixed, and what was mine. Each was solved with an AI coding agent as a pair.</p>
      </div>
      <ul className="post-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <a href={`/writing/${p.slug}`}>
              <h3>{p.meta.title}</h3>
              <p>{p.meta.description}</p>
              <span className="meta">{p.meta.topic} · {readingMinutes(p.body)} min</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
