"use client";

/**
 * "Back" that returns the visitor to the exact place they came from.
 * If they arrived from another page of this site, it goes back in history (the home page
 * restores its scroll position); if they arrived from outside (search, LinkedIn), it opens
 * the fallback, for example the Selected work section of the home page.
 */
export default function BackLink({ fallback, label }: { fallback: string; label: string }) {
  return (
    <a
      className="back-link"
      href={fallback}
      onClick={(e) => {
        try {
          const ref = document.referrer ? new URL(document.referrer) : null;
          if (ref && ref.origin === location.origin && ref.href !== location.href && history.length > 1) {
            e.preventDefault();
            history.back();
            return;
          }
          if (fallback.startsWith("/#")) sessionStorage.setItem("skipLoader", "1");
        } catch {}
      }}
    >
      <i aria-hidden="true">←</i> {label}
    </a>
  );
}
