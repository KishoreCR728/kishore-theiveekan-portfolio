import { videos } from "@/content/videos";

export default function VideoBlock({ id, note }: { id: string; note?: string }) {
  const v = videos[id];
  if (!v) return null;
  return (
    <figure className="video-block">
      <video controls preload="none" playsInline poster={`/videos/${id}.jpg`} width={1280} height={720} aria-label={`Video: ${v.title}`}>
        <source src={`/videos/${id}.mp4`} type="video/mp4" />
        <track kind="captions" src={`/videos/${id}.vtt`} srcLang="en" label="English" />
      </video>
      <figcaption>
        <span><b>{v.title}</b> · {v.duration} · captions on screen · AI-generated voice{note ? ` · ${note}` : ""}</span>
        <details>
          <summary>Transcript</summary>
          {v.transcript.map((t, i) => <p key={i}>{t}</p>)}
        </details>
      </figcaption>
    </figure>
  );
}
