/**
 * "Back" that returns the visitor to the exact place they came from.
 * If they arrived from another page of this site, it goes back in history (the home page
 * restores its scroll position); if they arrived from outside (search, LinkedIn), it opens
 * the fallback, for example the Selected work section of the home page.
 *
 * Inner pages ship no React runtime (see scripts/defer-hydration.mjs), so the behaviour is a
 * few lines of plain JavaScript instead of a client component. Without JavaScript it is a normal link.
 */
const script = `document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[data-back]");if(!a)return;try{var r=document.referrer?new URL(document.referrer):null;if(r&&r.origin===location.origin&&r.href!==location.href&&history.length>1){e.preventDefault();history.back();return}if(a.getAttribute("href").indexOf("/#")===0)sessionStorage.setItem("skipLoader","1")}catch(x){}});`;

export default function BackLink({ fallback, label }: { fallback: string; label: string }) {
  return (
    <>
      <a className="back-link" href={fallback} data-back="">
        <i aria-hidden="true">←</i> {label}
      </a>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
