/**
 * "Back" that returns the visitor to the exact place they came from (behaviour in public/back.js).
 * If they arrived from another page of this site, it goes back in history (the home page restores its
 * scroll position); if they arrived from outside (search, LinkedIn), it opens the fallback, for example
 * the Selected work section of the home page. Without JavaScript it is a normal link.
 */
export default function BackLink({ fallback, label }: { fallback: string; label: string }) {
  return (
    <>
      <a className="back-link" href={fallback} data-back="">
        <i aria-hidden="true">←</i> {label}
      </a>
      <script src="/back.js" defer />
    </>
  );
}
